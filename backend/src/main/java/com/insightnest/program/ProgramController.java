package com.insightnest.program;

import com.insightnest.exception.ApiException;
import com.insightnest.program.dto.ApplicationStatusRequest;
import com.insightnest.program.dto.ProgramApplicationRequest;
import com.insightnest.program.dto.ProgramRequest;
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
    public List<Program> list() {
        return programRepository.findAll();
    }

    @GetMapping("/{id}")
    public Program get(@PathVariable Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Program not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Program create(@RequestBody ProgramRequest request) {
        return programService.createProgram(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Program update(@PathVariable Long id, @RequestBody ProgramRequest request) {
        return programService.updateProgram(id, request);
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('LEARNER')")
    public ProgramApplication apply(@PathVariable Long id, @RequestBody ProgramApplicationRequest request) {
        return programService.applyToProgram(id, request);
    }

    @GetMapping("/applications/me")
    @PreAuthorize("hasRole('LEARNER')")
    public List<ProgramApplication> myApplications() {
        return programService.getMyApplications();
    }

    @GetMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ProgramApplication> allApplications() {
        return programService.getAllApplications();
    }

    @PatchMapping("/applications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProgramApplication updateStatus(@PathVariable Long id, @RequestBody ApplicationStatusRequest request) {
        return programService.updateApplicationStatus(id, request);
    }
}
