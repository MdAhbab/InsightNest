package com.insightnest.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("select count(u) > 0 from User u join u.roles r where r = :role")
    boolean existsByRole(@Param("role") Role role);

    @Query("select u from User u where u.enabled = true and u.suspended = false")
    List<User> findActiveUsers();
}
