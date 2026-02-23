export function SkeletonCard() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-square bg-slate-100 rounded-3xl" />
      <div className="px-1 py-3.5 space-y-2.5">
        <div className="h-3 bg-slate-100 rounded-full w-2/3" />
        <div className="h-4 bg-slate-100 rounded-full w-full" />
        <div className="flex items-end justify-between pt-2">
          <div className="space-y-2">
            <div className="h-3 bg-slate-100 rounded-full w-12" />
            <div className="h-6 bg-slate-100 rounded-full w-24" />
          </div>
          <div className="h-10 w-10 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
