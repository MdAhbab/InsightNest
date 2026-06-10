package com.insightnest.scholarship;

import com.insightnest.exception.ApiException;
import com.insightnest.scholarship.dto.ScholarshipApplicationRequest;
import com.insightnest.scholarship.dto.ScholarshipRequest;
import com.insightnest.scholarship.dto.ScholarshipStatusRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
    public Page<Scholarship> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return scholarshipRepository.findAll(pageable);
    }

    @GetMapping("/{id}")
    public Scholarship get(@PathVariable Long id) {
        return scholarshipRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Scholarship not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Scholarship create(@Valid @RequestBody ScholarshipRequest request) {
        return scholarshipService.createScholarship(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Scholarship update(@PathVariable Long id, @Valid @RequestBody ScholarshipRequest request) {
        return scholarshipService.updateScholarship(id, request);
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('LEARNER')")
    public ScholarshipApplication apply(@PathVariable Long id, @Valid @RequestBody ScholarshipApplicationRequest request) {
        return scholarshipService.applyToScholarship(id, request);
    }

    @GetMapping("/applications/me")
    @PreAuthorize("hasRole('LEARNER')")
    public List<ScholarshipApplication> myApplications() {
        return scholarshipService.getMyApplications();
    }

    @GetMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<ScholarshipApplication> allApplications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return scholarshipService.getAllApplications(pageable);
    }

    @PatchMapping("/applications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ScholarshipApplication updateStatus(@PathVariable Long id, @Valid @RequestBody ScholarshipStatusRequest request) {
        return scholarshipService.updateStatus(id, request);
    }
}
