package com.insightnest.forum;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForumThreadRepository extends JpaRepository<ForumThread, Long> {
    @Override
    @EntityGraph(attributePaths = "author")
    Page<ForumThread> findAll(Pageable pageable);
}
