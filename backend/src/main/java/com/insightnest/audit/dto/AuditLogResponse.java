package com.insightnest.audit.dto;

import com.insightnest.audit.AuditLog;

import java.time.Instant;

public record AuditLogResponse(Long id, String actorName, String action, String entityType, Long entityId,
                               String details, Instant createdAt) {
    public static AuditLogResponse from(AuditLog log) {
        if (log == null) {
            return null;
        }
        return new AuditLogResponse(log.getId(), log.getActor() == null ? null : log.getActor().getFullName(),
                log.getAction(), log.getEntityType(), log.getEntityId(), log.getDetails(), log.getCreatedAt());
    }
}
