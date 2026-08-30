package com.codemate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Objects;

/**
 * Problem entity representing a coding problem solved by a user.
 * 
 * Category represents high-level classification:
 * - LOGIC: Fundamentals, number problems, patterns, conditions, math logic.
 * - DSA: Data Structures and Algorithms (Arrays, Trees, Graphs, DP, etc.).
 * 
 * Topic represents specific granular subjects (e.g. Arrays, Binary Search, Prime Numbers).
 */
@Entity
@Table(name = "problems")
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Problem must belong to a user")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Size(max = 1000, message = "Problem URL must not exceed 1000 characters")
    @Column(name = "problem_url", length = 1000)
    private String problemUrl;

    @Size(max = 100, message = "Platform name must not exceed 100 characters")
    @Column(name = "platform", length = 100)
    private String platform;

    @NotNull(message = "Category is required (LOGIC or DSA)")
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private Category category;

    @Size(max = 100, message = "Topic name must not exceed 100 characters")
    @Column(name = "topic", length = 100)
    private String topic;

    @NotNull(message = "Difficulty is required (EASY, MEDIUM, HARD)")
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false, length = 20)
    private Difficulty difficulty;

    @Size(max = 50, message = "Programming language must not exceed 50 characters")
    @Column(name = "programming_language", length = 50)
    private String programmingLanguage;

    /**
     * Exact timestamp when the problem was solved.
     * Used for daily streaks, weekly progress, and dashboard analytics.
     */
    @Column(name = "solved_at")
    private Instant solvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Problem() {
    }

    public Problem(User user, String title, Category category, Difficulty difficulty) {
        this.user = user;
        this.title = title;
        this.category = category;
        this.difficulty = difficulty;
        this.solvedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    // Compatibility accessors
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Problem problem = (Problem) o;
        return Objects.equals(id, problem.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Problem{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", platform='" + platform + '\'' +
                ", category=" + category +
                ", topic='" + topic + '\'' +
                ", difficulty=" + difficulty +
                ", programmingLanguage='" + programmingLanguage + '\'' +
                ", solvedAt=" + solvedAt +
                ", createdAt=" + createdAt +
                '}';
    }
}
