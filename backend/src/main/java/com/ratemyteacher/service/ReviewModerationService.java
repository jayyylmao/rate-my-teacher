package com.ratemyteacher.service;

import com.ratemyteacher.entity.Review;
import com.ratemyteacher.entity.ReviewStatus;
import com.ratemyteacher.entity.UserContribution;
import com.ratemyteacher.repository.UserContributionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Service for handling review moderation and approval logic.
 * Determines whether reviews should be auto-approved or flagged for manual review.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewModerationService {

    private final UserContributionRepository contributionRepository;

    // Minimum comment length for auto-approval
    private static final int MIN_COMMENT_LENGTH = 50;

    // Strong negative language patterns that require manual review
    private static final Set<String> STRONG_NEGATIVE_WORDS = Set.of(
            // Negative descriptors
            "terrible", "worst", "horrible", "awful", "disgusting",
            "incompetent", "racist", "sexist", "discriminat", "harass",
            "unprofessional", "hostile", "rude", "abusive",
            // Profanity
            "fuck", "shit", "damn", "ass", "bitch", "crap", "hell",
            "bastard", "idiot", "stupid", "dumb", "moron"
    );

    // Pattern to match any of the negative words (case-insensitive)
    private static final Pattern NEGATIVE_LANGUAGE_PATTERN = Pattern.compile(
            "\\b(" + String.join("|", STRONG_NEGATIVE_WORDS) + ")\\w*\\b",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Determine if a review should be auto-approved.
     * Auto-approval criteria (ALL must be true):
     * 1. Has at least 1 tag
     * 2. Has round_type specified
     * 3. Comment length >= 50 characters
     * 4. No flags from content validation (already passed if we got here)
     *
     * Target: 70-90% of reviews should auto-approve
     *
     * @param review The review to evaluate
     * @return true if the review meets auto-approval criteria
     */
    public boolean shouldAutoApprove(Review review) {
        // Check tag count
        if (review.getTags() == null || review.getTags().isEmpty()) {
            log.debug("Review {} does not meet auto-approve: no tags", review.getId());
            return false;
        }

        // Check round type
        if (review.getRoundType() == null || review.getRoundType().isBlank()) {
            log.debug("Review {} does not meet auto-approve: no round type", review.getId());
            return false;
        }

        // Check comment length
        if (review.getComment() == null || review.getComment().length() < MIN_COMMENT_LENGTH) {
            log.debug("Review {} does not meet auto-approve: comment too short ({})",
                    review.getId(),
                    review.getComment() != null ? review.getComment().length() : 0);
            return false;
        }

        log.debug("Review {} meets auto-approval criteria", review.getId());
        return true;
    }

    /**
     * Check if a review needs manual moderation.
     * Flag for manual review if:
     * 1. Has interviewer_initials AND rating <= 2 (negative review about specific person)
     * 2. Comment contains strong negative language patterns
     *
     * @param review The review to evaluate
     * @return true if the review needs human moderation
     */
    public boolean needsManualReview(Review review) {
        // Flag: Negative rating with specific interviewer identified
        if (hasInterviewerWithLowRating(review)) {
            log.info("Review {} flagged for manual review: low rating with interviewer initials",
                    review.getId());
            return true;
        }

        // Flag: Strong negative language
        if (containsStrongNegativeLanguage(review.getComment())) {
            log.info("Review {} flagged for manual review: contains strong negative language",
                    review.getId());
            return true;
        }

        return false;
    }

    /**
     * Approve a review (called by auto-approve or moderator).
     * Sets status to APPROVED and records the approval timestamp.
     *
     * @param review The review to approve
     */
    public void approveReview(Review review) {
        review.setStatus(ReviewStatus.APPROVED);
        review.setApprovedAt(LocalDateTime.now());
        log.info("Review {} approved", review.getId());
    }

    /**
     * Approve a review and record user contribution for insights unlocking.
     * Sets status to APPROVED, records the approval timestamp, and creates contribution record.
     *
     * @param review The review to approve
     * @param userIdentifier The user's identifier for contribution tracking (nullable)
     */
    public void approveReview(Review review, String userIdentifier) {
        review.setStatus(ReviewStatus.APPROVED);
        review.setApprovedAt(LocalDateTime.now());
        log.info("Review {} approved", review.getId());

        // Record contribution to unlock insights
        if (userIdentifier != null && !userIdentifier.isBlank()) {
            recordContribution(userIdentifier, review);
        }
    }

    /**
     * Record a user contribution when their review is approved.
     * This unlocks insights for the user for that company.
     */
    private void recordContribution(String userIdentifier, Review review) {
        Integer interviewId = review.getInterviewExperience().getId();

        // Check if already contributed (should not happen, but be safe)
        if (contributionRepository.existsByUserIdentifierAndInterviewExperienceId(
                userIdentifier, interviewId)) {
            log.info("User {} already has contribution for interview {}", userIdentifier, interviewId);
            return;
        }

        UserContribution contribution = new UserContribution();
        contribution.setUserIdentifier(userIdentifier);
        contribution.setInterviewExperience(review.getInterviewExperience());
        contribution.setReview(review);
        contribution.setUnlockedAt(LocalDateTime.now());

        contributionRepository.save(contribution);
        log.info("Recorded contribution for user {} on interview {} via review {}",
                userIdentifier, interviewId, review.getId());
    }

    /**
     * Reject a review (moderator action only).
     * Sets status to REJECTED.
     *
     * @param review The review to reject
     * @param reason The reason for rejection (logged for audit purposes)
     */
    public void rejectReview(Review review, String reason) {
        review.setStatus(ReviewStatus.REJECTED);
        log.info("Review {} rejected. Reason: {}", review.getId(), reason);
        // Note: If rejection_reason field is added to Review entity in the future,
        // it should be set here: review.setRejectionReason(reason);
    }

    /**
     * Check if review has interviewer initials with a low rating.
     * This combination (specific person + negative feedback) requires manual review.
     */
    private boolean hasInterviewerWithLowRating(Review review) {
        return review.getInterviewerInitials() != null
                && !review.getInterviewerInitials().isBlank()
                && review.getRating() != null
                && review.getRating() <= 2;
    }

    /**
     * Check if comment contains strong negative language.
     */
    private boolean containsStrongNegativeLanguage(String comment) {
        if (comment == null || comment.isBlank()) {
            return false;
        }
        return NEGATIVE_LANGUAGE_PATTERN.matcher(comment).find();
    }
}
