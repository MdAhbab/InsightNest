package com.insightnest.scholarship;

import com.insightnest.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScholarshipApplicationRepository extends JpaRepository<ScholarshipApplication, Long> {
    List<ScholarshipApplication> findByLearner(User learner);
    boolean existsByScholarshipAndLearner(Scholarship scholarship, User learner);
}
