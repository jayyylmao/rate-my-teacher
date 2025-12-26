package com.ratemyteacher.service;

import com.ratemyteacher.dto.CreateInterviewRequest;
import com.ratemyteacher.dto.InterviewExperienceDTO;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.entity.InterviewExperience;
import com.ratemyteacher.entity.Review;
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

    /**
     * Get all interview experiences with aggregate data
     */
    @Transactional(readOnly = true)
    public List<InterviewExperienceDTO> getAllInterviews() {
        log.info("Fetching all interview experiences");

        List<InterviewExperience> interviews = interviewRepo.findAll();

        return interviews.stream()
                .map(this::mapWithAggregates)
                .collect(Collectors.toList());
    }

    /**
     * Get interview experience by ID with full details (reviews + breakdown)
     */
    @Transactional(readOnly = true)
    public InterviewExperienceDTO getInterviewById(Integer id) {
        log.info("Fetching interview experience with id: {}", id);

        InterviewExperience interview = interviewRepo.findByIdWithReviews(id);
        if (interview == null) {
            throw new ResourceNotFoundException("InterviewExperience", id);
        }

        // Get stats
        List<Object[]> statsList = reviewRepo.statsForInterview(id);
        Object[] stats = !statsList.isEmpty() ? statsList.get(0) : new Object[]{0L, null, null};
        Map<Integer, Long> breakdown = mapBreakdown(reviewRepo.ratingBreakdown(id));

        InterviewExperienceDTO dto = mapWithStats(interview, stats);
        dto.setReviews(interview.getReviews().stream()
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

        List<InterviewExperience> interviews = interviewRepo.findByCompanyContainingIgnoreCase(company);

        return interviews.stream()
                .map(this::mapWithAggregates)
                .collect(Collectors.toList());
    }

    /**
     * Search interviews by role
     */
    @Transactional(readOnly = true)
    public List<InterviewExperienceDTO> searchByRole(String role) {
        log.info("Searching interviews by role: {}", role);

        List<InterviewExperience> interviews = interviewRepo.findByRoleContainingIgnoreCase(role);

        return interviews.stream()
                .map(this::mapWithAggregates)
                .collect(Collectors.toList());
    }

    // Helper methods

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
        return new ReviewDTO(
                review.getId(),
                review.getInterviewExperience().getId(),
                review.getRating(),
                review.getComment(),
                review.getReviewerName(),
                review.getCreatedAt(),
                review.getTags().stream()
                        .map(tag -> tag.getKey())
                        .collect(Collectors.toList())
        );
    }
}
