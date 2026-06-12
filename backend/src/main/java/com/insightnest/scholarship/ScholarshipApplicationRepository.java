package com.insightnest.scholarship;

import com.insightnest.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScholarshipApplicationRepository extends JpaRepository<ScholarshipApplication, Long> {
    @EntityGraph(attributePaths = "scholarship", type = EntityGraph.EntityGraphType.LOAD)
    List<ScholarshipApplication> findByLearner(User learner);

    @Override
    @EntityGraph(attributePaths = {"scholarship", "learner"}, type = EntityGraph.EntityGraphType.LOAD)
    Page<ScholarshipApplication> findAll(Pageable pageable);

    boolean existsByScholarshipAndLearner(Scholarship scholarship, User learner);
    long countByStatus(ScholarshipApplicationStatus status);
}
