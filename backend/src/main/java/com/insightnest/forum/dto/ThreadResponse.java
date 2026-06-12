package com.insightnest.forum.dto;

import com.insightnest.forum.ForumThread;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;

public record ThreadResponse(Long id, String title, String body, String category,
                             UserSummary author, Instant createdAt, long replyCount, Instant lastReplyAt) {
    public static ThreadResponse from(ForumThread thread) {
        return from(thread, 0L, null);
    }

    public static ThreadResponse from(ForumThread thread, long replyCount, Instant lastReplyAt) {
        if (thread == null) {
            return null;
        }
        return new ThreadResponse(thread.getId(), thread.getTitle(), thread.getBody(), thread.getCategory(),
                UserSummary.from(thread.getAuthor()), thread.getCreatedAt(), replyCount, lastReplyAt);
    }
}
