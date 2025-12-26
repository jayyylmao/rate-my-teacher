import { formatDistanceToNow } from "date-fns";
import Card from "@/components/ui/card";
import StarRating from "@/components/ui/star-rating";
import type { TagKey } from "@/lib/api/types";

interface ReviewCardProps {
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: Date;
  tags?: TagKey[];
}

export default function ReviewCard({
  rating,
  comment,
  reviewerName,
  createdAt,
  tags = [],
}: ReviewCardProps) {
  const displayName = reviewerName.trim() || "Anonymous";
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  // Format tag key for display (GHOST_JOB → Ghost job)
  const formatTagLabel = (key: TagKey): string => {
    return key
      .split("_")
      .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()))
      .join(" ");
  };

  return (
    <Card className="p-6 transition-all duration-200 hover:shadow-lg">
      <div className="flex flex-col gap-4">
        {/* Header: Rating and Date */}
        <div className="flex items-start justify-between gap-4">
          <StarRating rating={rating} size="sm" />
          <time className="text-sm text-gray-500 flex-shrink-0" dateTime={createdAt.toISOString()}>
            {timeAgo}
          </time>
        </div>

        {/* Comment */}
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {comment}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {formatTagLabel(tag)}
              </span>
            ))}
          </div>
        )}

        {/* Reviewer name */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {displayName[0].toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700">{displayName}</span>
        </div>
      </div>
    </Card>
  );
}
