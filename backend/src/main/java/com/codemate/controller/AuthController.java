package com.codemate.controller;

import com.codemate.dto.AuthResponse;
import com.codemate.dto.GoogleLoginRequest;
import com.codemate.dto.LoginRequest;
import com.codemate.dto.RegisterRequest;
import com.codemate.dto.UserResponse;
import com.codemate.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication REST Controller for CodeMate.
 * 
 * Provides stateless JWT authentication endpoints:
 * - POST /api/auth/register (Email + Password sign up)
 * - POST /api/auth/login (Email + Password sign in)
 * - POST /api/auth/google (Google OAuth / OpenID Connect sign in)
 * - GET  /api/auth/me (Current authenticated user profile)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user with name, email, and password.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticate an existing user with email and password.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Authenticate or register a user using verified Google OAuth credentials.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieve the currently authenticated user's profile.
     * Requires a valid Bearer JWT in the Authorization header.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(response);
    }
}
