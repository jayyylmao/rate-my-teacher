// Database types for type-safe Supabase queries

export interface Teacher {
  id: number;
  name: string;
  subject: string;
  department: string | null;
  created_at: string;
}

export interface Review {
  id: number;
  teacher_id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

export interface TeacherWithReviews extends Teacher {
  reviews: Review[];
}

export interface TeacherWithStats extends Teacher {
  averageRating: number;
  reviewCount: number;
}
