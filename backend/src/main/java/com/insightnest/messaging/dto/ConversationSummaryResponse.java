package com.insightnest.messaging.dto;

import com.insightnest.messaging.Conversation;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;

public record ConversationSummaryResponse(Long id, String subject, UserSummary otherParty,
                                          long unreadCount, Instant lastMessageAt, String lastPreview) {
    public static ConversationSummaryResponse from(Conversation conversation, long unreadCount,
                                                   String lastPreview, boolean currentUserIsInitiator) {
        UserSummary otherParty = currentUserIsInitiator
                ? UserSummary.from(conversation.getRecipient())
                : UserSummary.from(conversation.getInitiator());
        return new ConversationSummaryResponse(conversation.getId(), conversation.getSubject(),
                otherParty, unreadCount, conversation.getLastMessageAt(), lastPreview);
    }
}
