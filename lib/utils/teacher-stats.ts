/**
 * Utility functions for calculating teacher statistics
 */

export interface Review {
  rating: number;
}

export interface RatingCounts {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
}

/**
 * Calculate rating distribution counts
 */
export function calculateRatingCounts(reviews: Review[]): RatingCounts {
  return {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };
}

/**
 * Generate initials from full name for avatar
 */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

/**
 * Calculate percentage of ratings for a specific star count
 */
export function getRatingPercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}
