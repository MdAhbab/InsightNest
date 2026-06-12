package com.insightnest.webinar;

import com.insightnest.exception.ApiException;
import com.insightnest.user.Role;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import com.insightnest.webinar.dto.WebinarRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WebinarService {
    private final WebinarRepository webinarRepository;
    private final WebinarRegistrationRepository registrationRepository;
    private final UserService userService;

    public WebinarService(WebinarRepository webinarRepository,
                          WebinarRegistrationRepository registrationRepository,
                          UserService userService) {
        this.webinarRepository = webinarRepository;
        this.registrationRepository = registrationRepository;
        this.userService = userService;
    }

    public Webinar create(WebinarRequest request) {
        User user = userService.getCurrentUser();
        boolean canCreate = user.getRoles().contains(Role.FACULTY)
                || user.getRoles().contains(Role.ADMIN)
                || user.getRoles().contains(Role.UNIVERSITY_REP);
        if (!canCreate) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only faculty, admin, or university reps can create webinars");
        }
        Webinar webinar = new Webinar();
        webinar.setTitle(request.getTitle());
        webinar.setDescription(request.getDescription());
        webinar.setScheduledAt(request.getScheduledAt());
        webinar.setMeetingLink(request.getMeetingLink());
        webinar.setDurationMinutes(request.getDurationMinutes());
        webinar.setSpeakerAffiliation(request.getSpeakerAffiliation());
        webinar.setHost(user);
        return webinarRepository.save(webinar);
    }

    public WebinarRegistration register(Long webinarId) {
        User user = userService.getCurrentUser();
        Webinar webinar = webinarRepository.findById(webinarId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Webinar not found"));
        WebinarRegistration existing = registrationRepository.findByWebinarAndUser(webinar, user).orElse(null);
        if (existing != null) {
            existing.setStatus(WebinarRegistrationStatus.REGISTERED);
            return registrationRepository.save(existing);
        }
        WebinarRegistration registration = new WebinarRegistration();
        registration.setWebinar(webinar);
        registration.setUser(user);
        return registrationRepository.save(registration);
    }

    public WebinarRegistration cancel(Long webinarId) {
        User user = userService.getCurrentUser();
        Webinar webinar = webinarRepository.findById(webinarId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Webinar not found"));
        WebinarRegistration registration = registrationRepository.findByWebinarAndUser(webinar, user)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Registration not found"));
        registration.setStatus(WebinarRegistrationStatus.CANCELED);
        return registrationRepository.save(registration);
    }

    public List<WebinarRegistration> getMyRegistrations() {
        User user = userService.getCurrentUser();
        return registrationRepository.findByUser(user);
    }
}
