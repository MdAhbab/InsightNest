package com.insightnest.research;

import com.insightnest.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResearchProjectRepository extends JpaRepository<ResearchProject, Long> {
    List<ResearchProject> findByCreatedBy(User user);
}
