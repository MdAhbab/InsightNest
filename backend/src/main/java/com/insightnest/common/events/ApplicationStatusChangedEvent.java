package com.insightnest.common.events;

import com.insightnest.user.User;

public record ApplicationStatusChangedEvent(User learner, String kind, String itemName, String status) {
}
