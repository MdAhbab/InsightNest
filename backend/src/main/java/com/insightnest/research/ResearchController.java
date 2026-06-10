package com.insightnest.research;

import com.insightnest.exception.ApiException;
import com.insightnest.research.dto.ResearchJoinRequestDto;
import com.insightnest.research.dto.ResearchJoinStatusRequest;
import com.insightnest.research.dto.ResearchProjectRequest;
import com.insightnest.research.dto.ResearchProjectStatusRequest;
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
@RequestMapping("/api/research")
public class ResearchController {
    private final ResearchProjectRepository projectRepository;
    private final ResearchService researchService;

    public ResearchController(ResearchProjectRepository projectRepository, ResearchService researchService) {
        this.projectRepository = projectRepository;
        this.researchService = researchService;
    }

    @GetMapping("/projects")
    public Page<ResearchProject> listProjects(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return projectRepository.findAll(pageable);
    }

    @GetMapping("/projects/{id}")
    public ResearchProject getProject(@PathVariable Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    @PostMapping("/projects")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public ResearchProject createProject(@Valid @RequestBody ResearchProjectRequest request) {
        return researchService.createProject(request);
    }

    @PatchMapping("/projects/{id}/status")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public ResearchProject updateProjectStatus(@PathVariable Long id,
                                               @Valid @RequestBody ResearchProjectStatusRequest request) {
        return researchService.updateStatus(id, request);
    }

    @PostMapping("/projects/{id}/join")
    @PreAuthorize("hasRole('LEARNER')")
    public ResearchJoinRequest requestToJoin(@PathVariable Long id, @Valid @RequestBody ResearchJoinRequestDto request) {
        return researchService.requestToJoin(id, request);
    }

    @GetMapping("/requests/owned")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public List<ResearchJoinRequest> getOwnedRequests() {
        return researchService.getOwnedRequests();
    }

    @PatchMapping("/requests/{id}")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public ResearchJoinRequest updateJoinRequest(@PathVariable Long id,
                                                 @Valid @RequestBody ResearchJoinStatusRequest request) {
        return researchService.updateJoinRequest(id, request);
    }
}
