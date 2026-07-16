export function TableSkeleton({ rows = 5, cols = 5 }) {
  const shimmer = "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse rounded";
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <div className="bg-gray-50 px-6 py-4 flex gap-8">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={`h-4 ${i === 0 ? "w-48" : i === 1 ? "w-36" : i === 2 ? "w-20" : i === 3 ? "w-32" : "w-24 ml-auto"}`}>
            <div className={`${shimmer} h-full`} />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-6 py-4 flex gap-8 border-t border-gray-100">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className={`${c === 0 ? "w-48" : c === 1 ? "w-36" : c === 2 ? "w-20" : c === 3 ? "w-32" : "w-24 ml-auto"}`}>
              <div className={`${shimmer} h-3.5`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatsCardSkeleton() {
  const shimmer = "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse rounded";
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className={`${shimmer} h-3.5 w-20 mb-3`} />
      <div className={`${shimmer} h-8 w-16`} />
    </div>
  );
}
