package com.insightnest.research;

import com.insightnest.exception.ApiException;
import com.insightnest.research.dto.ResearchJoinRequestDto;
import com.insightnest.research.dto.ResearchJoinStatusRequest;
import com.insightnest.research.dto.ResearchProjectRequest;
import com.insightnest.research.dto.ResearchProjectStatusRequest;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResearchService {
    private final ResearchProjectRepository projectRepository;
    private final ResearchJoinRequestRepository joinRequestRepository;
    private final UserService userService;

    public ResearchService(ResearchProjectRepository projectRepository,
                           ResearchJoinRequestRepository joinRequestRepository,
                           UserService userService) {
        this.projectRepository = projectRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.userService = userService;
    }

    public ResearchProject createProject(ResearchProjectRequest request) {
        User user = userService.getCurrentUser();
        ResearchProject project = new ResearchProject();
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setRequiredSkills(request.getRequiredSkills());
        project.setTags(request.getTags());
        project.setCreatedBy(user);
        return projectRepository.save(project);
    }

    public ResearchProject updateStatus(Long id, ResearchProjectStatusRequest request) {
        User user = userService.getCurrentUser();
        ResearchProject project = projectRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!project.getCreatedBy().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not project owner");
        }
        project.setStatus(request.getStatus());
        return projectRepository.save(project);
    }

    public ResearchJoinRequest requestToJoin(Long projectId, ResearchJoinRequestDto request) {
        User user = userService.getCurrentUser();
        ResearchProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Project not found"));
        if (joinRequestRepository.existsByProjectAndRequester(project, user)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Join request already submitted");
        }
        ResearchJoinRequest joinRequest = new ResearchJoinRequest();
        joinRequest.setProject(project);
        joinRequest.setRequester(user);
        joinRequest.setMessage(request.getMessage());
        joinRequest.setSkills(request.getSkills());
        return joinRequestRepository.save(joinRequest);
    }

    public List<ResearchJoinRequest> getOwnedRequests() {
        User user = userService.getCurrentUser();
        return joinRequestRepository.findByProjectCreatedBy(user);
    }

    public ResearchJoinRequest updateJoinRequest(Long id, ResearchJoinStatusRequest request) {
        User user = userService.getCurrentUser();
        ResearchJoinRequest joinRequest = joinRequestRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Join request not found"));
        if (!joinRequest.getProject().getCreatedBy().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not project owner");
        }
        joinRequest.setStatus(request.getStatus());
        return joinRequestRepository.save(joinRequest);
    }
}
