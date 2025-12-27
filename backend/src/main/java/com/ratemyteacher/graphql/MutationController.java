package com.ratemyteacher.graphql;

import com.ratemyteacher.auth.AppPrincipal;
import com.ratemyteacher.dto.CreateReviewRequest;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.dto.UpdateReviewRequest;
import com.ratemyteacher.entity.ReviewOutcome;
import com.ratemyteacher.graphql.model.*;
import com.ratemyteacher.service.ReviewService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
public class MutationController {

    private final ReviewService reviewService;

    public MutationController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * Create a review. Returns minimal response - client should refetch interview query.
     */
    @MutationMapping
    public CreateReviewResponseGql createReview(@Argument CreateReviewInputGql input, Authentication authentication) {
        CreateReviewRequest request = new CreateReviewRequest();
        request.setInterviewId(input.interviewId());
        request.setRating(input.rating());
        request.setComment(input.comment());
        request.setReviewerName(input.reviewerName());
        request.setRoundType(input.roundType());
        request.setTagKeys(input.tagKeys());
        request.setInterviewerInitials(input.interviewerInitials());

        if (input.outcome() != null && !input.outcome().isBlank()) {
            request.setOutcome(ReviewOutcome.valueOf(input.outcome()));
        }

        Long authorUserId = null;
        String userIdentifier = null;

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof AppPrincipal appPrincipal) {
                authorUserId = appPrincipal.getUserId();
                userIdentifier = appPrincipal.getEmail();
            }
        }

        ReviewDTO dto = reviewService.createReview(request, userIdentifier, authorUserId);

        // Return minimal response
        return new CreateReviewResponseGql(dto.getId(), dto.getStatus());
    }

    /**
     * Update a review. Returns minimal response - client should refetch as needed.
     */
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public UpdateReviewResponseGql updateReview(@Argument Integer id, @Argument UpdateReviewInputGql input, Authentication authentication) {
        AppPrincipal principal = (AppPrincipal) authentication.getPrincipal();
        Long callerUserId = principal.getUserId();

        UpdateReviewRequest request = new UpdateReviewRequest();
        request.setRating(input.rating());
        request.setComment(input.comment());
        request.setReviewerName(input.reviewerName());
        request.setRoundType(input.roundType());
        request.setTagKeys(input.tagKeys());
        request.setInterviewerInitials(input.interviewerInitials());

        if (input.outcome() != null && !input.outcome().isBlank()) {
            request.setOutcome(ReviewOutcome.valueOf(input.outcome()));
        }

        ReviewDTO dto = reviewService.updateReview(id, request, callerUserId);

        // Return minimal response
        return new UpdateReviewResponseGql(dto.getId(), dto.getStatus());
    }

    /**
     * Delete a review.
     */
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public DeleteResponseGql deleteReview(@Argument Integer id, Authentication authentication) {
        AppPrincipal principal = (AppPrincipal) authentication.getPrincipal();
        Long callerUserId = principal.getUserId();

        reviewService.deleteReview(id, callerUserId);
        return new DeleteResponseGql(true);
    }
}
