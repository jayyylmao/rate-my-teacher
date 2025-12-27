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

export type RoundType =
  | "PHONE_SCREEN"
  | "RECRUITER"
  | "BEHAVIORAL"
  | "CODING"
  | "SYSTEM_DESIGN"
  | "CASE_STUDY"
  | "ONSITE"
  | "OTHER";

export type ReviewOutcome = "OFFER" | "REJECTED" | "WITHDREW";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewDTO {
  id: number;
  interviewId: number;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
  tags: TagKey[];
  roundType?: RoundType | null;
  interviewerInitials?: string | null;
  outcome?: ReviewOutcome | null;
  status: ReviewStatus;
  approvedAt?: string | null;
  helpfulCount: number;
  viewerHasVoted: boolean;
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

export interface StructuredRatings {
  interviewStructure: number; // 1-5: Interview structure clarity
  questionRelevance: number; // 1-5: Question relevance to role
  professionalism: number; // 1-5: Professionalism & interaction quality
  communicationClarity: number; // 1-5: Communication / feedback clarity
}

export interface AddReviewPayload {
  interviewId: number;
  rating: number;
  comment: string;
  reviewerName: string;
  tags: TagKey[];
  roundType?: RoundType;
  interviewerInitials?: string;
  outcome?: ReviewOutcome;
  structuredRatings?: StructuredRatings;
}

export interface UpdateReviewPayload {
  rating: number;
  comment: string;
  reviewerName: string;
  tags: TagKey[];
  roundType: string;
  interviewerInitials?: string;
  outcome?: ReviewOutcome;
}

export interface MyReviewDTO extends ReviewDTO {
  rejectionReason?: string | null;
  interviewCompany?: string;
  interviewRole?: string;
}

// Auth types
export type UserRole = "ROLE_ADMIN" | "ROLE_MODERATOR";

export interface User {
  id: number;
  email: string;
  roles: UserRole[];
}

export interface AuthStartRequest {
  email: string;
}

export interface AuthVerifyRequest {
  email: string;
  code: string;
}

export interface AuthResponse {
  message: string;
}

// ─────────────────────────────────────────────────────────────
// Company Insights Types
// ─────────────────────────────────────────────────────────────

export interface TagDistribution {
  tag: string;
  percentage: number;
}

export interface OutcomeDistribution {
  outcome: string;
  percentage: number;
}

export interface Trend {
  recentAverageRating: number;
  olderAverageRating: number;
  ratingChange: number;
  direction: "improving" | "stable" | "declining";
  recentReviewCount: number;
  olderReviewCount: number;
}

export interface InsightsDTO {
  // Always available
  companyName: string;
  totalReviews: number;
  locked: boolean;

  // Only when unlocked
  tagDistribution?: TagDistribution[];
  averageDifficulty?: number;
  feedbackSpeed?: string;
  commonFeedback?: string[];
  outcomeDistribution?: OutcomeDistribution[];
  recentTrend?: Trend;

  // Only when locked
  unlockMessage?: string;
  availableInsightsCount?: number;
  topTagsBlurred?: string[];
}
