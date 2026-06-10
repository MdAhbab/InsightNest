package com.insightnest.forum.dto;

import com.insightnest.forum.ForumThread;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;

public record ThreadResponse(Long id, String title, String body, UserSummary author, Instant createdAt) {
    public static ThreadResponse from(ForumThread thread) {
        if (thread == null) {
            return null;
        }
        return new ThreadResponse(thread.getId(), thread.getTitle(), thread.getBody(),
                UserSummary.from(thread.getAuthor()), thread.getCreatedAt());
    }
}
