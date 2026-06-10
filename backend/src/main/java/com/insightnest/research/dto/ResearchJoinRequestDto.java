package com.insightnest.research.dto;

import jakarta.validation.constraints.NotBlank;

public class ResearchJoinRequestDto {
    @NotBlank
    private String message;
    private String skills;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }
}
