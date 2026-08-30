package com.codemate.repository;

import com.codemate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA Repository for User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Look up a user by email address.
     * Essential for authentication and JWT loading in Part 3.
     */
    Optional<User> findByEmail(String email);

    /**
     * Look up a user by verified Google ID.
     */
    Optional<User> findByGoogleId(String googleId);

    /**
     * Look up a user by verified GitHub ID.
     */
    Optional<User> findByGithubId(String githubId);

    /**
     * Check if an email is already registered.
     */
    boolean existsByEmail(String email);
}
