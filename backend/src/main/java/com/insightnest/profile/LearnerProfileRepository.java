package com.insightnest.profile;

import com.insightnest.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LearnerProfileRepository extends JpaRepository<LearnerProfile, Long> {
    Optional<LearnerProfile> findByUser(User user);
}
