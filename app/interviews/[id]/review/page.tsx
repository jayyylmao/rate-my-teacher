import { notFound } from "next/navigation";
import { Metadata } from "next";
import Breadcrumb from "@/components/ui/breadcrumb";
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

  try {
    const detail = await interviewApi.getInterviewById(id);
    interview = detail.interview;
  } catch (error) {
    console.error("Failed to fetch interview:", error);
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
          {/* Review form placeholder - will be implemented with tag support */}
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">Review form coming soon</p>
            <p className="text-sm">This will include rating, comment, and tag selection</p>
          </div>
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
        </div>
      </div>
    </div>
  );
}
