import type { Metadata } from "next";
import MyReviewsList from "@/components/my/my-reviews-list";

export const metadata: Metadata = {
  title: "My Reviews | Rate My Interview",
  description: "View and manage your interview experience reviews",
};

export default function MyReviewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Reviews</h1>
          <p className="text-gray-600">
            Track the status of your interview reviews. Pending reviews are being checked for quality.
            You can edit pending reviews or delete reviews that haven&apos;t been approved yet.
          </p>
        </div>

        {/* Reviews list with tabs */}
        <MyReviewsList />
      </div>
    </div>
  );
}
