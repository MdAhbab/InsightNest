package com.insightnest.auth;

import com.insightnest.auth.dto.AuthResponse;
import com.insightnest.auth.dto.LoginRequest;
import com.insightnest.auth.dto.RefreshRequest;
import com.insightnest.auth.dto.RegisterRequest;
import com.insightnest.common.events.AuditEvent;
import com.insightnest.config.JwtService;
import com.insightnest.exception.ApiException;
import com.insightnest.profile.FacultyProfile;
import com.insightnest.profile.FacultyProfileRepository;
import com.insightnest.profile.LearnerProfile;
import com.insightnest.profile.LearnerProfileRepository;
import com.insightnest.user.RefreshToken;
import com.insightnest.user.RefreshTokenRepository;
import com.insightnest.user.Role;
import com.insightnest.user.User;
import com.insightnest.user.UserRepository;
import com.insightnest.user.dto.UserResponse;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LearnerProfileRepository learnerProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final ApplicationEventPublisher eventPublisher;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       LearnerProfileRepository learnerProfileRepository,
                       FacultyProfileRepository facultyProfileRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.learnerProfileRepository = learnerProfileRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.eventPublisher = eventPublisher;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid role");
        }

        if (role == Role.ADMIN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Admin accounts must be created by an admin");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(role));
        User saved = userRepository.save(user);

        if (role == Role.LEARNER) {
            LearnerProfile profile = new LearnerProfile();
            profile.setUser(saved);
            learnerProfileRepository.save(profile);
        } else if (role == Role.FACULTY) {
            FacultyProfile profile = new FacultyProfile();
            profile.setUser(saved);
            facultyProfileRepository.save(profile);
        }

        eventPublisher.publishEvent(new AuditEvent(saved, "USER_REGISTERED", "User", saved.getId(), role.name()));
        return issueTokens(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        } catch (AuthenticationException ex) {
            eventPublisher.publishEvent(new AuditEvent(null, "LOGIN_FAILED", "User", null, email));
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        eventPublisher.publishEvent(new AuditEvent(user, "LOGIN_SUCCESS", "User", user.getId(), null));
        return issueTokens(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token not found"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        if (!jwtService.isRefreshToken(stored.getToken())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        User user = stored.getUser();
        if (!user.isEnabled() || user.isSuspended()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Account is disabled");
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        return issueTokens(user);
    }

    public void logout(RefreshRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Refresh token not found"));
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        RefreshToken token = new RefreshToken();
        token.setToken(refreshToken);
        token.setUser(user);
        token.setExpiresAt(jwtService.extractExpiration(refreshToken));
        token.setRevoked(false);
        refreshTokenRepository.save(token);

        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setUser(toResponse(user));
        return response;
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
