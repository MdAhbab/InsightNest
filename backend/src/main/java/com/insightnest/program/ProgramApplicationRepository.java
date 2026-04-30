package com.insightnest.program;

import com.insightnest.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgramApplicationRepository extends JpaRepository<ProgramApplication, Long> {
    List<ProgramApplication> findByLearner(User learner);
    boolean existsByProgramAndLearner(Program program, User learner);
}
