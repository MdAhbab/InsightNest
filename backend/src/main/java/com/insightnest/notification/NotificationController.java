package com.insightnest.notification;

import com.insightnest.notification.dto.NotificationResponse;
import com.insightnest.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public Page<NotificationResponse> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return notificationService.listFor(userService.getCurrentUser(), pageable)
                .map(NotificationResponse::from);
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable Long id) {
        return NotificationResponse.from(notificationService.markRead(userService.getCurrentUser(), id));
    }

    @PostMapping("/read-all")
    public void markAllRead() {
        notificationService.markAllRead(userService.getCurrentUser());
    }
}
