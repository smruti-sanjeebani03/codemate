package com.codemate.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for Google OAuth / OIDC authentication requests.
 * Carries the verified credential token (Google ID Token) or verified token payload.
 */
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID token or credential is required")
    private String credential;

    /**
     * Optional client-provided fallback hints (strictly verified on backend).
     */
    private String email;
    private String name;
    private String avatarUrl;

    public GoogleLoginRequest() {
    }

    public GoogleLoginRequest(String credential) {
        this.credential = credential;
    }

    public String getCredential() {
        return credential;
    }

    public void setCredential(String credential) {
        this.credential = credential;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
