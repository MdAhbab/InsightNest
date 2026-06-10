package com.insightnest.program;

import com.insightnest.common.events.ApplicationStatusChangedEvent;
import com.insightnest.common.events.AuditEvent;
import com.insightnest.exception.ApiException;
import com.insightnest.program.dto.ApplicationStatusRequest;
import com.insightnest.program.dto.ProgramApplicationRequest;
import com.insightnest.program.dto.ProgramRequest;
import com.insightnest.university.University;
import com.insightnest.university.UniversityRepository;
import com.insightnest.user.Role;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProgramService {
    private final ProgramRepository programRepository;
    private final ProgramApplicationRepository programApplicationRepository;
    private final UniversityRepository universityRepository;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;

    public ProgramService(ProgramRepository programRepository,
                          ProgramApplicationRepository programApplicationRepository,
                          UniversityRepository universityRepository,
                          UserService userService,
                          ApplicationEventPublisher eventPublisher) {
        this.programRepository = programRepository;
        this.programApplicationRepository = programApplicationRepository;
        this.universityRepository = universityRepository;
        this.userService = userService;
        this.eventPublisher = eventPublisher;
    }

    public Program createProgram(ProgramRequest request) {
        University university = universityRepository.findById(request.getUniversityId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "University not found"));
        Program program = new Program();
        applyProgram(program, request, university);
        Program saved = programRepository.save(program);
        eventPublisher.publishEvent(new AuditEvent(userService.getCurrentUser(), "PROGRAM_CREATED",
                "Program", saved.getId(), saved.getName()));
        return saved;
    }

    public Program updateProgram(Long id, ProgramRequest request) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Program not found"));
        University university = universityRepository.findById(request.getUniversityId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "University not found"));
        applyProgram(program, request, university);
        Program saved = programRepository.save(program);
        eventPublisher.publishEvent(new AuditEvent(userService.getCurrentUser(), "PROGRAM_UPDATED",
                "Program", saved.getId(), saved.getName()));
        return saved;
    }

    public ProgramApplication applyToProgram(Long programId, ProgramApplicationRequest request) {
        User user = userService.getCurrentUser();
        if (!user.getRoles().contains(Role.LEARNER)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only learners can apply");
        }
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Program not found"));
        if (program.getApplicationDeadline() != null && program.getApplicationDeadline().isBefore(LocalDate.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Application deadline has passed");
        }
        if (programApplicationRepository.existsByProgramAndLearner(program, user)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Duplicate application not allowed");
        }

        ProgramApplication application = new ProgramApplication();
        application.setProgram(program);
        application.setLearner(user);
        application.setEducationSummary(request.getEducationSummary());
        application.setStatementOfPurpose(request.getStatementOfPurpose());
        application.setSupportingDocumentPath(request.getSupportingDocumentPath());
        application.setNotes(request.getNotes());
        return programApplicationRepository.save(application);
    }

    public List<ProgramApplication> getMyApplications() {
        User user = userService.getCurrentUser();
        return programApplicationRepository.findByLearner(user);
    }

    public Page<ProgramApplication> getAllApplications(Pageable pageable) {
        return programApplicationRepository.findAll(pageable);
    }

    public ProgramApplication updateApplicationStatus(Long id, ApplicationStatusRequest request) {
        ProgramApplication application = programApplicationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found"));
        application.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            application.setNotes(request.getNotes());
        }
        ProgramApplication saved = programApplicationRepository.save(application);
        eventPublisher.publishEvent(new ApplicationStatusChangedEvent(saved.getLearner(),
                "Program application", saved.getProgram().getName(), saved.getStatus().name()));
        eventPublisher.publishEvent(new AuditEvent(userService.getCurrentUser(), "PROGRAM_APPLICATION_REVIEWED",
                "ProgramApplication", saved.getId(), saved.getStatus().name()));
        return saved;
    }

    private void applyProgram(Program program, ProgramRequest request, University university) {
        program.setName(request.getName());
        program.setType(request.getType());
        program.setDepartment(request.getDepartment());
        program.setDuration(request.getDuration());
        program.setDescription(request.getDescription());
        program.setApplicationDeadline(request.getApplicationDeadline());
        program.setUniversity(university);
        program.setArchived(request.isArchived());
    }
}
