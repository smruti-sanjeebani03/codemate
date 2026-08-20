package com.smruti.codemate.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "problems")
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String category;       // DSA or Logic
    private String topic;
    private String difficulty;     // Easy, Medium, Hard

    private String platform;       // GFG, LeetCode, CodeChef, GitHub, etc.
    private String problemLink;

    private String languageUsed;   // Java, Python, C++, C, Rust, Go
    private LocalDate dateSolved;

    public Problem() {
    }

    public Problem(String title, String category, String topic, String difficulty,
                   String platform, String problemLink, String languageUsed) {

        this.title = title;
        this.category = category;
        this.topic = topic;
        this.difficulty = difficulty;
        this.platform = platform;
        this.problemLink = problemLink;
        this.languageUsed = languageUsed;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getProblemLink() {
        return problemLink;
    }

    public void setProblemLink(String problemLink) {
        this.problemLink = problemLink;
    }

    public String getLanguageUsed() {
        return languageUsed;
    }

    public void setLanguageUsed(String languageUsed) {
        this.languageUsed = languageUsed;
    }

    public LocalDate getDateSolved() {
        return dateSolved;
    }

    public void setDateSolved(LocalDate dateSolved) {
        this.dateSolved = dateSolved;
    }
}