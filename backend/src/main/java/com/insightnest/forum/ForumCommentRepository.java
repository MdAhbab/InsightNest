package com.insightnest.forum;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ForumCommentRepository extends JpaRepository<ForumComment, Long> {
    @EntityGraph(attributePaths = "author")
    List<ForumComment> findByThreadIdOrderByCreatedAtAsc(Long threadId);
}
