"use client";

import { useState, useMemo } from "react";
import ReviewCard from "./review-card";
import ReviewSort, { SortOption } from "./review-sort";

interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const sortedReviews = useMemo(() => {
    const reviewsCopy = [...reviews];

    switch (sortOption) {
      case "recent":
        return reviewsCopy.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "highest":
        return reviewsCopy.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return reviewsCopy.sort((a, b) => a.rating - b.rating);
      default:
        return reviewsCopy;
    }
  }, [reviews, sortOption]);

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No reviews yet
        </h3>
        <p className="text-gray-600">Be the first to review this teacher!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count and sort */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Student Reviews ({reviews.length})
        </h2>
        <ReviewSort onSortChange={setSortOption} />
      </div>

      {/* Reviews grid */}
      <div className="grid gap-4">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            rating={review.rating}
            comment={review.comment}
            reviewerName={review.reviewer_name}
            createdAt={new Date(review.created_at)}
          />
        ))}
      </div>
    </div>
  );
}
