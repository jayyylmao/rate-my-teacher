package com.ratemyteacher.repository;

import com.ratemyteacher.entity.UserContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for managing user contributions (approved reviews that unlock insights).
 */
@Repository
public interface UserContributionRepository extends JpaRepository<UserContribution, Integer> {

    /**
     * Find a contribution by user and interview experience
     */
    Optional<UserContribution> findByUserIdentifierAndInterviewExperienceId(
            String userIdentifier, Integer interviewExperienceId);

    /**
     * Check if a user has unlocked insights for an interview experience
     */
    boolean existsByUserIdentifierAndInterviewExperienceId(
            String userIdentifier, Integer interviewExperienceId);

    /**
     * Find all contributions by a user (all companies they've unlocked)
     */
    List<UserContribution> findByUserIdentifier(String userIdentifier);

    /**
     * Find all contributions for an interview experience
     */
    List<UserContribution> findByInterviewExperienceId(Integer interviewExperienceId);

    /**
     * Count total contributors for an interview experience
     */
    long countByInterviewExperienceId(Integer interviewExperienceId);
}
