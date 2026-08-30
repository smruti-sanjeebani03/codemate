package com.codemate.dto;

import com.codemate.entity.Category;
import com.codemate.entity.Difficulty;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Size;

import java.time.Instant;

/**
 * Request payload for updating an existing coding problem.
 */
public class UpdateProblemRequest {

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 1000, message = "Problem URL must not exceed 1000 characters")
    @JsonAlias({"problemLink", "url"})
    private String problemUrl;

    @Size(max = 100, message = "Platform must not exceed 100 characters")
    private String platform;

    private Category category;

    @Size(max = 100, message = "Topic must not exceed 100 characters")
    private String topic;

    private Difficulty difficulty;

    @Size(max = 50, message = "Programming language must not exceed 50 characters")
    @JsonAlias({"languageUsed", "language"})
    private String programmingLanguage;

    @JsonAlias({"dateSolved", "solvedDate"})
    private Instant solvedAt;

    public UpdateProblemRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getProblemUrl() {
        return problemUrl;
    }

    public void setProblemUrl(String problemUrl) {
        this.problemUrl = problemUrl;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public String getProgrammingLanguage() {
        return programmingLanguage;
    }

    public void setProgrammingLanguage(String programmingLanguage) {
        this.programmingLanguage = programmingLanguage;
    }

    public Instant getSolvedAt() {
        return solvedAt;
    }

    public void setSolvedAt(Instant solvedAt) {
        this.solvedAt = solvedAt;
    }
}
