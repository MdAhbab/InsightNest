package com.insightnest.agent.dto;

import java.util.List;

public record LibrarianResponse(String answer, List<LibrarianSourceItem> sources) {}
