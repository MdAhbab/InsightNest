package com.insightnest.webinar;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WebinarRepository extends JpaRepository<Webinar, Long> {
    @Override
    @EntityGraph(attributePaths = "host", type = EntityGraph.EntityGraphType.LOAD)
    Page<Webinar> findAll(Pageable pageable);
}
