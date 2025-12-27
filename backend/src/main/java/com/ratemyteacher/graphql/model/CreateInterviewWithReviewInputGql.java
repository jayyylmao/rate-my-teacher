package com.ratemyteacher.graphql.model;

import java.util.List;

public record CreateInterviewWithReviewInputGql(
        // Interview fields
        String company,
        String role,
        String level,
        String stage,
        String location,

        // Review fields
        int rating,
        String comment,
        String reviewerName,
        String roundType,
        List<String> tagKeys,
        String interviewerInitials,
        String outcome
) {}
