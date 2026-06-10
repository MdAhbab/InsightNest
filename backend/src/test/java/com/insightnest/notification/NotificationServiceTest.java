package com.insightnest.notification;

import com.insightnest.exception.ApiException;
import com.insightnest.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {
    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User userWithId(long id) {
        User user = new User();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    @Test
    void markReadRejectsForeignNotification() {
        Notification notification = new Notification();
        notification.setUser(userWithId(2L));
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        ApiException ex = assertThrows(ApiException.class,
                () -> notificationService.markRead(userWithId(1L), 10L));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    void markReadSetsTimestampOnce() {
        User owner = userWithId(1L);
        Notification notification = new Notification();
        notification.setUser(owner);
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Notification read = notificationService.markRead(owner, 10L);
        assertNotNull(read.getReadAt());
    }

    @Test
    void notifyIgnoresNullUser() {
        notificationService.notify(null, "title", "message");
        verify(notificationRepository, never()).save(any());
    }
}
