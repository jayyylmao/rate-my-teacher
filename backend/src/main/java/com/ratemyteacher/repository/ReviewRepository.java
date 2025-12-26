package com.ratemyteacher.repository;

import com.ratemyteacher.entity.Review;
import com.ratemyteacher.entity.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    /**
     * Find all reviews for a specific interview experience
     */
    @Query("SELECT r FROM Review r WHERE r.interviewExperience.id = :interviewId ORDER BY r.createdAt DESC")
    List<Review> findByInterviewId(@Param("interviewId") Integer interviewId);

    /**
     * Find reviews by rating
     */
    List<Review> findByRating(Integer rating);

    /**
     * Find reviews by reviewer name
     */
    List<Review> findByReviewerNameContainingIgnoreCase(String reviewerName);

    /**
     * Get stats for an interview experience (count, avg rating, last review date)
     */
    @Query("""
        SELECT COUNT(r), AVG(r.rating), MAX(r.createdAt)
        FROM Review r
        WHERE r.interviewExperience.id = :interviewId
    """)
    List<Object[]> statsForInterview(@Param("interviewId") Integer interviewId);

    /**
     * Get rating breakdown (rating, count) for an interview experience
     * Only counts APPROVED reviews
     */
    @Query("""
        SELECT r.rating, COUNT(r)
        FROM Review r
        WHERE r.interviewExperience.id = :interviewId
          AND r.status = 'APPROVED'
        GROUP BY r.rating
    """)
    List<Object[]> ratingBreakdown(@Param("interviewId") Integer interviewId);

    // ==================== Status-based queries ====================

    /**
     * Find only approved reviews for an interview experience
     */
    @Query("""
        SELECT r FROM Review r
        WHERE r.interviewExperience.id = :interviewId
          AND r.status = :status
        ORDER BY r.createdAt DESC
    """)
    List<Review> findByInterviewIdAndStatus(
            @Param("interviewId") Integer interviewId,
            @Param("status") ReviewStatus status);

    /**
     * Find reviews by status (for moderation queue)
     */
    List<Review> findByStatusOrderByCreatedAtAsc(ReviewStatus status);

    /**
     * Count reviews by status
     */
    long countByStatus(ReviewStatus status);

    /**
     * Get stats for an interview experience - only APPROVED reviews
     * (count, avg rating, last review date)
     */
    @Query("""
        SELECT COUNT(r), AVG(r.rating), MAX(r.createdAt)
        FROM Review r
        WHERE r.interviewExperience.id = :interviewId
          AND r.status = 'APPROVED'
    """)
    List<Object[]> statsForInterviewApproved(@Param("interviewId") Integer interviewId);

    // ==================== Author-based queries ====================

    /**
     * Find all reviews by a specific user (for "My Reviews")
     */
    @Query("SELECT r FROM Review r WHERE r.authorUserId = :userId ORDER BY r.createdAt DESC")
    List<Review> findByAuthorUserId(@Param("userId") Long userId);

    // ==================== Metrics queries ====================

    /**
     * Count reviews that have full metadata (quality reviews)
     * Quality = has tags + has round_type + comment >= 150 chars
     */
    @Query("""
        SELECT COUNT(r) FROM Review r
        WHERE r.status = 'APPROVED'
          AND r.tags IS NOT EMPTY
          AND r.roundType IS NOT NULL
          AND LENGTH(r.comment) >= 150
    """)
    long countQualityReviews();

    /**
     * Average time between created_at and approved_at in seconds
     * Only for approved reviews that have an approved_at timestamp
     */
    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (approved_at - created_at))) " +
                   "FROM reviews WHERE status = 'APPROVED' AND approved_at IS NOT NULL",
           nativeQuery = true)
    Double averageApprovalTimeSeconds();
}
