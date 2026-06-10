package com.insightnest.faq.dto;

import jakarta.validation.constraints.NotBlank;

public class FaqRequest {
    @NotBlank
    private String question;
    @NotBlank
    private String answer;
    private boolean active;

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
