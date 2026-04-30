package com.insightnest.program;

import com.insightnest.common.BaseEntity;
import com.insightnest.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@Table(name = "program_applications")
public class ProgramApplication extends BaseEntity {
    @ManyToOne
    private Program program;

    @ManyToOne
    private User learner;

    @Enumerated(EnumType.STRING)
    private ProgramApplicationStatus status = ProgramApplicationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String educationSummary;

    @Column(columnDefinition = "TEXT")
    private String statementOfPurpose;

    private String supportingDocumentPath;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public User getLearner() {
        return learner;
    }

    public void setLearner(User learner) {
        this.learner = learner;
    }

    public ProgramApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ProgramApplicationStatus status) {
        this.status = status;
    }

    public String getEducationSummary() {
        return educationSummary;
    }

    public void setEducationSummary(String educationSummary) {
        this.educationSummary = educationSummary;
    }

    public String getStatementOfPurpose() {
        return statementOfPurpose;
    }

    public void setStatementOfPurpose(String statementOfPurpose) {
        this.statementOfPurpose = statementOfPurpose;
    }

    public String getSupportingDocumentPath() {
        return supportingDocumentPath;
    }

    public void setSupportingDocumentPath(String supportingDocumentPath) {
        this.supportingDocumentPath = supportingDocumentPath;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
