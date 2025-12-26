package com.ratemyteacher.auth;

import java.security.Principal;

/**
 * Principal representing an authenticated user.
 * Can be injected into controllers via Authentication object.
 */
public class AppPrincipal implements Principal {

    private final long userId;
    private final String email;

    public AppPrincipal(long userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    @Override
    public String getName() {
        return email;
    }

    public long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }
}
