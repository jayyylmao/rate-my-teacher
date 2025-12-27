// Interview Experience API service - GraphQL implementation
import { cache } from 'react';
import { graphqlRequest } from '@/lib/graphql/client';
import { INTERVIEWS_QUERY, INTERVIEW_QUERY, TAGS_QUERY, STATS_QUERY, INSIGHTS_QUERY } from '@/lib/graphql/queries';
import { CREATE_REVIEW_MUTATION } from '@/lib/graphql/mutations';
import { apiClient } from './client';
import type {
  StatsDTO,
  InterviewExperienceDTO,
  InterviewDetailDTO,
  TagDTO,
  ListInterviewsParams,
  GetInterviewDetailParams,
  CreateInterviewPayload,
  AddReviewPayload,
  InsightsDTO,
} from './types';

// ─────────────────────────────────────────────────────────────
// GraphQL Response Types
// ─────────────────────────────────────────────────────────────

// Public review (no status - that's in MyReview)
interface ReviewGql {
  id: number;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
  tags: string[];
  roundType: string | null;
  interviewerInitials: string | null;
  outcome: string | null;
}

// Interview with nested data (detail page)
interface InterviewGql {
  id: string;
  company: string;
  role: string;
  level: string | null;
  stage: string | null;
  location: string | null;
  createdAt: string;
  averageRating: number | null;
  reviewCount: number;
  lastReviewedAt: string | null;
  reviews: ReviewGql[];
  ratingBreakdown: Array<{ rating: number; count: number }>;
}

interface InterviewResponse {
  interview: InterviewGql;
}

interface InterviewsResponse {
  interviews: {
    items: InterviewExperienceDTO[];
    nextCursor: string | null;
  };
}

interface TagsResponse {
  tags: {
    items: TagDTO[];
  };
}

interface StatsResponse {
  stats: StatsDTO;
}

interface InsightsResponse {
  insights: InsightsDTO;
}

// Minimal mutation response
interface CreateReviewResponse {
  createReview: {
    id: number;
    status: string;
  };
}

// ─────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────

export const interviewApi = {
  /**
   * Get platform statistics (total interviews and reviews)
   */
  getStats: cache(async (): Promise<StatsDTO> => {
    const data = await graphqlRequest<StatsResponse>(STATS_QUERY);
    return data.stats;
  }),

  /**
   * List interview experiences with optional filters.
   * Does not include nested reviews.
   */
  async listInterviews(
    params?: ListInterviewsParams
  ): Promise<{ items: InterviewExperienceDTO[]; nextCursor?: string }> {
    let sort: string | undefined = params?.sort;
    if (sort === 'top') sort = 'rating';
    if (sort === 'mostReviewed') sort = 'reviews';

    const data = await graphqlRequest<InterviewsResponse>(INTERVIEWS_QUERY, {
      q: params?.q,
      company: params?.company,
      role: params?.role,
      level: params?.level,
      stage: params?.stage,
      location: params?.location,
      sort,
      limit: params?.limit,
    });

    return {
      items: data.interviews.items,
      nextCursor: data.interviews.nextCursor ?? undefined,
    };
  },

  /**
   * Get a single interview by ID with nested reviews and breakdown.
   * This is the canonical query for the interview detail page.
   */
  getInterviewById: cache(async (
    id: number | string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _params?: GetInterviewDetailParams
  ): Promise<InterviewDetailDTO> => {
    const data = await graphqlRequest<InterviewResponse>(INTERVIEW_QUERY, {
      id: String(id),
    });

    const interview = data.interview;

    // Convert ratingBreakdown array to Record
    const ratingBreakdown: Record<"1" | "2" | "3" | "4" | "5", number> = {
      "1": 0, "2": 0, "3": 0, "4": 0, "5": 0
    };
    for (const item of interview.ratingBreakdown) {
      const key = String(item.rating) as "1" | "2" | "3" | "4" | "5";
      ratingBreakdown[key] = item.count;
    }

    // Map to existing DTO structure
    return {
      interview: {
        id: parseInt(interview.id, 10),
        company: interview.company,
        role: interview.role,
        level: interview.level,
        stage: interview.stage,
        location: interview.location,
        createdAt: interview.createdAt,
        averageRating: interview.averageRating,
        reviewCount: interview.reviewCount,
        lastReviewedAt: interview.lastReviewedAt,
      },
      reviews: interview.reviews.map(r => ({
        id: r.id,
        interviewId: parseInt(interview.id, 10),
        rating: r.rating,
        comment: r.comment,
        reviewerName: r.reviewerName,
        createdAt: r.createdAt,
        tags: r.tags as InterviewDetailDTO['reviews'][0]['tags'],
        roundType: r.roundType as InterviewDetailDTO['reviews'][0]['roundType'],
        interviewerInitials: r.interviewerInitials,
        outcome: r.outcome as InterviewDetailDTO['reviews'][0]['outcome'],
        status: 'APPROVED' as const, // Public reviews are always APPROVED
      })),
      ratingBreakdown,
    };
  }),

  /**
   * Create a new interview experience.
   * (Still uses REST - no GraphQL mutation for this yet)
   */
  async createInterview(payload: CreateInterviewPayload): Promise<{ id: number }> {
    return apiClient.post<{ id: number }>('/api/interviews', payload);
  },

  /**
   * Add a review for an interview experience.
   * Returns minimal response - caller should refetch interview query.
   */
  async addReview(payload: AddReviewPayload): Promise<{ id: number; status: string }> {
    const { tags, ...rest } = payload;

    const data = await graphqlRequest<CreateReviewResponse>(CREATE_REVIEW_MUTATION, {
      input: {
        ...rest,
        tagKeys: tags,
      },
    });

    return {
      id: data.createReview.id,
      status: data.createReview.status,
    };
  },

  /**
   * Get all available tags with labels and categories
   */
  getTags: cache(async (): Promise<{ items: TagDTO[] }> => {
    const data = await graphqlRequest<TagsResponse>(TAGS_QUERY);
    return { items: data.tags.items };
  }),

  /**
   * Get recently reviewed interview experiences (for homepage)
   */
  async getRecentlyReviewed(limit: number = 6): Promise<InterviewExperienceDTO[]> {
    try {
      const response = await this.listInterviews({
        sort: 'recent',
        limit
      });

      return response.items.filter(i => i.reviewCount > 0);
    } catch (error) {
      console.error('Failed to fetch recently reviewed interviews:', error);
      return [];
    }
  },

  /**
   * Get company insights for an interview.
   * Returns full insights if user has contributed, otherwise preview.
   */
  async getInsights(interviewId: number | string): Promise<InsightsDTO> {
    const data = await graphqlRequest<InsightsResponse>(INSIGHTS_QUERY, {
      interviewId: String(interviewId),
    });
    return data.insights;
  },
};
