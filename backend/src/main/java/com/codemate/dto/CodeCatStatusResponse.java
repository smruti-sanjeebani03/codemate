package com.codemate.dto;

import java.time.Instant;
import java.util.List;

/**
 * Status DTO indicating the active AI model, provider, and companion capabilities.
 */
public class CodeCatStatusResponse {

    private String status;
    private String name;
    private String provider;
    private String model;
    private boolean hasApiKey;
    private List<String> capabilities;
    private Instant timestamp;

    public CodeCatStatusResponse() {
    }

    public CodeCatStatusResponse(String status, String name, String provider, String model, boolean hasApiKey, List<String> capabilities, Instant timestamp) {
        this.status = status;
        this.name = name;
        this.provider = provider;
        this.model = model;
        this.hasApiKey = hasApiKey;
        this.capabilities = capabilities;
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public boolean isHasApiKey() {
        return hasApiKey;
    }

    public void setHasApiKey(boolean hasApiKey) {
        this.hasApiKey = hasApiKey;
    }

    public List<String> getCapabilities() {
        return capabilities;
    }

    public void setCapabilities(List<String> capabilities) {
        this.capabilities = capabilities;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
