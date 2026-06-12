package com.insightnest.agent.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class CounsellorRequest {
    @NotBlank
    private String message;
    private List<HistoryEntry> history;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<HistoryEntry> getHistory() {
        return history;
    }

    public void setHistory(List<HistoryEntry> history) {
        this.history = history;
    }

    public record HistoryEntry(String role, String text) {}
}
