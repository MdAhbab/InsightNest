package com.insightnest.research;

import com.insightnest.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResearchProjectRepository extends JpaRepository<ResearchProject, Long> {
    List<ResearchProject> findByCreatedBy(User user);

    @Override
    @EntityGraph(attributePaths = "createdBy", type = EntityGraph.EntityGraphType.LOAD)
    Page<ResearchProject> findAll(Pageable pageable);
}
