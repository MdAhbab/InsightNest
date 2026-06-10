package com.insightnest.program.dto;

import com.insightnest.program.ProgramApplication;
import com.insightnest.program.ProgramApplicationStatus;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;

public record ProgramApplicationResponse(Long id, ProgramApplicationStatus status, String educationSummary,
                                         String statementOfPurpose, String supportingDocumentPath, String notes,
                                         ProgramResponse program, UserSummary learner, Instant createdAt) {
    public static ProgramApplicationResponse from(ProgramApplication application) {
        if (application == null) {
            return null;
        }
        return new ProgramApplicationResponse(application.getId(), application.getStatus(),
                application.getEducationSummary(), application.getStatementOfPurpose(),
                application.getSupportingDocumentPath(), application.getNotes(),
                ProgramResponse.from(application.getProgram()), UserSummary.from(application.getLearner()),
                application.getCreatedAt());
    }
}
