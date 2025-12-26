import Link from "next/link";
import SearchBar from "@/components/search/search-bar";
import InterviewCard from "@/components/interviews/interview-card";
import Button from "@/components/ui/button";
import { interviewApi } from "@/lib/api/interviews";
import type { InterviewExperienceDTO } from "@/lib/api/types";

export default async function Home() {
  // Fetch data from API
  let totalInterviews = 0;
  let totalReviews = 0;
  let recentInterviews: InterviewExperienceDTO[] = [];

  try {
    // Fetch platform stats
    const stats = await interviewApi.getStats();
    totalInterviews = stats.totalInterviews;
    totalReviews = stats.totalReviews;

    // Fetch recently reviewed interview experiences
    recentInterviews = await interviewApi.getRecentlyReviewed(6);
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    // Continue with empty data - UI will show empty state
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center space-y-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold drop-shadow-lg">
              Share Your Interview Experience
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto">
              Help others prepare for their interviews with honest feedback
            </p>
            <div className="flex justify-center pt-4">
              <SearchBar />
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
              {totalInterviews.toLocaleString()}
            </div>
            <div className="text-gray-600 text-lg">
              Interview {totalInterviews === 1 ? "Experience" : "Experiences"}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-4xl sm:text-5xl font-bold text-purple-600 mb-2">
              {totalReviews.toLocaleString()}
            </div>
            <div className="text-gray-600 text-lg">
              {totalReviews === 1 ? "Review" : "Reviews"}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Interviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Recently Reviewed Interview Experiences
          </h2>
          <p className="text-gray-600 text-lg">
            See what candidates are sharing about their recent interviews
          </p>
        </div>

        {recentInterviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {recentInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                id={interview.id}
                company={interview.company}
                role={interview.role}
                level={interview.level}
                stage={interview.stage}
                location={interview.location}
                averageRating={interview.averageRating}
                reviewCount={interview.reviewCount}
                topTags={interview.topTags}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-gray-300"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Interview Experiences Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to share an interview experience
              </p>
              <Link href="/interviews/new">
                <Button variant="primary">Share Your Experience</Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Call to Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Browse interview experiences or share your own to help others prepare
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/interviews">
              <Button variant="secondary" size="lg">
                Browse All Interviews
              </Button>
            </Link>
            <Link href="/interviews/new">
              <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white/20">
                Share Your Experience
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
