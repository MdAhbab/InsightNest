package com.insightnest.common.events;

import com.insightnest.user.User;

public record JoinRequestReviewedEvent(User requester, String projectTitle, String status) {
}
