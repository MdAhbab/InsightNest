package com.insightnest.scholarship.dto;

import jakarta.validation.constraints.NotBlank;

public class ScholarshipApplicationRequest {
    @NotBlank
    private String personalStatement;
    private String notes;

    public String getPersonalStatement() {
        return personalStatement;
    }

    public void setPersonalStatement(String personalStatement) {
        this.personalStatement = personalStatement;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
