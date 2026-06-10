package com.insightnest.webinar;

import com.insightnest.webinar.dto.WebinarRegistrationResponse;
import com.insightnest.webinar.dto.WebinarRequest;
import com.insightnest.webinar.dto.WebinarResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/webinars")
public class WebinarController {
    private final WebinarRepository webinarRepository;
    private final WebinarService webinarService;

    public WebinarController(WebinarRepository webinarRepository, WebinarService webinarService) {
        this.webinarRepository = webinarRepository;
        this.webinarService = webinarService;
    }

    @GetMapping
    public Page<WebinarResponse> list(
            @PageableDefault(size = 20, sort = "scheduledAt", direction = Sort.Direction.ASC) Pageable pageable) {
        return webinarRepository.findAll(pageable).map(WebinarResponse::from);
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public WebinarResponse create(@Valid @RequestBody WebinarRequest request) {
        return WebinarResponse.from(webinarService.create(request));
    }

    @PostMapping("/{id}/register")
    @PreAuthorize("hasRole('LEARNER')")
    public WebinarRegistrationResponse register(@PathVariable Long id) {
        return WebinarRegistrationResponse.from(webinarService.register(id));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('LEARNER')")
    public WebinarRegistrationResponse cancel(@PathVariable Long id) {
        return WebinarRegistrationResponse.from(webinarService.cancel(id));
    }

    @GetMapping("/registrations/me")
    @PreAuthorize("hasRole('LEARNER')")
    public List<WebinarRegistrationResponse> myRegistrations() {
        return webinarService.getMyRegistrations().stream().map(WebinarRegistrationResponse::from).toList();
    }
}
