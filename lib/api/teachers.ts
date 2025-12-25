// Teacher API service
import { apiClient } from './client';

// DTOs matching Java backend structure
export interface TeacherDTO {
  id: number;
  name: string;
  subject: string;
  department: string | null;
  createdAt: string;
  averageRating: number | null;
  reviewCount: number;
  reviews?: ReviewDTO[];
}

export interface ReviewDTO {
  id: number;
  teacherId?: number;
  teacherName?: string;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
}

export interface ApiStats {
  totalTeachers: number;
  totalReviews: number;
}

export const teacherApi = {
  /**
   * Get platform statistics (total teachers and reviews)
   * Derived from existing endpoints
   */
  async getStats(): Promise<ApiStats> {
    try {
      const [teachers, reviews] = await Promise.all([
        apiClient.get<TeacherDTO[]>('/api/teachers'),
        apiClient.get<ReviewDTO[]>('/api/reviews'),
      ]);

      return {
        totalTeachers: teachers.length,
        totalReviews: reviews.length,
      };
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return { totalTeachers: 0, totalReviews: 0 };
    }
  },

  /**
   * Get all teachers
   */
  async getAllTeachers(params?: {
    department?: string;
    subject?: string;
  }): Promise<TeacherDTO[]> {
    const searchParams = new URLSearchParams();
    if (params?.department) searchParams.set('department', params.department);
    if (params?.subject) searchParams.set('subject', params.subject);

    const query = searchParams.toString();
    const endpoint = `/api/teachers${query ? `?${query}` : ''}`;

    return apiClient.get<TeacherDTO[]>(endpoint);
  },

  /**
   * Get recently reviewed teachers (for homepage)
   * We'll get all teachers and sort by most reviews or highest rated
   */
  async getRecentlyReviewed(limit: number = 6): Promise<TeacherDTO[]> {
    try {
      const teachers = await apiClient.get<TeacherDTO[]>('/api/teachers');

      // Sort by review count (descending) and return top N
      return teachers
        .filter(t => t.reviewCount > 0)
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch recently reviewed teachers:', error);
      return [];
    }
  },

  /**
   * Get a single teacher by ID with all reviews
   */
  async getTeacherById(id: number | string): Promise<TeacherDTO> {
    return apiClient.get<TeacherDTO>(`/api/teachers/${id}`);
  },

  /**
   * Search teachers by name
   */
  async searchTeachers(name: string): Promise<TeacherDTO[]> {
    const searchParams = new URLSearchParams({ name });
    return apiClient.get<TeacherDTO[]>(`/api/teachers/search?${searchParams}`);
  },

  /**
   * Create a new teacher
   */
  async createTeacher(teacher: {
    name: string;
    subject: string;
    department?: string;
  }): Promise<TeacherDTO> {
    return apiClient.post<TeacherDTO>('/api/teachers', teacher);
  },

  /**
   * Add a review for a teacher
   */
  async addReview(review: {
    teacherId: number;
    rating: number;
    comment: string;
    reviewerName: string;
  }): Promise<ReviewDTO> {
    return apiClient.post<ReviewDTO>('/api/reviews', review);
  },

  /**
   * Get reviews for a specific teacher
   */
  async getTeacherReviews(teacherId: number): Promise<ReviewDTO[]> {
    return apiClient.get<ReviewDTO[]>(`/api/reviews/teacher/${teacherId}`);
  },
};
