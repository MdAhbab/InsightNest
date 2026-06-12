package com.insightnest.university;

import com.insightnest.common.events.AuditEvent;
import com.insightnest.exception.ApiException;
import com.insightnest.university.dto.UniversityRequest;
import com.insightnest.university.dto.UniversityResponse;
import com.insightnest.user.UserService;
import jakarta.validation.Valid;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/universities")
public class UniversityController {
    private final UniversityRepository universityRepository;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;

    public UniversityController(UniversityRepository universityRepository,
                                UserService userService,
                                ApplicationEventPublisher eventPublisher) {
        this.universityRepository = universityRepository;
        this.userService = userService;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping
    public Page<UniversityResponse> list(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return universityRepository.findAll(pageable).map(UniversityResponse::from);
    }

    @GetMapping("/{id}")
    public UniversityResponse get(@PathVariable Long id) {
        return universityRepository.findById(id)
                .map(UniversityResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "University not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UniversityResponse create(@Valid @RequestBody UniversityRequest request) {
        University university = new University();
        applyRequest(university, request);
        University saved = universityRepository.save(university);
        eventPublisher.publishEvent(new AuditEvent(userService.getCurrentUser(), "UNIVERSITY_CREATED",
                "University", saved.getId(), saved.getName()));
        return UniversityResponse.from(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UniversityResponse update(@PathVariable Long id, @Valid @RequestBody UniversityRequest request) {
        University university = universityRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "University not found"));
        applyRequest(university, request);
        University saved = universityRepository.save(university);
        eventPublisher.publishEvent(new AuditEvent(userService.getCurrentUser(), "UNIVERSITY_UPDATED",
                "University", saved.getId(), saved.getName()));
        return UniversityResponse.from(saved);
    }

    private void applyRequest(University university, UniversityRequest request) {
        university.setName(request.getName());
        university.setCountry(request.getCountry());
        university.setCity(request.getCity());
        university.setRanking(request.getRanking());
        university.setWebsite(request.getWebsite());
        university.setDescription(request.getDescription());
        university.setFoundedYear(request.getFoundedYear());
        university.setStudentCount(request.getStudentCount());
        university.setTags(request.getTags());
        university.setArchived(request.isArchived());
    }
}
