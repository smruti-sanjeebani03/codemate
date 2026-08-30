package com.codemate.repository;

import com.codemate.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for CodeCat Conversation entity.
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Retrieve all conversations belonging to a user, ordered by recent update time.
     */
    List<Conversation> findByUserIdOrderByUpdatedAtDesc(Long userId);

    /**
     * Retrieve a conversation ensuring user ownership constraint.
     */
    Optional<Conversation> findByIdAndUserId(Long id, Long userId);

    /**
     * Count total conversations for a user.
     */
    long countByUserId(Long userId);
}
