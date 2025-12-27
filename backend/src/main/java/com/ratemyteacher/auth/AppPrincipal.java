package com.ratemyteacher.auth;

import java.security.Principal;
import java.util.Collections;
import java.util.Set;

/**
 * Principal representing an authenticated user.
 * Can be injected into controllers via Authentication object.
 */
public class AppPrincipal implements Principal {

    private final long userId;
    private final String email;
    private final Set<String> roles;

    public AppPrincipal(long userId, String email, Set<String> roles) {
        this.userId = userId;
        this.email = email;
        this.roles = roles != null ? roles : Collections.emptySet();
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

    public Set<String> getRoles() {
        return roles;
    }

    public boolean hasRole(String role) {
        return roles.contains(role);
    }

    public boolean isAdmin() {
        return hasRole("ROLE_ADMIN");
    }

    public boolean isModerator() {
        return hasRole("ROLE_MODERATOR");
    }
}
