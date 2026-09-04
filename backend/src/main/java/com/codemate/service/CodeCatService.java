package com.codemate.service;

import com.codemate.dto.CodeCatChatRequest;
import com.codemate.dto.CodeCatChatResponse;
import com.codemate.dto.CodeCatStatusResponse;
import com.codemate.dto.ConversationDetailDTO;
import com.codemate.dto.ConversationSummaryDTO;
import com.codemate.dto.MessageDTO;
import com.codemate.dto.ProblemContextDTO;
import com.codemate.entity.Conversation;
import com.codemate.entity.Message;
import com.codemate.entity.MessageRole;
import com.codemate.entity.User;
import com.codemate.exception.AiServiceUnavailableException;
import com.codemate.exception.BadRequestException;
import com.codemate.exception.ResourceNotFoundException;
import com.codemate.repository.ConversationRepository;
import com.codemate.repository.MessageRepository;
import com.codemate.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for CodeCat AI Companion in Spring Boot.
 * 
 * Features:
 * - Persistent storage in PostgreSQL (Conversations & Messages)
 * - Real Google Gemini API integration with multi-turn chat and domain system prompt
 * - Problem context injection (DSA pattern analysis, bug trace, Big-O complexity)
 * - Strict server-side API key protection
 * - Clean application-level error handling when AI provider is unavailable
 */
@Service
public class CodeCatService {

    private static final Logger logger = LoggerFactory.getLogger(CodeCatService.class);

    private static final String CODECAT_SYSTEM_PROMPT = """
        You are CodeCat, CodeMate's intelligent, friendly, and encouraging AI coding companion.
        You are sitting right beside the student or developer as a supportive coding buddy while they practice programming, Logic building, and Data Structures & Algorithms (DSA).

        # YOUR CORE PERSONALITY & TONE
        1. Friendly, patient, encouraging, and technically precise.
        2. Beginner-friendly when explaining fundamentals; rigorous and insightful for advanced DSA.
        3. Concise for straightforward questions; structured and detailed for complex algorithmic problems.
        4. Slightly playful with tasteful coding humor or gentle companion warmth, but always professional and focused on the student's mastery.
        5. NEVER excessively verbose. Get straight to the heart of the learner's query.

        # YOUR DOMAIN EXPERTISE
        You specialize in TWO distinct pillars:
        A. LOGIC BUILDING:
           - Basic programming logic, loop constructs, conditionals, recursive thinking.
           - Number & math problems: Fibonacci series, Armstrong numbers, Palindrome check, Prime numbers, Factorials, GCD/LCM, Digit manipulation, Pattern printing.
           - Diagnosing off-by-one errors, infinite loops, integer overflow, modulo arithmetic mistakes.

        B. DATA STRUCTURES & ALGORITHMS (DSA):
           - Arrays, Strings, Hashing, Two Pointers, Sliding Window, Prefix Sums.
           - Linked Lists, Stacks, Queues, Monotonic Stacks, Heaps/Priority Queues.
           - Binary Search, Trees, Binary Search Trees, Tries.
           - Recursion, Backtracking, Divide & Conquer.
           - Graphs (BFS, DFS, Dijkstra, Topological Sort, Disjoint Set Union).
           - Dynamic Programming (1D, 2D, Knapsack, Interval, Trees), Greedy strategies.
           - Bit Manipulation, Advanced math.

        # LEARNING-FIRST PEDAGOGICAL RULES
        1. If the user asks "How do I solve this?", "I am stuck", or "Give me a hint":
           - Do NOT immediately dump a full ready-made copy-paste solution.
           - Instead, follow this structured guidance:
             1) Clarify the core problem requirement in simple terms.
             2) Identify the underlying pattern or conceptual approach.
             3) Give a targeted, intuitive hint.
             4) Discuss key edge cases to watch out for.
             5) Explain the target Time and Space complexity.
             6) Ask an engaging guiding question to help them write the code themselves.

        2. If the user explicitly asks for code (e.g., "Give me the Java solution", "Show the complete Python code"):
           - Provide the complete, clean, idiomatic solution, structured as:
             ### Approach
             ### Algorithm / Step-by-Step
             ### Code (well-commented and clean)
             ### Complexity Analysis (Time Complexity & Space Complexity with Big-O and concise reasons)
             ### Why It Works / Key Takeaway

        3. For Code Debugging ("Why is my code failing?", "Debug this snippet"):
           - Read the user's code carefully.
           - Identify the exact logical mistake, runtime hazard, or edge-case failure.
           - Clearly explain WHY the error occurs with a quick trace/example.
           - Show the corrected code snippet.
           - Explain why the fix resolves the issue without unnecessary full rewrites.

        4. Complexity Analysis:
           - Always state both Time Complexity and Space Complexity using Big-O notation.
           - Always explain the mathematical reasoning.

        5. Language Awareness:
           - Respect the user's chosen programming language (Java, Python, C++, JavaScript, TypeScript, Go, etc.).
        """.trim();

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${gemini.api.key:${GEMINI_API_KEY:${AI_API_KEY:}}}")
    private String apiKey;

    @Value("${ai.model:${AI_MODEL:gemini-2.5-flash}}")
    private String modelName;

    @Value("${ai.base-url:${AI_BASE_URL:https://generativelanguage.googleapis.com}}")
    private String baseUrl;

    public CodeCatService(ConversationRepository conversationRepository,
                          MessageRepository messageRepository,
                          UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(12))
                .build();
    }

    /**
     * Retrieve CodeCat AI companion status and capability list.
     */
    public CodeCatStatusResponse getStatus() {
        boolean hasKey = apiKey != null && !apiKey.trim().isEmpty() && !apiKey.contains("your_gemini_api_key");
        List<String> capabilities = Arrays.asList(
                "Logic Building & Number Problems",
                "DSA Pattern Identification",
                "Code Debugging & Bug Analysis",
                "Time & Space Complexity (Big-O)",
                "Step-by-Step Problem Guidance",
                "Multi-language Support (Java, Python, C++, TS)"
        );

        return new CodeCatStatusResponse(
                hasKey ? "active" : "unconfigured",
                "CodeCat AI Companion",
                hasKey ? "Google Gemini (" + modelName + ")" : "Google Gemini (No API Key Configured)",
                modelName,
                hasKey,
                capabilities,
                Instant.now()
        );
    }

    /**
     * Retrieve all conversations for an authenticated user.
     */
    @Transactional(readOnly = true)
    public List<ConversationSummaryDTO> getUserConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        List<ConversationSummaryDTO> summaries = new ArrayList<>();

        for (Conversation c : conversations) {
            List<Message> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());
            String lastSnippet = null;
            if (!msgs.isEmpty()) {
                String content = msgs.get(msgs.size() - 1).getContent();
                lastSnippet = content.length() > 80 ? content.substring(0, 80) + "..." : content;
            }

            summaries.add(new ConversationSummaryDTO(
                    c.getId(),
                    userId,
                    c.getTitle(),
                    msgs.size(),
                    lastSnippet,
                    c.getCreatedAt(),
                    c.getUpdatedAt()
            ));
        }

        return summaries;
    }

    /**
     * Retrieve a specific conversation with all message history for the authenticated user.
     */
    @Transactional(readOnly = true)
    public ConversationDetailDTO getConversationDetail(Long conversationId, Long userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation #" + conversationId + " not found"));

        if (!conv.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to access conversation #" + conversationId);
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<MessageDTO> messageDTOs = messages.stream()
                .map(MessageDTO::fromEntity)
                .toList();

        return new ConversationDetailDTO(
                conv.getId(),
                userId,
                conv.getTitle(),
                messageDTOs,
                conv.getCreatedAt(),
                conv.getUpdatedAt()
        );
    }

    /**
     * Delete a conversation with strict ownership check.
     */
    @Transactional
    public void deleteConversation(Long conversationId, Long userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation #" + conversationId + " not found"));

        if (!conv.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to delete conversation #" + conversationId);
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        messageRepository.deleteAll(messages);
        conversationRepository.delete(conv);
        logger.info("Deleted conversation id={} for user id={}", conversationId, userId);
    }

    /**
     * Main Chat method:
     * - Verifies real AI API key configuration
     * - Creates or finds conversation
     * - Saves User Message in DB
     * - Queries real Gemini AI Provider with full context
     * - Saves Assistant Message in DB
     * - Returns response payload
     */
    @Transactional
    public CodeCatChatResponse chat(Long userId, CodeCatChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new BadRequestException("Message cannot be empty");
        }

        boolean hasKey = apiKey != null && !apiKey.trim().isEmpty() && !apiKey.contains("your_gemini_api_key");
        if (!hasKey) {
            logger.warn("CodeCat chat rejected: AI_API_KEY is not configured on the backend.");
            throw new AiServiceUnavailableException("CodeCat AI service is unavailable because AI_API_KEY is not configured on the server.");
        }

        String userPrompt = request.getMessage().trim();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Conversation conversation;
        if (request.getConversationId() != null) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation #" + request.getConversationId() + " not found"));

            if (!conversation.getUser().getId().equals(userId)) {
                throw new AccessDeniedException("You do not have permission to access conversation #" + request.getConversationId());
            }
        } else {
            String title = generateTitle(userPrompt, request.getProblemContext());
            conversation = new Conversation(user, title);
            conversation = conversationRepository.save(conversation);
        }

        // Save User Message to PostgreSQL
        Message userMsg = new Message(conversation, MessageRole.USER, userPrompt);
        messageRepository.save(userMsg);

        // Fetch recent messages for multi-turn history
        List<Message> history = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<Message> recentHistory = history.size() > 8 ? history.subList(history.size() - 8, history.size()) : history;

        // Call the real Google Gemini API Provider
        String aiReply = callGeminiApi(recentHistory, request.getProblemContext());
        String providerName = "Google Gemini (" + modelName + ")";

        // Save Assistant Message to PostgreSQL
        Message assistantMsg = new Message(conversation, MessageRole.ASSISTANT, aiReply);
        assistantMsg = messageRepository.save(assistantMsg);

        // Update Conversation timestamp
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        return new CodeCatChatResponse(
                conversation.getId(),
                aiReply,
                "ASSISTANT",
                assistantMsg.getCreatedAt(),
                providerName,
                request.getProblemContext()
        );
    }

    private String generateTitle(String message, ProblemContextDTO context) {
        if (context != null && context.getTitle() != null && !context.getTitle().trim().isEmpty()) {
            String topic = context.getTopic() != null ? " (" + context.getTopic() + ")" : "";
            return context.getTitle().trim() + topic;
        }

        String clean = message.replaceAll("[^a-zA-Z0-9\\s]", " ").trim();
        if (clean.isEmpty()) return "New Coding Discussion";
        String[] words = clean.split("\\s+");
        if (words.length <= 6) return String.join(" ", words);
        return String.join(" ", Arrays.copyOfRange(words, 0, 6)) + "...";
    }

    /**
     * Calls the real Google Gemini REST API using standard Java HTTP Client.
     * Throws clean application-level AiServiceUnavailableException on any failure.
     */
    private String callGeminiApi(List<Message> history, ProblemContextDTO context) {
        String cleanBaseUrl = baseUrl != null && !baseUrl.trim().isEmpty() 
                ? baseUrl.trim().replaceAll("/+$", "") 
                : "https://generativelanguage.googleapis.com";
        String endpoint = cleanBaseUrl + "/v1beta/models/" + modelName + ":generateContent?key=" + apiKey.trim();

        // Build problem context header
        StringBuilder contextHeader = new StringBuilder();
        if (context != null) {
            contextHeader.append("[PROBLEM CONTEXT ATTACHED BY USER]\n");
            if (context.getTitle() != null) contextHeader.append("- Problem Title: ").append(context.getTitle()).append("\n");
            if (context.getCategory() != null) contextHeader.append("- Category: ").append(context.getCategory()).append("\n");
            if (context.getTopic() != null) contextHeader.append("- Topic: ").append(context.getTopic()).append("\n");
            if (context.getDifficulty() != null) contextHeader.append("- Difficulty: ").append(context.getDifficulty()).append("\n");
            if (context.getLanguage() != null) contextHeader.append("- Language: ").append(context.getLanguage()).append("\n");
            if (context.getProblemUrl() != null) contextHeader.append("- URL: ").append(context.getProblemUrl()).append("\n");
            if (context.getProblemStatement() != null) contextHeader.append("- Statement: ").append(context.getProblemStatement()).append("\n");
            if (context.getUserCode() != null) contextHeader.append("- User Code:\n```\n").append(context.getUserCode()).append("\n```\n");
            contextHeader.append("---\n");
        }

        try {
            // Build contents array for Gemini
            List<Map<String, Object>> contents = new ArrayList<>();
            for (int i = 0; i < history.size(); i++) {
                Message msg = history.get(i);
                String role = msg.getRole() == MessageRole.USER ? "user" : "model";
                String text = msg.getContent();

                // Prepend problem context to the user's latest prompt
                if (i == history.size() - 1 && contextHeader.length() > 0 && msg.getRole() == MessageRole.USER) {
                    text = contextHeader + "\nUser Question: " + text;
                }

                Map<String, Object> contentMap = new HashMap<>();
                contentMap.put("role", role);
                contentMap.put("parts", List.of(Map.of("text", text)));
                contents.add(contentMap);
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);

            Map<String, Object> systemInstruction = new HashMap<>();
            systemInstruction.put("parts", List.of(Map.of("text", CODECAT_SYSTEM_PROMPT)));
            requestBody.put("systemInstruction", systemInstruction);

            String jsonPayload = objectMapper.writeValueAsString(requestBody);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "aistudio-build")
                    .timeout(Duration.ofSeconds(25))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode rootNode = objectMapper.readTree(response.body());
                JsonNode candidates = rootNode.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        String text = parts.get(0).path("text").asText();
                        if (text != null && !text.trim().isEmpty()) {
                            return text.trim();
                        }
                    }
                }
                logger.warn("Gemini API returned 200 OK but candidates/parts was empty");
                throw new AiServiceUnavailableException("CodeCat received an empty response from the AI provider.");
            }

            logger.error("Gemini API error HTTP {}: {}", response.statusCode(), response.body());

            if (response.statusCode() == 400 || response.statusCode() == 401 || response.statusCode() == 403) {
                throw new AiServiceUnavailableException("CodeCat AI authentication failed. Please verify that AI_API_KEY is valid on the server.");
            } else if (response.statusCode() == 429) {
                throw new AiServiceUnavailableException("CodeCat AI rate limit or quota exceeded. Please try again in a few moments.");
            } else {
                throw new AiServiceUnavailableException("CodeCat AI provider returned error (HTTP " + response.statusCode() + "). Please try again later.");
            }

        } catch (AiServiceUnavailableException ex) {
            throw ex;
        } catch (java.net.http.HttpTimeoutException ex) {
            logger.error("Gemini API timeout: {}", ex.getMessage());
            throw new AiServiceUnavailableException("CodeCat AI provider request timed out. Please check server connectivity and try again.", ex);
        } catch (Exception ex) {
            logger.error("Unexpected error querying Gemini API: {}", ex.getMessage(), ex);
            throw new AiServiceUnavailableException("CodeCat AI service is temporarily unavailable. Please try again later.", ex);
        }
    }
}
