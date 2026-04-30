package com.insightnest.scholarship.dto;

import com.insightnest.scholarship.ScholarshipApplicationStatus;

public class ScholarshipStatusRequest {
    private ScholarshipApplicationStatus status;
    private String notes;

    public ScholarshipApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ScholarshipApplicationStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
