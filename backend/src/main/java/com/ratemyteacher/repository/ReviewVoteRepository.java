package com.ratemyteacher.repository;

import com.ratemyteacher.entity.ReviewVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewVoteRepository extends JpaRepository<ReviewVote, Integer> {

    /**
     * Find a specific vote by review and user
     */
    Optional<ReviewVote> findByReviewIdAndUserIdentifier(
        Integer reviewId,
        String userIdentifier
    );

    /**
     * Check if a user has voted on a review
     */
    boolean existsByReviewIdAndUserIdentifier(
        Integer reviewId,
        String userIdentifier
    );

    /**
     * Get all votes by a user (for analytics or cleanup)
     */
    List<ReviewVote> findByUserIdentifier(String userIdentifier);

    /**
     * Count votes for a review (backup query, prefer helpful_count column)
     */
    long countByReviewId(Integer reviewId);

    /**
     * Batch check: Get all review IDs the user has voted on from a list
     * Useful for marking voted reviews in a list view
     */
    @Query("SELECT v.review.id FROM ReviewVote v " +
           "WHERE v.userIdentifier = :userIdentifier " +
           "AND v.review.id IN :reviewIds")
    List<Integer> findVotedReviewIds(
        @Param("userIdentifier") String userIdentifier,
        @Param("reviewIds") List<Integer> reviewIds
    );
}
