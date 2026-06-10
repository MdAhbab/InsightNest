package com.insightnest.research;

import com.insightnest.exception.ApiException;
import com.insightnest.research.dto.ResearchJoinRequestDto;
import com.insightnest.research.dto.ResearchJoinRequestResponse;
import com.insightnest.research.dto.ResearchJoinStatusRequest;
import com.insightnest.research.dto.ResearchProjectRequest;
import com.insightnest.research.dto.ResearchProjectResponse;
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
@RequestMapping("/api/v1/research")
public class ResearchController {
    private final ResearchProjectRepository projectRepository;
    private final ResearchService researchService;

    public ResearchController(ResearchProjectRepository projectRepository, ResearchService researchService) {
        this.projectRepository = projectRepository;
        this.researchService = researchService;
    }

    @GetMapping("/projects")
    public Page<ResearchProjectResponse> listProjects(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return projectRepository.findAll(pageable).map(ResearchProjectResponse::from);
    }

    @GetMapping("/projects/{id}")
    public ResearchProjectResponse getProject(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResearchProjectResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    @PostMapping("/projects")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public ResearchProjectResponse createProject(@Valid @RequestBody ResearchProjectRequest request) {
        return ResearchProjectResponse.from(researchService.createProject(request));
    }

    @PatchMapping("/projects/{id}/status")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public ResearchProjectResponse updateProjectStatus(@PathVariable Long id,
                                                       @Valid @RequestBody ResearchProjectStatusRequest request) {
        return ResearchProjectResponse.from(researchService.updateStatus(id, request));
    }

    @PostMapping("/projects/{id}/join")
    @PreAuthorize("hasRole('LEARNER')")
    public ResearchJoinRequestResponse requestToJoin(@PathVariable Long id,
                                                     @Valid @RequestBody ResearchJoinRequestDto request) {
        return ResearchJoinRequestResponse.from(researchService.requestToJoin(id, request));
    }

    @GetMapping("/requests/owned")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public List<ResearchJoinRequestResponse> getOwnedRequests() {
        return researchService.getOwnedRequests().stream().map(ResearchJoinRequestResponse::from).toList();
    }

    @PatchMapping("/requests/{id}")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public ResearchJoinRequestResponse updateJoinRequest(@PathVariable Long id,
                                                         @Valid @RequestBody ResearchJoinStatusRequest request) {
        return ResearchJoinRequestResponse.from(researchService.updateJoinRequest(id, request));
    }
}
