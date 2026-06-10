package com.insightnest.university;

import com.insightnest.exception.ApiException;
import com.insightnest.university.dto.UniversityRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/universities")
public class UniversityController {
    private final UniversityRepository universityRepository;

    public UniversityController(UniversityRepository universityRepository) {
        this.universityRepository = universityRepository;
    }

    @GetMapping
    public Page<University> list(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return universityRepository.findAll(pageable);
    }

    @GetMapping("/{id}")
    public University get(@PathVariable Long id) {
        return universityRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "University not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public University create(@Valid @RequestBody UniversityRequest request) {
        University university = new University();
        applyRequest(university, request);
        return universityRepository.save(university);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public University update(@PathVariable Long id, @Valid @RequestBody UniversityRequest request) {
        University university = universityRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "University not found"));
        applyRequest(university, request);
        return universityRepository.save(university);
    }

    private void applyRequest(University university, UniversityRequest request) {
        university.setName(request.getName());
        university.setCountry(request.getCountry());
        university.setCity(request.getCity());
        university.setRanking(request.getRanking());
        university.setWebsite(request.getWebsite());
        university.setDescription(request.getDescription());
        university.setArchived(request.isArchived());
    }
}
