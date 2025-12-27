package com.ratemyteacher.graphql.model;

public record InterviewExperienceGql(
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
