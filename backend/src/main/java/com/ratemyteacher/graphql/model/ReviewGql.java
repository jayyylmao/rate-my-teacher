package com.ratemyteacher.graphql.model;

import java.util.List;

public record ReviewGql(
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
