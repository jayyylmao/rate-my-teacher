import Link from "next/link";
import Card from "@/components/ui/card";
import StarRating from "@/components/ui/star-rating";

interface TeacherCardProps {
  id: number;
  name: string;
  subject: string;
  department: string | null;
  averageRating: number;
  reviewCount: number;
}

export default function TeacherCard({
  id,
  name,
  subject,
  department,
  averageRating,
  reviewCount,
}: TeacherCardProps) {
  // Generate initials from name
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <Link href={`/teachers/${id}`}>
      <Card className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer h-full">
        <div className="flex flex-col gap-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {name}
              </h3>
              <p className="text-sm text-gray-600 truncate">{subject}</p>
            </div>
          </div>

          {/* Department */}
          {department && (
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-sm text-gray-500 truncate">{department}</span>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <StarRating rating={averageRating} size="sm" showValue />
            <span className="text-sm text-gray-500">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
