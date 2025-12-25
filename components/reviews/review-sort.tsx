"use client";

import { useState } from "react";

export type SortOption = "recent" | "highest" | "lowest";

interface ReviewSortProps {
  onSortChange: (sort: SortOption) => void;
  defaultSort?: SortOption;
}

export default function ReviewSort({
  onSortChange,
  defaultSort = "recent",
}: ReviewSortProps) {
  const [selectedSort, setSelectedSort] = useState<SortOption>(defaultSort);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as SortOption;
    setSelectedSort(newSort);
    onSortChange(newSort);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-reviews" className="text-sm font-medium text-gray-700">
        Sort by:
      </label>
      <select
        id="sort-reviews"
        value={selectedSort}
        onChange={handleChange}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
      >
        <option value="recent">Most Recent</option>
        <option value="highest">Highest Rated</option>
        <option value="lowest">Lowest Rated</option>
      </select>
    </div>
  );
}
