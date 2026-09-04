package com.codemate.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for Google OAuth / OIDC authentication requests.
 * Carries exclusively the verified credential token (Google ID Token).
 */
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID token or credential is required")
    private String credential;

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
}
