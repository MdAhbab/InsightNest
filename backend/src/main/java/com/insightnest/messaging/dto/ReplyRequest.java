package com.insightnest.messaging.dto;

import jakarta.validation.constraints.NotBlank;

public class ReplyRequest {
    @NotBlank
    private String body;

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}
