package com.insightnest.scholarship;

import com.insightnest.exception.ApiException;
import com.insightnest.scholarship.dto.ScholarshipApplicationRequest;
import com.insightnest.scholarship.dto.ScholarshipRequest;
import com.insightnest.scholarship.dto.ScholarshipStatusRequest;
import com.insightnest.user.Role;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ScholarshipService {
    private final ScholarshipRepository scholarshipRepository;
    private final ScholarshipApplicationRepository scholarshipApplicationRepository;
    private final UserService userService;

    public ScholarshipService(ScholarshipRepository scholarshipRepository,
                              ScholarshipApplicationRepository scholarshipApplicationRepository,
                              UserService userService) {
        this.scholarshipRepository = scholarshipRepository;
        this.scholarshipApplicationRepository = scholarshipApplicationRepository;
        this.userService = userService;
    }

    public Scholarship createScholarship(ScholarshipRequest request) {
        Scholarship scholarship = new Scholarship();
        applyScholarship(scholarship, request);
        return scholarshipRepository.save(scholarship);
    }

    public Scholarship updateScholarship(Long id, ScholarshipRequest request) {
        Scholarship scholarship = scholarshipRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Scholarship not found"));
        applyScholarship(scholarship, request);
        return scholarshipRepository.save(scholarship);
    }

    public ScholarshipApplication applyToScholarship(Long scholarshipId, ScholarshipApplicationRequest request) {
        User user = userService.getCurrentUser();
        if (!user.getRoles().contains(Role.LEARNER)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only learners can apply");
        }
        Scholarship scholarship = scholarshipRepository.findById(scholarshipId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Scholarship not found"));
        if (scholarship.getDeadline() != null && scholarship.getDeadline().isBefore(LocalDate.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Scholarship deadline has passed");
        }
        if (scholarshipApplicationRepository.existsByScholarshipAndLearner(scholarship, user)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Duplicate application not allowed");
        }
        ScholarshipApplication application = new ScholarshipApplication();
        application.setScholarship(scholarship);
        application.setLearner(user);
        application.setPersonalStatement(request.getPersonalStatement());
        application.setNotes(request.getNotes());
        return scholarshipApplicationRepository.save(application);
    }

    public List<ScholarshipApplication> getMyApplications() {
        User user = userService.getCurrentUser();
        return scholarshipApplicationRepository.findByLearner(user);
    }

    public Page<ScholarshipApplication> getAllApplications(Pageable pageable) {
        return scholarshipApplicationRepository.findAll(pageable);
    }

    public ScholarshipApplication updateStatus(Long id, ScholarshipStatusRequest request) {
        ScholarshipApplication application = scholarshipApplicationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found"));
        application.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            application.setNotes(request.getNotes());
        }
        return scholarshipApplicationRepository.save(application);
    }

    private void applyScholarship(Scholarship scholarship, ScholarshipRequest request) {
        scholarship.setTitle(request.getTitle());
        scholarship.setDescription(request.getDescription());
        scholarship.setEligibility(request.getEligibility());
        scholarship.setDeadline(request.getDeadline());
        scholarship.setArchived(request.isArchived());
    }
}
