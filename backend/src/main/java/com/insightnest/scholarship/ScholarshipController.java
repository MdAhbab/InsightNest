package com.insightnest.scholarship;

import com.insightnest.exception.ApiException;
import com.insightnest.scholarship.dto.ScholarshipApplicationRequest;
import com.insightnest.scholarship.dto.ScholarshipRequest;
import com.insightnest.scholarship.dto.ScholarshipStatusRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scholarships")
public class ScholarshipController {
    private final ScholarshipRepository scholarshipRepository;
    private final ScholarshipService scholarshipService;

    public ScholarshipController(ScholarshipRepository scholarshipRepository, ScholarshipService scholarshipService) {
        this.scholarshipRepository = scholarshipRepository;
        this.scholarshipService = scholarshipService;
    }

    @GetMapping
    public List<Scholarship> list() {
        return scholarshipRepository.findAll();
    }

    @GetMapping("/{id}")
    public Scholarship get(@PathVariable Long id) {
        return scholarshipRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Scholarship not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Scholarship create(@RequestBody ScholarshipRequest request) {
        return scholarshipService.createScholarship(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Scholarship update(@PathVariable Long id, @RequestBody ScholarshipRequest request) {
        return scholarshipService.updateScholarship(id, request);
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('LEARNER')")
    public ScholarshipApplication apply(@PathVariable Long id, @RequestBody ScholarshipApplicationRequest request) {
        return scholarshipService.applyToScholarship(id, request);
    }

    @GetMapping("/applications/me")
    @PreAuthorize("hasRole('LEARNER')")
    public List<ScholarshipApplication> myApplications() {
        return scholarshipService.getMyApplications();
    }

    @GetMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ScholarshipApplication> allApplications() {
        return scholarshipService.getAllApplications();
    }

    @PatchMapping("/applications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ScholarshipApplication updateStatus(@PathVariable Long id, @RequestBody ScholarshipStatusRequest request) {
        return scholarshipService.updateStatus(id, request);
    }
}
