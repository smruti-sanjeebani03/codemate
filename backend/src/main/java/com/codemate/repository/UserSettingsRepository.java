package com.codemate.repository;

import com.codemate.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA Repository for UserSettings entity.
 */
@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    /**
     * Find settings for a specific user.
     */
    Optional<UserSettings> findByUserId(Long userId);

    /**
     * Check if settings exist for a user.
     */
    boolean existsByUserId(Long userId);
}
