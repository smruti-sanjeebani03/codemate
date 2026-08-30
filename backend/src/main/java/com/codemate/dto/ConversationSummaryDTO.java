package com.codemate.dto;

import java.time.Instant;

/**
 * Summary DTO for displaying a list of conversations in the CodeCat sidebar.
 */
public class ConversationSummaryDTO {

    private Long id;
    private Long userId;
    private String title;
    private long messageCount;
    private String lastMessageSnippet;
    private Instant createdAt;
    private Instant updatedAt;

    public ConversationSummaryDTO() {
    }

    public ConversationSummaryDTO(Long id, Long userId, String title, long messageCount, String lastMessageSnippet, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.messageCount = messageCount;
        this.lastMessageSnippet = lastMessageSnippet;
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

    public long getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(long messageCount) {
        this.messageCount = messageCount;
    }

    public String getLastMessageSnippet() {
        return lastMessageSnippet;
    }

    public void setLastMessageSnippet(String lastMessageSnippet) {
        this.lastMessageSnippet = lastMessageSnippet;
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
