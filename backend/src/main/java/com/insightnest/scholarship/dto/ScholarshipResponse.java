package com.insightnest.scholarship.dto;

import com.insightnest.scholarship.Scholarship;

import java.time.Instant;
import java.time.LocalDate;

public record ScholarshipResponse(Long id, String title, String description, String eligibility,
                                  LocalDate deadline, boolean archived, Instant createdAt) {
    public static ScholarshipResponse from(Scholarship scholarship) {
        if (scholarship == null) {
            return null;
        }
        return new ScholarshipResponse(scholarship.getId(), scholarship.getTitle(), scholarship.getDescription(),
                scholarship.getEligibility(), scholarship.getDeadline(), scholarship.isArchived(),
                scholarship.getCreatedAt());
    }
}
