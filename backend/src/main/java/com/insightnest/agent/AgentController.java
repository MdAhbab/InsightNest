package com.insightnest.agent;

import com.insightnest.agent.dto.CounsellorRequest;
import com.insightnest.agent.dto.CounsellorResponse;
import com.insightnest.agent.dto.DigestResponse;
import com.insightnest.agent.dto.LibrarianRequest;
import com.insightnest.agent.dto.LibrarianResponse;
import com.insightnest.agent.dto.MatchmakerItem;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agent")
public class AgentController {
    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @PostMapping("/counsellor")
    public CounsellorResponse counsel(@Valid @RequestBody CounsellorRequest request) {
        return agentService.counsel(request);
    }

    @GetMapping("/matchmaker")
    @PreAuthorize("hasRole('LEARNER')")
    public List<MatchmakerItem> matchmaker() {
        return agentService.matchmaker();
    }

    @PostMapping("/librarian")
    public LibrarianResponse librarian(@Valid @RequestBody LibrarianRequest request) {
        return agentService.librarian(request);
    }

    @GetMapping("/digest")
    public DigestResponse digest() {
        return agentService.digest();
    }
}
