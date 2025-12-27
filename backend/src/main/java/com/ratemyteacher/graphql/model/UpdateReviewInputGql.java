package com.ratemyteacher.graphql.model;

import java.util.List;

public record UpdateReviewInputGql(
        int rating,
        String comment,
        String reviewerName,
        String roundType,
        List<String> tagKeys,
        String interviewerInitials,
        String outcome
) {}
