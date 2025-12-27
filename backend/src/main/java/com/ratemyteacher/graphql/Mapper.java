package com.ratemyteacher.graphql;

import com.ratemyteacher.dto.InterviewExperienceDTO;
import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.entity.Review;
import com.ratemyteacher.entity.Tag;
import com.ratemyteacher.graphql.model.InterviewGql;
import com.ratemyteacher.graphql.model.MyReviewGql;
import com.ratemyteacher.graphql.model.ReviewGql;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Mapper between domain objects and GraphQL types.
 */
final class Mapper {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private Mapper() {}

    // ─────────────────────────────────────────────────────────────
    // Interview mappings
    // ─────────────────────────────────────────────────────────────

    static InterviewGql toInterview(InterviewExperienceDTO dto) {
        return new InterviewGql(
                dto.getId(),
                dto.getCompany(),
                dto.getRole(),
                dto.getLevel(),
                dto.getStage(),
                dto.getLocation(),
                dto.getCreatedAt() != null ? ISO.format(dto.getCreatedAt()) : null,
                dto.getAverageRating(),
                dto.getReviewCount() != null ? dto.getReviewCount() : 0,
                dto.getLastReviewedAt() != null ? ISO.format(dto.getLastReviewedAt()) : null
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Review mappings (public - no status)
    // ─────────────────────────────────────────────────────────────

    static ReviewGql toReview(ReviewDTO dto) {
        return new ReviewGql(
                dto.getId(),
                dto.getRating(),
                dto.getComment(),
                dto.getReviewerName(),
                dto.getCreatedAt() != null ? ISO.format(dto.getCreatedAt()) : null,
                dto.getTags() != null ? dto.getTags() : List.of(),
                dto.getRoundType(),
                dto.getInterviewerInitials(),
                dto.getOutcome()
        );
    }

    static ReviewGql toReview(Review review) {
        List<String> tags = review.getTags() == null ? List.of() :
                review.getTags().stream().map(Tag::getKey).toList();

        return new ReviewGql(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getReviewerName(),
                review.getCreatedAt() != null ? ISO.format(review.getCreatedAt()) : null,
                tags,
                review.getRoundType(),
                review.getInterviewerInitials(),
                review.getOutcome() != null ? review.getOutcome().name() : null
        );
    }

    // ─────────────────────────────────────────────────────────────
    // MyReview mappings (includes status for owner's view)
    // ─────────────────────────────────────────────────────────────

    static MyReviewGql toMyReview(Review review) {
        List<String> tags = review.getTags() == null ? List.of() :
                review.getTags().stream().map(Tag::getKey).toList();

        return new MyReviewGql(
                review.getId(),
                review.getInterviewExperience().getId(),
                review.getRating(),
                review.getComment(),
                review.getReviewerName(),
                review.getCreatedAt() != null ? ISO.format(review.getCreatedAt()) : null,
                tags,
                review.getRoundType(),
                review.getInterviewerInitials(),
                review.getOutcome() != null ? review.getOutcome().name() : null,
                review.getStatus() != null ? review.getStatus().name() : "PENDING",
                review.getApprovedAt() != null ? ISO.format(review.getApprovedAt()) : null
        );
    }
}
