package com.insightnest.forum.dto;

import com.insightnest.forum.ForumComment;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;

public record CommentResponse(Long id, String body, UserSummary author, Instant createdAt) {
    public static CommentResponse from(ForumComment comment) {
        if (comment == null) {
            return null;
        }
        return new CommentResponse(comment.getId(), comment.getBody(),
                UserSummary.from(comment.getAuthor()), comment.getCreatedAt());
    }
}
