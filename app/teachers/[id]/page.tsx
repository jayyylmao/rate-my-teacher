import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import StarRating from "@/components/ui/star-rating";
import Button from "@/components/ui/button";
import Breadcrumb from "@/components/ui/breadcrumb";
import ShareButton from "@/components/ui/share-button";
import RatingDistribution from "@/components/teachers/rating-distribution";
import ReviewList from "@/components/reviews/review-list";
import { teacherApi, type TeacherDTO } from "@/lib/api/teachers";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const teacher = await teacherApi.getTeacherById(id);
    const reviewCount = teacher.reviewCount;
    const averageRating = teacher.averageRating
      ? teacher.averageRating.toFixed(1)
      : "No rating";

    return {
      title: `${teacher.name} - ${teacher.subject} | Rate My Teacher`,
      description: `Read ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"} for ${teacher.name}. ${reviewCount > 0 ? `Average rating: ${averageRating}/5.0` : "Be the first to review!"}`,
      openGraph: {
        title: `${teacher.name} - ${teacher.subject}`,
        description: `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"} - Rating: ${averageRating}/5.0`,
      },
    };
  } catch (error) {
    console.error("Failed to fetch teacher metadata:", error);
    return {
      title: "Teacher Not Found | Rate My Teacher",
    };
  }
}

export default async function TeacherProfilePage({ params }: PageProps) {
  const { id } = await params;

  let teacher: TeacherDTO;

  try {
    // Fetch teacher with all reviews from Java API
    teacher = await teacherApi.getTeacherById(id);
  } catch (error) {
    console.error("Failed to fetch teacher:", error);
    notFound();
  }

  const reviewsFromApi = teacher.reviews || [];
  const reviewCount = teacher.reviewCount;

  // Use the average rating from API or calculate from reviews
  const averageRating = teacher.averageRating ?? 0;

  // Map API reviews to component format (camelCase to snake_case)
  const reviews = reviewsFromApi.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    reviewer_name: r.reviewerName,
    created_at: r.createdAt,
  }));

  // Rating distribution
  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  // Generate initials for avatar
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const initials = getInitials(teacher.name);
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/teachers/${id}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            variant="light"
            items={[
              { label: "Home", href: "/" },
              { label: "Teachers", href: "/" },
              { label: teacher.name },
            ]}
          />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-6">
            {/* Large Avatar */}
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-3xl font-bold">{initials}</span>
            </div>

            {/* Teacher Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{teacher.name}</h1>
              <p className="text-xl text-blue-100 mb-4">{teacher.subject}</p>
              {teacher.department && (
                <div className="flex items-center gap-2 text-blue-100">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>{teacher.department}</span>
                </div>
              )}
            </div>

            {/* Share Button */}
            <div className="self-start">
              <ShareButton url={currentUrl} title={`${teacher.name} - Rate My Teacher`} />
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
        <Link href={`/teachers/${id}/review`}>
          <Button size="lg" className="shadow-2xl hover:shadow-3xl group">
            <svg
              className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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
