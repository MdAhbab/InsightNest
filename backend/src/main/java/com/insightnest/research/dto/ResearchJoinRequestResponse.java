package com.insightnest.research.dto;

import com.insightnest.research.ResearchJoinRequest;
import com.insightnest.research.ResearchJoinStatus;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;

public record ResearchJoinRequestResponse(Long id, ResearchJoinStatus status, String message, String skills,
                                          ResearchProjectResponse project, UserSummary requester,
                                          Instant createdAt) {
    public static ResearchJoinRequestResponse from(ResearchJoinRequest request) {
        if (request == null) {
            return null;
        }
        return new ResearchJoinRequestResponse(request.getId(), request.getStatus(), request.getMessage(),
                request.getSkills(), ResearchProjectResponse.from(request.getProject()),
                UserSummary.from(request.getRequester()), request.getCreatedAt());
    }
}
