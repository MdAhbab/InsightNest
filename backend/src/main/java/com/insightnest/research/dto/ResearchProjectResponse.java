package com.insightnest.research.dto;

import com.insightnest.research.ResearchProject;
import com.insightnest.research.ResearchProjectStatus;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;

public record ResearchProjectResponse(Long id, String title, String description, String requiredSkills,
                                      String tags, ResearchProjectStatus status, UserSummary createdBy,
                                      Instant createdAt) {
    public static ResearchProjectResponse from(ResearchProject project) {
        if (project == null) {
            return null;
        }
        return new ResearchProjectResponse(project.getId(), project.getTitle(), project.getDescription(),
                project.getRequiredSkills(), project.getTags(), project.getStatus(),
                UserSummary.from(project.getCreatedBy()), project.getCreatedAt());
    }
}
