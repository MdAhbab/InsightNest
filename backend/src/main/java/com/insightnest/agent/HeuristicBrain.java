package com.insightnest.agent;

import com.insightnest.agent.dto.CitationItem;
import com.insightnest.agent.dto.CounsellorRequest;
import com.insightnest.agent.dto.CounsellorResponse;
import com.insightnest.agent.dto.DigestItem;
import com.insightnest.agent.dto.DigestResponse;
import com.insightnest.agent.dto.LibrarianRequest;
import com.insightnest.agent.dto.LibrarianResponse;
import com.insightnest.agent.dto.LibrarianSourceItem;
import com.insightnest.agent.dto.MatchmakerItem;
import com.insightnest.profile.LearnerProfile;
import com.insightnest.profile.LearnerProfileRepository;
import com.insightnest.program.Program;
import com.insightnest.program.ProgramRepository;
import com.insightnest.research.ResearchProject;
import com.insightnest.research.ResearchProjectRepository;
import com.insightnest.research.ResearchProjectStatus;
import com.insightnest.research.dto.ResearchProjectResponse;
import com.insightnest.resource.LibraryResource;
import com.insightnest.resource.LibraryResourceRepository;
import com.insightnest.saved.SavedItem;
import com.insightnest.saved.SavedItemRepository;
import com.insightnest.saved.SavedItemType;
import com.insightnest.scholarship.Scholarship;
import com.insightnest.scholarship.ScholarshipRepository;
import com.insightnest.user.User;
import com.insightnest.webinar.Webinar;
import com.insightnest.webinar.WebinarRegistration;
import com.insightnest.webinar.WebinarRegistrationRepository;
import com.insightnest.webinar.WebinarRegistrationStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class HeuristicBrain implements AgentBrain {

    private final ProgramRepository programRepository;
    private final ScholarshipRepository scholarshipRepository;
    private final ResearchProjectRepository researchProjectRepository;
    private final LibraryResourceRepository resourceRepository;
    private final LearnerProfileRepository learnerProfileRepository;
    private final SavedItemRepository savedItemRepository;
    private final WebinarRegistrationRepository webinarRegistrationRepository;

    public HeuristicBrain(ProgramRepository programRepository,
                          ScholarshipRepository scholarshipRepository,
                          ResearchProjectRepository researchProjectRepository,
                          LibraryResourceRepository resourceRepository,
                          LearnerProfileRepository learnerProfileRepository,
                          SavedItemRepository savedItemRepository,
                          WebinarRegistrationRepository webinarRegistrationRepository) {
        this.programRepository = programRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.researchProjectRepository = researchProjectRepository;
        this.resourceRepository = resourceRepository;
        this.learnerProfileRepository = learnerProfileRepository;
        this.savedItemRepository = savedItemRepository;
        this.webinarRegistrationRepository = webinarRegistrationRepository;
    }

    @Override
    public CounsellorResponse counsel(CounsellorRequest request) {
        Set<String> tokens = tokenize(request.getMessage());
        List<CitationItem> citations = new ArrayList<>();

        // Match programs
        List<Program> programs = programRepository.findAll();
        programs.stream()
                .filter(p -> !p.isArchived())
                .map(p -> new ScoredItem<>(p, overlap(tokens,
                        tokenize(p.getName() + " " + p.getType() + " " + p.getDepartment() + " " + nullStr(p.getDescription())))))
                .filter(s -> s.score > 0)
                .sorted(Comparator.comparingInt(ScoredItem<Program>::score).reversed())
                .limit(4)
                .forEach(s -> citations.add(new CitationItem("PROGRAM", s.item.getId(),
                        s.item.getName(),
                        s.item.getType() + (s.item.getUniversity() != null ? " · " + s.item.getUniversity().getName() : ""),
                        s.item.getApplicationDeadline())));

        // Match scholarships
        List<Scholarship> scholarships = scholarshipRepository.findAll();
        scholarships.stream()
                .filter(sc -> !sc.isArchived())
                .map(sc -> new ScoredItem<>(sc, overlap(tokens,
                        tokenize(sc.getTitle() + " " + nullStr(sc.getRegion()) + " " + nullStr(sc.getLevel()) + " " + nullStr(sc.getDescription())))))
                .filter(s -> s.score > 0)
                .sorted(Comparator.comparingInt(ScoredItem<Scholarship>::score).reversed())
                .limit(3)
                .forEach(s -> citations.add(new CitationItem("SCHOLARSHIP", s.item.getId(),
                        s.item.getTitle(),
                        nullStr(s.item.getFunder()),
                        s.item.getDeadline())));

        // Cap to 6 total, sorted by type
        while (citations.size() > 6) {
            citations.remove(citations.size() - 1);
        }

        String reply;
        if (citations.isEmpty()) {
            reply = "I couldn't find specific programs or scholarships matching your query in the current catalogue. "
                    + "Try different keywords such as your field of interest, degree level, or region.";
        } else {
            StringBuilder sb = new StringBuilder("Based on your query, here are some relevant options from the InsightNest catalogue:\n\n");
            citations.forEach(c -> sb.append("• ").append(c.title()).append(" (").append(c.type()).append(")\n"));
            sb.append("\nExplore each item for full details and application deadlines.");
            reply = sb.toString();
        }

        return new CounsellorResponse(reply, citations);
    }

    @Override
    public List<MatchmakerItem> matchProjects(User learner) {
        Optional<LearnerProfile> profileOpt = learnerProfileRepository.findByUser(learner);
        String profileText = profileOpt.map(p ->
                nullStr(p.getEducationHistory()) + " " + nullStr(p.getProjects())
                        + " " + nullStr(p.getBio()) + " " + nullStr(p.getHobbies())).orElse("");
        Set<String> profileTokens = tokenize(profileText);

        List<ResearchProject> openProjects = researchProjectRepository.findAll().stream()
                .filter(p -> p.getStatus() == ResearchProjectStatus.OPEN)
                .toList();

        return openProjects.stream()
                .map(project -> {
                    Set<String> projectTokens = tokenize(
                            project.getTitle() + " " + nullStr(project.getDescription())
                                    + " " + nullStr(project.getTags()) + " " + nullStr(project.getRequiredSkills())
                                    + " " + nullStr(project.getField()));
                    int overlap = overlap(profileTokens, projectTokens);
                    int score = profileTokens.isEmpty() ? 50 : Math.min(100, overlap * 12 + 30);
                    String rationale = overlap > 0
                            ? "Your profile shares " + overlap + " keyword(s) with this project's focus area."
                            : "No direct keyword overlap — consider for its open position.";
                    return new MatchmakerItem(ResearchProjectResponse.from(project), score, rationale);
                })
                .sorted(Comparator.comparingInt(MatchmakerItem::score).reversed()
                        .thenComparingLong(m -> m.project().id()))
                .toList();
    }

    @Override
    public LibrarianResponse librarian(LibrarianRequest request) {
        Set<String> tokens = tokenize(request.getQuestion());
        List<LibraryResource> resources = resourceRepository.findAll();

        record Scored(LibraryResource r, int score) {}
        List<Scored> ranked = resources.stream()
                .map(r -> new Scored(r, overlap(tokens,
                        tokenize(r.getTitle() + " " + nullStr(r.getDescription())
                                + " " + nullStr(r.getField()) + " " + nullStr(r.getAuthor())))))
                .filter(s -> s.score() > 0)
                .sorted(Comparator.comparingInt(Scored::score).reversed())
                .limit(5)
                .toList();

        if (ranked.isEmpty()) {
            return new LibrarianResponse(
                    "I couldn't find relevant resources in the archive for your question. "
                            + "Try broader terms or check the Library for all available materials.",
                    List.of());
        }

        StringBuilder answer = new StringBuilder("Here are the most relevant resources I found:\n\n");
        ranked.forEach(s -> answer.append("• ").append(s.r().getTitle())
                .append(s.r().getDescription() != null ? " — " + truncate(s.r().getDescription(), 80) : "").append("\n"));

        List<LibrarianSourceItem> sources = ranked.stream()
                .map(s -> new LibrarianSourceItem(s.r().getId(), s.r().getTitle(),
                        s.r().getAuthor(), s.r().getYear(), s.score() / 10.0))
                .toList();

        return new LibrarianResponse(answer.toString(), sources);
    }

    @Override
    public DigestResponse digest(User user) {
        LocalDate today = LocalDate.now();
        LocalDate urgentCutoff = today.plusDays(30);
        LocalDate approachingCutoff = today.plusDays(90);

        List<DigestItem> urgent = new ArrayList<>();
        List<DigestItem> approaching = new ArrayList<>();
        List<DigestItem> webinarItems = new ArrayList<>();

        // Saved programs + scholarships
        List<SavedItem> saved = savedItemRepository.findByUserOrderByCreatedAtDesc(user);
        for (SavedItem item : saved) {
            if (item.getItemType() == SavedItemType.PROGRAM) {
                programRepository.findById(item.getItemId()).ifPresent(p -> {
                    if (p.getApplicationDeadline() != null && !p.getApplicationDeadline().isBefore(today)) {
                        DigestItem di = new DigestItem("PROGRAM", p.getId(), p.getName(),
                                p.getType() + (p.getUniversity() != null ? " · " + p.getUniversity().getName() : ""),
                                p.getApplicationDeadline());
                        if (!p.getApplicationDeadline().isAfter(urgentCutoff)) urgent.add(di);
                        else if (!p.getApplicationDeadline().isAfter(approachingCutoff)) approaching.add(di);
                    }
                });
            } else if (item.getItemType() == SavedItemType.SCHOLARSHIP) {
                scholarshipRepository.findById(item.getItemId()).ifPresent(sc -> {
                    if (sc.getDeadline() != null && !sc.getDeadline().isBefore(today)) {
                        DigestItem di = new DigestItem("SCHOLARSHIP", sc.getId(), sc.getTitle(),
                                nullStr(sc.getFunder()), sc.getDeadline());
                        if (!sc.getDeadline().isAfter(urgentCutoff)) urgent.add(di);
                        else if (!sc.getDeadline().isAfter(approachingCutoff)) approaching.add(di);
                    }
                });
            }
        }

        // Webinar registrations
        List<WebinarRegistration> registrations = webinarRegistrationRepository.findByUser(user);
        for (WebinarRegistration reg : registrations) {
            if (reg.getStatus() == WebinarRegistrationStatus.REGISTERED) {
                Webinar w = reg.getWebinar();
                if (w.getScheduledAt() != null && w.getScheduledAt().isAfter(java.time.LocalDateTime.now())) {
                    LocalDate wDate = w.getScheduledAt().toLocalDate();
                    webinarItems.add(new DigestItem("WEBINAR", w.getId(), w.getTitle(),
                            w.getHost() != null ? w.getHost().getFullName() : "", wDate));
                }
            }
        }

        // Also add catalogue items with upcoming deadlines (≤30 days) if no saved items found
        if (urgent.isEmpty()) {
            programRepository.findAll().stream()
                    .filter(p -> !p.isArchived() && p.getApplicationDeadline() != null
                            && !p.getApplicationDeadline().isBefore(today)
                            && !p.getApplicationDeadline().isAfter(urgentCutoff))
                    .limit(3)
                    .forEach(p -> urgent.add(new DigestItem("PROGRAM", p.getId(), p.getName(),
                            p.getType(), p.getApplicationDeadline())));

            scholarshipRepository.findAll().stream()
                    .filter(sc -> !sc.isArchived() && sc.getDeadline() != null
                            && !sc.getDeadline().isBefore(today)
                            && !sc.getDeadline().isAfter(urgentCutoff))
                    .limit(3)
                    .forEach(sc -> urgent.add(new DigestItem("SCHOLARSHIP", sc.getId(), sc.getTitle(),
                            nullStr(sc.getFunder()), sc.getDeadline())));
        }

        return new DigestResponse(Instant.now(), urgent, approaching, webinarItems);
    }

    // -- helpers --

    private static Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) return Set.of();
        return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
                .filter(t -> t.length() > 2)
                .collect(Collectors.toSet());
    }

    private static int overlap(Set<String> a, Set<String> b) {
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        return intersection.size();
    }

    private static String nullStr(String s) {
        return s == null ? "" : s;
    }

    private static String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max) + "…";
    }

    private record ScoredItem<T>(T item, int score) {}
}
