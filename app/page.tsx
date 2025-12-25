import Link from "next/link";
import SearchBar from "@/components/search/search-bar";
import TeacherCard from "@/components/teachers/teacher-card";
import Button from "@/components/ui/button";
import { teacherApi, type TeacherDTO } from "@/lib/api/teachers";

export default async function Home() {
  // Fetch data from Java API
  let totalTeachers = 0;
  let totalReviews = 0;
  let teachersWithRating: TeacherDTO[] = [];

  try {
    // Fetch platform stats
    const stats = await teacherApi.getStats();
    totalTeachers = stats.totalTeachers;
    totalReviews = stats.totalReviews;

    // Fetch recently reviewed teachers
    teachersWithRating = await teacherApi.getRecentlyReviewed(6);
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    // Continue with empty data - UI will show "No Teachers Yet" state
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center space-y-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold drop-shadow-lg">
              Find and Rate Your Teachers
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto">
              Help fellow students make informed decisions
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
              {totalTeachers.toLocaleString()}
            </div>
            <div className="text-gray-600 text-lg">
              {totalTeachers === 1 ? "Teacher" : "Teachers"}
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

      {/* Featured Teachers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Recently Reviewed Teachers
          </h2>
          <p className="text-gray-600 text-lg">
            Check out what students are saying about these teachers
          </p>
        </div>

        {teachersWithRating.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {teachersWithRating.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                id={teacher.id}
                name={teacher.name}
                subject={teacher.subject}
                department={teacher.department}
                averageRating={teacher.averageRating ?? 0}
                reviewCount={teacher.reviewCount}
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
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Teachers Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to add a teacher to our database
              </p>
              <Link href="/teachers/new">
                <Button variant="primary">Add a Teacher</Button>
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
            Browse our database of teachers or add a new teacher to help your
            fellow students
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teachers">
              <Button variant="secondary" size="lg">
                Browse All Teachers
              </Button>
            </Link>
            <Link href="/teachers/new">
              <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white/20">
                Add a Teacher
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
