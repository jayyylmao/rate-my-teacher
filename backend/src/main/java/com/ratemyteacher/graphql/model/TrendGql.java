package com.ratemyteacher.graphql.model;

/**
 * GraphQL model for trend data comparing recent vs older reviews.
 */
public record TrendGql(
    double recentAverageRating,
    double olderAverageRating,
    double ratingChange,
    String direction,
    int recentReviewCount,
    int olderReviewCount
) {}
