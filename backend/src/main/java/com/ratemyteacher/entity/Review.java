package com.ratemyteacher.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_experience_id", nullable = false)
    private InterviewExperience interviewExperience;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "reviewer_name", nullable = false, length = 255)
    private String reviewerName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "round_type")
    private String roundType;

    @Column(name = "interviewer_initials", length = 4)
    private String interviewerInitials;

    @Enumerated(EnumType.STRING)
    @Column(name = "outcome", length = 20)
    private ReviewOutcome outcome;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReviewStatus status = ReviewStatus.PENDING;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "author_type", nullable = false, length = 10)
    private AuthorType authorType = AuthorType.GUEST;

    @Column(name = "author_user_id")
    private Long authorUserId;

    @Column(name = "moderated_by_user_id")
    private Long moderatedByUserId;

    @Column(name = "moderated_at")
    private LocalDateTime moderatedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToMany
    @JoinTable(
        name = "review_tags",
        joinColumns = @JoinColumn(name = "review_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();
}
