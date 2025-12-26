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

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "https://hello-world-five-peach.vercel.app"})
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * GET /api/reviews - Get all reviews
     */
    @GetMapping
    public ResponseEntity<List<ReviewDTO>> getAllReviews(
            @RequestParam(required = false) Integer rating) {

        log.info("GET /api/reviews - rating filter: {}", rating);

        List<ReviewDTO> reviews;

        if (rating != null) {
            reviews = reviewService.getReviewsByRating(rating);
        } else {
            reviews = reviewService.getAllReviews();
        }

        return ResponseEntity.ok(reviews);
    }

    /**
     * GET /api/reviews/{id} - Get a specific review
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Integer id) {
        log.info("GET /api/reviews/{}", id);
        ReviewDTO review = reviewService.getReviewById(id);
        return ResponseEntity.ok(review);
    }

    /**
     * GET /api/reviews/interview/{interviewId} - Get all reviews for a specific interview
     */
    @GetMapping("/interview/{interviewId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByInterviewId(@PathVariable Integer interviewId) {
        log.info("GET /api/reviews/interview/{}", interviewId);
        List<ReviewDTO> reviews = reviewService.getReviewsByInterviewId(interviewId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * POST /api/reviews - Create a new review
     * Supports both guest and authenticated submissions.
     * If authenticated, the review is linked to the user's account.
     */
    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @RequestHeader(value = "X-User-Identifier", required = false) String userIdentifier,
            Authentication authentication) {

        // Extract user ID if authenticated
        Long authorUserId = null;
        if (authentication != null && authentication.getPrincipal() instanceof AppPrincipal) {
            AppPrincipal principal = (AppPrincipal) authentication.getPrincipal();
            authorUserId = principal.getUserId();
            log.info("POST /api/reviews - Creating review for interview id: {} (authenticated user: {})",
                    request.getInterviewId(), authorUserId);
        } else {
            log.info("POST /api/reviews - Creating review for interview id: {} (guest)",
                    request.getInterviewId());
        }

        ReviewDTO createdReview = reviewService.createReview(request, userIdentifier, authorUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
    }

    /**
     * PUT /api/reviews/{id} - Update an existing review (only if PENDING)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateReviewRequest request) {
        log.info("PUT /api/reviews/{} - Updating review", id);
        ReviewDTO updatedReview = reviewService.updateReview(id, request);
        return ResponseEntity.ok(updatedReview);
    }

    /**
     * DELETE /api/reviews/{id} - Delete a review
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Integer id) {
        log.info("DELETE /api/reviews/{}", id);
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
