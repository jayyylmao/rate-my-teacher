-- Update interviewer_initials constraint to 2-3 characters
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS chk_interviewer_initials;

ALTER TABLE reviews
  ADD CONSTRAINT chk_interviewer_initials
  CHECK (interviewer_initials IS NULL OR interviewer_initials ~ '^[A-Z]{2,3}$');

-- Update column length
ALTER TABLE reviews ALTER COLUMN interviewer_initials TYPE VARCHAR(3);
