import type { Metadata } from "next";
import EditReviewForm from "@/components/reviews/edit-review-form";

export const metadata: Metadata = {
  title: "Edit Review | Rate My Interview",
  description: "Edit your interview experience review",
};

interface EditReviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { id } = await params;
  const reviewId = parseInt(id, 10);

  if (isNaN(reviewId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Invalid review ID</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <a href="/my/reviews" className="hover:text-blue-600">
              My Reviews
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Edit Review</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Review</h1>
          <p className="text-gray-600">
            Update your review. Once saved, it will go through quality review again.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <EditReviewForm reviewId={reviewId} />
        </div>
      </div>
    </div>
  );
}
