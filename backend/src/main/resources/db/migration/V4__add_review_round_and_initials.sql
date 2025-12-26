-- Add round_type and interviewer_initials to reviews table
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS round_type TEXT,
  ADD COLUMN IF NOT EXISTS interviewer_initials VARCHAR(4);

-- Add constraint to ensure interviewer_initials are uppercase letters only (1-4 chars)
ALTER TABLE reviews
  ADD CONSTRAINT chk_interviewer_initials
  CHECK (interviewer_initials IS NULL OR interviewer_initials ~ '^[A-Z]{1,4}$');

-- Add index for round_type filtering
CREATE INDEX IF NOT EXISTS idx_reviews_round_type ON reviews (round_type);
