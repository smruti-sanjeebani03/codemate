package com.codemate.dto;

import com.codemate.entity.AuthProvider;
import com.codemate.entity.User;

import java.time.Instant;

/**
 * Safe user DTO returned in authentication and current-user responses.
 * Never serializes passwords, password hashes, or internal database metadata.
 */
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private String bio;
    private String coverUrl;
    private AuthProvider authProvider;
    private Instant createdAt;

    public UserResponse() {
    }

    public UserResponse(Long id, String name, String email, String avatarUrl, String bio, String coverUrl, AuthProvider authProvider, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.bio = bio;
        this.coverUrl = coverUrl;
        this.authProvider = authProvider;
        this.createdAt = createdAt;
    }

    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getCoverUrl(),
                user.getAuthProvider(),
                user.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public AuthProvider getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(AuthProvider authProvider) {
        this.authProvider = authProvider;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
