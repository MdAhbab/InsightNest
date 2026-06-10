package com.insightnest.program;

import com.insightnest.exception.ApiException;
import com.insightnest.program.dto.ApplicationStatusRequest;
import com.insightnest.program.dto.ProgramApplicationRequest;
import com.insightnest.program.dto.ProgramApplicationResponse;
import com.insightnest.program.dto.ProgramRequest;
import com.insightnest.program.dto.ProgramResponse;
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
@RequestMapping("/api/v1/programs")
public class ProgramController {
    private final ProgramRepository programRepository;
    private final ProgramService programService;

    public ProgramController(ProgramRepository programRepository, ProgramService programService) {
        this.programRepository = programRepository;
        this.programService = programService;
    }

    @GetMapping
    public Page<ProgramResponse> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return programRepository.findAll(pageable).map(ProgramResponse::from);
    }

    @GetMapping("/{id}")
    public ProgramResponse get(@PathVariable Long id) {
        return programRepository.findById(id)
                .map(ProgramResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Program not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ProgramResponse create(@Valid @RequestBody ProgramRequest request) {
        return ProgramResponse.from(programService.createProgram(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProgramResponse update(@PathVariable Long id, @Valid @RequestBody ProgramRequest request) {
        return ProgramResponse.from(programService.updateProgram(id, request));
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('LEARNER')")
    public ProgramApplicationResponse apply(@PathVariable Long id,
                                            @Valid @RequestBody ProgramApplicationRequest request) {
        return ProgramApplicationResponse.from(programService.applyToProgram(id, request));
    }

    @GetMapping("/applications/me")
    @PreAuthorize("hasRole('LEARNER')")
    public List<ProgramApplicationResponse> myApplications() {
        return programService.getMyApplications().stream().map(ProgramApplicationResponse::from).toList();
    }

    @GetMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<ProgramApplicationResponse> allApplications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return programService.getAllApplications(pageable).map(ProgramApplicationResponse::from);
    }

    @PatchMapping("/applications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProgramApplicationResponse updateStatus(@PathVariable Long id,
                                                   @Valid @RequestBody ApplicationStatusRequest request) {
        return ProgramApplicationResponse.from(programService.updateApplicationStatus(id, request));
    }
}
