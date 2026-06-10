package com.insightnest.audit;

import com.insightnest.common.events.AuditEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class AuditEventListener {
    private final AuditLogRepository auditLogRepository;

    public AuditEventListener(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @EventListener
    public void onAuditEvent(AuditEvent event) {
        AuditLog log = new AuditLog();
        log.setActor(event.actor());
        log.setAction(event.action());
        log.setEntityType(event.entityType());
        log.setEntityId(event.entityId());
        log.setDetails(event.details());
        auditLogRepository.save(log);
    }
}
