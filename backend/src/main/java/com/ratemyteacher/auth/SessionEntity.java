package com.ratemyteacher.auth;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "sessions")
public class SessionEntity {

    @Id
    @Column(length = 64)
    private String id; // sid cookie value

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "last_seen_at", nullable = false)
    private Instant lastSeenAt;

    protected SessionEntity() {}

    public SessionEntity(String id, Long userId, Instant expiresAt) {
        this.id = id;
        this.userId = userId;
        this.createdAt = Instant.now();
        this.lastSeenAt = this.createdAt;
        this.expiresAt = expiresAt;
    }

    public String getId() { return id; }
    public Long getUserId() { return userId; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getLastSeenAt() { return lastSeenAt; }

    public boolean isExpired(Instant now) {
        return expiresAt.isBefore(now);
    }

    public void touch(Instant now) {
        this.lastSeenAt = now;
    }

    public void extendTo(Instant newExpiresAt) {
        this.expiresAt = newExpiresAt;
    }
}
