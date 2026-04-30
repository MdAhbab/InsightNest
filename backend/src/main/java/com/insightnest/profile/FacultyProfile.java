package com.insightnest.profile;

import com.insightnest.common.BaseEntity;
import com.insightnest.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "faculty_profiles")
public class FacultyProfile extends BaseEntity {
    @OneToOne
    private User user;

    private String expertise;

    @Column(columnDefinition = "TEXT")
    private String researchInterests;

    private String department;
    private String website;
    private String linkedIn;

    @Column(columnDefinition = "TEXT")
    private String taughtCourses;

    @Column(columnDefinition = "TEXT")
    private String publications;

    @Column(columnDefinition = "TEXT")
    private String bio;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getExpertise() {
        return expertise;
    }

    public void setExpertise(String expertise) {
        this.expertise = expertise;
    }

    public String getResearchInterests() {
        return researchInterests;
    }

    public void setResearchInterests(String researchInterests) {
        this.researchInterests = researchInterests;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getLinkedIn() {
        return linkedIn;
    }

    public void setLinkedIn(String linkedIn) {
        this.linkedIn = linkedIn;
    }

    public String getTaughtCourses() {
        return taughtCourses;
    }

    public void setTaughtCourses(String taughtCourses) {
        this.taughtCourses = taughtCourses;
    }

    public String getPublications() {
        return publications;
    }

    public void setPublications(String publications) {
        this.publications = publications;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
