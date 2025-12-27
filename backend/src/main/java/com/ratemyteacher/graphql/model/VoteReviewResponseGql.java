package com.ratemyteacher.graphql.model;

/**
 * Response for voteReview mutation.
 * Returns new vote count and viewer's current vote state.
 */
public record VoteReviewResponseGql(
        int reviewId,
        int helpfulCount,
        boolean viewerHasVoted
) {}
