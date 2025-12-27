-- V11: Add review voting system
-- Allows users (authenticated and guests) to mark reviews as helpful

BEGIN;

-- Create review_votes table
CREATE TABLE review_votes (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_identifier VARCHAR(255) NOT NULL,  -- email for auth users, UUID for guests
  vote_type VARCHAR(20) NOT NULL DEFAULT 'HELPFUL',  -- Future-proof for different vote types
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_vote_per_user UNIQUE(review_id, user_identifier)
);

-- Index for fast lookups by review (to get vote counts)
CREATE INDEX idx_votes_review ON review_votes(review_id);

-- Index for user-specific queries (to check if user has voted)
CREATE INDEX idx_votes_user ON review_votes(user_identifier);

-- Add helpful_count column to reviews for performance
-- Stores denormalized count to avoid expensive COUNT queries
ALTER TABLE reviews ADD COLUMN helpful_count INTEGER NOT NULL DEFAULT 0;

-- Index for sorting reviews by helpful count (future feature)
CREATE INDEX idx_reviews_helpful_count ON reviews(helpful_count DESC);

COMMIT;
