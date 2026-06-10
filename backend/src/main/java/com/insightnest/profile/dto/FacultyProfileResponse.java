package com.insightnest.profile.dto;

import com.insightnest.profile.FacultyProfile;

import java.time.Instant;

public record FacultyProfileResponse(Long id, String expertise, String researchInterests, String department,
                                     String website, String linkedIn, String taughtCourses, String publications,
                                     String bio, Instant updatedAt) {
    public static FacultyProfileResponse from(FacultyProfile profile) {
        if (profile == null) {
            return null;
        }
        return new FacultyProfileResponse(profile.getId(), profile.getExpertise(), profile.getResearchInterests(),
                profile.getDepartment(), profile.getWebsite(), profile.getLinkedIn(), profile.getTaughtCourses(),
                profile.getPublications(), profile.getBio(), profile.getUpdatedAt());
    }
}
