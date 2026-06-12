package com.insightnest.messaging.dto;

import com.insightnest.messaging.Conversation;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;
import java.util.List;

public record ConversationThreadResponse(Long id, String subject, UserSummary initiator, UserSummary recipient,
                                         Instant createdAt, List<MessageResponse> messages) {
    public static ConversationThreadResponse from(Conversation conversation, List<MessageResponse> messages) {
        return new ConversationThreadResponse(conversation.getId(), conversation.getSubject(),
                UserSummary.from(conversation.getInitiator()), UserSummary.from(conversation.getRecipient()),
                conversation.getCreatedAt(), messages);
    }
}
