import { Suspense } from "react";
import { Metadata } from "next";
import SearchBar from "@/components/search/search-bar";
import InterviewCard from "@/components/interviews/interview-card";
import Breadcrumb from "@/components/ui/breadcrumb";
import { interviewApi } from "@/lib/api/interviews";
import type { InterviewExperienceDTO } from "@/lib/api/types";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Search Interview Experiences | Rate My Interview",
  description: "Search through interview experiences by company, role, or keywords",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";

  let results: InterviewExperienceDTO[] = [];
  let hasSearched = false;

  if (query.trim()) {
    hasSearched = true;
    try {
      const response = await interviewApi.listInterviews({
        q: query.trim(),
        limit: 50,
      });
      results = response.items;
    } catch (error) {
      console.error("Search failed:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            variant="light"
            items={[
              { label: "Home", href: "/" },
              { label: "Search" },
            ]}
          />
          <div className="mt-6">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">
              Search Interview Experiences
            </h1>
            <p className="text-xl text-blue-100">
              Find interview experiences by company, role, or keywords
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8">
            <SearchBar defaultValue={query} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!hasSearched ? (
          <div className="text-center py-20">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Start Your Search
            </h2>
            <p className="text-gray-600">
              Enter a company name, role, or keyword to find interview experiences
            </p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Found {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((interview) => (
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
          </>
        ) : (
          <div className="text-center py-20">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Results Found
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find any interview experiences matching &ldquo;{query}&rdquo;
            </p>
            <p className="text-gray-500 text-sm">
              Try searching with different keywords or check your spelling
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
