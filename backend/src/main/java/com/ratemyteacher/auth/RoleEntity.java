package com.ratemyteacher.auth;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class RoleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String name;

    protected RoleEntity() {}

    public RoleEntity(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
}
