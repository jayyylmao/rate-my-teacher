package com.ratemyteacher.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<SessionEntity, String> {

    List<SessionEntity> findByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM SessionEntity s WHERE s.expiresAt < :now")
    int deleteExpiredSessions(Instant now);

    @Modifying
    @Query("DELETE FROM SessionEntity s WHERE s.userId = :userId")
    int deleteByUserId(Long userId);
}
