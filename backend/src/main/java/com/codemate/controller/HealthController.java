package com.codemate.controller;

import com.codemate.dto.HealthResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.Statement;

/**
 * Controller providing system health check and safe database connectivity verification.
 * Does not expose passwords, credentials, or sensitive JDBC connection strings.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);

    private final DataSource dataSource;

    @Autowired
    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        boolean dbOk = false;
        String dbInfo = "UNKNOWN";

        try {
            if (dataSource != null) {
                try (Connection conn = dataSource.getConnection();
                     Statement stmt = conn.createStatement()) {
                    
                    // Verify actual connectivity with lightweight query
                    stmt.execute("SELECT 1");
                    
                    DatabaseMetaData metaData = conn.getMetaData();
                    String productName = metaData.getDatabaseProductName();
                    String productVersion = metaData.getDatabaseProductVersion();
                    dbInfo = String.format("UP (%s %s)", productName, productVersion != null ? productVersion.split(" ")[0] : "");
                    dbOk = true;
                }
            } else {
                dbInfo = "DOWN (DataSource bean not initialized)";
            }
        } catch (Exception ex) {
            dbOk = false;
            String sanitizedMessage = ex.getMessage() != null ? ex.getMessage().replaceAll("password=[^&; ]*", "password=***") : "Connection failed";
            dbInfo = "DOWN (Connection error: " + sanitizedMessage + ")";
            logger.warn("Database health check failed: {}", sanitizedMessage);
        }

        String overallStatus = dbOk ? "UP" : "DEGRADED";
        HealthResponse response = new HealthResponse(overallStatus, dbInfo, dbOk);

        return dbOk 
                ? ResponseEntity.ok(response) 
                : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
