package com.ratemyteacher.graphql.model;

import java.util.List;

public record MyReviewsResponseGql(List<ReviewGql> items, int count) {}
