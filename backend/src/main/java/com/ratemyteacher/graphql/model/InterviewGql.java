package com.ratemyteacher.graphql.model;

import java.util.List;

/**
 * GraphQL Interview type - used for both list and detail views.
 * reviews and ratingBreakdown are resolved on-demand via field resolvers.
 */
public record InterviewGql(
        int id,
        String company,
        String role,
        String level,
        String stage,
        String location,
        String createdAt,
        Double averageRating,
        int reviewCount,
        String lastReviewedAt
) {}
