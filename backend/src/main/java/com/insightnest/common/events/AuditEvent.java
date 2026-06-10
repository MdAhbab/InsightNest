package com.insightnest.common.events;

import com.insightnest.user.User;

public record AuditEvent(User actor, String action, String entityType, Long entityId, String details) {
}
