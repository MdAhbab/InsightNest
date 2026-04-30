package com.insightnest.profile;

import com.insightnest.exception.ApiException;
import com.insightnest.profile.dto.FacultyProfileRequest;
import com.insightnest.profile.dto.LearnerProfileRequest;
import com.insightnest.user.Role;
import com.insightnest.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {
    private final LearnerProfileRepository learnerProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;

    public ProfileService(LearnerProfileRepository learnerProfileRepository,
                          FacultyProfileRepository facultyProfileRepository) {
        this.learnerProfileRepository = learnerProfileRepository;
        this.facultyProfileRepository = facultyProfileRepository;
    }

    public LearnerProfile getLearnerProfile(User user) {
        return learnerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Learner profile not found"));
    }

    public FacultyProfile getFacultyProfile(User user) {
        return facultyProfileRepository.findByUser(user)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Faculty profile not found"));
    }

    public LearnerProfile updateLearner(User user, LearnerProfileRequest request) {
        if (!user.getRoles().contains(Role.LEARNER)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not a learner");
        }
        LearnerProfile profile = getLearnerProfile(user);
        profile.setEducationHistory(request.getEducationHistory());
        profile.setCgpa(request.getCgpa());
        profile.setIeltsScore(request.getIeltsScore());
        profile.setProjects(request.getProjects());
        profile.setPublications(request.getPublications());
        profile.setHobbies(request.getHobbies());
        profile.setNationality(request.getNationality());
        profile.setSocialLinks(request.getSocialLinks());
        profile.setBio(request.getBio());
        return learnerProfileRepository.save(profile);
    }

    public FacultyProfile updateFaculty(User user, FacultyProfileRequest request) {
        if (!user.getRoles().contains(Role.FACULTY)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not faculty");
        }
        FacultyProfile profile = getFacultyProfile(user);
        profile.setExpertise(request.getExpertise());
        profile.setResearchInterests(request.getResearchInterests());
        profile.setDepartment(request.getDepartment());
        profile.setWebsite(request.getWebsite());
        profile.setLinkedIn(request.getLinkedIn());
        profile.setTaughtCourses(request.getTaughtCourses());
        profile.setPublications(request.getPublications());
        profile.setBio(request.getBio());
        return facultyProfileRepository.save(profile);
    }
}
