package com.insightnest.agent.dto;

import java.time.LocalDate;

public record DigestItem(String type, Long id, String title, String subtitle, LocalDate deadline) {}
