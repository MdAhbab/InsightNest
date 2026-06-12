package com.insightnest.program.dto;

import com.insightnest.program.Program;
import com.insightnest.university.dto.UniversityResponse;

import java.time.Instant;
import java.time.LocalDate;

public record ProgramResponse(Long id, String name, String type, String department, String duration,
                              String description, LocalDate applicationDeadline, String tuition, boolean archived,
                              UniversityResponse university, Instant createdAt) {
    public static ProgramResponse from(Program program) {
        if (program == null) {
            return null;
        }
        return new ProgramResponse(program.getId(), program.getName(), program.getType(),
                program.getDepartment(), program.getDuration(), program.getDescription(),
                program.getApplicationDeadline(), program.getTuition(), program.isArchived(),
                UniversityResponse.from(program.getUniversity()), program.getCreatedAt());
    }
}
