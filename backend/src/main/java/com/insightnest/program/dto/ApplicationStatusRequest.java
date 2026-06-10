package com.insightnest.program.dto;

import com.insightnest.program.ProgramApplicationStatus;
import jakarta.validation.constraints.NotNull;

public class ApplicationStatusRequest {
    @NotNull
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
