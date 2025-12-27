package com.ratemyteacher.graphql.model;

/**
 * GraphQL model for outcome distribution percentage.
 */
public record OutcomeDistributionGql(
    String outcome,
    double percentage
) {}
