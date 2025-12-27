"use client";

import { useState } from "react";
import StarRating from "@/components/ui/star-rating";
import ReviewStatusBadge from "./review-status-badge";
import type { ReviewDTO, TagKey } from "@/lib/api/types";
import { formatRoundType, formatTagKey, formatMonthYear } from "@/lib/utils/format";
import { graphqlRequest } from "@/lib/graphql/client";
import { VOTE_REVIEW_MUTATION } from "@/lib/graphql/mutations";

interface ReviewCardProps {
  review: ReviewDTO;
  tagLabelsByKey?: Record<TagKey, string>;
}

export default function ReviewCard({ review, tagLabelsByKey }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_COMMENT_LINES = 4;

  // Vote state (optimistic updates)
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [hasVoted, setHasVoted] = useState(review.viewerHasVoted);
  const [isVoting, setIsVoting] = useState(false);

  // Check if comment is long (more than ~300 chars as heuristic)
  const isLongComment = review.comment.length > 300;

  // Format tag label using cache or fallback
  const getTagLabel = (tagKey: TagKey): string => {
    return tagLabelsByKey?.[tagKey] || formatTagKey(tagKey);
  };

  // Handle vote toggle
  const handleVote = async () => {
    if (isVoting) return;

    setIsVoting(true);

    // Optimistic update
    const wasVoted = hasVoted;
    setHasVoted(!hasVoted);
    setHelpfulCount((prev) => (wasVoted ? prev - 1 : prev + 1));

    try {
      const result = await graphqlRequest<{
        voteReview: {
          reviewId: number;
          helpfulCount: number;
          viewerHasVoted: boolean;
        };
      }>(VOTE_REVIEW_MUTATION, { reviewId: review.id.toString() });

      // Update with server response
      setHelpfulCount(result.voteReview.helpfulCount);
      setHasVoted(result.voteReview.viewerHasVoted);
    } catch (error) {
      console.error("Failed to vote:", error);
      // Revert optimistic update on error
      setHasVoted(wasVoted);
      setHelpfulCount(review.helpfulCount);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header Line */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <StarRating rating={review.rating} size="md" />
          {review.status === "APPROVED" && (
            <ReviewStatusBadge status={review.status} />
          )}
        </div>
        <span className="text-sm text-gray-500">
          {formatMonthYear(review.createdAt)}
        </span>
      </div>

      {/* Context Line (Round Type) */}
      {review.roundType && (
        <div className="mb-3">
          <span className="text-sm font-medium text-gray-700">
            {formatRoundType(review.roundType)}
          </span>
        </div>
      )}

      {/* Comment Body */}
      <div className="mb-4">
        <p
          className={`text-gray-800 ${
            !isExpanded && isLongComment
              ? "line-clamp-4"
              : ""
          }`}
          style={
            !isExpanded && isLongComment
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: MAX_COMMENT_LINES,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
              : undefined
          }
        >
          {review.comment}
        </p>
        {isLongComment && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Tags Row */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {getTagLabel(tag)}
            </span>
          ))}
        </div>
      )}

      {/* Meta Line (De-emphasized) */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3 mt-3">
        <div>
          <span>{review.reviewerName || "Candidate"}</span>
          {review.interviewerInitials && (
            <span> · Interviewer: {review.interviewerInitials}</span>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={handleVote}
            disabled={isVoting}
            className={`flex items-center gap-1 transition-colors ${
              hasVoted
                ? "text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            } ${isVoting ? "opacity-50 cursor-wait" : ""}`}
            title={hasVoted ? "Remove helpful vote" : "Mark as helpful"}
          >
            <span className={hasVoted ? "font-semibold" : ""}>
              {hasVoted ? "✓ " : ""}Helpful
            </span>
            {helpfulCount > 0 && (
              <span className="text-gray-600">({helpfulCount})</span>
            )}
          </button>
          <button
            className="hover:text-gray-700 transition-colors"
            title="Report this review"
          >
            Report
          </button>
        </div>
      </div>
    </div>
  );
}
