package com.insightnest.user.dto;

import com.insightnest.profile.FacultyProfile;
import com.insightnest.profile.LearnerProfile;
import com.insightnest.user.Role;
import com.insightnest.user.User;

import java.time.Instant;
import java.util.Set;

public record PublicUserResponse(Long id, String fullName, Set<Role> roles, Instant joinedAt,
                                 PublicLearnerProfile learnerProfile,
                                 PublicFacultyProfile facultyProfile) {

    public record PublicLearnerProfile(String bio, String educationHistory, String cgpa,
                                       String hobbies, String nationality, String socialLinks) {
        public static PublicLearnerProfile from(LearnerProfile p) {
            return new PublicLearnerProfile(p.getBio(), p.getEducationHistory(), p.getCgpa(),
                    p.getHobbies(), p.getNationality(), p.getSocialLinks());
        }
    }

    public record PublicFacultyProfile(String expertise, String researchInterests, String department,
                                       String website, String linkedIn) {
        public static PublicFacultyProfile from(FacultyProfile p) {
            return new PublicFacultyProfile(p.getExpertise(), p.getResearchInterests(),
                    p.getDepartment(), p.getWebsite(), p.getLinkedIn());
        }
    }

    public static PublicUserResponse from(User user, LearnerProfile learner, FacultyProfile faculty) {
        PublicLearnerProfile lp = learner != null ? PublicLearnerProfile.from(learner) : null;
        PublicFacultyProfile fp = faculty != null ? PublicFacultyProfile.from(faculty) : null;
        return new PublicUserResponse(user.getId(), user.getFullName(), user.getRoles(),
                user.getCreatedAt(), lp, fp);
    }
}
