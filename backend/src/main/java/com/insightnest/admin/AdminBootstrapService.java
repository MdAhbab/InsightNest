package com.insightnest.admin;

import com.insightnest.admin.dto.AdminBootstrapRequest;
import com.insightnest.exception.ApiException;
import com.insightnest.user.Role;
import com.insightnest.user.User;
import com.insightnest.user.UserRepository;
import com.insightnest.user.dto.UserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class AdminBootstrapService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String bootstrapSecret;

    public AdminBootstrapService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 @Value("${app.bootstrap.secret:}") String bootstrapSecret) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapSecret = bootstrapSecret;
    }

    @Transactional
    public synchronized UserResponse bootstrap(AdminBootstrapRequest request) {
        if (bootstrapSecret == null || bootstrapSecret.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Bootstrap secret not configured");
        }
        if (!bootstrapSecret.equals(request.getSecret())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid bootstrap secret");
        }
        String email = request.getEmail().trim().toLowerCase();
        String fullName = request.getFullName().trim();

        if (userRepository.existsByRole(Role.ADMIN)) {
            throw new ApiException(HttpStatus.CONFLICT, "Admin already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already in use");
        }

        User admin = new User();
        admin.setFullName(fullName);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setRoles(Set.of(Role.ADMIN));
        User saved = userRepository.save(admin);

        return toResponse(saved);
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
