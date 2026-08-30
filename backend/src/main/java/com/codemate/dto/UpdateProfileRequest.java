package com.codemate.dto;

import jakarta.validation.constraints.Size;

/**
 * Request payload for updating authenticated user profile details.
 */
public class UpdateProfileRequest {

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
    private String avatarUrl;

    @Size(max = 500, message = "Cover URL must not exceed 500 characters")
    private String coverUrl;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String name, String bio, String avatarUrl, String coverUrl) {
        this.name = name;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.coverUrl = coverUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }
}
