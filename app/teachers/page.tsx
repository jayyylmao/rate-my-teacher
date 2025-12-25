import { Suspense } from "react";
import { Metadata } from "next";
import TeacherGrid from "@/components/teachers/teacher-grid";
import Breadcrumb from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Browse All Teachers | Rate My Teacher",
  description: "Browse and search through our database of teachers. Filter by department, subject, and sort by ratings.",
};

interface PageProps {
  searchParams: Promise<{
    department?: string;
    subject?: string;
    sort?: string;
    search?: string;
  }>;
}

export default async function TeachersPage({ searchParams }: PageProps) {
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
              { label: "Teachers" },
            ]}
          />
          <div className="mt-6">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">
              Browse Teachers
            </h1>
            <p className="text-xl text-blue-100">
              Find and rate teachers from our community database
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
          <TeacherGrid
            department={params.department}
            subject={params.subject}
            sort={params.sort}
            search={params.search}
          />
        </Suspense>
      </div>
    </div>
  );
}
