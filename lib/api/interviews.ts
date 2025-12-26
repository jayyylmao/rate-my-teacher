// Interview Experience API service
import { cache } from 'react';
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
} from './types';

export const interviewApi = {
  /**
   * Get platform statistics (total interviews and reviews)
   * Cached to avoid duplicate API calls
   */
  getStats: cache(async (): Promise<StatsDTO> => {
    return apiClient.get<StatsDTO>('/api/stats');
  }),

  /**
   * List interview experiences with optional filters
   */
  async listInterviews(
    params?: ListInterviewsParams
  ): Promise<{ items: InterviewExperienceDTO[]; nextCursor?: string }> {
    const searchParams = new URLSearchParams();

    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.q) searchParams.set('q', params.q);
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.company) searchParams.set('company', params.company);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.level) searchParams.set('level', params.level);
    if (params?.stage) searchParams.set('stage', params.stage);
    if (params?.location) searchParams.set('location', params.location);
    if (params?.tags) searchParams.set('tags', params.tags);

    const query = searchParams.toString();
    const endpoint = `/api/interviews${query ? `?${query}` : ''}`;

    return apiClient.get<{ items: InterviewExperienceDTO[]; nextCursor?: string }>(endpoint);
  },

  /**
   * Get a single interview experience by ID with reviews
   * Cached to avoid duplicate API calls in metadata and page component
   */
  getInterviewById: cache(async (
    id: number | string,
    params?: GetInterviewDetailParams
  ): Promise<InterviewDetailDTO> => {
    const searchParams = new URLSearchParams();

    if (params?.reviewsSort) searchParams.set('reviewsSort', params.reviewsSort);
    if (params?.reviewsLimit) searchParams.set('reviewsLimit', params.reviewsLimit.toString());

    const query = searchParams.toString();
    const endpoint = `/api/interviews/${id}${query ? `?${query}` : ''}`;

    return apiClient.get<InterviewDetailDTO>(endpoint);
  }),

  /**
   * Create a new interview experience
   */
  async createInterview(payload: CreateInterviewPayload): Promise<{ id: number }> {
    return apiClient.post<{ id: number }>('/api/interviews', payload);
  },

  /**
   * Add a review for an interview experience
   */
  async addReview(payload: AddReviewPayload): Promise<{ id: number }> {
    // Transform frontend 'tags' field to backend 'tagKeys' field
    const { tags, ...rest } = payload;
    const backendPayload = {
      ...rest,
      tagKeys: tags,
    };
    return apiClient.post<{ id: number }>('/api/reviews', backendPayload);
  },

  /**
   * Get all available tags with labels and categories
   * Cached to avoid duplicate API calls
   */
  getTags: cache(async (): Promise<{ items: TagDTO[] }> => {
    return apiClient.get<{ items: TagDTO[] }>('/api/tags');
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
};
