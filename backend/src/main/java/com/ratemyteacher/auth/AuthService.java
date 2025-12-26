package com.ratemyteacher.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

/**
 * Service for handling authentication challenges (OTP).
 * For MVP, OTP is logged to console instead of sent via email.
 */
@Service
@Slf4j
public class AuthService {

    private static final Duration OTP_EXPIRY = Duration.ofMinutes(10);
    private static final int MAX_ATTEMPTS = 3;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final AuthChallengeRepository challengeRepository;
    private final UserRepository userRepository;
    private final SessionService sessionService;

    public AuthService(
            AuthChallengeRepository challengeRepository,
            UserRepository userRepository,
            SessionService sessionService) {
        this.challengeRepository = challengeRepository;
        this.userRepository = userRepository;
        this.sessionService = sessionService;
    }

    /**
     * Start authentication flow by creating an OTP challenge.
     * For MVP, logs the OTP instead of sending email.
     *
     * @param email User's email address
     * @return Always returns true to prevent email enumeration
     */
    @Transactional
    public boolean startAuth(String email) {
        String normalizedEmail = email.toLowerCase().trim();

        // Generate 6-digit OTP
        String otp = generateOtp();
        String otpHash = hashCode(otp);

        // Create challenge
        AuthChallenge challenge = new AuthChallenge(
                normalizedEmail,
                otpHash,
                Instant.now().plus(OTP_EXPIRY)
        );
        challengeRepository.save(challenge);

        // MVP: Log OTP instead of sending email
        // TODO: Integrate email service (SendGrid, SES, etc.)
        log.info("========================================");
        log.info("OTP for {}: {}", normalizedEmail, otp);
        log.info("========================================");

        return true;
    }

    /**
     * Verify OTP and create session if valid.
     *
     * @param email User's email
     * @param code OTP code entered by user
     * @return Session ID if verification succeeds, empty otherwise
     */
    @Transactional
    public Optional<String> verifyOtp(String email, String code) {
        String normalizedEmail = email.toLowerCase().trim();
        Instant now = Instant.now();

        // Find active challenge
        Optional<AuthChallenge> challengeOpt = challengeRepository
                .findLatestActiveChallenge(normalizedEmail, now);

        if (challengeOpt.isEmpty()) {
            log.warn("No active challenge found for {}", normalizedEmail);
            return Optional.empty();
        }

        AuthChallenge challenge = challengeOpt.get();

        // Check if too many attempts
        if (challenge.hasExceededAttempts(MAX_ATTEMPTS)) {
            log.warn("Too many attempts for challenge {}", challenge.getId());
            return Optional.empty();
        }

        // Increment attempt count
        challenge.incrementAttempts();

        // Verify code
        String codeHash = hashCode(code);
        if (!codeHash.equals(challenge.getCodeHash())) {
            log.warn("Invalid OTP for {} (attempt {})", normalizedEmail, challenge.getAttemptCount());
            challengeRepository.save(challenge);
            return Optional.empty();
        }

        // Mark challenge as consumed
        challenge.markConsumed();
        challengeRepository.save(challenge);

        // Upsert user
        UserEntity user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    log.info("Creating new user for {}", normalizedEmail);
                    return userRepository.save(new UserEntity(normalizedEmail));
                });

        // Mark email as verified
        if (user.getEmailVerifiedAt() == null) {
            user.setEmailVerifiedAt(now);
            userRepository.save(user);
        }

        // Create session
        String sid = sessionService.createSession(user.getId());
        log.info("User {} authenticated successfully", normalizedEmail);

        return Optional.of(sid);
    }

    /**
     * Clean up expired challenges (can be called by a scheduled job).
     */
    @Transactional
    public int cleanupExpiredChallenges() {
        int count = challengeRepository.deleteExpiredChallenges(Instant.now());
        if (count > 0) {
            log.info("Cleaned up {} expired challenges", count);
        }
        return count;
    }

    /**
     * Generate a 6-digit OTP.
     */
    private String generateOtp() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Hash a code using SHA-256.
     */
    private String hashCode(String code) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(code.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
