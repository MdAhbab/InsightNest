package com.insightnest.notification;

import com.insightnest.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUser(User user, Pageable pageable);

    @Modifying
    @Query("update Notification n set n.readAt = :now where n.user = :user and n.readAt is null")
    int markAllRead(@Param("user") User user, @Param("now") Instant now);

    @Modifying
    @Query("delete from Notification n where n.user = :user and n.title = :title")
    int deleteByUserAndTitle(@Param("user") User user, @Param("title") String title);
}
