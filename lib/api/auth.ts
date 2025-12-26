// Auth API functions

import { apiClient, ApiError } from "./client";
import { User, AuthStartRequest, AuthVerifyRequest, AuthResponse } from "./types";

/**
 * Start auth by sending OTP to email
 */
export async function startAuth(email: string): Promise<AuthResponse> {
  const payload: AuthStartRequest = { email };
  return apiClient.post<AuthResponse>("/api/auth/start", payload);
}

/**
 * Verify OTP and create session
 */
export async function verifyOtp(
  email: string,
  code: string
): Promise<AuthResponse> {
  const payload: AuthVerifyRequest = { email, code };
  return apiClient.post<AuthResponse>("/api/auth/verify", payload);
}

/**
 * Logout - clear session
 */
export async function logout(): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/api/auth/logout");
}

/**
 * Get current user (returns null if not authenticated)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiClient.get<User>("/api/me");
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    throw error;
  }
}

/**
 * Get current user's reviews
 */
export async function getMyReviews(): Promise<unknown[]> {
  return apiClient.get<unknown[]>("/api/my/reviews");
}
