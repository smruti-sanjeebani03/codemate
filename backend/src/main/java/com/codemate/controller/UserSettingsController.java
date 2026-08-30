package com.codemate.controller;

import com.codemate.dto.DailyTargetRequest;
import com.codemate.dto.DailyTargetResponse;
import com.codemate.security.UserPrincipal;
import com.codemate.service.UserSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for user settings and daily coding target configuration.
 */
@RestController
@RequestMapping("/api/settings")
public class UserSettingsController {

    private final UserSettingsService userSettingsService;

    public UserSettingsController(UserSettingsService userSettingsService) {
        this.userSettingsService = userSettingsService;
    }

    /**
     * GET /api/settings/daily-target
     * Retrieve authenticated user's current daily coding target.
     */
    @GetMapping("/daily-target")
    public ResponseEntity<DailyTargetResponse> getDailyTarget(@AuthenticationPrincipal UserPrincipal principal) {
        DailyTargetResponse response = userSettingsService.getDailyTarget(principal.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/settings/daily-target
     * Update authenticated user's daily coding target.
     */
    @PutMapping("/daily-target")
    public ResponseEntity<DailyTargetResponse> updateDailyTarget(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DailyTargetRequest request) {
        DailyTargetResponse response = userSettingsService.updateDailyTarget(principal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
