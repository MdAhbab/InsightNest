package com.insightnest.agent.dto;

import java.util.List;

public record CounsellorResponse(String reply, List<CitationItem> citations) {}
