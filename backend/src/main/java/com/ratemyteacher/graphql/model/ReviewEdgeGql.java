package com.ratemyteacher.graphql.model;

/**
 * GraphQL edge type for cursor-based pagination.
 */
public record ReviewEdgeGql(
    ReviewGql node,
    String cursor
) {}
