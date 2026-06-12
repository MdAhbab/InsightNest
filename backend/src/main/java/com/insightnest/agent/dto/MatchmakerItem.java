package com.insightnest.agent.dto;

import com.insightnest.research.dto.ResearchProjectResponse;

public record MatchmakerItem(ResearchProjectResponse project, int score, String rationale) {}
