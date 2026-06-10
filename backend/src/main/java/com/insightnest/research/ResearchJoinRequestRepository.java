package com.insightnest.research;

import com.insightnest.user.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResearchJoinRequestRepository extends JpaRepository<ResearchJoinRequest, Long> {
    @EntityGraph(attributePaths = {"project", "requester"}, type = EntityGraph.EntityGraphType.LOAD)
    List<ResearchJoinRequest> findByProjectCreatedBy(User owner);

    boolean existsByProjectAndRequester(ResearchProject project, User requester);
}
