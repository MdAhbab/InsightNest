package com.insightnest.program;

import com.insightnest.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgramApplicationRepository extends JpaRepository<ProgramApplication, Long> {
    @EntityGraph(attributePaths = {"program", "program.university"}, type = EntityGraph.EntityGraphType.LOAD)
    List<ProgramApplication> findByLearner(User learner);

    @Override
    @EntityGraph(attributePaths = {"program", "program.university", "learner"}, type = EntityGraph.EntityGraphType.LOAD)
    Page<ProgramApplication> findAll(Pageable pageable);

    boolean existsByProgramAndLearner(Program program, User learner);
}
