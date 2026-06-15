package com.insightnest.agent;

import com.insightnest.agent.dto.CitationItem;
import com.insightnest.agent.dto.CounsellorRequest;
import com.insightnest.agent.dto.CounsellorResponse;
import com.insightnest.agent.dto.DigestResponse;
import com.insightnest.agent.dto.LibrarianRequest;
import com.insightnest.agent.dto.LibrarianResponse;
import com.insightnest.agent.dto.LibrarianSourceItem;
import com.insightnest.agent.dto.MatchmakerItem;
import com.insightnest.agent.llm.ResilientChatModel;
import com.insightnest.profile.LearnerProfileRepository;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * LLM-backed {@link AgentBrain}, active only when {@code agent.llm.enabled=true}.
 *
 * <p>Design: <b>grounded narration</b>. {@link HeuristicBrain} still performs all data
 * retrieval against the live repositories (the "tools"), producing real citations,
 * sources and match scores. The LLM's only job is to rewrite the prose/rationale over
 * that grounded data — it is told it may only reference the items we hand it, which makes
 * hallucinated programmes/scholarships/resources structurally impossible. If the LLM layer
 * fails for any reason, each method returns the heuristic result unchanged, so the agent
 * endpoints never hard-fail.
 */
@Component
@Primary
@ConditionalOnProperty(prefix = "agent.llm", name = "enabled", havingValue = "true")
public class GemmaBrain implements AgentBrain {

    private static final Logger log = LoggerFactory.getLogger(GemmaBrain.class);
    private static final int MAX_RANKED_FOR_LLM = 8;
    private static final int MAX_HISTORY = 6;

    private final HeuristicBrain heuristic;
    private final ResilientChatModel llm;
    private final LearnerProfileRepository learnerProfileRepository;
    private final UserService userService;

    public GemmaBrain(HeuristicBrain heuristic,
                      ResilientChatModel llm,
                      LearnerProfileRepository learnerProfileRepository,
                      UserService userService) {
        this.heuristic = heuristic;
        this.llm = llm;
        this.learnerProfileRepository = learnerProfileRepository;
        this.userService = userService;
        log.info("GemmaBrain active — agent responses will be narrated by the configured LLM provider chain");
    }

    // ── Counsellor ─────────────────────────────────────────────────────────────

    @Override
    public CounsellorResponse counsel(CounsellorRequest request) {
        CounsellorResponse grounded = heuristic.counsel(request);
        try {
            String system = """
                    You are Nest Counsellor, a concise, warm study-abroad and higher-education advisor for InsightNest.
                    Strict rules:
                    - Recommend ONLY the catalogue items listed below. Never invent programmes, scholarships, universities or deadlines.
                    - If no catalogue items are listed, give brief general guidance and ask ONE clarifying question (field, level, region, budget, or timeline).
                    - Be specific and practical. Keep it to 2-4 short paragraphs. Plain text, no markdown headings.""";

            StringBuilder user = new StringBuilder();
            String profile = currentProfileSummary();
            if (!profile.isBlank()) {
                user.append("The learner's profile:\n").append(profile).append("\n\n");
            }
            appendHistory(user, request);
            user.append("Learner's message:\n").append(safe(request.getMessage())).append("\n\n");
            user.append(citationBlock(grounded.citations()));

            String reply = llm.complete(system, user.toString());
            return new CounsellorResponse(reply, grounded.citations());
        } catch (RuntimeException e) {
            log.warn("Counsellor LLM narration failed, serving heuristic answer: {}", e.getMessage());
            return grounded;
        }
    }

    // ── Matchmaker ─────────────────────────────────────────────────────────────

    @Override
    public List<MatchmakerItem> matchProjects(User learner) {
        List<MatchmakerItem> grounded = heuristic.matchProjects(learner);
        if (grounded.isEmpty()) {
            return grounded;
        }
        try {
            int k = Math.min(MAX_RANKED_FOR_LLM, grounded.size());
            String profile = profileSummary(learner);

            StringBuilder user = new StringBuilder();
            user.append("Learner profile:\n").append(profile.isBlank() ? "(no profile details provided)" : profile).append("\n\n");
            user.append("Open research projects (numbered):\n");
            for (int i = 0; i < k; i++) {
                var p = grounded.get(i).project();
                user.append(i + 1).append("| ").append(safe(p.title()));
                if (notBlank(p.field())) user.append(" — field: ").append(p.field());
                if (notBlank(p.requiredSkills())) user.append(" — skills: ").append(truncate(p.requiredSkills(), 120));
                if (notBlank(p.description())) user.append(" — ").append(truncate(p.description(), 160));
                user.append("\n");
            }
            user.append("""

                    For EACH numbered project, write one sentence (max ~25 words) explaining how it fits this learner.
                    Reply with exactly one line per project in the form:
                    <number>| <reason>
                    No preamble, no extra lines.""");

            String system = "You are Research Matchmaker for InsightNest. Ground every reason in the learner profile and the "
                    + "project's stated field/skills. Be honest when overlap is weak.";

            Map<Integer, String> rationales = parseNumbered(llm.complete(system, user.toString()));

            List<MatchmakerItem> result = new ArrayList<>(grounded.size());
            for (int i = 0; i < grounded.size(); i++) {
                MatchmakerItem item = grounded.get(i);
                String llmRationale = rationales.get(i + 1);
                if (i < k && notBlank(llmRationale)) {
                    result.add(new MatchmakerItem(item.project(), item.score(), llmRationale));
                } else {
                    result.add(item);
                }
            }
            return result;
        } catch (RuntimeException e) {
            log.warn("Matchmaker LLM narration failed, serving heuristic scores: {}", e.getMessage());
            return grounded;
        }
    }

    // ── Librarian ──────────────────────────────────────────────────────────────

    @Override
    public LibrarianResponse librarian(LibrarianRequest request) {
        LibrarianResponse grounded = heuristic.librarian(request);
        // Nothing retrieved above the threshold → do not let the LLM improvise.
        if (grounded.sources() == null || grounded.sources().isEmpty()) {
            return grounded;
        }
        try {
            String system = """
                    You are Ask the Library, InsightNest's resource librarian.
                    Answer the question USING ONLY the numbered sources provided. Support each claim with a citation like [1] or [2].
                    If the sources do not contain the answer, say the archive does not cover it — do not use outside knowledge.
                    Keep the answer concise. Plain text.""";

            StringBuilder user = new StringBuilder();
            user.append("Question:\n").append(safe(request.getQuestion())).append("\n\n");
            user.append("Numbered sources:\n");
            List<LibrarianSourceItem> sources = grounded.sources();
            for (int i = 0; i < sources.size(); i++) {
                LibrarianSourceItem s = sources.get(i);
                user.append("[").append(i + 1).append("] ").append(safe(s.title()));
                if (notBlank(s.author())) user.append(" — ").append(s.author());
                if (s.year() != null) user.append(" (").append(s.year()).append(")");
                user.append("\n");
            }
            user.append("\nRetrieved context:\n").append(truncate(grounded.answer(), 1200));

            String answer = llm.complete(system, user.toString());
            return new LibrarianResponse(answer, grounded.sources());
        } catch (RuntimeException e) {
            log.warn("Librarian LLM narration failed, serving heuristic answer: {}", e.getMessage());
            return grounded;
        }
    }

    // ── Digest ─────────────────────────────────────────────────────────────────

    @Override
    public DigestResponse digest(User user) {
        // The digest is a structured deadline ledger; narration adds little and would change
        // the response contract, so it stays on the deterministic aggregation.
        return heuristic.digest(user);
    }

    // ── helpers ──────────────────────────────────────────────────────────────────

    private String currentProfileSummary() {
        try {
            return profileSummary(userService.getCurrentUser());
        } catch (RuntimeException e) {
            return "";
        }
    }

    private String profileSummary(User user) {
        if (user == null) {
            return "";
        }
        try {
            return learnerProfileRepository.findByUser(user).map(p -> {
                StringBuilder sb = new StringBuilder();
                appendField(sb, "Education", p.getEducationHistory());
                appendField(sb, "CGPA", p.getCgpa());
                appendField(sb, "IELTS", p.getIeltsScore());
                appendField(sb, "Projects", p.getProjects());
                appendField(sb, "Publications", p.getPublications());
                appendField(sb, "Interests", p.getHobbies());
                appendField(sb, "Nationality", p.getNationality());
                appendField(sb, "Bio", p.getBio());
                return sb.toString().trim();
            }).orElse("");
        } catch (RuntimeException e) {
            return "";
        }
    }

    private void appendHistory(StringBuilder user, CounsellorRequest request) {
        List<CounsellorRequest.HistoryEntry> history = request.getHistory();
        if (history == null || history.isEmpty()) {
            return;
        }
        int start = Math.max(0, history.size() - MAX_HISTORY);
        user.append("Conversation so far:\n");
        for (int i = start; i < history.size(); i++) {
            CounsellorRequest.HistoryEntry h = history.get(i);
            if (h != null && notBlank(h.text())) {
                String who = "user".equalsIgnoreCase(h.role()) ? "Learner" : "Counsellor";
                user.append(who).append(": ").append(truncate(h.text(), 400)).append("\n");
            }
        }
        user.append("\n");
    }

    private static String citationBlock(List<CitationItem> citations) {
        if (citations == null || citations.isEmpty()) {
            return "Catalogue matches: none were found for this query.";
        }
        StringBuilder sb = new StringBuilder("Catalogue matches you may recommend (do not invent others):\n");
        for (CitationItem c : citations) {
            sb.append("- ").append(c.title()).append(" (").append(c.type()).append(")");
            if (notBlank(c.subtitle())) sb.append(" — ").append(c.subtitle());
            if (c.deadline() != null) sb.append(" — deadline ").append(c.deadline());
            sb.append("\n");
        }
        return sb.toString();
    }

    private static Map<Integer, String> parseNumbered(String raw) {
        Map<Integer, String> out = new HashMap<>();
        if (raw == null) {
            return out;
        }
        for (String line : raw.split("\\R")) {
            String t = line.trim();
            int bar = t.indexOf('|');
            if (bar <= 0) {
                continue;
            }
            String digits = t.substring(0, bar).replaceAll("[^0-9]", "");
            String reason = t.substring(bar + 1).trim();
            if (digits.isEmpty() || reason.isEmpty()) {
                continue;
            }
            try {
                out.put(Integer.parseInt(digits), reason);
            } catch (NumberFormatException ignored) {
                // skip malformed line
            }
        }
        return out;
    }

    private static void appendField(StringBuilder sb, String label, String value) {
        if (notBlank(value)) {
            sb.append(label).append(": ").append(truncate(value, 280)).append("\n");
        }
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static String safe(String s) {
        return s == null ? "" : s.trim();
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return "";
        }
        return s.length() <= max ? s : s.substring(0, max) + "…";
    }
}
