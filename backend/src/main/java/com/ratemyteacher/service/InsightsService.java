package com.ratemyteacher.service;

import com.ratemyteacher.dto.CompanyInsightsDTO;
import com.ratemyteacher.dto.CompanyInsightsPreviewDTO;
import com.ratemyteacher.dto.TrendDTO;
import com.ratemyteacher.entity.*;
import com.ratemyteacher.exception.InsightsAccessDeniedException;
import com.ratemyteacher.exception.ResourceNotFoundException;
import com.ratemyteacher.repository.InterviewExperienceRepository;
import com.ratemyteacher.repository.ReviewRepository;
import com.ratemyteacher.repository.UserContributionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing company insights and user contributions.
 * Users who submit approved reviews unlock full insights for that company.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InsightsService {

    private final UserContributionRepository contributionRepository;
    private final ReviewRepository reviewRepository;
    private final InterviewExperienceRepository interviewRepository;

    // Period for "recent" reviews (6 months)
    private static final int RECENT_MONTHS = 6;

    /**
     * Check if a user has unlocked insights for a specific interview experience.
     *
     * @param userIdentifier The user's identifier (email hash or session ID)
     * @param interviewId The interview experience ID
     * @return true if the user has contributed and unlocked insights
     */
    public boolean hasUnlockedInsights(String userIdentifier, Integer interviewId) {
        if (userIdentifier == null || userIdentifier.isBlank()) {
            return false;
        }
        return contributionRepository.existsByUserIdentifierAndInterviewExperienceId(
                userIdentifier, interviewId);
    }

    /**
     * Record a contribution when a review is approved.
     * This unlocks insights for the user for that company.
     *
     * @param userIdentifier The user's identifier
     * @param interviewId The interview experience ID
     * @param reviewId The approved review ID
     */
    @Transactional
    public void recordContribution(String userIdentifier, Integer interviewId, Integer reviewId) {
        if (userIdentifier == null || userIdentifier.isBlank()) {
            log.warn("Cannot record contribution: userIdentifier is null or blank");
            return;
        }

        // Check if already contributed (should not happen, but be safe)
        if (contributionRepository.existsByUserIdentifierAndInterviewExperienceId(
                userIdentifier, interviewId)) {
            log.info("User {} already has contribution for interview {}", userIdentifier, interviewId);
            return;
        }

        InterviewExperience interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewExperience", interviewId));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        UserContribution contribution = new UserContribution();
        contribution.setUserIdentifier(userIdentifier);
        contribution.setInterviewExperience(interview);
        contribution.setReview(review);
        contribution.setUnlockedAt(LocalDateTime.now());

        contributionRepository.save(contribution);
        log.info("Recorded contribution for user {} on interview {} via review {}",
                userIdentifier, interviewId, reviewId);
    }

    /**
     * Get full insights for a company (only if user has unlocked).
     *
     * @param userIdentifier The user's identifier
     * @param interviewId The interview experience ID
     * @return Full company insights
     * @throws InsightsAccessDeniedException if user hasn't unlocked insights
     */
    @Transactional(readOnly = true)
    public CompanyInsightsDTO getInsights(String userIdentifier, Integer interviewId) {
        if (!hasUnlockedInsights(userIdentifier, interviewId)) {
            throw new InsightsAccessDeniedException();
        }

        InterviewExperience interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewExperience", interviewId));

        List<Review> approvedReviews = reviewRepository.findByInterviewIdAndStatus(
                interviewId, ReviewStatus.APPROVED);

        if (approvedReviews.isEmpty()) {
            return CompanyInsightsDTO.builder()
                    .companyName(interview.getCompany())
                    .totalReviews(0)
                    .locked(false)
                    .build();
        }

        return buildFullInsights(interview, approvedReviews);
    }

    /**
     * Get preview insights for non-contributors (blurred/limited data).
     *
     * @param interviewId The interview experience ID
     * @return Preview insights with blurred data
     */
    @Transactional(readOnly = true)
    public CompanyInsightsPreviewDTO getInsightsPreview(Integer interviewId) {
        InterviewExperience interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewExperience", interviewId));

        List<Review> approvedReviews = reviewRepository.findByInterviewIdAndStatus(
                interviewId, ReviewStatus.APPROVED);

        // Count unique tags across all reviews
        Set<String> uniqueTags = approvedReviews.stream()
                .flatMap(r -> r.getTags().stream())
                .map(Tag::getKey)
                .collect(Collectors.toSet());

        // Create blurred tag hints
        List<String> blurredTags = new ArrayList<>();
        if (!uniqueTags.isEmpty()) {
            blurredTags.add("Interview feedback includes " + uniqueTags.size() + " insights");
            blurredTags.add("Common patterns: " + generateBlurredText(8));
            blurredTags.add("Success factors: " + generateBlurredText(6));
        }

        return CompanyInsightsPreviewDTO.builder()
                .companyName(interview.getCompany())
                .totalReviews(approvedReviews.size())
                .topTagsBlurred(blurredTags)
                .locked(true)
                .unlockMessage("Share your interview experience to unlock detailed insights")
                .availableInsightsCount(uniqueTags.size())
                .build();
    }

    /**
     * Build full insights from approved reviews.
     */
    private CompanyInsightsDTO buildFullInsights(InterviewExperience interview, List<Review> reviews) {
        // Calculate tag distribution
        Map<String, Double> tagDistribution = calculateTagDistribution(reviews);

        // Calculate average difficulty (using rating as proxy)
        double avgDifficulty = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        // Calculate outcome distribution
        Map<String, Double> outcomeDistribution = calculateOutcomeDistribution(reviews);

        // Calculate trends
        TrendDTO trend = calculateTrend(reviews);

        // Extract common feedback themes from tags
        List<String> commonFeedback = extractTopTags(reviews, 5);

        return CompanyInsightsDTO.builder()
                .companyName(interview.getCompany())
                .totalReviews(reviews.size())
                .tagDistribution(tagDistribution)
                .averageDifficulty(Math.round(avgDifficulty * 10.0) / 10.0)
                .feedbackSpeed(determineFeedbackSpeed(reviews))
                .commonFeedback(commonFeedback)
                .recentTrend(trend)
                .outcomeDistribution(outcomeDistribution)
                .locked(false)
                .build();
    }

    /**
     * Calculate tag distribution as percentages.
     */
    private Map<String, Double> calculateTagDistribution(List<Review> reviews) {
        if (reviews.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Long> tagCounts = reviews.stream()
                .flatMap(r -> r.getTags().stream())
                .collect(Collectors.groupingBy(Tag::getKey, Collectors.counting()));

        double totalReviews = reviews.size();
        return tagCounts.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> Math.round((e.getValue() / totalReviews) * 1000.0) / 10.0
                ));
    }

    /**
     * Calculate outcome distribution as percentages.
     */
    private Map<String, Double> calculateOutcomeDistribution(List<Review> reviews) {
        List<Review> reviewsWithOutcome = reviews.stream()
                .filter(r -> r.getOutcome() != null)
                .collect(Collectors.toList());

        if (reviewsWithOutcome.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Long> outcomeCounts = reviewsWithOutcome.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getOutcome().name(),
                        Collectors.counting()
                ));

        double total = reviewsWithOutcome.size();
        return outcomeCounts.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> Math.round((e.getValue() / total) * 1000.0) / 10.0
                ));
    }

    /**
     * Calculate trend comparing recent reviews to older ones.
     */
    private TrendDTO calculateTrend(List<Review> reviews) {
        LocalDateTime cutoff = LocalDateTime.now().minusMonths(RECENT_MONTHS);

        List<Review> recentReviews = reviews.stream()
                .filter(r -> r.getCreatedAt().isAfter(cutoff))
                .collect(Collectors.toList());

        List<Review> olderReviews = reviews.stream()
                .filter(r -> r.getCreatedAt().isBefore(cutoff) || r.getCreatedAt().isEqual(cutoff))
                .collect(Collectors.toList());

        double recentAvg = recentReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        double olderAvg = olderReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        double change = recentAvg - olderAvg;
        String direction;
        if (Math.abs(change) < 0.3) {
            direction = "stable";
        } else if (change > 0) {
            direction = "improving";
        } else {
            direction = "declining";
        }

        return TrendDTO.builder()
                .recentAverageRating(Math.round(recentAvg * 10.0) / 10.0)
                .olderAverageRating(Math.round(olderAvg * 10.0) / 10.0)
                .ratingChange(Math.round(change * 10.0) / 10.0)
                .direction(direction)
                .recentReviewCount(recentReviews.size())
                .olderReviewCount(olderReviews.size())
                .build();
    }

    /**
     * Extract top N tags by frequency.
     */
    private List<String> extractTopTags(List<Review> reviews, int limit) {
        return reviews.stream()
                .flatMap(r -> r.getTags().stream())
                .collect(Collectors.groupingBy(Tag::getKey, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Determine feedback speed category based on reviews.
     * This is a simplified implementation - could be enhanced with actual timing data.
     */
    private String determineFeedbackSpeed(List<Review> reviews) {
        // For now, base on average rating as proxy
        // (Higher rated experiences tend to have faster feedback)
        double avgRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(3.0);

        if (avgRating >= 4.0) {
            return "Fast";
        } else if (avgRating >= 2.5) {
            return "Average";
        } else {
            return "Slow";
        }
    }

    /**
     * Generate blurred placeholder text for preview.
     */
    private String generateBlurredText(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append("\u2022"); // Bullet character
        }
        return sb.toString();
    }
}
