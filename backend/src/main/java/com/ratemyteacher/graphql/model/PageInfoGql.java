package com.ratemyteacher.graphql.model;

/**
 * GraphQL PageInfo for cursor-based pagination.
 */
public record PageInfoGql(
    boolean hasNextPage,
    boolean hasPreviousPage,
    String startCursor,
    String endCursor
) {}
