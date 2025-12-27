package com.ratemyteacher.graphql.model;

/**
 * GraphQL model for tag distribution percentage.
 */
public record TagDistributionGql(
    String tag,
    double percentage
) {}
