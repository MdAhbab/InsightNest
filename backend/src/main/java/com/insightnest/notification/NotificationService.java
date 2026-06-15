package com.insightnest.notification;

import com.insightnest.exception.ApiException;
import com.insightnest.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void notify(User user, String title, String message) {
        if (user == null) {
            return;
        }
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notificationRepository.save(notification);
    }

    /**
     * Creates a notification, first removing any existing one with the same title for this user.
     * Used by the Deadline Sentinel so a weekly digest is replaced, never duplicated, on re-run.
     */
    @Transactional
    public void notifyReplacingByTitle(User user, String title, String message) {
        if (user == null) {
            return;
        }
        notificationRepository.deleteByUserAndTitle(user, title);
        notify(user, title, message);
    }

    public Page<Notification> listFor(User user, Pageable pageable) {
        return notificationRepository.findByUser(user, pageable);
    }

    public Notification markRead(User user, Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your notification");
        }
        if (notification.getReadAt() == null) {
            notification.setReadAt(Instant.now());
            notification = notificationRepository.save(notification);
        }
        return notification;
    }

    @Transactional
    public void markAllRead(User user) {
        notificationRepository.markAllRead(user, Instant.now());
    }
}
