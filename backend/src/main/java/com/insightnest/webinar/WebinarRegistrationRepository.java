package com.insightnest.webinar;

import com.insightnest.user.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WebinarRegistrationRepository extends JpaRepository<WebinarRegistration, Long> {
    @EntityGraph(attributePaths = {"webinar", "webinar.host"})
    List<WebinarRegistration> findByUser(User user);

    Optional<WebinarRegistration> findByWebinarAndUser(Webinar webinar, User user);
}
