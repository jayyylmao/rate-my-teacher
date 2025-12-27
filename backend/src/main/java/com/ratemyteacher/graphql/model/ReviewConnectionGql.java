package com.ratemyteacher.graphql.model;

import java.util.List;

/**
 * GraphQL connection type for cursor-based review pagination.
 */
public record ReviewConnectionGql(
    List<ReviewEdgeGql> edges,
    PageInfoGql pageInfo,
    int totalCount
) {}
