package com.ratemyteacher.graphql.model;

import java.util.List;

/**
 * GraphQL model for company insights.
 * Single type that handles both locked (preview) and unlocked (full) states.
 */
public record InsightsGql(
    // Always available
    String companyName,
    int totalReviews,
    boolean locked,

    // Only available when unlocked (locked=false)
    List<TagDistributionGql> tagDistribution,
    Double averageDifficulty,
    String feedbackSpeed,
    List<String> commonFeedback,
    List<OutcomeDistributionGql> outcomeDistribution,
    TrendGql recentTrend,

    // Only available when locked (locked=true)
    String unlockMessage,
    Integer availableInsightsCount,
    List<String> topTagsBlurred
) {}
