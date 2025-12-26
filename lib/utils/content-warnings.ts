/**
 * Content warning detection for review quality guardrails
 * These are soft guardrails - non-blocking nudges to encourage better reviews
 */

export interface ContentWarning {
  type: "all_caps" | "profanity" | "direct_insult";
  message: string;
}

// Simple profanity word list (expandable)
const PROFANITY_LIST = [
  "damn",
  "hell",
  "crap",
  "shit",
  "ass",
  "asshole",
  "bastard",
  "bitch",
  "fuck",
  "fucking",
  "bullshit",
];

// Direct insult patterns - interviewer + insult word
const INSULT_WORDS = [
  "stupid",
  "idiot",
  "idiotic",
  "dumb",
  "moron",
  "incompetent",
  "useless",
  "worthless",
  "terrible",
  "awful",
  "horrible",
  "pathetic",
  "joke",
  "clown",
  "jerk",
  "rude",
];

/**
 * Detect all-caps sections (10+ consecutive uppercase letters)
 */
function detectAllCaps(text: string): boolean {
  // Remove spaces and check for 10+ consecutive uppercase letters
  const noSpaces = text.replace(/\s+/g, "");
  const allCapsPattern = /[A-Z]{10,}/;
  return allCapsPattern.test(noSpaces);
}

/**
 * Detect excessive profanity (2+ occurrences)
 */
function detectProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  let count = 0;

  for (const word of PROFANITY_LIST) {
    // Word boundary match to avoid partial matches
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) {
      count += matches.length;
    }
    if (count >= 2) return true;
  }

  return false;
}

/**
 * Detect direct insults targeting interviewer
 * Patterns like "interviewer is stupid" or "the interviewer was an idiot"
 */
function detectDirectInsults(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Check for patterns like "interviewer is/was [insult]" or "interviewer [insult]"
  for (const insult of INSULT_WORDS) {
    const patterns = [
      new RegExp(`\\binterviewer\\s+(is|was|are|were)\\s+(a\\s+|an\\s+)?${insult}\\b`, "i"),
      new RegExp(`\\binterviewers?\\s+(are|were)\\s+(all\\s+)?${insult}\\b`, "i"),
      new RegExp(`\\b${insult}\\s+interviewer\\b`, "i"),
    ];

    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Analyze content and return any detected warnings
 * Returns array of warnings (empty if content is fine)
 */
export function detectContentWarnings(text: string): ContentWarning[] {
  const warnings: ContentWarning[] = [];

  if (detectAllCaps(text)) {
    warnings.push({
      type: "all_caps",
      message: "Your review contains sections in all caps. Consider using regular casing.",
    });
  }

  if (detectProfanity(text)) {
    warnings.push({
      type: "profanity",
      message: "Your review contains strong language.",
    });
  }

  if (detectDirectInsults(text)) {
    warnings.push({
      type: "direct_insult",
      message: "Your review contains direct characterizations of people.",
    });
  }

  return warnings;
}

/**
 * Check if content has any warnings
 */
export function hasContentWarnings(text: string): boolean {
  return detectContentWarnings(text).length > 0;
}
