package com.insightnest.webinar.dto;

import com.insightnest.user.dto.UserSummary;
import com.insightnest.webinar.Webinar;
import com.insightnest.webinar.WebinarStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record WebinarResponse(Long id, String title, String description, LocalDateTime scheduledAt,
                              String meetingLink, WebinarStatus status, UserSummary host, Instant createdAt) {
    public static WebinarResponse from(Webinar webinar) {
        if (webinar == null) {
            return null;
        }
        return new WebinarResponse(webinar.getId(), webinar.getTitle(), webinar.getDescription(),
                webinar.getScheduledAt(), webinar.getMeetingLink(), webinar.getStatus(),
                UserSummary.from(webinar.getHost()), webinar.getCreatedAt());
    }
}
