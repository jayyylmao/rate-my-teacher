package com.ratemyteacher.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String key; // e.g. GHOST_JOB

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String category; // PROCESS / QUALITY / BEHAVIOR
}
