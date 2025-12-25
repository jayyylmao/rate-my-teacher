export default function TeacherProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-white/20 rounded w-48 mb-6 animate-pulse" />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-6">
            {/* Avatar skeleton */}
            <div className="w-24 h-24 bg-white/20 rounded-full animate-pulse" />

            {/* Info skeleton */}
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-white/20 rounded w-64 animate-pulse" />
              <div className="h-6 bg-white/20 rounded w-48 animate-pulse" />
              <div className="h-5 bg-white/20 rounded w-56 animate-pulse" />
            </div>
          </div>

          {/* Rating skeleton */}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="h-12 w-16 bg-white/20 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-white/20 rounded w-32 animate-pulse" />
              <div className="h-4 bg-white/20 rounded w-24 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-3 bg-gray-200 rounded flex-1 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6">
                <div className="space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
