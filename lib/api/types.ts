// TypeScript DTOs for Interview Experience Rating API

export type TagCategory = "PROCESS" | "QUALITY" | "BEHAVIOR";

export type TagKey =
  | "GHOST_JOB"
  | "PROMPT_FEEDBACK"
  | "NO_FEEDBACK"
  | "UNREASONABLE_DIFFICULTY"
  | "DISRESPECTFUL"
  | "WELL_ORGANIZED"
  | "MISALIGNED_ROLE"
  | "LONG_PROCESS";

export interface InterviewExperienceDTO {
  id: number;
  company: string;
  role: string;
  level: string | null;
  stage: string | null;
  location: string | null;
  createdAt: string;
  averageRating: number | null;
  reviewCount: number;
  lastReviewedAt: string | null;
  topTags?: TagKey[];
}

export interface ReviewDTO {
  id: number;
  interviewId: number;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
  tags: TagKey[];
}

export interface InterviewDetailDTO {
  interview: InterviewExperienceDTO;
  reviews: ReviewDTO[];
  ratingBreakdown?: Record<"1" | "2" | "3" | "4" | "5", number>;
}

export interface StatsDTO {
  totalInterviews: number;
  totalReviews: number;
}

export interface TagDTO {
  key: TagKey;
  label: string;
  category: TagCategory;
}

export interface ListInterviewsParams {
  sort?: "recent" | "top" | "mostReviewed";
  limit?: number;
  q?: string;
  cursor?: string;
  company?: string;
  role?: string;
  level?: string;
  stage?: string;
  location?: string;
  tags?: string;
}

export interface GetInterviewDetailParams {
  reviewsSort?: "recent" | "highest" | "lowest";
  reviewsLimit?: number;
}

export interface CreateInterviewPayload {
  company: string;
  role: string;
  level?: string;
  stage?: string;
  location?: string;
}

export interface AddReviewPayload {
  interviewId: number;
  rating: number;
  comment: string;
  reviewerName: string;
  tags: TagKey[];
}
