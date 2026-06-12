package com.insightnest.messaging;

import com.insightnest.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, Long> {
    List<ConversationMessage> findByConversationOrderBySentAtAsc(Conversation conversation);

    @Query("select count(m) from ConversationMessage m where m.conversation = :conv and m.sender <> :user and m.readByRecipient = false")
    long countUnreadForUser(@Param("conv") Conversation conversation, @Param("user") User user);

    @Modifying
    @Transactional
    @Query("update ConversationMessage m set m.readByRecipient = true where m.conversation = :conv and m.sender <> :user and m.readByRecipient = false")
    void markReadForUser(@Param("conv") Conversation conversation, @Param("user") User user);

    @Query("select m from ConversationMessage m where m.conversation = :conv order by m.sentAt desc")
    List<ConversationMessage> findLastMessage(@Param("conv") Conversation conversation,
                                              org.springframework.data.domain.Pageable pageable);
}
