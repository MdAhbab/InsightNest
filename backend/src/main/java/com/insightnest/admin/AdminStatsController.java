package com.insightnest.admin;

import com.insightnest.contact.ContactRepository;
import com.insightnest.contact.ContactStatus;
import com.insightnest.forum.ForumThreadRepository;
import com.insightnest.program.ProgramApplicationRepository;
import com.insightnest.program.ProgramApplicationStatus;
import com.insightnest.program.ProgramRepository;
import com.insightnest.research.ResearchJoinRequestRepository;
import com.insightnest.research.ResearchJoinStatus;
import com.insightnest.research.ResearchProjectRepository;
import com.insightnest.resource.LibraryResourceRepository;
import com.insightnest.scholarship.ScholarshipApplicationRepository;
import com.insightnest.scholarship.ScholarshipApplicationStatus;
import com.insightnest.scholarship.ScholarshipRepository;
import com.insightnest.university.UniversityRepository;
import com.insightnest.user.UserRepository;
import com.insightnest.webinar.WebinarRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminStatsController {
    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final ProgramRepository programRepository;
    private final ScholarshipRepository scholarshipRepository;
    private final ResearchProjectRepository researchProjectRepository;
    private final LibraryResourceRepository resourceRepository;
    private final WebinarRepository webinarRepository;
    private final ForumThreadRepository forumThreadRepository;
    private final ProgramApplicationRepository programApplicationRepository;
    private final ScholarshipApplicationRepository scholarshipApplicationRepository;
    private final ResearchJoinRequestRepository joinRequestRepository;
    private final ContactRepository contactRepository;

    public AdminStatsController(UserRepository userRepository,
                                UniversityRepository universityRepository,
                                ProgramRepository programRepository,
                                ScholarshipRepository scholarshipRepository,
                                ResearchProjectRepository researchProjectRepository,
                                LibraryResourceRepository resourceRepository,
                                WebinarRepository webinarRepository,
                                ForumThreadRepository forumThreadRepository,
                                ProgramApplicationRepository programApplicationRepository,
                                ScholarshipApplicationRepository scholarshipApplicationRepository,
                                ResearchJoinRequestRepository joinRequestRepository,
                                ContactRepository contactRepository) {
        this.userRepository = userRepository;
        this.universityRepository = universityRepository;
        this.programRepository = programRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.researchProjectRepository = researchProjectRepository;
        this.resourceRepository = resourceRepository;
        this.webinarRepository = webinarRepository;
        this.forumThreadRepository = forumThreadRepository;
        this.programApplicationRepository = programApplicationRepository;
        this.scholarshipApplicationRepository = scholarshipApplicationRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.contactRepository = contactRepository;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Long> stats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("users", userRepository.count());
        stats.put("universities", universityRepository.count());
        stats.put("programs", programRepository.count());
        stats.put("scholarships", scholarshipRepository.count());
        stats.put("researchProjects", researchProjectRepository.count());
        stats.put("resources", resourceRepository.count());
        stats.put("webinars", webinarRepository.count());
        stats.put("threads", forumThreadRepository.count());
        stats.put("pendingProgramApplications",
                programApplicationRepository.countByStatus(ProgramApplicationStatus.PENDING));
        stats.put("pendingScholarshipApplications",
                scholarshipApplicationRepository.countByStatus(ScholarshipApplicationStatus.PENDING));
        stats.put("pendingJoinRequests",
                joinRequestRepository.countByStatus(ResearchJoinStatus.PENDING));
        stats.put("newContactMessages",
                contactRepository.countByStatus(ContactStatus.NEW));
        return stats;
    }
}
