package com.insightnest.university.dto;

import com.insightnest.university.University;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

public record UniversityResponse(Long id, String name, String country, String city, Integer ranking,
                                 String website, String description, Integer foundedYear, Integer studentCount,
                                 List<String> tags, boolean archived, Instant createdAt) {
    public static UniversityResponse from(University university) {
        if (university == null) {
            return null;
        }
        List<String> tagList = (university.getTags() != null && !university.getTags().isBlank())
                ? Arrays.stream(university.getTags().split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList()
                : List.of();
        return new UniversityResponse(university.getId(), university.getName(), university.getCountry(),
                university.getCity(), university.getRanking(), university.getWebsite(),
                university.getDescription(), university.getFoundedYear(), university.getStudentCount(),
                tagList, university.isArchived(), university.getCreatedAt());
    }
}
