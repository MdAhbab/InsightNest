package com.insightnest.webinar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class WebinarRequest {
    @NotBlank
    @Size(max = 200)
    private String title;
    private String description;
    @NotNull
    private LocalDateTime scheduledAt;
    private String meetingLink;
    private Integer durationMinutes;
    private String speakerAffiliation;

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getSpeakerAffiliation() {
        return speakerAffiliation;
    }

    public void setSpeakerAffiliation(String speakerAffiliation) {
        this.speakerAffiliation = speakerAffiliation;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }
}
