package com.ratemyteacher.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthChallengeRepository extends JpaRepository<AuthChallenge, UUID> {

    /**
     * Find active (not expired, not consumed) challenges for an email
     */
    @Query("SELECT c FROM AuthChallenge c WHERE c.email = :email AND c.expiresAt > :now AND c.consumedAt IS NULL ORDER BY c.createdAt DESC")
    List<AuthChallenge> findActiveChallengesByEmail(String email, Instant now);

    /**
     * Find the most recent active challenge for an email
     */
    default Optional<AuthChallenge> findLatestActiveChallenge(String email, Instant now) {
        List<AuthChallenge> challenges = findActiveChallengesByEmail(email, now);
        return challenges.isEmpty() ? Optional.empty() : Optional.of(challenges.get(0));
    }

    @Modifying
    @Query("DELETE FROM AuthChallenge c WHERE c.expiresAt < :now")
    int deleteExpiredChallenges(Instant now);
}
