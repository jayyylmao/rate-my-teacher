// Auth API functions - Uses GraphQL for data queries, REST for auth operations

import { apiClient, ApiError } from "./client";
import { graphqlRequest, GraphQLError } from "@/lib/graphql/client";
import { ME_QUERY, ME_BASIC_QUERY } from "@/lib/graphql/queries";
import { UPDATE_REVIEW_MUTATION, DELETE_REVIEW_MUTATION } from "@/lib/graphql/mutations";
import { User, AuthStartRequest, AuthVerifyRequest, AuthResponse, ReviewDTO, UpdateReviewPayload } from "./types";

// ─────────────────────────────────────────────────────────────
// GraphQL Response Types
// ─────────────────────────────────────────────────────────────

// MyReview includes status (for user's own reviews)
interface MyReviewGql {
  id: number;
  interviewId: number;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
  tags: string[];
  roundType: string | null;
  interviewerInitials: string | null;
  outcome: string | null;
  status: string;
  approvedAt: string | null;
  interview: {
    id: string;
    company: string;
    role: string;
  };
}

interface MeResponse {
  me: {
    id: string;
    email: string;
    roles: string[];
    myReviews: {
      items: MyReviewGql[];
      count: number;
    };
  } | null;
}

interface MeBasicResponse {
  me: {
    id: string;
    email: string;
    roles: string[];
  } | null;
}

// Minimal mutation responses
interface UpdateReviewResponse {
  updateReview: {
    id: number;
    status: string;
  };
}

interface DeleteReviewResponse {
  deleteReview: {
    success: boolean;
  };
}

// ─────────────────────────────────────────────────────────────
// Auth Operations (REST)
// ─────────────────────────────────────────────────────────────

/**
 * Start auth by sending OTP to email
 */
export async function startAuth(email: string): Promise<AuthResponse> {
  const payload: AuthStartRequest = { email };
  return apiClient.post<AuthResponse>("/api/auth/start", payload);
}

/**
 * Verify OTP and create session
 */
export async function verifyOtp(
  email: string,
  code: string
): Promise<AuthResponse> {
  const payload: AuthVerifyRequest = { email, code };
  return apiClient.post<AuthResponse>("/api/auth/verify", payload);
}

/**
 * Logout - clear session
 */
export async function logout(): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/api/auth/logout");
}

// ─────────────────────────────────────────────────────────────
// User Queries (GraphQL)
// ─────────────────────────────────────────────────────────────

/**
 * Get current user (returns null if not authenticated)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const data = await graphqlRequest<MeBasicResponse>(ME_BASIC_QUERY);
    if (!data.me) return null;
    return {
      id: parseInt(data.me.id, 10),
      email: data.me.email,
      roles: data.me.roles as User["roles"],
    };
  } catch (error) {
    if (error instanceof GraphQLError) {
      return null;
    }
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    throw error;
  }
}

/**
 * Get current user's reviews (all statuses)
 */
export async function getMyReviews(): Promise<ReviewDTO[]> {
  const data = await graphqlRequest<MeResponse>(ME_QUERY);
  if (!data.me) {
    throw new Error("Not authenticated");
  }

  // Map MyReviewGql to ReviewDTO (with nested interview data)
  return data.me.myReviews.items.map(r => ({
    id: r.id,
    interviewId: r.interviewId,
    rating: r.rating,
    comment: r.comment,
    reviewerName: r.reviewerName,
    createdAt: r.createdAt,
    tags: r.tags as ReviewDTO['tags'],
    roundType: r.roundType as ReviewDTO['roundType'],
    interviewerInitials: r.interviewerInitials,
    outcome: r.outcome as ReviewDTO['outcome'],
    status: r.status as ReviewDTO['status'],
    approvedAt: r.approvedAt,
    // Mobile-friendly nested data
    interviewCompany: r.interview.company,
    interviewRole: r.interview.role,
  }));
}

// ─────────────────────────────────────────────────────────────
// Review Mutations (GraphQL)
// ─────────────────────────────────────────────────────────────

/**
 * Update a review (owner only, pending only)
 * Returns minimal response - caller should refetch as needed.
 */
export async function updateReview(id: number, payload: UpdateReviewPayload): Promise<{ id: number; status: string }> {
  const { tags, ...rest } = payload;

  const data = await graphqlRequest<UpdateReviewResponse>(UPDATE_REVIEW_MUTATION, {
    id: String(id),
    input: {
      ...rest,
      tagKeys: tags,
    },
  });

  return {
    id: data.updateReview.id,
    status: data.updateReview.status,
  };
}

/**
 * Delete a review (owner only, pending/rejected only)
 */
export async function deleteReview(id: number): Promise<void> {
  await graphqlRequest<DeleteReviewResponse>(DELETE_REVIEW_MUTATION, {
    id: String(id),
  });
}

/**
 * Get a single review by ID (for editing)
 * Uses getMyReviews and filters client-side.
 */
export async function getReviewById(id: number): Promise<ReviewDTO> {
  const reviews = await getMyReviews();
  const review = reviews.find(r => r.id === id);
  if (!review) {
    throw new Error(`Review ${id} not found`);
  }
  return review;
}
