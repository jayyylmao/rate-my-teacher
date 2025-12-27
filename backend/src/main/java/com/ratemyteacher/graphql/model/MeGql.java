package com.ratemyteacher.graphql.model;

import java.util.List;

public record MeGql(long id, String email, List<String> roles) {}
