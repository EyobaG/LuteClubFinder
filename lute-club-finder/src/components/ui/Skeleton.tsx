interface SkeletonProps {
  className?: string;
}

export function SkeletonLine({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function SkeletonCircle({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded-full ${className}`} />;
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
      <SkeletonLine className="h-40 w-full rounded-lg mb-4" />
      <SkeletonLine className="h-5 w-3/4 mb-3" />
      <SkeletonLine className="h-4 w-full mb-2" />
      <SkeletonLine className="h-4 w-5/6 mb-4" />
      <div className="flex gap-2">
        <SkeletonLine className="h-6 w-16 rounded-full" />
        <SkeletonLine className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonDetailPage() {
  return (
    <div className="animate-pulse max-w-4xl mx-auto">
      <SkeletonLine className="h-4 w-48 mb-6" />
      <SkeletonLine className="h-64 w-full rounded-xl mb-6" />
      <SkeletonLine className="h-8 w-2/3 mb-3" />
      <div className="flex gap-2 mb-6">
        <SkeletonLine className="h-6 w-20 rounded-full" />
        <SkeletonLine className="h-6 w-24 rounded-full" />
      </div>
      <SkeletonLine className="h-4 w-full mb-2" />
      <SkeletonLine className="h-4 w-full mb-2" />
      <SkeletonLine className="h-4 w-5/6 mb-2" />
      <SkeletonLine className="h-4 w-4/6 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonLine className="h-24 rounded-lg" />
        <SkeletonLine className="h-24 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="animate-pulse">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <SkeletonLine className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <SkeletonLine className="h-4 w-24 mb-3" />
          <SkeletonLine className="h-8 w-16 mb-2" />
          <SkeletonLine className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChartPanel() {
  return (
    <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <SkeletonLine className="h-5 w-48 mb-4" />
      <SkeletonLine className="h-64 w-full rounded-lg" />
    </div>
  );
}
