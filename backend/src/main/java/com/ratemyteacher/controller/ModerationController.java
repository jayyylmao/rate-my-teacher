package com.ratemyteacher.controller;

import com.ratemyteacher.auth.AppPrincipal;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.entity.Review;
import com.ratemyteacher.entity.ReviewStatus;
import com.ratemyteacher.entity.Tag;
import com.ratemyteacher.exception.ResourceNotFoundException;
import com.ratemyteacher.repository.ReviewRepository;
import com.ratemyteacher.service.ReviewModerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin/Moderation endpoints for managing review approval.
 * Protected by RBAC - requires ADMIN or MODERATOR role.
 */
@RestController
@RequestMapping("/api/admin/moderation")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
public class ModerationController {

    private final ReviewRepository reviewRepository;
    private final ReviewModerationService moderationService;

    /**
     * GET /api/admin/moderation/pending - Get all pending reviews awaiting moderation
     */
    @GetMapping("/pending")
    public ResponseEntity<List<ReviewDTO>> getPendingReviews() {
        log.info("GET /api/admin/moderation/pending");

        List<Review> pendingReviews = reviewRepository.findByStatusOrderByCreatedAtAsc(ReviewStatus.PENDING);

        List<ReviewDTO> dtos = pendingReviews.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        log.info("Found {} pending reviews", dtos.size());
        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /api/admin/moderation/stats - Get moderation queue statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getModerationStats() {
        log.info("GET /api/admin/moderation/stats");

        Map<String, Long> stats = new HashMap<>();
        stats.put("pending", reviewRepository.countByStatus(ReviewStatus.PENDING));
        stats.put("approved", reviewRepository.countByStatus(ReviewStatus.APPROVED));
        stats.put("rejected", reviewRepository.countByStatus(ReviewStatus.REJECTED));

        return ResponseEntity.ok(stats);
    }

    /**
     * POST /api/admin/moderation/reviews/{id}/approve - Approve a pending review
     */
    @PostMapping("/reviews/{id}/approve")
    public ResponseEntity<ReviewDTO> approveReview(
            @PathVariable Integer id,
            Authentication authentication) {

        AppPrincipal principal = (AppPrincipal) authentication.getPrincipal();
        log.info("POST /api/admin/moderation/reviews/{}/approve by user {}", id, principal.getUserId());

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        if (review.getStatus() != ReviewStatus.PENDING) {
            log.warn("Attempted to approve review {} with status {}", id, review.getStatus());
            return ResponseEntity.badRequest().build();
        }

        moderationService.approveReview(review, principal.getUserId());
        Review savedReview = reviewRepository.save(review);

        log.info("Review {} approved by moderator {}", id, principal.getEmail());
        return ResponseEntity.ok(convertToDTO(savedReview));
    }

    /**
     * POST /api/admin/moderation/reviews/{id}/reject - Reject a pending review
     */
    @PostMapping("/reviews/{id}/reject")
    public ResponseEntity<ReviewDTO> rejectReview(
            @PathVariable Integer id,
            @RequestBody(required = false) RejectRequest request,
            Authentication authentication) {

        AppPrincipal principal = (AppPrincipal) authentication.getPrincipal();
        log.info("POST /api/admin/moderation/reviews/{}/reject by user {}", id, principal.getUserId());

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));

        if (review.getStatus() != ReviewStatus.PENDING) {
            log.warn("Attempted to reject review {} with status {}", id, review.getStatus());
            return ResponseEntity.badRequest().build();
        }

        String reason = (request != null && request.getReason() != null)
                ? request.getReason()
                : null;

        moderationService.rejectReview(review, reason, principal.getUserId());
        Review savedReview = reviewRepository.save(review);

        log.info("Review {} rejected by moderator {}. Reason: {}", id, principal.getEmail(), reason);
        return ResponseEntity.ok(convertToDTO(savedReview));
    }

    /**
     * Helper method to convert Review entity to DTO
     */
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
     * Request body for reject endpoint
     */
    public static class RejectRequest {
        private String reason;

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
