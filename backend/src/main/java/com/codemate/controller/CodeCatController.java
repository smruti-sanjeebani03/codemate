package com.codemate.controller;

import com.codemate.dto.CodeCatChatRequest;
import com.codemate.dto.CodeCatChatResponse;
import com.codemate.dto.CodeCatStatusResponse;
import com.codemate.dto.ConversationDetailDTO;
import com.codemate.dto.ConversationSummaryDTO;
import com.codemate.security.UserPrincipal;
import com.codemate.service.CodeCatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST Controller for CodeCat AI Coding Companion.
 * 
 * Endpoints:
 * - GET    /api/codecat/status             - Active model and capabilities
 * - GET    /api/codecat/conversations      - User's conversations list
 * - GET    /api/codecat/conversations/{id} - Full message history of conversation
 * - DELETE /api/codecat/conversations/{id} - Delete conversation
 * - POST   /api/codecat/chat               - Send message to CodeCat
 */
@RestController
@RequestMapping("/api/codecat")
public class CodeCatController {

    private final CodeCatService codeCatService;

    public CodeCatController(CodeCatService codeCatService) {
        this.codeCatService = codeCatService;
    }

    /**
     * Get CodeCat AI service status and model capabilities.
     */
    @GetMapping("/status")
    public ResponseEntity<CodeCatStatusResponse> getStatus() {
        CodeCatStatusResponse response = codeCatService.getStatus();
        return ResponseEntity.ok(response);
    }

    /**
     * List all conversations belonging to the authenticated user.
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationSummaryDTO>> getConversations(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ConversationSummaryDTO> conversations = codeCatService.getUserConversations(principal.getId());
        return ResponseEntity.ok(conversations);
    }

    /**
     * Retrieve full message history of a specific conversation.
     */
    @GetMapping("/conversations/{id}")
    public ResponseEntity<ConversationDetailDTO> getConversation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ConversationDetailDTO conversation = codeCatService.getConversationDetail(id, principal.getId());
        return ResponseEntity.ok(conversation);
    }

    /**
     * Delete a conversation.
     */
    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        codeCatService.deleteConversation(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Send a prompt or question to CodeCat.
     */
    @PostMapping("/chat")
    public ResponseEntity<CodeCatChatResponse> chat(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CodeCatChatRequest request) {
        CodeCatChatResponse response = codeCatService.chat(principal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
