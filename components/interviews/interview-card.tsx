import Link from "next/link";
import Card from "@/components/ui/card";
import StarRating from "@/components/ui/star-rating";
import type { TagKey } from "@/lib/api/types";

interface InterviewCardProps {
  id: number;
  company: string;
  role: string;
  level: string | null;
  stage: string | null;
  location: string | null;
  averageRating: number | null;
  reviewCount: number;
  topTags?: TagKey[];
}

export default function InterviewCard({
  id,
  company,
  role,
  level,
  stage,
  location,
  averageRating,
  reviewCount,
  topTags,
}: InterviewCardProps) {
  // Generate initials from company name
  const getInitials = (companyName: string) => {
    const parts = companyName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const initials = getInitials(company);

  // Build metadata string from level, stage, location
  const metadata = [level, stage, location].filter(Boolean).join(" · ");

  return (
    <Link href={`/interviews/${id}`}>
      <Card className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer h-full">
        <div className="flex flex-col gap-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {company}
              </h3>
              <p className="text-sm text-gray-600 truncate">{role}</p>
            </div>
          </div>

          {/* Metadata */}
          {metadata && (
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-gray-500 truncate">{metadata}</span>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <StarRating rating={averageRating ?? 0} size="sm" showValue />
            <span className="text-sm text-gray-500">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
