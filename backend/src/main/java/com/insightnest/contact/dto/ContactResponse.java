package com.insightnest.contact.dto;

import com.insightnest.contact.ContactRequest;
import com.insightnest.contact.ContactStatus;

import java.time.Instant;

public record ContactResponse(Long id, String name, String email, String subject, String message,
                              ContactStatus status, Instant createdAt) {
    public static ContactResponse from(ContactRequest contact) {
        if (contact == null) {
            return null;
        }
        return new ContactResponse(contact.getId(), contact.getName(), contact.getEmail(), contact.getSubject(),
                contact.getMessage(), contact.getStatus(), contact.getCreatedAt());
    }
}
