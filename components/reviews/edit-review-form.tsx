"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateReview, getMyReviews } from "@/lib/api/auth";
import { interviewApi } from "@/lib/api/interviews";
import type { ReviewDTO, TagKey, TagDTO, ReviewOutcome } from "@/lib/api/types";
import { normalizeInitials, validateInitials } from "@/lib/utils/format";
import Button from "@/components/ui/button";

interface EditReviewFormProps {
  reviewId: number;
}

const MIN_COMMENT_LENGTH = 80;

const ROUND_TYPE_OPTIONS = [
  { value: "PHONE_SCREEN", label: "Phone Screen" },
  { value: "RECRUITER", label: "Recruiter Call" },
  { value: "BEHAVIORAL", label: "Behavioral" },
  { value: "CODING", label: "Coding" },
  { value: "SYSTEM_DESIGN", label: "System Design" },
  { value: "CASE_STUDY", label: "Case Study" },
  { value: "ONSITE", label: "Onsite" },
  { value: "OTHER", label: "Other" },
];

const OUTCOME_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "OFFER", label: "Got Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDREW", label: "Withdrew" },
];

export default function EditReviewForm({ reviewId }: EditReviewFormProps) {
  const router = useRouter();
  const [review, setReview] = useState<ReviewDTO | null>(null);
  const [availableTags, setAvailableTags] = useState<TagDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagKey[]>([]);
  const [roundType, setRoundType] = useState("");
  const [interviewerInitials, setInterviewerInitials] = useState("");
  const [initialsError, setInitialsError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<ReviewOutcome | "">("");

  // Load review and tags
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Fetch user's reviews and find the one to edit
        const myReviews = await getMyReviews();
        const reviewToEdit = myReviews.find((r) => r.id === reviewId);

        if (!reviewToEdit) {
          setError("Review not found or you don't have permission to edit it.");
          return;
        }

        if (reviewToEdit.status !== "PENDING") {
          setError("Only pending reviews can be edited.");
          return;
        }

        setReview(reviewToEdit);
        setRating(reviewToEdit.rating);
        setComment(reviewToEdit.comment);
        setReviewerName(reviewToEdit.reviewerName || "");
        setSelectedTags(reviewToEdit.tags || []);
        setRoundType(reviewToEdit.roundType || "");
        setInterviewerInitials(reviewToEdit.interviewerInitials || "");
        setOutcome(reviewToEdit.outcome || "");

        // Load available tags
        const tagsResponse = await interviewApi.getTags();
        setAvailableTags(tagsResponse.items);
      } catch (err) {
        console.error("Failed to load review:", err);
        setError("Failed to load review. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [reviewId]);

  const toggleTag = (tagKey: TagKey) => {
    if (selectedTags.length >= 5 && !selectedTags.includes(tagKey)) {
      return; // Max 5 tags
    }
    setSelectedTags((prev) =>
      prev.includes(tagKey)
        ? prev.filter((t) => t !== tagKey)
        : [...prev, tagKey]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInitialsError(null);

    // Validation
    if (!roundType) {
      setError("Please select an interview round type");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }

    if (comment.trim().length < MIN_COMMENT_LENGTH) {
      setError(`Comment must be at least ${MIN_COMMENT_LENGTH} characters`);
      return;
    }

    if (!reviewerName.trim()) {
      setError("Please enter a reviewer name");
      return;
    }

    const initialsValidation = validateInitials(interviewerInitials);
    if (initialsValidation) {
      setInitialsError(initialsValidation);
      return;
    }

    try {
      setIsSubmitting(true);

      await updateReview(reviewId, {
        rating,
        comment: comment.trim(),
        reviewerName: reviewerName.trim(),
        tags: selectedTags,
        roundType,
        interviewerInitials: normalizeInitials(interviewerInitials) || undefined,
        outcome: outcome || undefined,
      });

      router.push("/my/reviews");
    } catch (err) {
      console.error("Failed to update review:", err);
      setError(err instanceof Error ? err.message : "Failed to update review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group tags by category
  const tagsByCategory = availableTags.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, TagDTO[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !review) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => router.push("/my/reviews")} variant="outline">
          Back to My Reviews
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Round Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interview Round Type <span className="text-red-500">*</span>
        </label>
        <select
          value={roundType}
          onChange={(e) => setRoundType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select round type...</option>
          {ROUND_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Overall Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <svg
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (select up to 5)
        </label>
        {Object.entries(tagsByCategory).map(([category, tags]) => (
          <div key={category} className="mb-3">
            <p className="text-xs text-gray-500 mb-1">{category}</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.key}
                  type="button"
                  onClick={() => toggleTag(tag.key)}
                  disabled={selectedTags.length >= 5 && !selectedTags.includes(tag.key)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag.key)
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder="Share your interview experience..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/{MIN_COMMENT_LENGTH} characters minimum
        </p>
      </div>

      {/* Reviewer Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          placeholder="How should we display your name?"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Interviewer Initials */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interviewer Initials (optional)
        </label>
        <input
          type="text"
          value={interviewerInitials}
          onChange={(e) => {
            setInterviewerInitials(e.target.value);
            setInitialsError(null);
          }}
          placeholder="e.g., JD"
          maxLength={4}
          className={`w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            initialsError ? "border-red-300" : "border-gray-300"
          }`}
        />
        {initialsError && (
          <p className="text-xs text-red-500 mt-1">{initialsError}</p>
        )}
      </div>

      {/* Outcome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interview Outcome (optional)
        </label>
        <select
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as ReviewOutcome | "")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {OUTCOME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/my/reviews")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
