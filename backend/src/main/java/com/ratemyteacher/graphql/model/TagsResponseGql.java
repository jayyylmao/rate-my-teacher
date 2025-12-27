package com.ratemyteacher.graphql.model;

import java.util.List;

public record TagsResponseGql(
        List<TagGql> items
) {}
