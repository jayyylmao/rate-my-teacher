package com.ratemyteacher.service;

import com.ratemyteacher.entity.Review;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for calculating internal review weights.
 * Weights are used to produce better aggregates but are never exposed to users.
 */
@Service
public class ReviewWeightingService {

    /**
     * Calculate weight for a review (internal use only, never exposed)
     * Higher weight = more influence on aggregates
     *
     * Scoring factors:
     * - Has tags: +1.0
     * - Has round_type: +1.0
     * - Comment >= 150 chars: +1.0
     * - Recent (within 6 months): +1.0
     * - Has structured ratings: +0.5 (placeholder for future)
     *
     * Base weight: 1.0
     * Max weight: 5.5
     */
    public double calculateWeight(Review review) {
        double weight = 1.0;  // base weight

        // Has tags: +1.0
        if (review.getTags() != null && !review.getTags().isEmpty()) {
            weight += 1.0;
        }

        // Has round_type: +1.0
        if (review.getRoundType() != null && !review.getRoundType().isBlank()) {
            weight += 1.0;
        }

        // Comment >= 150 chars: +1.0
        if (review.getComment() != null && review.getComment().length() >= 150) {
            weight += 1.0;
        }

        // Recent = within 6 months: +1.0
        if (review.getCreatedAt() != null) {
            LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
            if (review.getCreatedAt().isAfter(sixMonthsAgo)) {
                weight += 1.0;
            }
        }

        // TODO: Check structured ratings when that field is added
        // For now, give bonus if round_type suggests a detailed review

        return weight;
    }

    /**
     * Calculate weighted average rating for an interview
     *
     * @param reviews List of reviews to calculate weighted average for
     * @return Weighted average rating, or null if no reviews
     */
    public Double calculateWeightedAverageRating(List<Review> reviews) {
        if (reviews == null || reviews.isEmpty()) {
            return null;
        }

        double totalWeightedRating = 0;
        double totalWeight = 0;

        for (Review review : reviews) {
            double weight = calculateWeight(review);
            totalWeightedRating += review.getRating() * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? totalWeightedRating / totalWeight : null;
    }
}
