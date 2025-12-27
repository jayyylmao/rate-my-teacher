package com.ratemyteacher.service;

import com.ratemyteacher.entity.Review;
import com.ratemyteacher.entity.ReviewVote;
import com.ratemyteacher.exception.ResourceNotFoundException;
import com.ratemyteacher.repository.ReviewRepository;
import com.ratemyteacher.repository.ReviewVoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewVoteService {

    private final ReviewVoteRepository voteRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Toggle vote: if user hasn't voted, add vote. If they have, remove it.
     * Returns the new helpful count.
     */
    @Transactional
    public int toggleVote(Integer reviewId, String userIdentifier) {
        if (userIdentifier == null || userIdentifier.isBlank()) {
            log.warn("Cannot vote: userIdentifier is null or blank");
            throw new IllegalArgumentException("User identifier required for voting");
        }

        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        Optional<ReviewVote> existingVote = voteRepository
            .findByReviewIdAndUserIdentifier(reviewId, userIdentifier);

        if (existingVote.isPresent()) {
            // Remove vote
            voteRepository.delete(existingVote.get());
            review.setHelpfulCount(Math.max(0, review.getHelpfulCount() - 1));
            log.info("Removed vote: review={}, user={}", reviewId, userIdentifier);
        } else {
            // Add vote
            ReviewVote vote = new ReviewVote();
            vote.setReview(review);
            vote.setUserIdentifier(userIdentifier);
            vote.setVoteType("HELPFUL");
            voteRepository.save(vote);

            review.setHelpfulCount(review.getHelpfulCount() + 1);
            log.info("Added vote: review={}, user={}", reviewId, userIdentifier);
        }

        reviewRepository.save(review);
        return review.getHelpfulCount();
    }

    /**
     * Check if a user has voted on a review
     */
    @Transactional(readOnly = true)
    public boolean hasVoted(Integer reviewId, String userIdentifier) {
        if (userIdentifier == null || userIdentifier.isBlank()) {
            return false;
        }
        return voteRepository.existsByReviewIdAndUserIdentifier(reviewId, userIdentifier);
    }

    /**
     * Get all review IDs the user has voted on from a list
     * Useful for batch checking in list views
     */
    @Transactional(readOnly = true)
    public List<Integer> getVotedReviewIds(String userIdentifier, List<Integer> reviewIds) {
        if (userIdentifier == null || userIdentifier.isBlank() || reviewIds.isEmpty()) {
            return List.of();
        }
        return voteRepository.findVotedReviewIds(userIdentifier, reviewIds);
    }
}
