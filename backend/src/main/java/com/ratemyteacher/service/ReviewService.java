package com.ratemyteacher.service;

import com.ratemyteacher.dto.CreateReviewRequest;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.dto.UpdateReviewRequest;
import com.ratemyteacher.entity.InterviewExperience;
import com.ratemyteacher.entity.Review;
import com.ratemyteacher.entity.AuthorType;
import com.ratemyteacher.entity.ReviewOutcome;
import com.ratemyteacher.entity.ReviewStatus;
import com.ratemyteacher.entity.Tag;
import com.ratemyteacher.exception.ContentValidationException;
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
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final InterviewExperienceRepository interviewRepo;
    private final TagRepository tagRepo;
    private final ReviewModerationService moderationService;

    // Validation patterns for content guardrails
    private static final Pattern FULL_NAME_PATTERN = Pattern.compile("\\b[A-Z][a-z]+\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*\\b");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("\\b[\\w.-]+@[\\w.-]+\\.\\w+\\b");
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b");
    private static final Pattern URL_PATTERN = Pattern.compile("(https?://|www\\.)", Pattern.CASE_INSENSITIVE);

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
     * Create a new review with tags (guest submission)
     */
    @Transactional
    public ReviewDTO createReview(CreateReviewRequest request, String userIdentifier) {
        return createReview(request, userIdentifier, null);
    }

    /**
     * Create a new review with tags
     * @param request The review request
     * @param userIdentifier Identifier for contribution tracking (can be null)
     * @param authorUserId The authenticated user's ID (null for guest submissions)
     */
    @Transactional
    public ReviewDTO createReview(CreateReviewRequest request, String userIdentifier, Long authorUserId) {
        log.info("Creating new review for interview id: {} (authorUserId: {})",
                request.getInterviewId(), authorUserId);

        // Run content validation guardrails before any database operations
        // Note: roundType is now enforced at DTO level via @NotBlank
        validateNoFullNames(request.getComment(), request.getInterviewerInitials());
        validateNoContactInfo(request.getComment());
        validateNoUrls(request.getComment());

        // Verify interview exists
        InterviewExperience interview = interviewRepo.findById(request.getInterviewId())
                .orElseThrow(() -> new ResourceNotFoundException("InterviewExperience", request.getInterviewId()));

        Review review = new Review();
        review.setInterviewExperience(interview);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setReviewerName(request.getReviewerName());

        // Set required and optional fields
        review.setRoundType(request.getRoundType());
        review.setInterviewerInitials(normalizeInitials(request.getInterviewerInitials()));

        // Set outcome if provided (now an enum, no parsing needed)
        review.setOutcome(request.getOutcome());

        // Set author type and user ID
        if (authorUserId != null) {
            review.setAuthorType(AuthorType.USER);
            review.setAuthorUserId(authorUserId);
        } else {
            review.setAuthorType(AuthorType.GUEST);
            review.setAuthorUserId(null);
        }

        // Set initial status to PENDING
        review.setStatus(ReviewStatus.PENDING);

        // Handle tags
        if (request.getTagKeys() != null && !request.getTagKeys().isEmpty()) {
            List<Tag> tags = tagRepo.findByKeyIn(request.getTagKeys());
            if (tags.size() != request.getTagKeys().size()) {
                throw new IllegalArgumentException("Unknown tagKeys");
            }
            review.setTags(new HashSet<>(tags));
        }

        // Save the review first
        Review savedReview = reviewRepository.save(review);
        log.info("Review created with id: {} (status: PENDING, authorType: {})",
                savedReview.getId(), savedReview.getAuthorType());

        // Check if should auto-approve
        if (moderationService.shouldAutoApprove(savedReview) &&
                !moderationService.needsManualReview(savedReview)) {
            // Uses review's authorUserId internally for contribution tracking
            moderationService.approveReview(savedReview);
            savedReview = reviewRepository.save(savedReview);
            log.info("Review {} auto-approved", savedReview.getId());
        } else {
            log.info("Review {} requires manual moderation", savedReview.getId());
        }

        return convertToDTO(savedReview);
    }

    /**
     * Update an existing review (only allowed for PENDING reviews).
     * Only authenticated users can edit their own reviews. Guest reviews cannot be edited.
     *
     * @param id The review ID to update
     * @param request The update request with new values
     * @param callerUserId The ID of the user attempting to update (from auth context)
     * @return The updated review DTO
     * @throws IllegalStateException if not owner, guest review, or not PENDING status
     */
    @Transactional
    public ReviewDTO updateReview(Integer id, UpdateReviewRequest request, Long callerUserId) {
        log.info("Updating review with id: {} (callerUserId: {})", id, callerUserId);

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        // Authz: only authenticated owners can edit (guest reviews not editable)
        if (review.getAuthorUserId() == null) {
            throw new IllegalStateException("Guest reviews cannot be edited.");
        }
        if (!review.getAuthorUserId().equals(callerUserId)) {
            throw new IllegalStateException("You do not have permission to edit this review.");
        }

        // Only allow editing PENDING reviews
        if (review.getStatus() != ReviewStatus.PENDING) {
            log.warn("Attempted to edit non-PENDING review {}", id);
            throw new IllegalStateException("Can only edit reviews that are pending. Current status: " + review.getStatus());
        }

        // Run content validation guardrails
        validateNoFullNames(request.getComment(), request.getInterviewerInitials());
        validateNoContactInfo(request.getComment());
        validateNoUrls(request.getComment());

        // Update fields
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setReviewerName(request.getReviewerName());
        review.setRoundType(request.getRoundType());
        review.setInterviewerInitials(normalizeInitials(request.getInterviewerInitials()));

        // Update outcome (now an enum, no parsing needed)
        review.setOutcome(request.getOutcome());

        // Update tags
        if (request.getTagKeys() != null && !request.getTagKeys().isEmpty()) {
            List<Tag> tags = tagRepo.findByKeyIn(request.getTagKeys());
            if (tags.size() != request.getTagKeys().size()) {
                throw new IllegalArgumentException("Unknown tagKeys");
            }
            review.setTags(new HashSet<>(tags));
        } else {
            review.setTags(new HashSet<>());
        }

        // Reset moderation metadata (defensive; keeps invariants correct)
        review.setApprovedAt(null);
        review.setModeratedAt(null);
        review.setModeratedByUserId(null);
        review.setRejectionReason(null);
        review.setStatus(ReviewStatus.PENDING);

        // Re-run moderation check after edit
        if (moderationService.shouldAutoApprove(review) &&
                !moderationService.needsManualReview(review)) {
            moderationService.approveReview(review);
            log.info("Review {} auto-approved after edit", review.getId());
        } else {
            log.info("Review {} still requires manual moderation after edit", review.getId());
        }

        Review savedReview = reviewRepository.save(review);
        log.info("Review updated successfully with id: {}", savedReview.getId());

        return convertToDTO(savedReview);
    }

    /**
     * Delete a review.
     * Only authenticated users can delete their own reviews. Guest reviews cannot be deleted.
     * Only PENDING or REJECTED reviews can be deleted (not APPROVED).
     *
     * @param id The review ID to delete
     * @param callerUserId The ID of the user attempting to delete (from auth context)
     * @throws IllegalStateException if not owner, guest review, or approved status
     */
    @Transactional
    public void deleteReview(Integer id, Long callerUserId) {
        log.info("Deleting review with id: {} (callerUserId: {})", id, callerUserId);

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        // Authz: only authenticated owners can delete (guest reviews not deletable in MVP)
        if (review.getAuthorUserId() == null) {
            throw new IllegalStateException("Guest reviews cannot be deleted.");
        }
        if (!review.getAuthorUserId().equals(callerUserId)) {
            throw new IllegalStateException("You do not have permission to delete this review.");
        }

        // Restrict deletes to pending/rejected only (approved reviews should not be deleted)
        if (review.getStatus() == ReviewStatus.APPROVED) {
            throw new IllegalStateException("Approved reviews cannot be deleted.");
        }

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
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setInterviewId(review.getInterviewExperience().getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setReviewerName(review.getReviewerName());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setTags(review.getTags().stream()
                .map(Tag::getKey)
                .collect(Collectors.toList()));
        dto.setRoundType(review.getRoundType());
        dto.setInterviewerInitials(review.getInterviewerInitials());
        dto.setOutcome(review.getOutcome() != null ? review.getOutcome().name() : null);
        dto.setStatus(review.getStatus().name());
        dto.setApprovedAt(review.getApprovedAt());
        return dto;
    }

    /**
     * Normalize interviewer initials:
     * - Remove non-letter characters
     * - Convert to uppercase
     * - Limit to 4 characters
     * - Return null if empty or less than 2 chars
     */
    private String normalizeInitials(String initials) {
        if (initials == null || initials.isBlank()) {
            return null;
        }

        // Remove non-letters, convert to uppercase, limit to 4 chars
        String normalized = initials.replaceAll("[^a-zA-Z]", "").toUpperCase();
        if (normalized.length() > 4) {
            normalized = normalized.substring(0, 4);
        }

        // Must be 2-4 characters
        return normalized.length() >= 2 ? normalized : null;
    }

    // ==================== Content Validation Guardrails ====================

    /**
     * Validate that no full names are included in comment or interviewer initials.
     * Pattern: Two or more capitalized words together (e.g., "John Smith", "Mary Jane Watson")
     */
    private void validateNoFullNames(String comment, String interviewerInitials) {
        if (comment != null && FULL_NAME_PATTERN.matcher(comment).find()) {
            log.warn("Full name detected in comment");
            throw new ContentValidationException("comment", "Please do not include full names. Use initials instead.");
        }

        if (interviewerInitials != null && FULL_NAME_PATTERN.matcher(interviewerInitials).find()) {
            log.warn("Full name detected in interviewer initials field");
            throw new ContentValidationException("interviewerInitials", "Please do not include full names. Use initials instead.");
        }
    }

    /**
     * Validate that no contact information (email or phone) is included in comment.
     */
    private void validateNoContactInfo(String comment) {
        if (comment == null) {
            return;
        }

        if (EMAIL_PATTERN.matcher(comment).find()) {
            log.warn("Email address detected in comment");
            throw new ContentValidationException("comment", "Please do not include contact information.");
        }

        if (PHONE_PATTERN.matcher(comment).find()) {
            log.warn("Phone number detected in comment");
            throw new ContentValidationException("comment", "Please do not include contact information.");
        }
    }

    /**
     * Validate that no URLs are included in comment.
     * Pattern: http://, https://, or www.
     */
    private void validateNoUrls(String comment) {
        if (comment != null && URL_PATTERN.matcher(comment).find()) {
            log.warn("URL detected in comment");
            throw new ContentValidationException("comment", "Please do not include URLs.");
        }
    }
}
