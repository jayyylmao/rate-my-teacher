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
}
