package com.codemate.dto;

import jakarta.validation.constraints.NotBlank;

public class PlatformDetectRequest {

    @NotBlank(message = "URL is required")
    private String url;

    public PlatformDetectRequest() {
    }

    public PlatformDetectRequest(String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
