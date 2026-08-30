package com.codemate.dto;

import com.codemate.entity.Category;
import com.codemate.entity.Difficulty;
import com.codemate.entity.Problem;

import java.time.Instant;

/**
 * Clean, safe DTO for returning Problem details to clients.
 * Prevents leaking entity internals or User credentials.
 */
public class ProblemResponse {

    private Long id;
    private Long userId;
    private String title;
    private String problemUrl;
    private String platform;
    private Category category;
    private String topic;
    private Difficulty difficulty;
    private String programmingLanguage;
    private Instant solvedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public ProblemResponse() {
    }

    public ProblemResponse(Long id, Long userId, String title, String problemUrl, String platform,
                           Category category, String topic, Difficulty difficulty,
                           String programmingLanguage, Instant solvedAt, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.problemUrl = problemUrl;
        this.platform = platform;
        this.category = category;
        this.topic = topic;
        this.difficulty = difficulty;
        this.programmingLanguage = programmingLanguage;
        this.solvedAt = solvedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ProblemResponse fromEntity(Problem problem) {
        if (problem == null) return null;
        return new ProblemResponse(
                problem.getId(),
                problem.getUser() != null ? problem.getUser().getId() : null,
                problem.getTitle(),
                problem.getProblemUrl(),
                problem.getPlatform(),
                problem.getCategory(),
                problem.getTopic(),
                problem.getDifficulty(),
                problem.getProgrammingLanguage(),
                problem.getSolvedAt(),
                problem.getCreatedAt(),
                problem.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public String getLanguageUsed() {
        return programmingLanguage;
    }

    public void setLanguageUsed(String languageUsed) {
        this.programmingLanguage = languageUsed;
    }

    public String getProblemLink() {
        return problemUrl;
    }

    public void setProblemLink(String problemLink) {
        this.problemUrl = problemLink;
    }

    public Instant getDateSolved() {
        return solvedAt;
    }

    public void setDateSolved(Instant dateSolved) {
        this.solvedAt = dateSolved;
    }

    public Instant getSolvedAt() {
        return solvedAt;
    }

    public void setSolvedAt(Instant solvedAt) {
        this.solvedAt = solvedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
