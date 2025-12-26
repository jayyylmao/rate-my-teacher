package com.ratemyteacher.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing trend data comparing recent reviews to older ones.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendDTO {

    /**
     * Average rating in the last 6 months
     */
    private Double recentAverageRating;

    /**
     * Average rating from reviews older than 6 months
     */
    private Double olderAverageRating;

    /**
     * Change in rating (positive = improving, negative = declining)
     */
    private Double ratingChange;

    /**
     * Trend direction: "improving", "stable", or "declining"
     */
    private String direction;

    /**
     * Number of reviews in the recent period
     */
    private Integer recentReviewCount;

    /**
     * Number of reviews in the older period
     */
    private Integer olderReviewCount;
}
