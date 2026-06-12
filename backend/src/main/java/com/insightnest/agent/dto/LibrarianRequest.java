package com.insightnest.agent.dto;

import jakarta.validation.constraints.NotBlank;

public class LibrarianRequest {
    @NotBlank
    private String question;

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}
