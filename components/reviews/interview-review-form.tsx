"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { interviewApi } from "@/lib/api/interviews";
import type { TagKey, TagDTO, RoundType, ReviewOutcome, StructuredRatings } from "@/lib/api/types";
import { normalizeInitials, validateInitials } from "@/lib/utils/format";
import { detectContentWarnings, type ContentWarning } from "@/lib/utils/content-warnings";
import Button from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInModal } from "@/components/auth/sign-in-modal";

interface InterviewReviewFormProps {
  interviewId: number;
  initialTags: TagDTO[];
}

const MIN_COMMENT_LENGTH = 50;

interface StructuredRatingConfig {
  key: keyof StructuredRatings;
  label: string;
  description: string;
}

const STRUCTURED_RATING_CONFIG: StructuredRatingConfig[] = [
  {
    key: "interviewStructure",
    label: "Interview Structure",
    description: "How clear and organized was the interview process?",
  },
  {
    key: "questionRelevance",
    label: "Question Relevance",
    description: "How relevant were the questions to the actual role?",
  },
  {
    key: "professionalism",
    label: "Professionalism",
    description: "How professional was the interaction quality?",
  },
  {
    key: "communicationClarity",
    label: "Communication",
    description: "How clear was the feedback and communication?",
  },
];

export default function InterviewReviewForm({ interviewId, initialTags }: InterviewReviewFormProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagKey[]>([]);
  const [roundType, setRoundType] = useState<RoundType | "">("");
  const [interviewerInitials, setInterviewerInitials] = useState("");
  const [initialsError, setInitialsError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<ReviewOutcome | "">("");
  const [structuredRatings, setStructuredRatings] = useState<StructuredRatings>({
    interviewStructure: 0,
    questionRelevance: 0,
    professionalism: 0,
    communicationClarity: 0,
  });
  const [hoveredStructuredRatings, setHoveredStructuredRatings] = useState<Record<keyof StructuredRatings, number>>({
    interviewStructure: 0,
    questionRelevance: 0,
    professionalism: 0,
    communicationClarity: 0,
  });
  const [availableTags] = useState<TagDTO[]>(initialTags);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Content warning state
  const [contentWarnings, setContentWarnings] = useState<ContentWarning[]>([]);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [warningWasShown, setWarningWasShown] = useState(false);

  const toggleTag = (tagKey: TagKey) => {
    setSelectedTags((prev) =>
      prev.includes(tagKey)
        ? prev.filter((t) => t !== tagKey)
        : [...prev, tagKey]
    );
  };

  const updateStructuredRating = (key: keyof StructuredRatings, value: number) => {
    setStructuredRatings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateHoveredStructuredRating = (key: keyof StructuredRatings, value: number) => {
    setHoveredStructuredRatings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const allStructuredRatingsComplete = Object.values(structuredRatings).every((r) => r > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!roundType) {
      setError("Please select an interview round type");
      return;
    }

    if (!allStructuredRatingsComplete) {
      setError("Please complete all process ratings");
      return;
    }

    if (rating === 0) {
      setError("Please select an overall rating");
      return;
    }

    if (selectedTags.length === 0) {
      setError("Please select at least one tag");
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

    const initialsValidation = validateInitials(interviewerInitials);
    if (initialsValidation) {
      setInitialsError(initialsValidation);
      return;
    }

    // Check for content warnings before submission
    const warnings = detectContentWarnings(comment);
    if (warnings.length > 0 && !warningDismissed) {
      setContentWarnings(warnings);
      setWarningWasShown(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await interviewApi.addReview({
        interviewId,
        rating,
        comment: comment.trim(),
        reviewerName: reviewerName.trim() || "Anonymous",
        tags: selectedTags,
        roundType: roundType || undefined,
        interviewerInitials: interviewerInitials.trim()
          ? normalizeInitials(interviewerInitials)
          : undefined,
        outcome: outcome || undefined,
        structuredRatings,
      });

      // Redirect back to interview page with success indicator
      router.push(`/interviews/${interviewId}?submitted=true`);
      router.refresh(); // Refresh to show new review
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError("Failed to submit review. Please try again.");
      setIsSubmitting(false);
    }
  };

  const dismissWarning = () => {
    setWarningDismissed(true);
    setContentWarnings([]);
  };

  // Group tags by category
  const tagsByCategory = availableTags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, TagDTO[]>);

  const categoryOrder = ["PROCESS", "QUALITY", "BEHAVIOR"];
  const categoryLabels = {
    PROCESS: "Interview Process",
    QUALITY: "Interview Quality",
    BEHAVIOR: "Interviewer Behavior",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Auth Status Banner */}
      {isAuthenticated ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-green-800">
            Signed in as <span className="font-medium">{user?.email}</span>. This review will be linked to your account.
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-blue-800">
                <button
                  type="button"
                  onClick={() => setShowSignInModal(true)}
                  className="font-medium underline hover:text-blue-900"
                >
                  Sign in
                </button>{" "}
                to link this review to your account and edit it later.
              </p>
              <p className="text-sm text-blue-700 mt-1">
                You can still submit as a guest without signing in.
              </p>
            </div>
          </div>
        </div>
      )}

      <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />

      {/* 1. Round Type (REQUIRED - moved to top) */}
      <div>
        <label htmlFor="roundType" className="block text-lg font-semibold text-gray-900 mb-3">
          Interview Round <span className="text-red-500">*</span>
        </label>
        <select
          id="roundType"
          value={roundType}
          onChange={(e) => setRoundType(e.target.value as RoundType | "")}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          required
        >
          <option value="">Select a round type</option>
          <option value="PHONE_SCREEN">Phone Screen</option>
          <option value="RECRUITER">Recruiter</option>
          <option value="BEHAVIORAL">Behavioral</option>
          <option value="CODING">Coding</option>
          <option value="SYSTEM_DESIGN">System Design</option>
          <option value="CASE_STUDY">Case Study</option>
          <option value="ONSITE">Onsite</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* 2. Structured Process Questions (NEW) */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          Process Ratings <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Rate each aspect of the interview process (1 = Poor, 5 = Excellent)
        </p>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          {STRUCTURED_RATING_CONFIG.map((config) => (
            <div key={config.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-48 flex-shrink-0">
                <p className="font-medium text-gray-900">{config.label}</p>
                <p className="text-xs text-gray-500">{config.description}</p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateStructuredRating(config.key, value)}
                    onMouseEnter={() => updateHoveredStructuredRating(config.key, value)}
                    onMouseLeave={() => updateHoveredStructuredRating(config.key, 0)}
                    className="group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <svg
                      className={`w-8 h-8 transition-colors ${
                        value <= (hoveredStructuredRatings[config.key] || structuredRatings[config.key])
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } group-hover:scale-110 transition-transform`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                {structuredRatings[config.key] > 0 && (
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {structuredRatings[config.key]}/5
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Rating */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Overall Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              <svg
                className={`w-12 h-12 transition-colors ${
                  value <= (hoveredRating || rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                } group-hover:scale-110 transition-transform`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-lg font-medium text-gray-700">
              {rating} / 5
            </span>
          )}
        </div>
      </div>

      {/* 3. Tags (required >= 1) */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Tags <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Select all that apply to describe your experience
        </p>

        <div className="space-y-6">
            {categoryOrder.map((category) => {
              const tags = tagsByCategory[category] || [];
              if (tags.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.key}
                        type="button"
                        onClick={() => toggleTag(tag.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedTags.includes(tag.key)
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 4. Comment (required, min 50 chars) */}
      <div>
        <label htmlFor="comment" className="block text-lg font-semibold text-gray-900 mb-3">
          Your Experience <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          rows={6}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            // Clear warnings if user is editing after seeing them
            if (contentWarnings.length > 0) {
              setContentWarnings([]);
              setWarningDismissed(false);
            }
          }}
          placeholder="Describe specific aspects of the interview process (e.g., question scope, interaction style, feedback timing)."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          maxLength={2000}
        />
        <p className={`mt-1 text-sm ${comment.length < MIN_COMMENT_LENGTH ? "text-gray-500" : "text-green-600"}`}>
          {comment.length} / 2000 characters (minimum {MIN_COMMENT_LENGTH})
        </p>
      </div>

      {/* Content Warning Banner */}
      {contentWarnings.length > 0 && !warningDismissed && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-amber-800">
                Reviews describing specific behaviors are more helpful to other candidates.
              </p>
              <ul className="mt-2 text-sm text-amber-700 space-y-1">
                {contentWarnings.map((warning, idx) => (
                  <li key={idx}>- {warning.message}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={dismissWarning}
                  className="text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                >
                  Continue anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Reviewer Name (optional) */}
      <div>
        <label htmlFor="reviewerName" className="block text-lg font-semibold text-gray-900 mb-3">
          Your Name (Optional)
        </label>
        <input
          id="reviewerName"
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          placeholder="Anonymous"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          maxLength={100}
        />
        <p className="mt-1 text-sm text-gray-500">
          Leave blank to post anonymously
        </p>
      </div>

      {/* 6. Interviewer Initials (optional) */}
      <div>
        <label htmlFor="interviewerInitials" className="block text-lg font-semibold text-gray-900 mb-3">
          Interviewer Initials (Optional)
        </label>
        <input
          id="interviewerInitials"
          type="text"
          value={interviewerInitials}
          onChange={(e) => {
            const value = e.target.value;
            setInterviewerInitials(value);
            setInitialsError(validateInitials(value));
          }}
          placeholder="e.g., JD or MKS"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 ${
            initialsError ? "border-red-500" : "border-gray-300"
          }`}
          maxLength={5}
        />
        {initialsError ? (
          <p className="mt-1 text-sm text-red-600">{initialsError}</p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            2-4 letters (e.g., JD for John Doe). Do not enter full names.
          </p>
        )}
      </div>

      {/* 7. Outcome (NEW - optional, LAST) */}
      <div>
        <label htmlFor="outcome" className="block text-lg font-semibold text-gray-900 mb-3">
          Interview Outcome (Optional)
        </label>
        <select
          id="outcome"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as ReviewOutcome | "")}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
        >
          <option value="">Select outcome (optional)</option>
          <option value="OFFER">Received Offer</option>
          <option value="REJECTED">Rejected</option>
          <option value="WITHDREW">Withdrew</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Outcome does not affect how reviews are weighted.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !roundType ||
            !allStructuredRatingsComplete ||
            rating === 0 ||
            !comment.trim() ||
            comment.trim().length < MIN_COMMENT_LENGTH ||
            selectedTags.length === 0 ||
            !!initialsError
          }
          size="lg"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </div>
    </form>
  );
}
