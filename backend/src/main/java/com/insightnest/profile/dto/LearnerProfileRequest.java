package com.insightnest.profile.dto;

public class LearnerProfileRequest {
    private String educationHistory;
    private String cgpa;
    private String ieltsScore;
    private String projects;
    private String publications;
    private String hobbies;
    private String nationality;
    private String socialLinks;
    private String bio;

    public String getEducationHistory() {
        return educationHistory;
    }

    public void setEducationHistory(String educationHistory) {
        this.educationHistory = educationHistory;
    }

    public String getCgpa() {
        return cgpa;
    }

    public void setCgpa(String cgpa) {
        this.cgpa = cgpa;
    }

    public String getIeltsScore() {
        return ieltsScore;
    }

    public void setIeltsScore(String ieltsScore) {
        this.ieltsScore = ieltsScore;
    }

    public String getProjects() {
        return projects;
    }

    public void setProjects(String projects) {
        this.projects = projects;
    }

    public String getPublications() {
        return publications;
    }

    public void setPublications(String publications) {
        this.publications = publications;
    }

    public String getHobbies() {
        return hobbies;
    }

    public void setHobbies(String hobbies) {
        this.hobbies = hobbies;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(String socialLinks) {
        this.socialLinks = socialLinks;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
