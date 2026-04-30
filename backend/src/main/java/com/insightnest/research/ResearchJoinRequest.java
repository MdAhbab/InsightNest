package com.insightnest.research;

import com.insightnest.common.BaseEntity;
import com.insightnest.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@Table(name = "research_join_requests")
public class ResearchJoinRequest extends BaseEntity {
    @ManyToOne
    private ResearchProject project;

    @ManyToOne
    private User requester;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String skills;
    @Enumerated(EnumType.STRING)
    private ResearchJoinStatus status = ResearchJoinStatus.PENDING;

    public ResearchProject getProject() {
        return project;
    }

    public void setProject(ResearchProject project) {
        this.project = project;
    }

    public User getRequester() {
        return requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public ResearchJoinStatus getStatus() {
        return status;
    }

    public void setStatus(ResearchJoinStatus status) {
        this.status = status;
    }
}
