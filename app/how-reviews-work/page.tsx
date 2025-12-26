import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How Reviews Work | Rate My Interview",
  description: "Learn how our review quality system works, what makes a helpful review, and our content guidelines.",
};

export default function HowReviewsWorkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          How Reviews Work
        </h1>

        {/* Section: Quality Checks */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quality Checks
          </h2>
          <p className="text-gray-600 mb-4">
            All reviews go through a quick quality check before being published.
            This helps ensure reviews are helpful and focus on the interview process.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Reviews must describe the interview process, not personal attacks</li>
            <li>No full names, contact information, or external links</li>
            <li>At least one tag and interview round type required</li>
            <li>Most reviews are published within minutes</li>
          </ul>
        </section>

        {/* Section: What We Look For */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            What Makes a Helpful Review
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Specific details about question types and interview structure</li>
            <li>How professional and clear the communication was</li>
            <li>Timeline and feedback responsiveness</li>
            <li>Tips for future candidates</li>
          </ul>
        </section>

        {/* Section: What's Not Allowed */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            What&apos;s Not Allowed
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Full names of interviewers (use initials like &quot;JD&quot; instead)</li>
            <li>Personal contact information or social media links</li>
            <li>Discriminatory or hateful content</li>
            <li>Information that could identify specific candidates</li>
          </ul>
        </section>

        {/* Section: Outcome Neutrality */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Interview Outcome
          </h2>
          <p className="text-gray-600">
            Sharing your interview outcome is optional. Whether you received an offer,
            were rejected, or withdrew does not affect how your review is weighted or displayed.
            We focus on the quality of the interview process, not the hiring decision.
          </p>
        </section>

        {/* Section: Editing Reviews */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Editing Your Review
          </h2>
          <p className="text-gray-600">
            While your review is being checked, you can make edits. Once published,
            reviews cannot be edited but can be reported if they violate our guidelines.
          </p>
        </section>

        {/* Section: Review Status */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Review Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full flex-shrink-0">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Pending
              </span>
              <p className="text-gray-600 text-sm">
                Your review is being checked for quality. This usually takes just a few minutes.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full flex-shrink-0">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Reviewed
              </span>
              <p className="text-gray-600 text-sm">
                Your review has been published and is visible to other candidates.
              </p>
            </div>
          </div>
        </section>

        {/* Questions Section */}
        <section className="bg-blue-50 rounded-lg p-6 mt-12">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Have Questions?
          </h2>
          <p className="text-gray-600">
            If you have any questions about our review process or need to report a concern,
            please reach out to our team.
          </p>
        </section>
      </div>
    </div>
  );
}
