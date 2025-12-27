
⸻

Post-MVP Execution Plan

Project: Candidate Interview Experience Aggregation
Audience: IC Engineer / PM hybrid
Goal: Stabilize signal quality, prevent abuse, and make the product quietly useful without scope creep.

⸻

1. Product North Star (Non-Negotiable)

Primary user: Candidates deciding whether to enter or continue an interview process.
Primary value: Early warning + expectation setting.
Explicit non-goals:
  • Holding companies or interviewers “accountable”
  • Diagnosing root causes
  • Fairness, objectivity, or completeness

If a feature does not improve candidate decision-making, it does not ship.

⸻

2. Success Criteria (What “Working” Means)

This product is working if:
  • Users change behavior (opt out earlier, proceed more informed)
  • Submissions describe events, not motives
  • Data remains boring, non-viral, non-performative
  • No single report feels authoritative on its own

This product fails if:
  • It becomes a venting platform
  • It trends toward naming/shaming
  • Scores are treated as truth instead of heuristics
  • Fraud overwhelms organic signal

⸻

3. Post-MVP Priorities (Ordered)

P0 — Data Integrity & Abuse Control

P1 — Signal Readability

P2 — Trust Calibration

P3 — Incremental Coverage Expansion

Anything else is deferred.

⸻

4. P0: Fraud, Spam, and Abuse Controls

4.1 Submission Gating (Must Have)

Implement immediately:
  • Account required to submit
  • Email verification (non-disposable domains only)
  • One submission per role per company per user

Optional but recommended:
  • Soft cooldown (e.g., max 3 submissions / 30 days)

Goal: Raise cost of spam without blocking legitimate angry users.

⸻

4.2 Input Constraints (Force Experience, Not Interpretation)

Submission form must:
  • Prefer structured fields over free text
  • Cap any free text to ≤ 500 chars
  • Prompt for what happened, not why

Example prompt:

“Briefly describe what occurred that most affected your experience.”

Explicitly disallow:
  • Naming individuals
  • Speculating about intent
  • Legal or criminal allegations

⸻

4.3 Moderation Policy (Lightweight, Deterministic)

Moderation is not debate, it is enforcement.

Remove or redact reports that:
  • Assert facts not directly observed
  • Include identifying details
  • Use defamatory language

Do not adjudicate truth. Only admissibility.

Automate first-pass filtering where possible; escalate edge cases.

⸻

5. P1: Signal Readability (Prevent Over-Interpretation)

5.1 No Global Scores

Never show:
  • Star ratings
  • Rankings
  • Percentiles across companies

Instead show:
  • Distributions (histograms)
  • Commonly reported friction points
  • “Would you re-enter this process?” aggregate

This prevents false precision.

⸻

5.2 Low-N Handling (Hard Rules)

If N < threshold (define, e.g. 3–5):
  • Do not show summaries
  • Show only: “Limited reports — experiences may vary”

No exceptions.

⸻

5.3 Time Awareness

All surfaced data must:
  • Show date ranges clearly
  • Bias toward recent reports in summaries
  • Never imply current accuracy

Simple language:

“Based on reports from the past 6 months.”

⸻

6. P2: Trust Calibration (User Education Without Preaching)

6.1 Canonical Framing (Shown Once)

On first use, show:

“This reflects how candidates experienced interview processes. It does not judge intent, individuals, or hiring quality.”

Users must dismiss it once. Never show again.

⸻

6.2 Micro-copy at Risk Points

Wherever users could misread signal:
  • Add 1-line clarifiers
  • No tooltips longer than one sentence

Example:

“Reported experiences vary by role, timing, and interviewer.”

No disclaimers page. No legal wall.

⸻

7. P3: Coverage Expansion (Only After Stability)

Allowed expansions:
  • Role / seniority filtering
  • Interview stage breakdown
  • High-level themes (e.g., “scope unclear”, “long delays”)

Explicitly disallowed:
  • Team-level resolution
  • Interviewer attributes
  • Real-time reporting
  • Commenting, replies, or voting

Any increase in resolution must preserve k-anonymity. If it doesn’t, it doesn’t ship.

⸻

8. Metrics to Track (Internally Only)

Do not expose these publicly.

Core:
  • Submission rate vs. browse rate
  • % of submissions removed or redacted
  • Median text length (proxy for venting)
  • Repeat submissions per user

Health:
  • Time between experience and submission
  • Distribution skew (extreme vs neutral)
  • Fraud indicators (IP reuse, pattern similarity)

If abuse > signal, pause expansion.

⸻

9. Explicit Tradeoffs (Documented, Accepted)

We accept:
  • Bias toward negative experiences
  • Occasional unfair impressions
  • Incomplete or stale data

We do not accept:
  • Defamation risk
  • Identity reconstruction
  • Becoming a justice platform
  • Chasing engagement or virality

⸻

10. Decision Log Requirement

Any change that increases:
  • Resolution
  • Visibility
  • Interpretability

must include a short written note answering:
  1.  What new user behavior does this enable?
  2.  What new misinterpretation risk does this create?
  3.  Why is this worth it now?

No note → no merge.

⸻

11. Final Instruction to IC

Build this like infrastructure, not a social product.

If a feature makes the product:
  • More exciting
  • More shareable
  • More opinionated

…it’s probably wrong.

Quiet usefulness is the goal.=