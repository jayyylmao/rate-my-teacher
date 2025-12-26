BEGIN;

INSERT INTO tags (key, label, category) VALUES
  ('GHOST_JOB', 'Ghost job', 'PROCESS'),
  ('PROMPT_FEEDBACK', 'Prompt feedback', 'PROCESS'),
  ('NO_FEEDBACK', 'No feedback', 'PROCESS'),
  ('LONG_PROCESS', 'Long process', 'PROCESS'),
  ('UNREASONABLE_DIFFICULTY', 'Unreasonable difficulty', 'QUALITY'),
  ('MISALIGNED_ROLE', 'Misaligned role', 'QUALITY'),
  ('DISRESPECTFUL', 'Disrespectful', 'BEHAVIOR'),
  ('WELL_ORGANIZED', 'Well organized', 'BEHAVIOR')
ON CONFLICT (key) DO UPDATE
SET
  label = EXCLUDED.label,
  category = EXCLUDED.category;

COMMIT;
