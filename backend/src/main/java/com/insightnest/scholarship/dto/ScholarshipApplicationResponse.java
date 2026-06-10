package com.insightnest.scholarship.dto;

import com.insightnest.scholarship.ScholarshipApplication;
import com.insightnest.scholarship.ScholarshipApplicationStatus;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;

public record ScholarshipApplicationResponse(Long id, ScholarshipApplicationStatus status, String personalStatement,
                                             String notes, ScholarshipResponse scholarship, UserSummary learner,
                                             Instant createdAt) {
    public static ScholarshipApplicationResponse from(ScholarshipApplication application) {
        if (application == null) {
            return null;
        }
        return new ScholarshipApplicationResponse(application.getId(), application.getStatus(),
                application.getPersonalStatement(), application.getNotes(),
                ScholarshipResponse.from(application.getScholarship()), UserSummary.from(application.getLearner()),
                application.getCreatedAt());
    }
}
