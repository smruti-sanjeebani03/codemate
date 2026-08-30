package com.codemate.service;

import com.codemate.dto.CreateProblemRequest;
import com.codemate.dto.PlatformDetectResponse;
import com.codemate.dto.ProblemResponse;
import com.codemate.dto.UpdateProblemRequest;
import com.codemate.entity.Category;
import com.codemate.entity.Difficulty;
import com.codemate.entity.Problem;
import com.codemate.entity.User;
import com.codemate.exception.ResourceNotFoundException;
import com.codemate.repository.ProblemRepository;
import com.codemate.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service orchestrating problem creation, retrieval, updates, and deletion.
 * Enforces strict user-level authorization and automatic platform detection.
 */
@Service
@Transactional
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final PlatformDetectionService platformDetectionService;

    public ProblemService(ProblemRepository problemRepository,
                          UserRepository userRepository,
                          PlatformDetectionService platformDetectionService) {
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.platformDetectionService = platformDetectionService;
    }

    /**
     * Record a new solved coding problem for the authenticated user.
     */
    public ProblemResponse createProblem(Long userId, CreateProblemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user #" + userId + " not found"));

        Problem problem = new Problem();
        problem.setUser(user);
        problem.setTitle(request.getTitle().trim());
        problem.setCategory(request.getCategory());
        problem.setTopic(request.getTopic().trim());
        problem.setDifficulty(request.getDifficulty());
        problem.setProgrammingLanguage(request.getProgrammingLanguage().trim());

        // Platform detection logic:
        // If user manually provided a platform, prioritize it; otherwise auto-detect from problem URL
        if (request.getProblemUrl() != null && !request.getProblemUrl().trim().isEmpty()) {
            String url = request.getProblemUrl().trim();
            problem.setProblemUrl(url);

            if (request.getPlatform() != null && !request.getPlatform().trim().isEmpty()) {
                problem.setPlatform(request.getPlatform().trim());
            } else {
                problem.setPlatform(platformDetectionService.detectPlatform(url));
            }
        } else {
            problem.setPlatform(request.getPlatform() != null ? request.getPlatform().trim() : "Custom");
        }

        // Solved timestamp defaults to now if not specified
        problem.setSolvedAt(request.getSolvedAt() != null ? request.getSolvedAt() : Instant.now());

        Problem saved = problemRepository.save(problem);
        return ProblemResponse.fromEntity(saved);
    }

    /**
     * Retrieve all problems belonging to the authenticated user with optional filters, search, and sorting.
     */
    @Transactional(readOnly = true)
    public List<ProblemResponse> getProblems(Long userId,
                                             String search,
                                             Category category,
                                             String topic,
                                             Difficulty difficulty,
                                             String platform,
                                             String language,
                                             String sortBy,
                                             String sortDirection) {
        // Build sort order
        String sortField = (sortBy != null && !sortBy.isBlank()) ? sortBy : "solvedAt";
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortField);

        // Normalize blank filter parameters to null for SQL query matching
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        String cleanTopic = (topic != null && !topic.isBlank()) ? topic.trim() : null;
        String cleanPlatform = (platform != null && !platform.isBlank()) ? platform.trim() : null;
        String cleanLanguage = (language != null && !language.isBlank()) ? language.trim() : null;

        List<Problem> problems = problemRepository.findUserProblemsFiltered(
                userId,
                cleanSearch,
                category,
                cleanTopic,
                difficulty,
                cleanPlatform,
                cleanLanguage,
                sort
        );

        return problems.stream()
                .map(ProblemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve a single problem by ID, strictly verifying that the authenticated user owns it.
     */
    @Transactional(readOnly = true)
    public ProblemResponse getProblemById(Long userId, Long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem #" + problemId + " not found"));

        if (!problem.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Forbidden: You do not have permission to view problem #" + problemId);
        }

        return ProblemResponse.fromEntity(problem);
    }

    /**
     * Update an existing problem, strictly verifying that the authenticated user owns it.
     * Re-runs platform detection if URL changed.
     */
    public ProblemResponse updateProblem(Long userId, Long problemId, UpdateProblemRequest request) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem #" + problemId + " not found"));

        if (!problem.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Forbidden: You do not have permission to modify problem #" + problemId);
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            problem.setTitle(request.getTitle().trim());
        }

        if (request.getCategory() != null) {
            problem.setCategory(request.getCategory());
        }

        if (request.getTopic() != null && !request.getTopic().isBlank()) {
            problem.setTopic(request.getTopic().trim());
        }

        if (request.getDifficulty() != null) {
            problem.setDifficulty(request.getDifficulty());
        }

        if (request.getProgrammingLanguage() != null && !request.getProgrammingLanguage().isBlank()) {
            problem.setProgrammingLanguage(request.getProgrammingLanguage().trim());
        }

        if (request.getSolvedAt() != null) {
            problem.setSolvedAt(request.getSolvedAt());
        }

        // Handle URL and platform update
        if (request.getProblemUrl() != null) {
            String newUrl = request.getProblemUrl().trim();
            boolean urlChanged = !newUrl.equalsIgnoreCase(problem.getProblemUrl());
            problem.setProblemUrl(newUrl);

            if (request.getPlatform() != null && !request.getPlatform().isBlank()) {
                problem.setPlatform(request.getPlatform().trim());
            } else if (urlChanged && !newUrl.isEmpty()) {
                // Re-run platform detection if URL changed
                problem.setPlatform(platformDetectionService.detectPlatform(newUrl));
            }
        } else if (request.getPlatform() != null && !request.getPlatform().isBlank()) {
            problem.setPlatform(request.getPlatform().trim());
        }

        Problem saved = problemRepository.save(problem);
        return ProblemResponse.fromEntity(saved);
    }

    /**
     * Delete an existing problem, strictly verifying that the authenticated user owns it.
     */
    public void deleteProblem(Long userId, Long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem #" + problemId + " not found"));

        if (!problem.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Forbidden: You do not have permission to delete problem #" + problemId);
        }

        problemRepository.delete(problem);
    }

    /**
     * Preview platform detection for a URL.
     */
    public PlatformDetectResponse previewPlatformDetection(String url) {
        String platform = platformDetectionService.detectPlatform(url);
        String host = platformDetectionService.extractHost(url);
        boolean recognized = platformDetectionService.isRecognizedPlatform(url);
        return new PlatformDetectResponse(url, platform, host != null ? host : "unknown", recognized);
    }
}
