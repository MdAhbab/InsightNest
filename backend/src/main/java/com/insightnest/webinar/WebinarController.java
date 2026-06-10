package com.insightnest.webinar;

import com.insightnest.webinar.dto.WebinarRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/webinars")
public class WebinarController {
    private final WebinarRepository webinarRepository;
    private final WebinarService webinarService;

    public WebinarController(WebinarRepository webinarRepository, WebinarService webinarService) {
        this.webinarRepository = webinarRepository;
        this.webinarService = webinarService;
    }

    @GetMapping
    public Page<Webinar> list(
            @PageableDefault(size = 20, sort = "scheduledAt", direction = Sort.Direction.ASC) Pageable pageable) {
        return webinarRepository.findAll(pageable);
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public Webinar create(@Valid @RequestBody WebinarRequest request) {
        return webinarService.create(request);
    }

    @PostMapping("/{id}/register")
    @PreAuthorize("hasRole('LEARNER')")
    public WebinarRegistration register(@PathVariable Long id) {
        return webinarService.register(id);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('LEARNER')")
    public WebinarRegistration cancel(@PathVariable Long id) {
        return webinarService.cancel(id);
    }

    @GetMapping("/registrations/me")
    @PreAuthorize("hasRole('LEARNER')")
    public List<WebinarRegistration> myRegistrations() {
        return webinarService.getMyRegistrations();
    }
}
