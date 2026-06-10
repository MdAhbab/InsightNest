package com.insightnest.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    @Override
    @EntityGraph(attributePaths = "actor", type = EntityGraph.EntityGraphType.LOAD)
    Page<AuditLog> findAll(Pageable pageable);
}
