package com.codemate.controller;

import com.codemate.dto.CreateProblemRequest;
import com.codemate.dto.PlatformDetectRequest;
import com.codemate.dto.PlatformDetectResponse;
import com.codemate.dto.ProblemResponse;
import com.codemate.dto.UpdateProblemRequest;
import com.codemate.entity.Category;
import com.codemate.entity.Difficulty;
import com.codemate.security.UserPrincipal;
import com.codemate.service.ProblemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST Controller for problem tracking, categorization, platform detection, and ownership management.
 * All operations derive user identity from Spring Security JWT authentication.
 */
@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    /**
     * Record a new solved coding problem.
     * POST /api/problems
     */
    @PostMapping
    public ResponseEntity<ProblemResponse> createProblem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateProblemRequest request) {
        ProblemResponse response = problemService.createProblem(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieve all problems solved by the authenticated user with search, filtering, and sorting.
     * GET /api/problems
     */
    @GetMapping
    public ResponseEntity<List<ProblemResponse>> getProblems(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String language,
            @RequestParam(required = false, defaultValue = "solvedAt") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDir) {
        List<ProblemResponse> problems = problemService.getProblems(
                principal.getId(),
                search,
                category,
                topic,
                difficulty,
                platform,
                language,
                sortBy,
                sortDir
        );
        return ResponseEntity.ok(problems);
    }

    /**
     * Retrieve a specific problem by ID. Rejects access if problem does not belong to caller.
     * GET /api/problems/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProblemResponse> getProblemById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ProblemResponse problem = problemService.getProblemById(principal.getId(), id);
        return ResponseEntity.ok(problem);
    }

    /**
     * Update an existing problem.
     * PUT /api/problems/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProblemResponse> updateProblem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProblemRequest request) {
        ProblemResponse updated = problemService.updateProblem(principal.getId(), id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete an existing problem.
     * DELETE /api/problems/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        problemService.deleteProblem(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Helper endpoint for client-side live platform detection preview as user types problem URL.
     * POST /api/problems/detect-platform
     */
    @PostMapping("/detect-platform")
    public ResponseEntity<PlatformDetectResponse> detectPlatform(
            @Valid @RequestBody PlatformDetectRequest request) {
        PlatformDetectResponse response = problemService.previewPlatformDetection(request.getUrl());
        return ResponseEntity.ok(response);
    }
}
