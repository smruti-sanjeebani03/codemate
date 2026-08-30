package com.codemate.dto;

import java.time.Instant;

/**
 * Data Transfer Object representing the health status response with database connectivity diagnostics.
 * Safe for development and production - does NOT expose sensitive credentials.
 */
public class HealthResponse {

    private String status;
    private String timestamp;
    private String service;
    private String version;
    private String database;
    private boolean databaseConnected;

    public HealthResponse() {
    }

    public HealthResponse(String status) {
        this.status = status;
        this.timestamp = Instant.now().toString();
        this.service = "CodeMate Spring Boot Backend";
        this.version = "1.0.0";
    }

    public HealthResponse(String status, String database, boolean databaseConnected) {
        this.status = status;
        this.timestamp = Instant.now().toString();
        this.service = "CodeMate Spring Boot Backend";
        this.version = "1.0.0";
        this.database = database;
        this.databaseConnected = databaseConnected;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public boolean isDatabaseConnected() {
        return databaseConnected;
    }

    public void setDatabaseConnected(boolean databaseConnected) {
        this.databaseConnected = databaseConnected;
    }
}
