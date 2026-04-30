package com.insightnest.research;

import com.insightnest.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResearchJoinRequestRepository extends JpaRepository<ResearchJoinRequest, Long> {
    List<ResearchJoinRequest> findByProjectCreatedBy(User owner);
    boolean existsByProjectAndRequester(ResearchProject project, User requester);
}
