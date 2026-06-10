package com.insightnest.webinar.dto;

import com.insightnest.webinar.WebinarRegistration;
import com.insightnest.webinar.WebinarRegistrationStatus;

import java.time.Instant;

public record WebinarRegistrationResponse(Long id, WebinarRegistrationStatus status, WebinarResponse webinar,
                                          Instant createdAt) {
    public static WebinarRegistrationResponse from(WebinarRegistration registration) {
        if (registration == null) {
            return null;
        }
        return new WebinarRegistrationResponse(registration.getId(), registration.getStatus(),
                WebinarResponse.from(registration.getWebinar()), registration.getCreatedAt());
    }
}
