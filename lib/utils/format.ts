import type { RoundType, TagKey } from "@/lib/api/types";

/**
 * Format round type enum to human-readable string
 * SYSTEM_DESIGN -> "System Design"
 */
export function formatRoundType(roundType: RoundType): string {
  const formatted = roundType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  return formatted;
}

/**
 * Format tag key to human-readable string
 * GHOST_JOB -> "Ghost job"
 */
export function formatTagKey(tagKey: TagKey): string {
  const formatted = tagKey
    .split("_")
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase()
    )
    .join(" ");
  return formatted;
}

/**
 * Format date to "Month Year" format
 * 2025-12-26T18:12:01Z -> "Dec 2025"
 */
export function formatMonthYear(dateString: string): string {
  const date = new Date(dateString);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${month} ${year}`;
}

/**
 * Normalize interviewer initials on frontend input
 * - Strip non-letters
 * - Uppercase
 * - Max 4 characters (supports compound surnames like MCKS)
 */
export function normalizeInitials(initials: string): string {
  if (!initials) return "";

  // Remove non-letter characters, convert to uppercase, limit to 4 chars
  const normalized = initials
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 4);

  return normalized;
}

/**
 * Validate interviewer initials
 * Returns error message or null if valid
 */
export function validateInitials(initials: string): string | null {
  if (!initials || !initials.trim()) return null; // Optional field

  const lettersOnly = initials.replace(/[^a-zA-Z]/g, "");

  if (lettersOnly.length > 4) {
    return "Initials must be 2-4 letters (e.g., JD or MCKS)";
  }

  if (lettersOnly.length < 2) {
    return "Initials must be at least 2 letters";
  }

  return null;
}
