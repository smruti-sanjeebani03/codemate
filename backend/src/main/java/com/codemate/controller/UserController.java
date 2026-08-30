package com.codemate.controller;

import com.codemate.dto.UpdateProfileRequest;
import com.codemate.dto.UserResponse;
import com.codemate.entity.User;
import com.codemate.security.UserPrincipal;
import com.codemate.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for user profile management.
 * Provides endpoints for retrieving and updating user profile details.
 */
@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieve the authenticated user profile.
     * Accessible via GET /api/users/me or /api/users/profile.
     */
    @GetMapping({"/api/users/me", "/api/users/profile", "/api/user/profile", "/api/profile"})
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    /**
     * Update the authenticated user profile (name, bio, avatarUrl, coverUrl).
     */
    @PutMapping({"/api/users/profile", "/api/user/profile", "/api/auth/profile", "/api/profile"})
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse response = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * Partial update of user profile.
     */
    @PatchMapping({"/api/users/profile", "/api/user/profile", "/api/auth/profile", "/api/profile"})
    public ResponseEntity<UserResponse> patchProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse response = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
