package com.insightnest.agent;

import com.insightnest.agent.dto.CounsellorRequest;
import com.insightnest.agent.dto.CounsellorResponse;
import com.insightnest.agent.dto.DigestResponse;
import com.insightnest.agent.dto.LibrarianRequest;
import com.insightnest.agent.dto.LibrarianResponse;
import com.insightnest.agent.dto.MatchmakerItem;
import com.insightnest.common.events.AuditEvent;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AgentService {
    private final AgentBrain brain;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;

    public AgentService(AgentBrain brain, UserService userService, ApplicationEventPublisher eventPublisher) {
        this.brain = brain;
        this.userService = userService;
        this.eventPublisher = eventPublisher;
    }

    public CounsellorResponse counsel(CounsellorRequest request) {
        User user = userService.getCurrentUser();
        CounsellorResponse response = brain.counsel(request);
        eventPublisher.publishEvent(new AuditEvent(user, "AGENT_RUN", "Agent", null, "counsellor"));
        return response;
    }

    public List<MatchmakerItem> matchmaker() {
        User user = userService.getCurrentUser();
        List<MatchmakerItem> items = brain.matchProjects(user);
        eventPublisher.publishEvent(new AuditEvent(user, "AGENT_RUN", "Agent", null, "matchmaker"));
        return items;
    }

    public LibrarianResponse librarian(LibrarianRequest request) {
        User user = userService.getCurrentUser();
        LibrarianResponse response = brain.librarian(request);
        eventPublisher.publishEvent(new AuditEvent(user, "AGENT_RUN", "Agent", null, "librarian"));
        return response;
    }

    public DigestResponse digest() {
        User user = userService.getCurrentUser();
        DigestResponse response = brain.digest(user);
        eventPublisher.publishEvent(new AuditEvent(user, "AGENT_RUN", "Agent", null, "digest"));
        return response;
    }
}
