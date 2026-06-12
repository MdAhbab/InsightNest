package com.insightnest.user;

import com.insightnest.exception.ApiException;
import com.insightnest.profile.FacultyProfile;
import com.insightnest.profile.FacultyProfileRepository;
import com.insightnest.profile.LearnerProfile;
import com.insightnest.profile.LearnerProfileRepository;
import com.insightnest.user.dto.PasswordChangeRequest;
import com.insightnest.user.dto.PublicUserResponse;
import com.insightnest.user.dto.UserResponse;
import com.insightnest.user.dto.UserStatusRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final LearnerProfileRepository learnerProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;

    public UserController(UserService userService,
                          UserRepository userRepository,
                          LearnerProfileRepository learnerProfileRepository,
                          FacultyProfileRepository facultyProfileRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.learnerProfileRepository = learnerProfileRepository;
        this.facultyProfileRepository = facultyProfileRepository;
    }

    @GetMapping("/me")
    public UserResponse getMe() {
        return toResponse(userService.getCurrentUser());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserResponse> getAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return userService.getUsers(pageable).map(this::toResponse);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UserStatusRequest request) {
        return toResponse(userService.updateSuspended(id, request.getSuspended()));
    }

    @PostMapping("/me/password")
    public void changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        userService.changePassword(request.getCurrentPassword(), request.getNewPassword());
    }

    @GetMapping("/{id}/public")
    public PublicUserResponse getPublicProfile(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (!user.isEnabled() || user.isSuspended()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User not found");
        }
        LearnerProfile learnerProfile = learnerProfileRepository.findByUser(user).orElse(null);
        FacultyProfile facultyProfile = facultyProfileRepository.findByUser(user).orElse(null);
        return PublicUserResponse.from(user, learnerProfile, facultyProfile);
    }

    private UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRoles(user.getRoles());
        response.setEnabled(user.isEnabled());
        response.setSuspended(user.isSuspended());
        return response;
    }
}
