"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TeacherCard from "./teacher-card";
import { teacherApi, type TeacherDTO } from "@/lib/api/teachers";
import Link from "next/link";
import Button from "@/components/ui/button";

interface TeacherGridProps {
  department?: string;
  subject?: string;
  sort?: string;
  search?: string;
}

type SortOption = "rating-desc" | "rating-asc" | "name-asc" | "name-desc" | "reviews-desc";

export default function TeacherGrid({
  department: initialDepartment,
  subject: initialSubject,
  sort: initialSort,
  search: initialSearch,
}: TeacherGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [teachers, setTeachers] = useState<TeacherDTO[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartment || "");
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || "");
  const [selectedSort, setSelectedSort] = useState<SortOption>((initialSort as SortOption) || "rating-desc");
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await teacherApi.getAllTeachers();
        setTeachers(data);
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
        setError("Failed to load teachers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...teachers];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.subject.toLowerCase().includes(query) ||
          t.department?.toLowerCase().includes(query)
      );
    }

    // Apply department filter
    if (selectedDepartment) {
      result = result.filter(
        (t) => t.department?.toLowerCase() === selectedDepartment.toLowerCase()
      );
    }

    // Apply subject filter
    if (selectedSubject) {
      result = result.filter(
        (t) => t.subject.toLowerCase() === selectedSubject.toLowerCase()
      );
    }

    // Apply sorting
    switch (selectedSort) {
      case "rating-desc":
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case "rating-asc":
        result.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "reviews-desc":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    setFilteredTeachers(result);
  }, [teachers, selectedDepartment, selectedSubject, selectedSort, searchQuery]);

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedDepartment) params.set("department", selectedDepartment);
    if (selectedSubject) params.set("subject", selectedSubject);
    if (selectedSort !== "rating-desc") params.set("sort", selectedSort);
    if (searchQuery) params.set("search", searchQuery);

    const queryString = params.toString();
    router.push(`/teachers${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [selectedDepartment, selectedSubject, selectedSort, searchQuery, router]);

  // Extract unique departments and subjects
  const departments = Array.from(
    new Set(teachers.map((t) => t.department).filter((d): d is string => !!d))
  ).sort();

  const subjects = Array.from(
    new Set(teachers.map((t) => t.subject))
  ).sort();

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
  };

  const handleSortChange = (value: SortOption) => {
    setSelectedSort(value);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const clearFilters = () => {
    setSelectedDepartment("");
    setSelectedSubject("");
    setSelectedSort("rating-desc");
    setSearchQuery("");
    router.push("/teachers");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 300); // Debounce URL updates

    return () => clearTimeout(timer);
  }, [updateURL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <svg
          className="w-12 h-12 text-red-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Teachers</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const hasActiveFilters = selectedDepartment || selectedSubject || searchQuery || selectedSort !== "rating-desc";

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search teachers..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              id="department"
              value={selectedDepartment}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
            >
              <option value="">All Subjects</option>
              {subjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={selectedSort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="reviews-desc">Most Reviews</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredTeachers.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{teachers.length}</span> teachers
        </p>
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
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
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Teachers Found
            </h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "Be the first to add a teacher to our database"}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <Link href="/teachers/new">
                <Button variant="primary">Add a Teacher</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
