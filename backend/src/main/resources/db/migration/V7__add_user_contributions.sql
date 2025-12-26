-- Phase 6: Create user_contributions table for tracking unlocked insights
-- Users who submit an APPROVED review unlock insights for that company

CREATE TABLE user_contributions (
  id SERIAL PRIMARY KEY,
  user_identifier VARCHAR(255) NOT NULL,  -- email hash or session ID
  interview_experience_id INTEGER NOT NULL REFERENCES interview_experiences(id) ON DELETE CASCADE,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_identifier, interview_experience_id)
);

-- Index for looking up contributions by user
CREATE INDEX idx_contributions_user ON user_contributions(user_identifier);

-- Index for looking up contributions by interview experience
CREATE INDEX idx_contributions_interview ON user_contributions(interview_experience_id);

-- Index for looking up by review (useful for cleanup if review is deleted)
CREATE INDEX idx_contributions_review ON user_contributions(review_id);
