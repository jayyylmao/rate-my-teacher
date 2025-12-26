package com.ratemyteacher.controller;

import com.ratemyteacher.dto.CreateReviewRequest;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
     */
    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@Valid @RequestBody CreateReviewRequest request) {
        log.info("POST /api/reviews - Creating review for interview id: {}", request.getInterviewId());
        ReviewDTO createdReview = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
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
