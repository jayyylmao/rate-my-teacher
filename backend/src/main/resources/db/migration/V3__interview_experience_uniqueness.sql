BEGIN;

-- This uses COALESCE so NULLs don't bypass uniqueness.
-- Adjust the COALESCE values if empty string is meaningful to you.
CREATE UNIQUE INDEX IF NOT EXISTS ux_interviews_identity
ON interview_experiences (
  LOWER(company),
  LOWER(role),
  LOWER(COALESCE(level, '')),
  LOWER(COALESCE(stage, '')),
  LOWER(COALESCE(location, ''))
);

COMMIT;
