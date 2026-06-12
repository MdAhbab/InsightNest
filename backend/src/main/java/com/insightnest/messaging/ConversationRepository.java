package com.insightnest.messaging;

import com.insightnest.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("select c from Conversation c where c.initiator = :user or c.recipient = :user order by c.lastMessageAt desc nulls last")
    Page<Conversation> findByParticipant(@Param("user") User user, Pageable pageable);
}
