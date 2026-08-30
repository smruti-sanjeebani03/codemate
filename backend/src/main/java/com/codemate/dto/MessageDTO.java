package com.codemate.dto;

import com.codemate.entity.Message;
import com.codemate.entity.MessageRole;

import java.time.Instant;

/**
 * DTO representing an individual message in a CodeCat conversation.
 */
public class MessageDTO {

    private Long id;
    private Long conversationId;
    private MessageRole role;
    private String content;
    private Instant createdAt;

    public MessageDTO() {
    }

    public MessageDTO(Long id, Long conversationId, MessageRole role, String content, Instant createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.role = role;
        this.content = content;
        this.createdAt = createdAt;
    }

    public static MessageDTO fromEntity(Message message) {
        if (message == null) return null;
        return new MessageDTO(
                message.getId(),
                message.getConversation() != null ? message.getConversation().getId() : null,
                message.getRole(),
                message.getContent(),
                message.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public MessageRole getRole() {
        return role;
    }

    public void setRole(MessageRole role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
