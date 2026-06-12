package com.insightnest.agent.dto;

import java.time.Instant;
import java.util.List;

public record DigestResponse(Instant generatedAt, List<DigestItem> urgent,
                             List<DigestItem> approaching, List<DigestItem> webinars) {}
