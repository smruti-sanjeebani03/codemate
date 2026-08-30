package com.codemate.repository;

import com.codemate.entity.Category;
import com.codemate.entity.Difficulty;
import com.codemate.entity.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for Problem entity.
 * All operations are strictly partitioned by user ownership.
 */
@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    /**
     * Retrieve a problem by its ID and verify it belongs to the given user.
     * Prevents cross-user ID tampering.
     */
    Optional<Problem> findByIdAndUserId(Long id, Long userId);

    /**
     * Retrieve all problems solved by a specific user with sorting.
     */
    List<Problem> findByUserId(Long userId, Sort sort);

    /**
     * Retrieve all problems solved by a specific user with pagination.
     */
    Page<Problem> findByUserId(Long userId, Pageable pageable);

    /**
     * Check if a problem with same URL already exists for this user.
     */
    boolean existsByUserIdAndProblemUrl(Long userId, String problemUrl);

    /**
     * Filtered search query scoped strictly to a user.
     */
    @Query("SELECT p FROM Problem p WHERE p.user.id = :userId " +
           "AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.topic) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:topic IS NULL OR LOWER(p.topic) = LOWER(:topic)) " +
           "AND (:difficulty IS NULL OR p.difficulty = :difficulty) " +
           "AND (:platform IS NULL OR LOWER(p.platform) = LOWER(:platform)) " +
           "AND (:language IS NULL OR LOWER(p.programmingLanguage) = LOWER(:language))")
    List<Problem> findUserProblemsFiltered(
            @Param("userId") Long userId,
            @Param("search") String search,
            @Param("category") Category category,
            @Param("topic") String topic,
            @Param("difficulty") Difficulty difficulty,
            @Param("platform") String platform,
            @Param("language") String language,
            Sort sort
    );

    /**
     * Count total problems solved by a user.
     */
    long countByUserId(Long userId);

    /**
     * Count problems solved by category for a user.
     */
    long countByUserIdAndCategory(Long userId, Category category);

    /**
     * Retrieve problems solved within a specific time window.
     */
    List<Problem> findByUserIdAndSolvedAtBetween(Long userId, Instant start, Instant end);
}
