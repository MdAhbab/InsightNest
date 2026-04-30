package com.insightnest.university;

import com.insightnest.exception.ApiException;
import com.insightnest.university.dto.UniversityRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/universities")
public class UniversityController {
    private final UniversityRepository universityRepository;

    public UniversityController(UniversityRepository universityRepository) {
        this.universityRepository = universityRepository;
    }

    @GetMapping
    public List<University> list() {
        return universityRepository.findAll();
    }

    @GetMapping("/{id}")
    public University get(@PathVariable Long id) {
        return universityRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "University not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public University create(@RequestBody UniversityRequest request) {
        University university = new University();
        applyRequest(university, request);
        return universityRepository.save(university);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public University update(@PathVariable Long id, @RequestBody UniversityRequest request) {
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
