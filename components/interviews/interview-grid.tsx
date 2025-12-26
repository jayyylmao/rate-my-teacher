"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import InterviewCard from "./interview-card";
import { interviewApi } from "@/lib/api/interviews";
import type { InterviewExperienceDTO } from "@/lib/api/types";
import Link from "next/link";
import Button from "@/components/ui/button";

interface InterviewGridProps {
  company?: string;
  role?: string;
  level?: string;
  stage?: string;
  location?: string;
  sort?: string;
  search?: string;
  tags?: string;
}

type SortOption = "recent" | "top" | "mostReviewed";

export default function InterviewGrid({
  company: initialCompany,
  role: initialRole,
  level: initialLevel,
  stage: initialStage,
  location: initialLocation,
  sort: initialSort,
  search: initialSearch,
  tags: initialTags,
}: InterviewGridProps) {
  const router = useRouter();

  const [interviews, setInterviews] = useState<InterviewExperienceDTO[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewExperienceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCompany, setSelectedCompany] = useState(initialCompany || "");
  const [selectedRole, setSelectedRole] = useState(initialRole || "");
  const [selectedLevel, setSelectedLevel] = useState(initialLevel || "");
  const [selectedStage, setSelectedStage] = useState(initialStage || "");
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || "");
  const [selectedSort, setSelectedSort] = useState<SortOption>((initialSort as SortOption) || "recent");
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [selectedTags, setSelectedTags] = useState(initialTags || "");

  // Fetch interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await interviewApi.listInterviews({
          sort: selectedSort,
          limit: 100, // Get more results for client-side filtering
        });

        setInterviews(response.items);
      } catch (err) {
        console.error("Failed to fetch interviews:", err);
        setError("Failed to load interview experiences. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [selectedSort]);

  // Apply client-side filters
  useEffect(() => {
    let result = [...interviews];

    // Apply search filter (searches company + role)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.company.toLowerCase().includes(query) ||
          i.role.toLowerCase().includes(query) ||
          i.level?.toLowerCase().includes(query) ||
          i.stage?.toLowerCase().includes(query) ||
          i.location?.toLowerCase().includes(query)
      );
    }

    // Apply company filter
    if (selectedCompany) {
      result = result.filter(
        (i) => i.company.toLowerCase() === selectedCompany.toLowerCase()
      );
    }

    // Apply role filter
    if (selectedRole) {
      result = result.filter(
        (i) => i.role.toLowerCase() === selectedRole.toLowerCase()
      );
    }

    // Apply level filter
    if (selectedLevel) {
      result = result.filter(
        (i) => i.level?.toLowerCase() === selectedLevel.toLowerCase()
      );
    }

    // Apply stage filter
    if (selectedStage) {
      result = result.filter(
        (i) => i.stage?.toLowerCase() === selectedStage.toLowerCase()
      );
    }

    // Apply location filter
    if (selectedLocation) {
      result = result.filter(
        (i) => i.location?.toLowerCase() === selectedLocation.toLowerCase()
      );
    }

    setFilteredInterviews(result);
  }, [interviews, selectedCompany, selectedRole, selectedLevel, selectedStage, selectedLocation, searchQuery, selectedTags]);

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedCompany) params.set("company", selectedCompany);
    if (selectedRole) params.set("role", selectedRole);
    if (selectedLevel) params.set("level", selectedLevel);
    if (selectedStage) params.set("stage", selectedStage);
    if (selectedLocation) params.set("location", selectedLocation);
    if (selectedSort !== "recent") params.set("sort", selectedSort);
    if (searchQuery) params.set("search", searchQuery);
    if (selectedTags) params.set("tags", selectedTags);

    const queryString = params.toString();
    router.push(`/interviews${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [selectedCompany, selectedRole, selectedLevel, selectedStage, selectedLocation, selectedSort, searchQuery, selectedTags, router]);

  // Extract unique filter options
  const companies = Array.from(
    new Set(interviews.map((i) => i.company))
  ).sort();

  const roles = Array.from(
    new Set(interviews.map((i) => i.role))
  ).sort();

  const levels = Array.from(
    new Set(interviews.map((i) => i.level).filter((l): l is string => !!l))
  ).sort();

  const stages = Array.from(
    new Set(interviews.map((i) => i.stage).filter((s): s is string => !!s))
  ).sort();

  const locations = Array.from(
    new Set(interviews.map((i) => i.location).filter((l): l is string => !!l))
  ).sort();

  const clearFilters = () => {
    setSelectedCompany("");
    setSelectedRole("");
    setSelectedLevel("");
    setSelectedStage("");
    setSelectedLocation("");
    setSelectedSort("recent");
    setSearchQuery("");
    setSelectedTags("");
    router.push("/interviews");
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
          <p className="text-gray-600">Loading interview experiences...</p>
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Interviews</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const hasActiveFilters = selectedCompany || selectedRole || selectedLevel || selectedStage || selectedLocation || searchQuery || selectedSort !== "recent" || selectedTags;

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="xl:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, role, level..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="recent">Most Recent</option>
              <option value="top">Top Rated</option>
              <option value="mostReviewed">Most Reviewed</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <select
              id="company"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select
              id="level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
              Stage
            </label>
            <select
              id="stage"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
            >
              <option value="">All Stages</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
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
          Showing <span className="font-semibold text-gray-900">{filteredInterviews.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{interviews.length}</span> interview experiences
        </p>
      </div>

      {/* Interviews Grid */}
      {filteredInterviews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterviews.map((interview) => (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Interview Experiences Found
            </h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "Be the first to add an interview experience to our database"}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <Link href="/interviews/new">
                <Button variant="primary">Share Your Experience</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
