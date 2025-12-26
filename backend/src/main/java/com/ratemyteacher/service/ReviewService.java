package com.ratemyteacher.service;

import com.ratemyteacher.dto.CreateReviewRequest;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.entity.InterviewExperience;
import com.ratemyteacher.entity.Review;
import com.ratemyteacher.entity.Tag;
import com.ratemyteacher.exception.ResourceNotFoundException;
import com.ratemyteacher.repository.InterviewExperienceRepository;
import com.ratemyteacher.repository.ReviewRepository;
import com.ratemyteacher.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final InterviewExperienceRepository interviewRepo;
    private final TagRepository tagRepo;

    /**
     * Get all reviews
     */
    @Transactional(readOnly = true)
    public List<ReviewDTO> getAllReviews() {
        log.info("Fetching all reviews");
        List<Review> reviews = reviewRepository.findAll();

        return reviews.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific review by ID
     */
    @Transactional(readOnly = true)
    public ReviewDTO getReviewById(Integer id) {
        log.info("Fetching review with id: {}", id);
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        return convertToDTO(review);
    }

    /**
     * Get all reviews for a specific interview experience
     */
    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsByInterviewId(Integer interviewId) {
        log.info("Fetching reviews for interview id: {}", interviewId);

        // Verify interview exists
        if (!interviewRepo.existsById(interviewId)) {
            throw new ResourceNotFoundException("InterviewExperience", interviewId);
        }

        List<Review> reviews = reviewRepository.findByInterviewId(interviewId);

        return reviews.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new review with tags
     */
    @Transactional
    public ReviewDTO createReview(CreateReviewRequest request) {
        log.info("Creating new review for interview id: {}", request.getInterviewId());

        // Verify interview exists
        InterviewExperience interview = interviewRepo.findById(request.getInterviewId())
                .orElseThrow(() -> new ResourceNotFoundException("InterviewExperience", request.getInterviewId()));

        Review review = new Review();
        review.setInterviewExperience(interview);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setReviewerName(request.getReviewerName());

        // Handle tags
        if (request.getTagKeys() != null && !request.getTagKeys().isEmpty()) {
            List<Tag> tags = tagRepo.findByKeyIn(request.getTagKeys());
            if (tags.size() != request.getTagKeys().size()) {
                throw new IllegalArgumentException("Unknown tagKeys");
            }
            review.setTags(new HashSet<>(tags));
        }

        Review savedReview = reviewRepository.save(review);
        log.info("Review created successfully with id: {}", savedReview.getId());

        return convertToDTO(savedReview);
    }

    /**
     * Delete a review
     */
    @Transactional
    public void deleteReview(Integer id) {
        log.info("Deleting review with id: {}", id);

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        reviewRepository.delete(review);
        log.info("Review deleted successfully with id: {}", id);
    }

    /**
     * Get reviews by rating
     */
    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsByRating(Integer rating) {
        log.info("Fetching reviews with rating: {}", rating);

        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        List<Review> reviews = reviewRepository.findByRating(rating);

        return reviews.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Helper method to convert entity to DTO
    private ReviewDTO convertToDTO(Review review) {
        return new ReviewDTO(
                review.getId(),
                review.getInterviewExperience().getId(),
                review.getRating(),
                review.getComment(),
                review.getReviewerName(),
                review.getCreatedAt(),
                review.getTags().stream()
                        .map(Tag::getKey)
                        .collect(Collectors.toList())
        );
    }
}
