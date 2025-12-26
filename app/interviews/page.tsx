import { Suspense } from "react";
import { Metadata } from "next";
import InterviewGrid from "@/components/interviews/interview-grid";
import Breadcrumb from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Browse Interview Experiences | Rate My Interview",
  description: "Browse and search through interview experiences. Filter by company, role, level, and more.",
};

interface PageProps {
  searchParams: Promise<{
    company?: string;
    role?: string;
    level?: string;
    stage?: string;
    location?: string;
    sort?: string;
    search?: string;
    tags?: string;
  }>;
}

export default async function InterviewsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            variant="light"
            items={[
              { label: "Home", href: "/" },
              { label: "Interviews" },
            ]}
          />
          <div className="mt-6">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">
              Browse Interview Experiences
            </h1>
            <p className="text-xl text-blue-100">
              Find and rate interview experiences from our community database
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <InterviewGrid
            company={params.company}
            role={params.role}
            level={params.level}
            stage={params.stage}
            location={params.location}
            sort={params.sort}
            search={params.search}
            tags={params.tags}
          />
        </Suspense>
      </div>
    </div>
  );
}
