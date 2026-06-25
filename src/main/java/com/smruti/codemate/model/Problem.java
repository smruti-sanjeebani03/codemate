package com.smruti.codemate.model;

import java.time.LocalDate; 

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "problems")
public class Problem {
    
    @Id
    private String id; 

    private String title; 
    private String category; // DSA Or Logic
    private String topic; 
    private String difficulty; //Easy,Medium, Hard 

    private String platform; // GFG, LeetCode, Codedex.. 
    private String problemLink; 

    private String languageUsed; //Java, Python, C++, C, Rust, Go
    private LocalDate dateSolved; 

    public Problem() { 

    }

    public Problem(String title, String category, String topic, String difficulty, String platform, 
        String problemLink, String languageUsed){ 
            this.title = title; 
            this.category = category;
            this.topic = topic;
            this.difficulty = difficulty;
            this.platform = platform;
            this.problemLink = problemLink;
            this.languageUsed = languageUsed; 
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

    public void setProblemLink(String problemLink){ 
        this.problemLink = problemLink;
    }

    public String getLanguageUsed() { 
        return languageUsed; 
    }

    public void setLanguageUsed(String languageUsed){
        this.languageUsed = languageUsed; 
    }

    public LocalDate getDateSolved() {
    return dateSolved;
    }

    public void setDateSolved(LocalDate dateSolved) {
    this.dateSolved = dateSolved;
    }
   
    }


    

