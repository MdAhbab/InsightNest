package com.insightnest.scholarship;

import com.insightnest.exception.ApiException;
import com.insightnest.scholarship.dto.ScholarshipApplicationRequest;
import com.insightnest.scholarship.dto.ScholarshipApplicationResponse;
import com.insightnest.scholarship.dto.ScholarshipRequest;
import com.insightnest.scholarship.dto.ScholarshipResponse;
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
@RequestMapping("/api/v1/scholarships")
public class ScholarshipController {
    private final ScholarshipRepository scholarshipRepository;
    private final ScholarshipService scholarshipService;

    public ScholarshipController(ScholarshipRepository scholarshipRepository, ScholarshipService scholarshipService) {
        this.scholarshipRepository = scholarshipRepository;
        this.scholarshipService = scholarshipService;
    }

    @GetMapping
    public Page<ScholarshipResponse> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return scholarshipRepository.findAll(pageable).map(ScholarshipResponse::from);
    }

    @GetMapping("/{id}")
    public ScholarshipResponse get(@PathVariable Long id) {
        return scholarshipRepository.findById(id)
                .map(ScholarshipResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Scholarship not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ScholarshipResponse create(@Valid @RequestBody ScholarshipRequest request) {
        return ScholarshipResponse.from(scholarshipService.createScholarship(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ScholarshipResponse update(@PathVariable Long id, @Valid @RequestBody ScholarshipRequest request) {
        return ScholarshipResponse.from(scholarshipService.updateScholarship(id, request));
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('LEARNER')")
    public ScholarshipApplicationResponse apply(@PathVariable Long id,
                                                @Valid @RequestBody ScholarshipApplicationRequest request) {
        return ScholarshipApplicationResponse.from(scholarshipService.applyToScholarship(id, request));
    }

    @GetMapping("/applications/me")
    @PreAuthorize("hasRole('LEARNER')")
    public List<ScholarshipApplicationResponse> myApplications() {
        return scholarshipService.getMyApplications().stream().map(ScholarshipApplicationResponse::from).toList();
    }

    @GetMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<ScholarshipApplicationResponse> allApplications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return scholarshipService.getAllApplications(pageable).map(ScholarshipApplicationResponse::from);
    }

    @PatchMapping("/applications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ScholarshipApplicationResponse updateStatus(@PathVariable Long id,
                                                       @Valid @RequestBody ScholarshipStatusRequest request) {
        return ScholarshipApplicationResponse.from(scholarshipService.updateStatus(id, request));
    }
}
