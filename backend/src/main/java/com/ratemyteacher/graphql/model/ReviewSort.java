package com.ratemyteacher.graphql.model;

/**
 * Sort options for review queries.
 */
public enum ReviewSort {
    RECENT,   // Sort by createdAt DESC
    HIGHEST,  // Sort by rating DESC
    LOWEST    // Sort by rating ASC
}
