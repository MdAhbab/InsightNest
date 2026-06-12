package com.insightnest.resource.dto;

import com.insightnest.resource.LibraryResource;
import com.insightnest.user.dto.UserSummary;

import java.time.Instant;

public record ResourceResponse(Long id, String title, String description, String fileName, long fileSize,
                               String author, Integer year, Integer pages, String field, String resourceType,
                               boolean publicAccess, UserSummary uploader, Instant createdAt) {
    public static ResourceResponse from(LibraryResource resource) {
        if (resource == null) {
            return null;
        }
        return new ResourceResponse(resource.getId(), resource.getTitle(), resource.getDescription(),
                resource.getFileName(), resource.getFileSize(),
                resource.getAuthor(), resource.getYear(), resource.getPages(), resource.getField(),
                resource.getResourceType(), resource.isPublicAccess(),
                UserSummary.from(resource.getUploader()), resource.getCreatedAt());
    }
}
