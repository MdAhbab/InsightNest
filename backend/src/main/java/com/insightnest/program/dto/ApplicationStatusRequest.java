package com.insightnest.program.dto;

import com.insightnest.program.ProgramApplicationStatus;

public class ApplicationStatusRequest {
    private ProgramApplicationStatus status;
    private String notes;

    public ProgramApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ProgramApplicationStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
