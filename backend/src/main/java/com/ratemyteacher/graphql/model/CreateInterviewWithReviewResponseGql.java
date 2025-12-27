package com.ratemyteacher.graphql.model;

public record CreateInterviewWithReviewResponseGql(
        int interviewId,
        int reviewId,
        String status,
        boolean isNewInterview
) {}
