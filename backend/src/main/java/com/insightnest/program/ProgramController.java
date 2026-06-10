package com.insightnest.program;

import com.insightnest.exception.ApiException;
import com.insightnest.program.dto.ApplicationStatusRequest;
import com.insightnest.program.dto.ProgramApplicationRequest;
import com.insightnest.program.dto.ProgramRequest;
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
@RequestMapping("/api/programs")
public class ProgramController {
    private final ProgramRepository programRepository;
    private final ProgramService programService;

    public ProgramController(ProgramRepository programRepository, ProgramService programService) {
        this.programRepository = programRepository;
        this.programService = programService;
    }

    @GetMapping
    public Page<Program> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return programRepository.findAll(pageable);
    }

    @GetMapping("/{id}")
    public Program get(@PathVariable Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Program not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Program create(@Valid @RequestBody ProgramRequest request) {
        return programService.createProgram(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Program update(@PathVariable Long id, @Valid @RequestBody ProgramRequest request) {
        return programService.updateProgram(id, request);
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('LEARNER')")
    public ProgramApplication apply(@PathVariable Long id, @Valid @RequestBody ProgramApplicationRequest request) {
        return programService.applyToProgram(id, request);
    }

    @GetMapping("/applications/me")
    @PreAuthorize("hasRole('LEARNER')")
    public List<ProgramApplication> myApplications() {
        return programService.getMyApplications();
    }

    @GetMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<ProgramApplication> allApplications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return programService.getAllApplications(pageable);
    }

    @PatchMapping("/applications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProgramApplication updateStatus(@PathVariable Long id, @Valid @RequestBody ApplicationStatusRequest request) {
        return programService.updateApplicationStatus(id, request);
    }
}
