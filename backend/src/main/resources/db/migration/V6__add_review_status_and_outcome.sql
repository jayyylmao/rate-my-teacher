-- Phase 1: Add status, outcome, and approved_at fields to reviews
-- This enables the review quality/approval system

-- Add outcome column (nullable enum: OFFER, REJECTED, WITHDREW)
ALTER TABLE reviews ADD COLUMN outcome VARCHAR(20);

-- Add status column (enum: PENDING, APPROVED, REJECTED)
-- Default to APPROVED for existing reviews (grandfathered in)
ALTER TABLE reviews ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'APPROVED';

-- Add approved_at timestamp (nullable, set when review is approved)
ALTER TABLE reviews ADD COLUMN approved_at TIMESTAMPTZ;

-- For existing approved reviews, set approved_at to created_at
UPDATE reviews SET approved_at = created_at WHERE status = 'APPROVED';

-- Add constraints for enum values
ALTER TABLE reviews ADD CONSTRAINT chk_review_outcome
  CHECK (outcome IS NULL OR outcome IN ('OFFER', 'REJECTED', 'WITHDREW'));

ALTER TABLE reviews ADD CONSTRAINT chk_review_status
  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- Update interviewer_initials constraint to allow 2-4 chars (was 2-3)
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS chk_interviewer_initials;
ALTER TABLE reviews ALTER COLUMN interviewer_initials TYPE VARCHAR(4);
ALTER TABLE reviews ADD CONSTRAINT chk_interviewer_initials
  CHECK (interviewer_initials IS NULL OR interviewer_initials ~ '^[A-Z]{2,4}$');

-- Add index on status for efficient filtering of approved reviews
CREATE INDEX idx_reviews_status ON reviews(status);

-- Add index on outcome for potential future analytics
CREATE INDEX idx_reviews_outcome ON reviews(outcome) WHERE outcome IS NOT NULL;
