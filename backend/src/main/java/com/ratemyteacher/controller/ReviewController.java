package com.ratemyteacher.controller;

import com.ratemyteacher.auth.AppPrincipal;
import com.ratemyteacher.dto.CreateReviewRequest;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.dto.UpdateReviewRequest;
import com.ratemyteacher.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Public review endpoints.
 *
 * POST /api/reviews - Create a new review (guest or authenticated)
 * PUT /api/reviews/{id} - Update (authenticated owner only, pending only)
 * DELETE /api/reviews/{id} - Delete (authenticated owner only, pending/rejected only)
 *
 * Note: GET endpoints have been moved to AdminReviewQueryController under /api/admin/reviews
 * to prevent leaking PENDING/REJECTED review data to the public.
 * Public review data should be accessed via GET /api/interviews/{id} which returns approved-only reviews.
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "https://hello-world-five-peach.vercel.app"})
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * POST /api/reviews - Create a new review
     * Supports both guest and authenticated submissions.
     * If authenticated, the review is linked to the user's account.
     */
    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {

        Long authorUserId = null;

        if (authentication != null && authentication.getPrincipal() instanceof AppPrincipal principal) {
            authorUserId = principal.getUserId();
            log.info("POST /api/reviews - Creating review for interview id: {} (user: {})",
                    request.getInterviewId(), authorUserId);
        } else {
            log.info("POST /api/reviews - Creating review for interview id: {} (guest)",
                    request.getInterviewId());
        }

        // No identity header for MVP. Pass null userIdentifier.
        ReviewDTO createdReview = reviewService.createReview(request, null, authorUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
    }

    /**
     * PUT /api/reviews/{id} - Update an existing review
     * Only authenticated users can edit their own PENDING reviews.
     * Guest reviews cannot be edited.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateReviewRequest request,
            Authentication authentication) {

        if (authentication == null || !(authentication.getPrincipal() instanceof AppPrincipal principal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        log.info("PUT /api/reviews/{} - Updating review (user: {})", id, principal.getUserId());
        ReviewDTO updated = reviewService.updateReview(id, request, principal.getUserId());
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/reviews/{id} - Delete a review
     * Only authenticated users can delete their own reviews.
     * Guest reviews cannot be deleted.
     * Only PENDING or REJECTED reviews can be deleted (not APPROVED).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Integer id,
            Authentication authentication) {

        if (authentication == null || !(authentication.getPrincipal() instanceof AppPrincipal principal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        log.info("DELETE /api/reviews/{} (user: {})", id, principal.getUserId());
        reviewService.deleteReview(id, principal.getUserId());
        return ResponseEntity.noContent().build();
    }
}
