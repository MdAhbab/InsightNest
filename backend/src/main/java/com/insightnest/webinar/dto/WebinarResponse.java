package com.insightnest.webinar.dto;

import com.insightnest.user.dto.UserSummary;
import com.insightnest.webinar.Webinar;
import com.insightnest.webinar.WebinarStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record WebinarResponse(Long id, String title, String description, LocalDateTime scheduledAt,
                              String meetingLink, WebinarStatus status, String displayStatus,
                              Integer durationMinutes, String speakerAffiliation,
                              UserSummary host, Instant createdAt) {
    public static WebinarResponse from(Webinar webinar) {
        if (webinar == null) {
            return null;
        }
        String displayStatus = (webinar.getScheduledAt() != null
                && webinar.getScheduledAt().isBefore(LocalDateTime.now())) ? "PAST" : "UPCOMING";
        return new WebinarResponse(webinar.getId(), webinar.getTitle(), webinar.getDescription(),
                webinar.getScheduledAt(), webinar.getMeetingLink(), webinar.getStatus(), displayStatus,
                webinar.getDurationMinutes(), webinar.getSpeakerAffiliation(),
                UserSummary.from(webinar.getHost()), webinar.getCreatedAt());
    }
}
