"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "canonical-framing-seen";

/**
 * Canonical Framing Disclaimer (Section 6.1 of goal.md)
 *
 * Shows once on first use to calibrate user expectations.
 * Must be dismissed once, never shown again.
 */
export default function CanonicalFramingDisclaimer() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check if user has already seen the disclaimer
    const hasSeen = localStorage.getItem(STORAGE_KEY);

    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  // Don't render anything during SSR or if already dismissed
  if (!isClient || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative">
        {/* Icon */}
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          About These Reviews
        </h2>

        {/* Canonical framing text from goal.md */}
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          This reflects how candidates experienced interview processes. It does not judge intent, individuals, or hiring quality.
        </p>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
