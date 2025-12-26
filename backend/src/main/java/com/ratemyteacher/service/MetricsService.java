package com.ratemyteacher.service;

import com.ratemyteacher.dto.AdminMetricsDTO;
import com.ratemyteacher.entity.ReviewStatus;
import com.ratemyteacher.repository.InterviewExperienceRepository;
import com.ratemyteacher.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Service for tracking and reporting admin metrics
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService {

    private final ReviewRepository reviewRepo;
    private final InterviewExperienceRepository interviewRepo;

    /**
     * Get primary metric: % of approved reviews with full metadata
     * (has tags + round_type + comment >= 150 chars)
     */
    @Transactional(readOnly = true)
    public double getQualityReviewPercentage() {
        long total = reviewRepo.countByStatus(ReviewStatus.APPROVED);
        if (total == 0) {
            return 0;
        }

        long quality = reviewRepo.countQualityReviews();
        return (double) quality / total * 100;
    }

    /**
     * Get approval/rejection rates
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getStatusCounts() {
        return Map.of(
            "pending", reviewRepo.countByStatus(ReviewStatus.PENDING),
            "approved", reviewRepo.countByStatus(ReviewStatus.APPROVED),
            "rejected", reviewRepo.countByStatus(ReviewStatus.REJECTED)
        );
    }

    /**
     * Get average time to approval (for approved reviews)
     *
     * @return Average time in seconds, or null if no data
     */
    @Transactional(readOnly = true)
    public Double getAverageTimeToApprovalSeconds() {
        return reviewRepo.averageApprovalTimeSeconds();
    }

    /**
     * Get rejection reasons breakdown (if tracked)
     * Placeholder for future enhancement
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getRejectionReasons() {
        // This would require tracking rejection reasons
        // For now, return empty map
        return Map.of();
    }

    /**
     * Get all metrics as a single DTO
     */
    @Transactional(readOnly = true)
    public AdminMetricsDTO getAllMetrics() {
        log.info("Generating admin metrics");

        AdminMetricsDTO dto = new AdminMetricsDTO();
        dto.setQualityReviewPercentage(getQualityReviewPercentage());
        dto.setStatusCounts(getStatusCounts());
        dto.setAverageTimeToApprovalSeconds(getAverageTimeToApprovalSeconds());
        dto.setTotalReviews(reviewRepo.count());
        dto.setTotalInterviews(interviewRepo.count());
        dto.setGeneratedAt(LocalDateTime.now());

        log.info("Metrics generated: quality={}%, total_reviews={}, total_interviews={}",
                String.format("%.2f", dto.getQualityReviewPercentage()),
                dto.getTotalReviews(),
                dto.getTotalInterviews());

        return dto;
    }
}
