import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import StarRating from "@/components/ui/star-rating";
import Button from "@/components/ui/button";
import Breadcrumb from "@/components/ui/breadcrumb";
import ShareButton from "@/components/ui/share-button";
import RatingDistribution from "@/components/ui/rating-distribution";
import ReviewList from "@/components/reviews/review-list";
import SubmissionSuccessBanner from "@/components/reviews/submission-success-banner";
import { interviewApi } from "@/lib/api/interviews";
import type { InterviewDetailDTO } from "@/lib/api/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const detail = await interviewApi.getInterviewById(id);
    const interview = detail.interview;
    const reviewCount = interview.reviewCount;
    const averageRating = interview.averageRating
      ? interview.averageRating.toFixed(1)
      : "No rating";

    return {
      title: `${interview.company} · ${interview.role} · ${interview.stage || "Interview"} | Rate My Interview`,
      description: `Read ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"} for ${interview.company} ${interview.role} interview. ${reviewCount > 0 ? `Average rating: ${averageRating}/5.0` : "Be the first to review!"}`,
      openGraph: {
        title: `${interview.company} – ${interview.role}`,
        description: `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"} - Rating: ${averageRating}/5.0`,
      },
    };
  } catch (error) {
    console.error("Failed to fetch interview metadata:", error);
    return {
      title: "Interview Not Found | Rate My Interview",
    };
  }
}

export default async function InterviewProfilePage({ params }: PageProps) {
  const { id } = await params;

  let detail: InterviewDetailDTO;

  try {
    // Fetch interview with all reviews from API
    detail = await interviewApi.getInterviewById(id, {
      reviewsSort: "recent",
    });
  } catch (error) {
    console.error("Failed to fetch interview:", error);
    notFound();
  }

  const interview = detail.interview;
  const reviewsFromApi = detail.reviews || [];
  const reviewCount = interview.reviewCount;

  // Use the average rating from API
  const averageRating = interview.averageRating ?? 0;

  // Reviews already in correct format from API (ReviewDTO)
  const reviews = reviewsFromApi;

  // Rating distribution - use backend-provided or compute from reviews
  const ratingCounts = detail.ratingBreakdown
    ? {
        5: detail.ratingBreakdown["5"] || 0,
        4: detail.ratingBreakdown["4"] || 0,
        3: detail.ratingBreakdown["3"] || 0,
        2: detail.ratingBreakdown["2"] || 0,
        1: detail.ratingBreakdown["1"] || 0,
      }
    : {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
      };

  // Generate initials for company avatar
  const getInitials = (companyName: string) => {
    const parts = companyName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const initials = getInitials(interview.company);
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/interviews/${id}`;

  // Build metadata line (level · stage · location)
  const metadata = [interview.level, interview.stage, interview.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Submission Success Banner */}
      <Suspense fallback={null}>
        <SubmissionSuccessBanner />
      </Suspense>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            variant="light"
            items={[
              { label: "Home", href: "/" },
              { label: "Interviews", href: "/interviews" },
              { label: interview.company },
            ]}
          />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-6">
            {/* Large Avatar */}
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-3xl font-bold">{initials}</span>
            </div>

            {/* Interview Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{interview.company}</h1>
              <p className="text-xl text-blue-100 mb-4">{interview.role}</p>
              {metadata && (
                <div className="flex items-center gap-2 text-blue-100">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{metadata}</span>
                </div>
              )}
            </div>

            {/* Share Button */}
            <div className="self-start">
              <ShareButton url={currentUrl} title={`${interview.company} – ${interview.role} | Rate My Interview`} />
            </div>
          </div>

          {/* Overall Rating */}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex items-center gap-4">
              <div className="text-center">
                <div className="text-5xl font-bold mb-1">
                  {reviewCount > 0 ? averageRating.toFixed(1) : "N/A"}
                </div>
                <div className="text-sm text-blue-100">out of 5</div>
              </div>
            </div>
            <div>
              <StarRating rating={averageRating} size="lg" />
              <p className="text-blue-100 mt-2">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Rating Distribution */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Rating Distribution
              </h2>
              <RatingDistribution
                ratingCounts={ratingCounts}
                totalReviews={reviewCount}
              />
            </div>
          </div>

          {/* Main Content - Reviews */}
          <div className="lg:col-span-2">
            <ReviewList reviews={reviews} />
          </div>
        </div>
      </div>

      {/* Floating Action Button - Write Review */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link href={`/interviews/${id}/review`}>
          <Button size="lg" className="shadow-2xl hover:shadow-3xl group">
            <svg
              className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Write a Review
          </Button>
        </Link>
      </div>
    </div>
  );
}
