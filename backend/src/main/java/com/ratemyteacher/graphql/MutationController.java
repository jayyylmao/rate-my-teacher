package com.ratemyteacher.graphql;

import com.ratemyteacher.auth.AppPrincipal;
import com.ratemyteacher.dto.CreateInterviewRequest;
import com.ratemyteacher.dto.CreateReviewRequest;
import com.ratemyteacher.dto.InterviewExperienceDTO;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.dto.UpdateReviewRequest;
import com.ratemyteacher.entity.ReviewOutcome;
import com.ratemyteacher.graphql.model.*;
import com.ratemyteacher.service.InterviewExperienceService;
import com.ratemyteacher.service.ReviewService;
import com.ratemyteacher.service.ReviewVoteService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Controller
public class MutationController {

    private final ReviewService reviewService;
    private final InterviewExperienceService interviewService;
    private final ReviewVoteService voteService;

    public MutationController(
            ReviewService reviewService,
            InterviewExperienceService interviewService,
            ReviewVoteService voteService
    ) {
        this.reviewService = reviewService;
        this.interviewService = interviewService;
        this.voteService = voteService;
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
     * Create interview + review in one atomic operation (smart form)
     * Checks for existing interview by company+role, creates if not found
     * Returns minimal response with both interview and review IDs
     */
    @MutationMapping
    public CreateInterviewWithReviewResponseGql createInterviewWithReview(
            @Argument CreateInterviewWithReviewInputGql input,
            Authentication authentication
    ) {
        // Extract auth info
        Long authorUserId = null;
        String userIdentifier = null;

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof AppPrincipal appPrincipal) {
                authorUserId = appPrincipal.getUserId();
                userIdentifier = appPrincipal.getEmail();
            }
        }

        // Step 1: Find or create interview
        CreateInterviewRequest interviewRequest = new CreateInterviewRequest();
        interviewRequest.setCompany(input.company());
        interviewRequest.setRole(input.role());
        interviewRequest.setLevel(input.level());
        interviewRequest.setStage(input.stage());
        interviewRequest.setLocation(input.location());

        InterviewExperienceService.InterviewWithCreationStatus result =
                interviewService.findOrCreateInterview(interviewRequest);

        InterviewExperienceDTO interview = result.interview();
        boolean isNew = result.isNew();

        // Step 2: Create review for the interview
        CreateReviewRequest reviewRequest = new CreateReviewRequest();
        reviewRequest.setInterviewId(interview.getId());
        reviewRequest.setRating(input.rating());
        reviewRequest.setComment(input.comment());
        reviewRequest.setReviewerName(input.reviewerName());
        reviewRequest.setRoundType(input.roundType());
        reviewRequest.setTagKeys(input.tagKeys());
        reviewRequest.setInterviewerInitials(input.interviewerInitials());

        if (input.outcome() != null && !input.outcome().isBlank()) {
            reviewRequest.setOutcome(ReviewOutcome.valueOf(input.outcome()));
        }

        ReviewDTO review = reviewService.createReview(reviewRequest, userIdentifier, authorUserId);

        // Return minimal response
        return new CreateInterviewWithReviewResponseGql(
                interview.getId(),
                review.getId(),
                review.getStatus(),
                isNew
        );
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

    /**
     * Toggle helpful vote on a review.
     * If user hasn't voted, adds vote. If they have, removes it.
     * Works for both authenticated users and guests.
     */
    @MutationMapping
    public VoteReviewResponseGql voteReview(@Argument Integer reviewId, Authentication authentication) {
        // Extract user identifier (email for auth users, UUID for guests from header)
        String userIdentifier = extractUserIdentifier(authentication);

        // Toggle vote
        int newCount = voteService.toggleVote(reviewId, userIdentifier);

        // Check new vote state
        boolean hasVoted = voteService.hasVoted(reviewId, userIdentifier);

        return new VoteReviewResponseGql(reviewId, newCount, hasVoted);
    }

    /**
     * Helper: Extract user identifier for voting/contributions.
     * For authenticated users: returns email
     * For guests: returns X-User-Identifier header value (UUID from frontend)
     */
    private String extractUserIdentifier(Authentication authentication) {
        // Try authenticated user first
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof AppPrincipal appPrincipal) {
                return appPrincipal.getEmail();
            }
        }

        // Fall back to guest identifier from header
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            String guestIdentifier = request.getHeader("X-User-Identifier");
            if (guestIdentifier != null && !guestIdentifier.isBlank()) {
                return guestIdentifier;
            }
        }

        // No identifier available (will fail validation in service layer)
        return null;
    }
}
