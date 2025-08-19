export default function RootLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="animate-pulse flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="animate-pulse flex items-center gap-6">
            <div className="h-4 bg-gray-200 rounded w-12"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-9 bg-gray-200 rounded w-20 opacity-50"></div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="text-center mb-12">
            <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-128 mx-auto"></div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-32 mx-auto opacity-50"></div>
          </div>
        </div>
      </main>
    </div>
  )
}
