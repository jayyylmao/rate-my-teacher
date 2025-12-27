/**
 * Manages user identifier for guest voting and contributions.
 * Uses localStorage for persistence across sessions.
 */

const STORAGE_KEY = 'user_identifier';

/**
 * Get or create a stable user identifier for guests.
 * For authenticated users, the backend will use their email instead.
 */
export function getUserIdentifier(): string {
  // Only run in browser
  if (typeof window === 'undefined') {
    return '';
  }

  // Try to get existing identifier from localStorage
  let identifier = localStorage.getItem(STORAGE_KEY);

  if (!identifier) {
    // Generate new identifier (UUID v4)
    identifier = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, identifier);
  }

  return identifier;
}

/**
 * Clear user identifier (for testing/reset).
 */
export function clearUserIdentifier(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
