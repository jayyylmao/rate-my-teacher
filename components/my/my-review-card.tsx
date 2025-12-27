"use client";

import { useState } from "react";
import Link from "next/link";
import type { ReviewDTO, ReviewStatus } from "@/lib/api/types";
import { deleteReview } from "@/lib/api/auth";
import ReviewStatusBadge from "@/components/reviews/review-status-badge";
import Button from "@/components/ui/button";

interface MyReviewCardProps {
  review: ReviewDTO;
  onDeleted?: () => void;
}

const ROUND_TYPE_LABELS: Record<string, string> = {
  PHONE_SCREEN: "Phone Screen",
  RECRUITER: "Recruiter Call",
  BEHAVIORAL: "Behavioral",
  CODING: "Coding",
  SYSTEM_DESIGN: "System Design",
  CASE_STUDY: "Case Study",
  ONSITE: "Onsite",
  OTHER: "Other",
};

const OUTCOME_LABELS: Record<string, string> = {
  OFFER: "Got Offer",
  REJECTED: "Rejected",
  WITHDREW: "Withdrew",
};

export default function MyReviewCard({ review, onDeleted }: MyReviewCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canEdit = review.status === "PENDING";
  const canDelete = review.status === "PENDING" || review.status === "REJECTED";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteReview(review.id);
      onDeleted?.();
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header with status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <ReviewStatusBadge status={review.status} showLabel />
          <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400" : "text-gray-200"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap gap-2 mb-3 text-sm">
        {review.roundType && (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {ROUND_TYPE_LABELS[review.roundType] || review.roundType}
          </span>
        )}
        {review.outcome && (
          <span className={`px-2 py-1 rounded ${
            review.outcome === "OFFER"
              ? "bg-green-100 text-green-700"
              : review.outcome === "REJECTED"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}>
            {OUTCOME_LABELS[review.outcome]}
          </span>
        )}
        {review.interviewerInitials && (
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
            Interviewer: {review.interviewerInitials}
          </span>
        )}
      </div>

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
            >
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      {/* Comment */}
      <p className="text-gray-700 text-sm mb-4 whitespace-pre-wrap">{review.comment}</p>

      {/* Rejection reason if rejected */}
      {review.status === "REJECTED" && (
        <div className="bg-red-50 border border-red-100 rounded p-3 mb-4">
          <p className="text-sm text-red-700">
            <span className="font-medium">Reason:</span>{" "}
            {(review as { rejectionReason?: string }).rejectionReason || "This review did not meet our quality guidelines."}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <Link href={`/interviews/${review.interviewId}`}>
          <Button variant="outline" size="sm">
            View Interview
          </Button>
        </Link>

        {canEdit && (
          <Link href={`/my/reviews/${review.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
        )}

        {canDelete && !showDeleteConfirm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Delete
          </Button>
        )}

        {showDeleteConfirm && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Delete this review?</span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
