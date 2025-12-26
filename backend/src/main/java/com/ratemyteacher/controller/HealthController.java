package com.ratemyteacher.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;

    /**
     * GET /api/health - Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("application", "rate-my-teacher-api");
        health.put("timestamp", System.currentTimeMillis());

        // Check database connection
        try (Connection connection = dataSource.getConnection()) {
            health.put("database", "UP");
        } catch (Exception e) {
            health.put("database", "DOWN");
            health.put("error", e.getMessage());
        }

        return ResponseEntity.ok(health);
    }
}
