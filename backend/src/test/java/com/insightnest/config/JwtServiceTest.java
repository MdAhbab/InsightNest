package com.insightnest.config;

import com.insightnest.user.Role;
import com.insightnest.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("test-secret-key-that-is-long-enough-for-hmac-sha256");
        properties.setAccessTokenMinutes(30);
        properties.setRefreshTokenDays(7);
        jwtService = new JwtService(properties);
    }

    private User user(String email) {
        User user = new User();
        user.setFullName("Test User");
        user.setEmail(email);
        user.setPassword("hash");
        user.setRoles(Set.of(Role.LEARNER));
        return user;
    }

    @Test
    void accessTokenCarriesSubjectAndValidates() {
        User user = user("learner@test.com");
        String token = jwtService.generateAccessToken(user);

        assertEquals("learner@test.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, user));
        assertFalse(jwtService.isRefreshToken(token));
    }

    @Test
    void refreshTokenIsMarkedAsRefreshAndExpiresInFuture() {
        User user = user("learner@test.com");
        String token = jwtService.generateRefreshToken(user);

        assertTrue(jwtService.isRefreshToken(token));
        assertTrue(jwtService.extractExpiration(token).isAfter(Instant.now()));
    }

    @Test
    void tokenIsInvalidForDifferentUser() {
        String token = jwtService.generateAccessToken(user("learner@test.com"));
        assertFalse(jwtService.isTokenValid(token, user("other@test.com")));
    }
}
