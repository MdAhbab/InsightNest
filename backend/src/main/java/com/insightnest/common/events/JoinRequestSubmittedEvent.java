package com.insightnest.common.events;

import com.insightnest.user.User;

public record JoinRequestSubmittedEvent(User projectOwner, String projectTitle, String requesterName) {
}
