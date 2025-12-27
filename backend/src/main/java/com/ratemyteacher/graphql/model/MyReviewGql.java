package com.ratemyteacher.graphql.model;

import java.util.List;

/**
 * GraphQL MyReview type - includes moderation status for user's own reviews.
 */
public record MyReviewGql(
        int id,
        int interviewId,
        int rating,
        String comment,
        String reviewerName,
        String createdAt,
        List<String> tags,
        String roundType,
        String interviewerInitials,
        String outcome,
        String status,
        String approvedAt
) {}
