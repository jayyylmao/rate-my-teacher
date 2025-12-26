package com.ratemyteacher.service;

import com.ratemyteacher.dto.CreateInterviewRequest;
import com.ratemyteacher.dto.InterviewExperienceDTO;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.entity.InterviewExperience;
import com.ratemyteacher.entity.Review;
import com.ratemyteacher.entity.ReviewStatus;
import com.ratemyteacher.exception.ResourceNotFoundException;
import com.ratemyteacher.repository.InterviewExperienceRepository;
import com.ratemyteacher.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewExperienceService {

    private final InterviewExperienceRepository interviewRepo;
    private final ReviewRepository reviewRepo;
    private final ReviewWeightingService weightingService;

    /**
     * Get all interview experiences with aggregate data
     */
    @Transactional(readOnly = true)
    public List<InterviewExperienceDTO> getAllInterviews() {
        log.info("Fetching all interview experiences");

        List<Object[]> results = interviewRepo.findAllWithStats();

        return results.stream()
                .map(this::mapFromStatsResult)
                .collect(Collectors.toList());
    }

    /**
     * Get interview experience by ID with full details (reviews + breakdown)
     * Returns the complete DTO including only APPROVED reviews and rating breakdown
     * Uses weighted average for better aggregate ratings
     */
    @Transactional(readOnly = true)
    public InterviewExperienceDTO getInterviewById(Integer id) {
        log.info("Fetching interview experience with id: {}", id);

        InterviewExperience interview = interviewRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewExperience", id));

        // Get only APPROVED reviews for public display
        List<Review> approvedReviews = reviewRepo.findByInterviewIdAndStatus(id, ReviewStatus.APPROVED);

        // Get stats for APPROVED reviews only
        List<Object[]> statsList = reviewRepo.statsForInterviewApproved(id);
        Object[] stats = !statsList.isEmpty() ? statsList.get(0) : new Object[]{0L, null, null};
        Map<Integer, Long> breakdown = mapBreakdown(reviewRepo.ratingBreakdown(id));

        InterviewExperienceDTO dto = mapWithStats(interview, stats);

        // Use weighted average instead of simple average
        Double weightedAvg = weightingService.calculateWeightedAverageRating(approvedReviews);
        dto.setAverageRating(weightedAvg);

        dto.setReviews(approvedReviews.stream()
                .map(this::convertReview)
                .collect(Collectors.toList()));
        dto.setRatingBreakdown(breakdown);

        return dto;
    }

    /**
     * Create new interview experience
     */
    @Transactional
    public InterviewExperienceDTO createInterview(CreateInterviewRequest request) {
        log.info("Creating new interview experience for company: {} role: {}",
                request.getCompany(), request.getRole());

        InterviewExperience interview = new InterviewExperience();
        interview.setCompany(request.getCompany());
        interview.setRole(request.getRole());
        interview.setLevel(request.getLevel());
        interview.setStage(request.getStage());
        interview.setLocation(request.getLocation());

        InterviewExperience saved = interviewRepo.save(interview);
        log.info("Created interview experience with id: {}", saved.getId());

        return mapWithAggregates(saved);
    }

    /**
     * Delete interview experience (cascade deletes reviews)
     */
    @Transactional
    public void deleteInterview(Integer id) {
        log.info("Deleting interview experience with id: {}", id);

        InterviewExperience interview = interviewRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewExperience", id));

        interviewRepo.delete(interview);
        log.info("Deleted interview experience with id: {}", id);
    }

    /**
     * Search interviews by company
     */
    @Transactional(readOnly = true)
    public List<InterviewExperienceDTO> searchByCompany(String company) {
        log.info("Searching interviews by company: {}", company);

        List<Object[]> results = interviewRepo.findByCompanyWithStats(company);

        return results.stream()
                .map(this::mapFromStatsResult)
                .collect(Collectors.toList());
    }

    /**
     * Search interviews by role
     */
    @Transactional(readOnly = true)
    public List<InterviewExperienceDTO> searchByRole(String role) {
        log.info("Searching interviews by role: {}", role);

        List<Object[]> results = interviewRepo.findByRoleWithStats(role);

        return results.stream()
                .map(this::mapFromStatsResult)
                .collect(Collectors.toList());
    }

    /**
     * Search interviews by query (searches across company, role, level, location, stage)
     */
    @Transactional(readOnly = true)
    public List<InterviewExperienceDTO> searchByQuery(String query) {
        log.info("Searching interviews by query: {}", query);

        List<Object[]> results = interviewRepo.searchByQueryWithStats(query);

        return results.stream()
                .map(this::mapFromStatsResult)
                .collect(Collectors.toList());
    }

    // Helper methods

    /**
     * Map query result with stats to DTO
     * Result format: [InterviewExperience, reviewCount, avgRating, lastReviewedAt]
     */
    private InterviewExperienceDTO mapFromStatsResult(Object[] result) {
        InterviewExperience interview = (InterviewExperience) result[0];
        Long reviewCount = result[1] != null ? ((Number) result[1]).longValue() : 0L;
        Double avgRating = result[2] != null ? ((Number) result[2]).doubleValue() : null;
        LocalDateTime lastReviewedAt = result[3] != null ? (LocalDateTime) result[3] : null;

        InterviewExperienceDTO dto = new InterviewExperienceDTO();
        dto.setId(interview.getId());
        dto.setCompany(interview.getCompany());
        dto.setRole(interview.getRole());
        dto.setLevel(interview.getLevel());
        dto.setStage(interview.getStage());
        dto.setLocation(interview.getLocation());
        dto.setCreatedAt(interview.getCreatedAt());
        dto.setAverageRating(avgRating);
        dto.setReviewCount(reviewCount.intValue());
        dto.setLastReviewedAt(lastReviewedAt);

        return dto;
    }

    private InterviewExperienceDTO mapWithAggregates(InterviewExperience interview) {
        List<Object[]> statsList = reviewRepo.statsForInterview(interview.getId());
        Object[] stats = !statsList.isEmpty() ? statsList.get(0) : new Object[]{0L, null, null};
        return mapWithStats(interview, stats);
    }

    private InterviewExperienceDTO mapWithStats(InterviewExperience interview, Object[] stats) {
        Long reviewCount = stats[0] != null ? ((Number) stats[0]).longValue() : 0L;
        Double avgRating = stats[1] != null ? ((Number) stats[1]).doubleValue() : null;
        LocalDateTime lastReviewedAt = stats[2] != null ? (LocalDateTime) stats[2] : null;

        InterviewExperienceDTO dto = new InterviewExperienceDTO();
        dto.setId(interview.getId());
        dto.setCompany(interview.getCompany());
        dto.setRole(interview.getRole());
        dto.setLevel(interview.getLevel());
        dto.setStage(interview.getStage());
        dto.setLocation(interview.getLocation());
        dto.setCreatedAt(interview.getCreatedAt());
        dto.setAverageRating(avgRating);
        dto.setReviewCount(reviewCount.intValue());
        dto.setLastReviewedAt(lastReviewedAt);

        return dto;
    }

    private Map<Integer, Long> mapBreakdown(List<Object[]> breakdownData) {
        Map<Integer, Long> breakdown = new HashMap<>();
        for (Object[] row : breakdownData) {
            Integer rating = (Integer) row[0];
            Long count = ((Number) row[1]).longValue();
            breakdown.put(rating, count);
        }
        return breakdown;
    }

    private ReviewDTO convertReview(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setInterviewId(review.getInterviewExperience().getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setReviewerName(review.getReviewerName());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setTags(review.getTags().stream()
                .map(tag -> tag.getKey())
                .collect(Collectors.toList()));
        dto.setRoundType(review.getRoundType());
        dto.setInterviewerInitials(review.getInterviewerInitials());
        dto.setOutcome(review.getOutcome() != null ? review.getOutcome().name() : null);
        dto.setStatus(review.getStatus() != null ? review.getStatus().name() : "APPROVED");
        dto.setApprovedAt(review.getApprovedAt());
        return dto;
    }
}
