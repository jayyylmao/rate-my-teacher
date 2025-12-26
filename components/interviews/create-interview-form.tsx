"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { interviewApi } from "@/lib/api/interviews";
import Button from "@/components/ui/button";

export default function CreateInterviewForm() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [stage, setStage] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company.trim()) {
      setError("Company name is required");
      return;
    }

    if (!role.trim()) {
      setError("Role is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await interviewApi.createInterview({
        company: company.trim(),
        role: role.trim(),
        level: level.trim() || undefined,
        stage: stage.trim() || undefined,
        location: location.trim() || undefined,
      });

      // Redirect to the new interview page
      router.push(`/interviews/${response.id}`);
      router.refresh();
    } catch (err) {
      console.error("Failed to create interview:", err);
      setError("Failed to create interview experience. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company */}
      <div>
        <label htmlFor="company" className="block text-lg font-semibold text-gray-900 mb-2">
          Company <span className="text-red-500">*</span>
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g., Google, Amazon, Microsoft"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          maxLength={200}
          required
        />
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-lg font-semibold text-gray-900 mb-2">
          Role <span className="text-red-500">*</span>
        </label>
        <input
          id="role"
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Software Engineer, Product Manager"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          maxLength={200}
          required
        />
      </div>

      {/* Level */}
      <div>
        <label htmlFor="level" className="block text-lg font-semibold text-gray-900 mb-2">
          Level (Optional)
        </label>
        <input
          id="level"
          type="text"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="e.g., L4, Senior, IC3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          maxLength={100}
        />
      </div>

      {/* Stage */}
      <div>
        <label htmlFor="stage" className="block text-lg font-semibold text-gray-900 mb-2">
          Interview Stage (Optional)
        </label>
        <input
          id="stage"
          type="text"
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          placeholder="e.g., Phone Screen, Onsite, Final Round"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          maxLength={100}
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-lg font-semibold text-gray-900 mb-2">
          Location (Optional)
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Remote, Seattle WA, New York NY"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          maxLength={100}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <Button
          type="submit"
          disabled={isSubmitting || !company.trim() || !role.trim()}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            "Create Interview Experience"
          )}
        </Button>
      </div>
    </form>
  );
}
