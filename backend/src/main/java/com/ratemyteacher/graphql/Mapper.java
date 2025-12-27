package com.ratemyteacher.graphql;

import com.ratemyteacher.dto.ReviewDTO;
import com.ratemyteacher.entity.Review;
import com.ratemyteacher.entity.Tag;
import com.ratemyteacher.graphql.model.ReviewGql;

import java.time.format.DateTimeFormatter;
import java.util.List;

final class Mapper {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private Mapper() {}

    static ReviewGql toReview(ReviewDTO dto) {
        return new ReviewGql(
                dto.getId(),
                dto.getInterviewId(),
                dto.getRating(),
                dto.getComment(),
                dto.getReviewerName(),
                dto.getCreatedAt() != null ? ISO.format(dto.getCreatedAt()) : null,
                dto.getTags() != null ? dto.getTags() : List.of(),
                dto.getRoundType(),
                dto.getInterviewerInitials(),
                dto.getOutcome(),
                dto.getStatus(),
                dto.getApprovedAt() != null ? ISO.format(dto.getApprovedAt()) : null
        );
    }

    static ReviewGql toReview(Review review) {
        List<String> tags = review.getTags() == null ? List.of() :
                review.getTags().stream().map(Tag::getKey).toList();

        return new ReviewGql(
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
