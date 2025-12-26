import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/ui/breadcrumb";
import InterviewReviewForm from "@/components/reviews/interview-review-form";
import { interviewApi } from "@/lib/api/interviews";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const detail = await interviewApi.getInterviewById(id);
    const interview = detail.interview;

    return {
      title: `Write a Review for ${interview.company} ${interview.role} | Rate My Interview`,
      description: `Share your interview experience with ${interview.company} - ${interview.role}`,
    };
  } catch (error) {
    console.error("Failed to fetch interview metadata:", error);
    return {
      title: "Write a Review | Rate My Interview",
    };
  }
}

export default async function WriteReviewPage({ params }: PageProps) {
  const { id } = await params;

  let interview;
  let tags;

  try {
    // Fetch interview and tags in parallel
    const [detail, tagsResponse] = await Promise.all([
      interviewApi.getInterviewById(id),
      interviewApi.getTags(),
    ]);
    interview = detail.interview;
    tags = tagsResponse.items;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    notFound();
  }

  const metadata = [interview.level, interview.stage, interview.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            variant="light"
            items={[
              { label: "Home", href: "/" },
              { label: "Interviews", href: "/interviews" },
              { label: interview.company, href: `/interviews/${id}` },
              { label: "Write Review" },
            ]}
          />
          <div className="mt-6">
            <h1 className="text-4xl font-bold mb-3">Write a Review</h1>
            <p className="text-xl text-blue-100">
              Share your interview experience with {interview.company}
            </p>
            {metadata && (
              <p className="text-blue-200 mt-2">{interview.role} • {metadata}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <InterviewReviewForm interviewId={parseInt(id)} initialTags={tags} />
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Review Guidelines</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Be honest and constructive about your interview experience
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Focus on the process, communication, and overall experience
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Do not include interviewer names or personally identifiable information
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Keep comments respectful and professional
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-blue-100">
            <Link
              href="/how-reviews-work"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Learn more about how reviews work
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
