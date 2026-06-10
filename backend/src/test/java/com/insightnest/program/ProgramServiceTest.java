package com.insightnest.program;

import com.insightnest.exception.ApiException;
import com.insightnest.program.dto.ProgramApplicationRequest;
import com.insightnest.university.UniversityRepository;
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
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgramServiceTest {
    @Mock
    private ProgramRepository programRepository;
    @Mock
    private ProgramApplicationRepository programApplicationRepository;
    @Mock
    private UniversityRepository universityRepository;
    @Mock
    private UserService userService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ProgramService programService;

    private User learner() {
        User user = new User();
        user.setFullName("Learner");
        user.setEmail("learner@test.com");
        user.setRoles(Set.of(Role.LEARNER));
        return user;
    }

    private ProgramApplicationRequest applicationRequest() {
        ProgramApplicationRequest request = new ProgramApplicationRequest();
        request.setEducationSummary("BSc in CSE");
        request.setStatementOfPurpose("I want to study here.");
        return request;
    }

    @Test
    void applyRejectsNonLearner() {
        User faculty = new User();
        faculty.setRoles(Set.of(Role.FACULTY));
        when(userService.getCurrentUser()).thenReturn(faculty);

        ApiException ex = assertThrows(ApiException.class,
                () -> programService.applyToProgram(1L, applicationRequest()));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    void applyRejectsPastDeadline() {
        when(userService.getCurrentUser()).thenReturn(learner());
        Program program = new Program();
        program.setName("CSE");
        program.setApplicationDeadline(LocalDate.now().minusDays(1));
        when(programRepository.findById(1L)).thenReturn(Optional.of(program));

        ApiException ex = assertThrows(ApiException.class,
                () -> programService.applyToProgram(1L, applicationRequest()));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void applyRejectsDuplicateApplication() {
        User user = learner();
        when(userService.getCurrentUser()).thenReturn(user);
        Program program = new Program();
        program.setName("CSE");
        when(programRepository.findById(1L)).thenReturn(Optional.of(program));
        when(programApplicationRepository.existsByProgramAndLearner(program, user)).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class,
                () -> programService.applyToProgram(1L, applicationRequest()));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void applySavesPendingApplication() {
        User user = learner();
        when(userService.getCurrentUser()).thenReturn(user);
        Program program = new Program();
        program.setName("CSE");
        program.setApplicationDeadline(LocalDate.now().plusDays(10));
        when(programRepository.findById(1L)).thenReturn(Optional.of(program));
        when(programApplicationRepository.existsByProgramAndLearner(program, user)).thenReturn(false);
        when(programApplicationRepository.save(any(ProgramApplication.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProgramApplication application = programService.applyToProgram(1L, applicationRequest());

        assertNotNull(application);
        assertEquals(ProgramApplicationStatus.PENDING, application.getStatus());
        assertEquals(program, application.getProgram());
        assertEquals(user, application.getLearner());
    }
}
