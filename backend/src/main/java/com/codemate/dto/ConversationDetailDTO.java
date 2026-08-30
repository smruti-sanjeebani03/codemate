package com.codemate.dto;

import java.time.Instant;
import java.util.List;

/**
 * Detailed DTO with full message history for viewing an individual conversation.
 */
public class ConversationDetailDTO {

    private Long id;
    private Long userId;
    private String title;
    private List<MessageDTO> messages;
    private Instant createdAt;
    private Instant updatedAt;

    public ConversationDetailDTO() {
    }

    public ConversationDetailDTO(Long id, Long userId, String title, List<MessageDTO> messages, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.messages = messages;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<MessageDTO> getMessages() {
        return messages;
    }

    public void setMessages(List<MessageDTO> messages) {
        this.messages = messages;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
