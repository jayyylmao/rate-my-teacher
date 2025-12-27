package com.ratemyteacher.graphql.model;

import java.util.List;

public record CreateReviewInputGql(
        int interviewId,
        int rating,
        String comment,
        String reviewerName,
        String roundType,
        List<String> tagKeys,
        String interviewerInitials,
        String outcome
) {}
