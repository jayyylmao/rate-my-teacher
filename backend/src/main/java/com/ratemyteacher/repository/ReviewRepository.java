package com.ratemyteacher.repository;

import com.ratemyteacher.entity.Review;
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
     */
    @Query("""
        SELECT r.rating, COUNT(r)
        FROM Review r
        WHERE r.interviewExperience.id = :interviewId
        GROUP BY r.rating
    """)
    List<Object[]> ratingBreakdown(@Param("interviewId") Integer interviewId);
}
