package com.insightnest.university.dto;

import com.insightnest.university.University;

import java.time.Instant;

public record UniversityResponse(Long id, String name, String country, String city, Integer ranking,
                                 String website, String description, boolean archived, Instant createdAt) {
    public static UniversityResponse from(University university) {
        if (university == null) {
            return null;
        }
        return new UniversityResponse(university.getId(), university.getName(), university.getCountry(),
                university.getCity(), university.getRanking(), university.getWebsite(),
                university.getDescription(), university.isArchived(), university.getCreatedAt());
    }
}
