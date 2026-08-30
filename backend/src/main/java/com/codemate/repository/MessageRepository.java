package com.codemate.repository;

import com.codemate.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for CodeCat Message entity.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Retrieve all messages in a conversation ordered chronologically for chat flow reconstruction.
     */
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    /**
     * Count messages in a conversation.
     */
    long countByConversationId(Long conversationId);
}
