package com.codemate.dto;

import java.time.Instant;

/**
 * Response DTO returning the generated assistant message and updated conversation state.
 */
public class CodeCatChatResponse {

    private Long conversationId;
    private String message;
    private String role;
    private Instant timestamp;
    private String provider;
    private ProblemContextDTO problemContext;

    public CodeCatChatResponse() {
    }

    public CodeCatChatResponse(Long conversationId, String message, String role, Instant timestamp, String provider, ProblemContextDTO problemContext) {
        this.conversationId = conversationId;
        this.message = message;
        this.role = role;
        this.timestamp = timestamp;
        this.provider = provider;
        this.problemContext = problemContext;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public ProblemContextDTO getProblemContext() {
        return problemContext;
    }

    public void setProblemContext(ProblemContextDTO problemContext) {
        this.problemContext = problemContext;
    }
}
