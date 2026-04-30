package com.insightnest.scholarship.dto;

public class ScholarshipApplicationRequest {
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
