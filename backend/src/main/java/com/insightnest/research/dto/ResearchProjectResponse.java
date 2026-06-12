package com.insightnest.research.dto;

import com.insightnest.research.ResearchProject;
import com.insightnest.research.ResearchProjectStatus;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;
import java.time.LocalDate;

public record ResearchProjectResponse(Long id, String title, String description, String requiredSkills,
                                      String tags, ResearchProjectStatus status, UserSummary createdBy,
                                      String pi, String lab, String institution, Integer openings,
                                      String field, LocalDate deadline, Instant createdAt) {
    public static ResearchProjectResponse from(ResearchProject project) {
        if (project == null) {
            return null;
        }
        String pi = project.getCreatedBy() != null ? project.getCreatedBy().getFullName() : null;
        return new ResearchProjectResponse(project.getId(), project.getTitle(), project.getDescription(),
                project.getRequiredSkills(), project.getTags(), project.getStatus(),
                UserSummary.from(project.getCreatedBy()), pi,
                project.getLab(), project.getInstitution(), project.getOpenings(),
                project.getField(), project.getDeadline(), project.getCreatedAt());
    }
}
