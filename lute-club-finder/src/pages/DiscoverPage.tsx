export default function DiscoverPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Clubs</h1>
      <p className="text-gray-600 mb-8">
        Browse, search, and filter all 55+ clubs at PLU.
      </p>

      {/* Search and Filters - Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <p className="text-gray-400 text-sm">
          Search bar, category filters, and tag filters will be implemented in Phase 2.
        </p>
      </div>

      {/* Club Grid - Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
