package com.insightnest.forum;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ForumCommentRepository extends JpaRepository<ForumComment, Long> {
    @EntityGraph(attributePaths = "author", type = EntityGraph.EntityGraphType.LOAD)
    List<ForumComment> findByThreadIdOrderByCreatedAtAsc(Long threadId);

    long countByThreadId(Long threadId);

    @Query("select max(c.createdAt) from ForumComment c where c.thread.id = :threadId")
    Instant findLastReplyAt(@Param("threadId") Long threadId);
}
