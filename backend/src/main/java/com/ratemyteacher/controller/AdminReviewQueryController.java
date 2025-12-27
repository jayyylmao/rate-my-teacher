package com.ratemyteacher.controller;

import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-only query endpoints for reviews.
 * These endpoints return all reviews (including PENDING/REJECTED) for admin/moderation purposes.
 * Protected by RBAC - requires ADMIN or MODERATOR role.
 *
 * Public review data should be accessed via GET /api/interviews/{id} which returns approved-only reviews.
 */
@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
public class AdminReviewQueryController {

    private final ReviewService reviewService;

    /**
     * GET /api/admin/reviews - Get all reviews (admin/mod only)
     * Returns reviews of all statuses for admin management.
     */
    @GetMapping
    public ResponseEntity<List<ReviewDTO>> getAllReviews(
            @RequestParam(required = false) Integer rating) {

        log.info("GET /api/admin/reviews - rating filter: {}", rating);

        List<ReviewDTO> reviews;

        if (rating != null) {
            reviews = reviewService.getReviewsByRating(rating);
        } else {
            reviews = reviewService.getAllReviews();
        }

        return ResponseEntity.ok(reviews);
    }

    /**
     * GET /api/admin/reviews/{id} - Get a specific review by ID (admin/mod only)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Integer id) {
        log.info("GET /api/admin/reviews/{}", id);
        ReviewDTO review = reviewService.getReviewById(id);
        return ResponseEntity.ok(review);
    }

    /**
     * GET /api/admin/reviews/interview/{interviewId} - Get all reviews for a specific interview (admin/mod only)
     * Returns reviews of all statuses for admin management.
     */
    @GetMapping("/interview/{interviewId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByInterviewId(@PathVariable Integer interviewId) {
        log.info("GET /api/admin/reviews/interview/{}", interviewId);
        List<ReviewDTO> reviews = reviewService.getReviewsByInterviewId(interviewId);
        return ResponseEntity.ok(reviews);
    }
}
