package com.ratemyteacher.auth;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, columnDefinition = "citext")
    private String email;

    @Column(name = "email_verified_at")
    private Instant emailVerifiedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<RoleEntity> roles = new HashSet<>();

    protected UserEntity() {}

    public UserEntity(String email) {
        this.email = email.toLowerCase();
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public Instant getEmailVerifiedAt() { return emailVerifiedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Set<RoleEntity> getRoles() { return roles; }

    public void setEmailVerifiedAt(Instant t) { this.emailVerifiedAt = t; }

    public void addRole(RoleEntity role) {
        this.roles.add(role);
    }

    public void removeRole(RoleEntity role) {
        this.roles.remove(role);
    }

    public boolean hasRole(String roleName) {
        return roles.stream().anyMatch(r -> r.getName().equals(roleName));
    }
}
