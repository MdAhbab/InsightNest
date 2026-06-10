package com.insightnest.research.dto;

import com.insightnest.research.ResearchJoinStatus;
import jakarta.validation.constraints.NotNull;

public class ResearchJoinStatusRequest {
    @NotNull
    private ResearchJoinStatus status;

    public ResearchJoinStatus getStatus() {
        return status;
    }

    public void setStatus(ResearchJoinStatus status) {
        this.status = status;
    }
}
