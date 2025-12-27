"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { apiClient } from "@/lib/api/client";
import { ReviewDTO } from "@/lib/api/types";

interface ModerationStats {
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [pendingReviews, setPendingReviews] = useState<ReviewDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const isAdmin = user?.roles?.some((role) =>
    ["ROLE_ADMIN", "ROLE_MODERATOR"].includes(role)
  );

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) return;

    async function fetchData() {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          apiClient.get<ModerationStats>("/api/admin/moderation/stats"),
          apiClient.get<ReviewDTO[]>("/api/admin/moderation/pending"),
        ]);
        setStats(statsRes);
        setPendingReviews(pendingRes);
      } catch (err) {
        setError("Failed to load moderation data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [authLoading, isAdmin]);

  async function handleApprove(reviewId: number) {
    setActionLoading(reviewId);
    try {
      await apiClient.post(`/api/admin/moderation/reviews/${reviewId}/approve`);
      setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setStats((prev) =>
        prev
          ? { ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }
          : prev
      );
    } catch (err) {
      console.error("Failed to approve:", err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(reviewId: number) {
    setActionLoading(reviewId);
    try {
      await apiClient.post(`/api/admin/moderation/reviews/${reviewId}/reject`);
      setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setStats((prev) =>
        prev
          ? { ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }
          : prev
      );
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setActionLoading(null);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-4">
            Please sign in to access the admin dashboard.
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access this page.
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Moderate reviews and manage content</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-700">
                {stats.pending}
              </div>
              <div className="text-sm text-yellow-600">Pending Reviews</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">
                {stats.approved}
              </div>
              <div className="text-sm text-green-600">Approved</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-700">
                {stats.rejected}
              </div>
              <div className="text-sm text-red-600">Rejected</div>
            </div>
          </div>
        )}

        {/* Pending Reviews */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Reviews
            </h2>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No pending reviews to moderate.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingReviews.map((review) => (
                <div key={review.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {review.reviewerName}
                        </span>
                        <span className="text-yellow-600">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                        {review.roundType && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {review.roundType.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {review.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                            >
                              {tag.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Interview #{review.interviewId} &bull;{" "}
                        {new Date(review.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
                      >
                        {actionLoading === review.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        disabled={actionLoading === review.id}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
                      >
                        {actionLoading === review.id ? "..." : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
