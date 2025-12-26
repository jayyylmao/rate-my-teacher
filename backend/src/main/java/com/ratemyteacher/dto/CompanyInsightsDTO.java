package com.ratemyteacher.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO containing full company insights, available only to users who have contributed.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyInsightsDTO {

    /**
     * Tag distribution showing percentage of reviews with each tag
     * e.g., {"Behavioral Questions": 75.5, "Technical Interview": 60.2}
     */
    private Map<String, Double> tagDistribution;

    /**
     * Average difficulty rating (1-5 scale)
     */
    private Double averageDifficulty;

    /**
     * Feedback speed category based on reviews
     * Values: "Fast" (< 1 week), "Average" (1-2 weeks), "Slow" (> 2 weeks)
     */
    private String feedbackSpeed;

    /**
     * Top mentioned themes/feedback from reviews
     */
    private List<String> commonFeedback;

    /**
     * Trend data comparing recent reviews to older ones
     */
    private TrendDTO recentTrend;

    /**
     * Outcome distribution (percentage of OFFER, REJECTED, WITHDREW)
     */
    private Map<String, Double> outcomeDistribution;

    /**
     * Total number of approved reviews analyzed
     */
    private Integer totalReviews;

    /**
     * Company name for context
     */
    private String companyName;

    /**
     * Indicates this is the full (unlocked) version
     */
    @Builder.Default
    private boolean locked = false;
}
