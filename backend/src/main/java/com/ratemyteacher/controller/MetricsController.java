package com.ratemyteacher.controller;

import com.ratemyteacher.dto.AdminMetricsDTO;
import com.ratemyteacher.service.MetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST controller for admin metrics endpoints
 */
@RestController
@RequestMapping("/api/admin/metrics")
@RequiredArgsConstructor
@Slf4j
public class MetricsController {

    private final MetricsService metricsService;

    /**
     * Get all admin metrics
     *
     * @return AdminMetricsDTO with all metrics
     */
    @GetMapping
    public ResponseEntity<AdminMetricsDTO> getMetrics() {
        log.info("GET /api/admin/metrics");
        return ResponseEntity.ok(metricsService.getAllMetrics());
    }

    /**
     * Get quality review percentage metric only
     *
     * @return Map with qualityReviewPercentage
     */
    @GetMapping("/quality")
    public ResponseEntity<Map<String, Double>> getQualityMetric() {
        log.info("GET /api/admin/metrics/quality");
        return ResponseEntity.ok(Map.of(
            "qualityReviewPercentage", metricsService.getQualityReviewPercentage()
        ));
    }

    /**
     * Get review status counts
     *
     * @return Map with pending/approved/rejected counts
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Long>> getStatusCounts() {
        log.info("GET /api/admin/metrics/status");
        return ResponseEntity.ok(metricsService.getStatusCounts());
    }
}
