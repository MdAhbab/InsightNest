package com.insightnest.user.dto;

import jakarta.validation.constraints.NotNull;

public class UserStatusRequest {
    @NotNull
    private Boolean suspended;

    public Boolean getSuspended() {
        return suspended;
    }

    public void setSuspended(Boolean suspended) {
        this.suspended = suspended;
    }
}
