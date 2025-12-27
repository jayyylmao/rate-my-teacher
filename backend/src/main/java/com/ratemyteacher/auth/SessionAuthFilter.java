package com.ratemyteacher.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Filter that extracts the session ID from the 'sid' cookie and sets up
 * the SecurityContext with the authenticated principal if valid.
 */
public class SessionAuthFilter extends OncePerRequestFilter {

    private static final String COOKIE_NAME = "sid";

    private final SessionService sessionService;

    public SessionAuthFilter(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String sid = readCookie(request, COOKIE_NAME);

        sessionService.authenticate(sid).ifPresent(principal -> {
            // Convert roles to Spring Security authorities
            List<GrantedAuthority> authorities = principal.getRoles().stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            Authentication auth = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    authorities
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

            // Touch session and optionally refresh expiry
            sessionService.touchAndMaybeRefresh(sid);
        });

        try {
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private static String readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
