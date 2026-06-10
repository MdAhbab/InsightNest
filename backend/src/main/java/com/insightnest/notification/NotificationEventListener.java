package com.insightnest.notification;

import com.insightnest.common.events.ApplicationStatusChangedEvent;
import com.insightnest.common.events.JoinRequestReviewedEvent;
import com.insightnest.common.events.JoinRequestSubmittedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class NotificationEventListener {
    private final NotificationService notificationService;

    public NotificationEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void onApplicationStatusChanged(ApplicationStatusChangedEvent event) {
        String status = event.status().replace('_', ' ').toLowerCase(Locale.ROOT);
        notificationService.notify(event.learner(), event.kind() + " update",
                "Your " + event.kind().toLowerCase(Locale.ROOT) + " for \"" + event.itemName()
                        + "\" is now " + status + ".");
    }

    @EventListener
    public void onJoinRequestSubmitted(JoinRequestSubmittedEvent event) {
        notificationService.notify(event.projectOwner(), "New research join request",
                event.requesterName() + " requested to join \"" + event.projectTitle() + "\".");
    }

    @EventListener
    public void onJoinRequestReviewed(JoinRequestReviewedEvent event) {
        String status = event.status().toLowerCase(Locale.ROOT);
        notificationService.notify(event.requester(), "Join request " + status,
                "Your request to join \"" + event.projectTitle() + "\" was " + status + ".");
    }
}
