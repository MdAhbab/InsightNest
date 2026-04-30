package com.insightnest.profile;

import com.insightnest.profile.dto.FacultyProfileRequest;
import com.insightnest.profile.dto.LearnerProfileRequest;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final ProfileService profileService;
    private final UserService userService;

    public ProfileController(ProfileService profileService, UserService userService) {
        this.profileService = profileService;
        this.userService = userService;
    }

    @GetMapping("/learner")
    @PreAuthorize("hasRole('LEARNER')")
    public LearnerProfile getLearnerProfile() {
        User user = userService.getCurrentUser();
        return profileService.getLearnerProfile(user);
    }

    @PutMapping("/learner")
    @PreAuthorize("hasRole('LEARNER')")
    public LearnerProfile updateLearnerProfile(@RequestBody LearnerProfileRequest request) {
        User user = userService.getCurrentUser();
        return profileService.updateLearner(user, request);
    }

    @GetMapping("/faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public FacultyProfile getFacultyProfile() {
        User user = userService.getCurrentUser();
        return profileService.getFacultyProfile(user);
    }

    @PutMapping("/faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public FacultyProfile updateFacultyProfile(@RequestBody FacultyProfileRequest request) {
        User user = userService.getCurrentUser();
        return profileService.updateFaculty(user, request);
    }
}
