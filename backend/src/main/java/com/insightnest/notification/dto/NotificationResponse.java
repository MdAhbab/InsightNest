package com.insightnest.notification.dto;

import com.insightnest.notification.Notification;

import java.time.Instant;

public record NotificationResponse(Long id, String title, String message, Instant readAt, Instant createdAt) {
    public static NotificationResponse from(Notification notification) {
        if (notification == null) {
            return null;
        }
        return new NotificationResponse(notification.getId(), notification.getTitle(), notification.getMessage(),
                notification.getReadAt(), notification.getCreatedAt());
    }
}
