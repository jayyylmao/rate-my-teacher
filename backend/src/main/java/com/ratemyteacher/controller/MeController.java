package com.ratemyteacher.controller;

import com.ratemyteacher.auth.AppPrincipal;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.entity.Review;
import com.ratemyteacher.entity.Tag;
import com.ratemyteacher.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Endpoints for authenticated user information.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class MeController {

    private final ReviewRepository reviewRepository;

    /**
     * GET /api/me
     * Returns the current authenticated user's info including roles.
     * Returns 401 if not authenticated (handled by Spring Security).
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        AppPrincipal principal = (AppPrincipal) authentication.getPrincipal();

        log.info("GET /api/me for user {}", principal.getUserId());

        return ResponseEntity.ok(Map.of(
                "id", principal.getUserId(),
                "email", principal.getEmail(),
                "roles", principal.getRoles()
        ));
    }

    /**
     * GET /api/my/reviews
     * Returns all reviews submitted by the authenticated user.
     * Includes pending, approved, and rejected reviews.
     */
    @GetMapping("/my/reviews")
    public ResponseEntity<Map<String, Object>> myReviews(Authentication authentication) {
        AppPrincipal principal = (AppPrincipal) authentication.getPrincipal();

        log.info("GET /api/my/reviews for user {}", principal.getUserId());

        List<Review> reviews = reviewRepository.findByAuthorUserId(principal.getUserId());

        List<ReviewDTO> reviewDTOs = reviews.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "items", reviewDTOs,
                "count", reviewDTOs.size()
        ));
    }

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
}
