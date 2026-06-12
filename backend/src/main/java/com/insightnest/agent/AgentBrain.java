package com.insightnest.agent;

import com.insightnest.agent.dto.CounsellorRequest;
import com.insightnest.agent.dto.CounsellorResponse;
import com.insightnest.agent.dto.DigestResponse;
import com.insightnest.agent.dto.LibrarianRequest;
import com.insightnest.agent.dto.LibrarianResponse;
import com.insightnest.agent.dto.MatchmakerItem;
import com.insightnest.user.User;

import java.util.List;

/**
 * Seam for plugging in an LLM backend (e.g. Gemma).
 * Default implementation is deterministic heuristics over live repositories.
 */
public interface AgentBrain {
    CounsellorResponse counsel(CounsellorRequest request);
    List<MatchmakerItem> matchProjects(User learner);
    LibrarianResponse librarian(LibrarianRequest request);
    DigestResponse digest(User user);
}
