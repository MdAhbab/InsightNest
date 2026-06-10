package com.insightnest.profile;

import com.insightnest.profile.dto.FacultyProfileRequest;
import com.insightnest.profile.dto.FacultyProfileResponse;
import com.insightnest.profile.dto.LearnerProfileRequest;
import com.insightnest.profile.dto.LearnerProfileResponse;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {
    private final ProfileService profileService;
    private final UserService userService;

    public ProfileController(ProfileService profileService, UserService userService) {
        this.profileService = profileService;
        this.userService = userService;
    }

    @GetMapping("/learner")
    @PreAuthorize("hasRole('LEARNER')")
    public LearnerProfileResponse getLearnerProfile() {
        User user = userService.getCurrentUser();
        return LearnerProfileResponse.from(profileService.getLearnerProfile(user));
    }

    @PutMapping("/learner")
    @PreAuthorize("hasRole('LEARNER')")
    public LearnerProfileResponse updateLearnerProfile(@RequestBody LearnerProfileRequest request) {
        User user = userService.getCurrentUser();
        return LearnerProfileResponse.from(profileService.updateLearner(user, request));
    }

    @GetMapping("/faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public FacultyProfileResponse getFacultyProfile() {
        User user = userService.getCurrentUser();
        return FacultyProfileResponse.from(profileService.getFacultyProfile(user));
    }

    @PutMapping("/faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public FacultyProfileResponse updateFacultyProfile(@RequestBody FacultyProfileRequest request) {
        User user = userService.getCurrentUser();
        return FacultyProfileResponse.from(profileService.updateFaculty(user, request));
    }
}
