BEGIN;

-- 1) Drop old tables if they exist
DROP TABLE IF EXISTS review_tags CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS interview_experiences CASCADE;

-- 2) Create interview_experiences table
CREATE TABLE interview_experiences (
  id          SERIAL PRIMARY KEY,
  company     TEXT NOT NULL,
  role        TEXT NOT NULL,
  level       TEXT NULL,
  stage       TEXT NULL,
  location    TEXT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes for browse/search/sort
CREATE INDEX idx_interviews_created_at
  ON interview_experiences (created_at DESC);

CREATE INDEX idx_interviews_company
  ON interview_experiences (company);

CREATE INDEX idx_interviews_role
  ON interview_experiences (role);

-- 3) Create tags table
CREATE TABLE tags (
  id        SERIAL PRIMARY KEY,
  key       TEXT NOT NULL UNIQUE,
  label     TEXT NOT NULL,
  category  TEXT NOT NULL
);

-- 4) Create reviews table (fresh)
CREATE TABLE reviews (
  id                         SERIAL PRIMARY KEY,
  interview_experience_id    INTEGER NOT NULL,
  rating                     INTEGER NOT NULL,
  comment                    TEXT,
  reviewer_name              TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reviews_interview_experience_id_fkey
    FOREIGN KEY (interview_experience_id) REFERENCES interview_experiences(id) ON DELETE CASCADE,
  CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- Index for fast fetch of reviews per interview (sorted by created_at)
CREATE INDEX idx_reviews_interview_created_at
  ON reviews (interview_experience_id, created_at DESC);

-- 5) Create review_tags join table
CREATE TABLE review_tags (
  review_id INTEGER NOT NULL,
  tag_id    INTEGER NOT NULL,
  PRIMARY KEY (review_id, tag_id),
  CONSTRAINT fk_review_tags_review
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_tags_tag_id
  ON review_tags (tag_id);

COMMIT;
