package com.insightnest.common.events;

import com.insightnest.user.User;

public record NewMessageEvent(User recipient, String senderName, String subject, String preview) {
}
