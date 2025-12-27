package com.ratemyteacher.graphql.model;

import java.util.List;

public record InterviewDetailResponseGql(
    InterviewExperienceGql interview,
    List<ReviewGql> reviews,
    List<RatingCountGql> ratingBreakdown
) {}
