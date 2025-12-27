package com.ratemyteacher.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing user sessions.
 * Handles session creation, validation, and sliding refresh.
 */
@Service
@Slf4j
public class SessionService {

    private static final Duration SESSION_TTL = Duration.ofDays(30);
    private static final Duration REFRESH_WINDOW = Duration.ofDays(7);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public SessionService(SessionRepository sessionRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    /**
     * Authenticate a session by its ID (sid cookie value).
     * Returns the principal if the session is valid and not expired.
     */
    @Transactional(readOnly = true)
    public Optional<AppPrincipal> authenticate(String sid) {
        if (sid == null || sid.isBlank()) {
            return Optional.empty();
        }

        Instant now = Instant.now();
        return sessionRepository.findById(sid).flatMap(session -> {
            if (session.isExpired(now)) {
                log.debug("Session {} is expired", sid);
                return Optional.empty();
            }
            return userRepository.findById(session.getUserId())
                    .map(user -> {
                        Set<String> roles = user.getRoles().stream()
                                .map(RoleEntity::getName)
                                .collect(Collectors.toSet());
                        return new AppPrincipal(user.getId(), user.getEmail(), roles);
                    });
        });
    }

    /**
     * Touch the session (update last_seen_at) and optionally extend expiry
     * if within the refresh window.
     */
    @Transactional
    public void touchAndMaybeRefresh(String sid) {
        if (sid == null || sid.isBlank()) return;

        Instant now = Instant.now();
        SessionEntity session = sessionRepository.findById(sid).orElse(null);
        if (session == null) return;

        if (session.isExpired(now)) {
            sessionRepository.delete(session);
            log.debug("Deleted expired session {}", sid);
            return;
        }

        session.touch(now);

        // Sliding refresh: if within 7 days of expiry, extend to 30 days
        if (session.getExpiresAt().minus(REFRESH_WINDOW).isBefore(now)) {
            session.extendTo(now.plus(SESSION_TTL));
            log.debug("Extended session {} to {}", sid, session.getExpiresAt());
        }

        sessionRepository.save(session);
    }

    /**
     * Create a new session for a user.
     * Returns the session ID (sid) to be set as a cookie.
     */
    @Transactional
    public String createSession(Long userId) {
        String sid = generateSessionId();
        Instant expiresAt = Instant.now().plus(SESSION_TTL);

        SessionEntity session = new SessionEntity(sid, userId, expiresAt);
        sessionRepository.save(session);

        log.info("Created session for user {}", userId);
        return sid;
    }

    /**
     * Delete a session (logout).
     */
    @Transactional
    public void deleteSession(String sid) {
        if (sid == null || sid.isBlank()) return;
        sessionRepository.deleteById(sid);
        log.info("Deleted session {}", sid);
    }

    /**
     * Delete all sessions for a user (force logout everywhere).
     */
    @Transactional
    public void deleteAllUserSessions(Long userId) {
        int count = sessionRepository.deleteByUserId(userId);
        log.info("Deleted {} sessions for user {}", count, userId);
    }

    /**
     * Clean up expired sessions (can be called by a scheduled job).
     */
    @Transactional
    public int cleanupExpiredSessions() {
        int count = sessionRepository.deleteExpiredSessions(Instant.now());
        if (count > 0) {
            log.info("Cleaned up {} expired sessions", count);
        }
        return count;
    }

    /**
     * Generate a cryptographically secure session ID.
     */
    private String generateSessionId() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
