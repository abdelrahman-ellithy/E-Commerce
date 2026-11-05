export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="skeleton aspect-square rounded-none" />
          <div className="space-y-3 p-4">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
