package com.ratemyteacher.graphql.model;

/**
 * Minimal response for updateReview mutation.
 * Client should refetch as needed.
 */
public record UpdateReviewResponseGql(
        int id,
        String status
) {}
