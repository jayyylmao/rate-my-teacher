"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReviewDTO, ReviewStatus } from "@/lib/api/types";
import { getMyReviews } from "@/lib/api/auth";
import { useAuth } from "@/components/auth/auth-provider";
import MyReviewCard from "./my-review-card";

type TabStatus = "all" | ReviewStatus;

export default function MyReviewsList() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabStatus>("all");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    fetchReviews();
  }, [user, authLoading, router]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyReviews();
      setReviews(data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError("Failed to load your reviews. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewDeleted = () => {
    fetchReviews();
  };

  const filteredReviews = activeTab === "all"
    ? reviews
    : reviews.filter((r) => r.status === activeTab);

  const counts = {
    all: reviews.length,
    PENDING: reviews.filter((r) => r.status === "PENDING").length,
    APPROVED: reviews.filter((r) => r.status === "APPROVED").length,
    REJECTED: reviews.filter((r) => r.status === "REJECTED").length,
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchReviews}
          className="text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const tabs: { key: TabStatus; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "PENDING", label: `Pending (${counts.PENDING})` },
    { key: "APPROVED", label: `Approved (${counts.APPROVED})` },
    { key: "REJECTED", label: `Rejected (${counts.REJECTED})` },
  ];

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">
            {activeTab === "all"
              ? "You haven't written any reviews yet."
              : `No ${activeTab.toLowerCase()} reviews.`}
          </p>
          {activeTab === "all" && (
            <a
              href="/interviews"
              className="text-blue-600 hover:underline text-sm"
            >
              Browse interviews to write a review
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <MyReviewCard
              key={review.id}
              review={review}
              onDeleted={handleReviewDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
