package com.ratemyteacher.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "review_votes",
    uniqueConstraints = @UniqueConstraint(
        name = "unique_vote_per_user",
        columnNames = {"review_id", "user_identifier"}
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Column(name = "user_identifier", nullable = false, length = 255)
    private String userIdentifier;

    @Column(name = "vote_type", nullable = false, length = 20)
    private String voteType = "HELPFUL";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
