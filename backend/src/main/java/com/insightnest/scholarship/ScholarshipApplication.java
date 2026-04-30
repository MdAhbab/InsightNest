package com.insightnest.scholarship;

import com.insightnest.common.BaseEntity;
import com.insightnest.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@Table(name = "scholarship_applications")
public class ScholarshipApplication extends BaseEntity {
    @ManyToOne
    private Scholarship scholarship;

    @ManyToOne
    private User learner;

    @Enumerated(EnumType.STRING)
    private ScholarshipApplicationStatus status = ScholarshipApplicationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String personalStatement;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Scholarship getScholarship() {
        return scholarship;
    }

    public void setScholarship(Scholarship scholarship) {
        this.scholarship = scholarship;
    }

    public User getLearner() {
        return learner;
    }

    public void setLearner(User learner) {
        this.learner = learner;
    }

    public ScholarshipApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ScholarshipApplicationStatus status) {
        this.status = status;
    }

    public String getPersonalStatement() {
        return personalStatement;
    }

    public void setPersonalStatement(String personalStatement) {
        this.personalStatement = personalStatement;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
