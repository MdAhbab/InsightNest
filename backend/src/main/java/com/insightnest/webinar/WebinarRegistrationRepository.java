package com.insightnest.webinar;

import com.insightnest.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WebinarRegistrationRepository extends JpaRepository<WebinarRegistration, Long> {
    List<WebinarRegistration> findByUser(User user);
    Optional<WebinarRegistration> findByWebinarAndUser(Webinar webinar, User user);
}
