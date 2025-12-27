package com.ratemyteacher.graphql.model;

/**
 * Minimal response for createReview mutation.
 * Client should refetch interview query on success.
 */
public record CreateReviewResponseGql(
        int id,
        String status
) {}
