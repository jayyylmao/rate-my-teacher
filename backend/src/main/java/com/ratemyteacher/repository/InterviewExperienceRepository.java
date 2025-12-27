package com.ratemyteacher.repository;

import com.ratemyteacher.entity.InterviewExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewExperienceRepository extends JpaRepository<InterviewExperience, Integer> {

    @Query("""
        SELECT DISTINCT i
        FROM InterviewExperience i
        LEFT JOIN FETCH i.reviews
        WHERE i.id = :id
    """)
    InterviewExperience findByIdWithReviews(@Param("id") Integer id);

    List<InterviewExperience> findByCompanyContainingIgnoreCase(String company);

    List<InterviewExperience> findByRoleContainingIgnoreCase(String role);

    /**
     * Find exact match by company and role (case-insensitive)
     * Used for smart form to prevent duplicate interview entries
     */
    @Query("""
        SELECT i FROM InterviewExperience i
        WHERE LOWER(TRIM(i.company)) = LOWER(TRIM(:company))
          AND LOWER(TRIM(i.role)) = LOWER(TRIM(:role))
    """)
    List<InterviewExperience> findByCompanyAndRoleExact(
        @Param("company") String company,
        @Param("role") String role
    );

    @Query("""
        SELECT i FROM InterviewExperience i
        WHERE LOWER(i.company) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(i.role) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(i.level) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(i.location) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(i.stage) LIKE LOWER(CONCAT('%', :query, '%'))
    """)
    List<InterviewExperience> searchByQuery(@Param("query") String query);

    /**
     * Get all interviews with their review stats (count, avg rating, last review date)
     * Only counts APPROVED reviews for public display
     * Returns: [InterviewExperience, reviewCount, avgRating, lastReviewedAt]
     */
    @Query("""
        SELECT i, COUNT(r.id), AVG(r.rating), MAX(r.createdAt)
        FROM InterviewExperience i
        LEFT JOIN i.reviews r ON r.status = 'APPROVED'
        GROUP BY i.id
    """)
    List<Object[]> findAllWithStats();

    /**
     * Search interviews with their review stats
     * Only counts APPROVED reviews for public display
     * Returns: [InterviewExperience, reviewCount, avgRating, lastReviewedAt]
     */
    @Query("""
        SELECT i, COUNT(r.id), AVG(r.rating), MAX(r.createdAt)
        FROM InterviewExperience i
        LEFT JOIN i.reviews r ON r.status = 'APPROVED'
        WHERE LOWER(i.company) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(i.role) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(i.level) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(i.location) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(i.stage) LIKE LOWER(CONCAT('%', :query, '%'))
        GROUP BY i.id
    """)
    List<Object[]> searchByQueryWithStats(@Param("query") String query);

    /**
     * Find interviews by company with stats
     * Only counts APPROVED reviews for public display
     * Returns: [InterviewExperience, reviewCount, avgRating, lastReviewedAt]
     */
    @Query("""
        SELECT i, COUNT(r.id), AVG(r.rating), MAX(r.createdAt)
        FROM InterviewExperience i
        LEFT JOIN i.reviews r ON r.status = 'APPROVED'
        WHERE LOWER(i.company) LIKE LOWER(CONCAT('%', :query, '%'))
        GROUP BY i.id
    """)
    List<Object[]> findByCompanyWithStats(@Param("query") String query);

    /**
     * Find interviews by role with stats
     * Only counts APPROVED reviews for public display
     * Returns: [InterviewExperience, reviewCount, avgRating, lastReviewedAt]
     */
    @Query("""
        SELECT i, COUNT(r.id), AVG(r.rating), MAX(r.createdAt)
        FROM InterviewExperience i
        LEFT JOIN i.reviews r ON r.status = 'APPROVED'
        WHERE LOWER(i.role) LIKE LOWER(CONCAT('%', :query, '%'))
        GROUP BY i.id
    """)
    List<Object[]> findByRoleWithStats(@Param("query") String query);
}
