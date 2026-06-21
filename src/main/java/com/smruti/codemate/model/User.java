package com.smruti.codemate.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id; 
   
    private String username; 
    private String name; 
    
    private String email; 
    private String password; 
    private String bio; 

    private int dailyTarget; 
    private int currentStreak; 

    public User() {

    }

    public User(String username, String name, String email, String password, String bio, int dailyTarget, int currentStreak) {
        this.username = username;
        this.name = name; 
        this.email = email;
        this.password = password;
        this.bio = bio; 
        this.dailyTarget = dailyTarget;
        this.currentStreak = currentStreak;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getname() { 
        return name; 
    }

    public void setname(String name){ 
        this.name = name; 
    } 

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getBio() { 
        return bio; 
    }
    
    public void setBio(String bio) { 
        this.bio = bio; 
    }
    public int getDailyTarget() {
        return dailyTarget;
    }

    public void setDailyTarget(int dailyTarget) {
        this.dailyTarget = dailyTarget;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }
}
