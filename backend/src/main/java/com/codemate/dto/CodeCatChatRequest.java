package com.codemate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for chatting with CodeCat AI Companion.
 */
public class CodeCatChatRequest {

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 10000, message = "Message length exceeds maximum allowed limit (10,000 characters)")
    private String message;

    private Long conversationId;

    private ProblemContextDTO problemContext;

    public CodeCatChatRequest() {
    }

    public CodeCatChatRequest(String message, Long conversationId, ProblemContextDTO problemContext) {
        this.message = message;
        this.conversationId = conversationId;
        this.problemContext = problemContext;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public ProblemContextDTO getProblemContext() {
        return problemContext;
    }

    public void setProblemContext(ProblemContextDTO problemContext) {
        this.problemContext = problemContext;
    }
}
