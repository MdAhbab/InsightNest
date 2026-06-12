package com.insightnest.messaging.dto;

import com.insightnest.messaging.ConversationMessage;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;

public record MessageResponse(Long id, UserSummary sender, String body, Instant sentAt, boolean readByRecipient) {
    public static MessageResponse from(ConversationMessage message) {
        return new MessageResponse(message.getId(), UserSummary.from(message.getSender()),
                message.getBody(), message.getSentAt(), message.isReadByRecipient());
    }
}
