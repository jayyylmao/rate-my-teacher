package com.ratemyteacher.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for admin metrics dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminMetricsDTO {

    /**
     * Primary metric: % of approved reviews with full metadata
     * (has tags + round_type + comment >= 150 chars)
     */
    private double qualityReviewPercentage;

    /**
     * Count of reviews by status (pending/approved/rejected)
     */
    private Map<String, Long> statusCounts;

    /**
     * Average time between created_at and approved_at in seconds
     */
    private Double averageTimeToApprovalSeconds;

    /**
     * Total number of reviews in the system
     */
    private long totalReviews;

    /**
     * Total number of interview experiences in the system
     */
    private long totalInterviews;

    /**
     * Timestamp when these metrics were generated
     */
    private LocalDateTime generatedAt = LocalDateTime.now();
}
