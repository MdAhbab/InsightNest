package com.insightnest.profile.dto;

import com.insightnest.profile.LearnerProfile;

import java.time.Instant;

public record LearnerProfileResponse(Long id, String educationHistory, String cgpa, String ieltsScore,
                                     String projects, String publications, String hobbies, String nationality,
                                     String socialLinks, String bio, Instant updatedAt) {
    public static LearnerProfileResponse from(LearnerProfile profile) {
        if (profile == null) {
            return null;
        }
        return new LearnerProfileResponse(profile.getId(), profile.getEducationHistory(), profile.getCgpa(),
                profile.getIeltsScore(), profile.getProjects(), profile.getPublications(), profile.getHobbies(),
                profile.getNationality(), profile.getSocialLinks(), profile.getBio(), profile.getUpdatedAt());
    }
}
