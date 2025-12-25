import { formatDistanceToNow } from "date-fns";
import Card from "@/components/ui/card";
import StarRating from "@/components/ui/star-rating";

interface ReviewCardProps {
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: Date;
}

export default function ReviewCard({
  rating,
  comment,
  reviewerName,
  createdAt,
}: ReviewCardProps) {
  const displayName = reviewerName.trim() || "Anonymous";
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

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
