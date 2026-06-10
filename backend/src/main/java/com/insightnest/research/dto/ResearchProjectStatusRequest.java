package com.insightnest.research.dto;

import com.insightnest.research.ResearchProjectStatus;
import jakarta.validation.constraints.NotNull;

public class ResearchProjectStatusRequest {
    @NotNull
    private ResearchProjectStatus status;

    public ResearchProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ResearchProjectStatus status) {
        this.status = status;
    }
}
