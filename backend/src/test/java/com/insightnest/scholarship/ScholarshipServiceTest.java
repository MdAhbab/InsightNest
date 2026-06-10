package com.insightnest.scholarship;

import com.insightnest.exception.ApiException;
import com.insightnest.scholarship.dto.ScholarshipApplicationRequest;
import com.insightnest.user.Role;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScholarshipServiceTest {
    @Mock
    private ScholarshipRepository scholarshipRepository;
    @Mock
    private ScholarshipApplicationRepository scholarshipApplicationRepository;
    @Mock
    private UserService userService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ScholarshipService scholarshipService;

    private User learner() {
        User user = new User();
        user.setRoles(Set.of(Role.LEARNER));
        return user;
    }

    private ScholarshipApplicationRequest applicationRequest() {
        ScholarshipApplicationRequest request = new ScholarshipApplicationRequest();
        request.setPersonalStatement("I am eligible.");
        return request;
    }

    @Test
    void applyRejectsAfterDeadline() {
        when(userService.getCurrentUser()).thenReturn(learner());
        Scholarship scholarship = new Scholarship();
        scholarship.setDeadline(LocalDate.now().minusDays(1));
        when(scholarshipRepository.findById(1L)).thenReturn(Optional.of(scholarship));

        ApiException ex = assertThrows(ApiException.class,
                () -> scholarshipService.applyToScholarship(1L, applicationRequest()));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void applyAllowsBeforeDeadline() {
        User user = learner();
        when(userService.getCurrentUser()).thenReturn(user);
        Scholarship scholarship = new Scholarship();
        scholarship.setDeadline(LocalDate.now().plusDays(5));
        when(scholarshipRepository.findById(1L)).thenReturn(Optional.of(scholarship));
        when(scholarshipApplicationRepository.existsByScholarshipAndLearner(scholarship, user)).thenReturn(false);
        when(scholarshipApplicationRepository.save(any(ScholarshipApplication.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ScholarshipApplication application = scholarshipService.applyToScholarship(1L, applicationRequest());
        assertEquals(ScholarshipApplicationStatus.PENDING, application.getStatus());
    }
}
