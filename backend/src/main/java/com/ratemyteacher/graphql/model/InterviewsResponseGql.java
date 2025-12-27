package com.ratemyteacher.graphql.model;

import java.util.List;

public record InterviewsResponseGql(
        List<InterviewGql> items,
        String nextCursor
) {}
