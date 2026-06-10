package com.insightnest.faq.dto;

import com.insightnest.faq.Faq;

public record FaqResponse(Long id, String question, String answer, boolean active) {
    public static FaqResponse from(Faq faq) {
        if (faq == null) {
            return null;
        }
        return new FaqResponse(faq.getId(), faq.getQuestion(), faq.getAnswer(), faq.isActive());
    }
}
