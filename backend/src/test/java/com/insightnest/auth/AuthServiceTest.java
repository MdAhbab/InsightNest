package com.insightnest.auth;

import com.insightnest.auth.dto.AuthResponse;
import com.insightnest.auth.dto.RefreshRequest;
import com.insightnest.auth.dto.RegisterRequest;
import com.insightnest.config.JwtService;
import com.insightnest.exception.ApiException;
import com.insightnest.profile.FacultyProfileRepository;
import com.insightnest.profile.LearnerProfileRepository;
import com.insightnest.user.RefreshToken;
import com.insightnest.user.RefreshTokenRepository;
import com.insightnest.user.Role;
import com.insightnest.user.User;
import com.insightnest.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private LearnerProfileRepository learnerProfileRepository;
    @Mock
    private FacultyProfileRepository facultyProfileRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest(String role) {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("Test@Example.com");
        request.setPassword("password123");
        request.setRole(role);
        return request;
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () -> authService.register(registerRequest("LEARNER")));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void registerRejectsAdminRole() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);

        ApiException ex = assertThrows(ApiException.class, () -> authService.register(registerRequest("ADMIN")));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void registerRejectsUnknownRole() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);

        ApiException ex = assertThrows(ApiException.class, () -> authService.register(registerRequest("WIZARD")));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void registerCreatesLearnerWithProfileAndTokens() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");
        when(jwtService.extractExpiration("refresh-token")).thenReturn(Instant.now().plusSeconds(3600));

        AuthResponse response = authService.register(registerRequest("LEARNER"));

        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals("test@example.com", response.getUser().getEmail());
    }

    @Test
    void refreshRejectsSuspendedUser() {
        User suspended = new User();
        suspended.setEmail("test@example.com");
        suspended.setRoles(Set.of(Role.LEARNER));
        suspended.setSuspended(true);

        RefreshToken stored = new RefreshToken();
        stored.setToken("refresh-token");
        stored.setUser(suspended);
        stored.setExpiresAt(Instant.now().plusSeconds(3600));
        stored.setRevoked(false);

        when(refreshTokenRepository.findByToken("refresh-token")).thenReturn(Optional.of(stored));
        when(jwtService.isRefreshToken(anyString())).thenReturn(true);

        RefreshRequest request = new RefreshRequest();
        request.setRefreshToken("refresh-token");

        ApiException ex = assertThrows(ApiException.class, () -> authService.refresh(request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }

    @Test
    void refreshRejectsRevokedToken() {
        RefreshToken stored = new RefreshToken();
        stored.setToken("refresh-token");
        stored.setExpiresAt(Instant.now().plusSeconds(3600));
        stored.setRevoked(true);

        when(refreshTokenRepository.findByToken("refresh-token")).thenReturn(Optional.of(stored));

        RefreshRequest request = new RefreshRequest();
        request.setRefreshToken("refresh-token");

        ApiException ex = assertThrows(ApiException.class, () -> authService.refresh(request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }
}
