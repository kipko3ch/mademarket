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

export function BundleSkeleton() {
  return (
    <div className="flex flex-col animate-pulse bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm h-full">
      <div className="aspect-[4/3] bg-slate-50 relative">
        <div className="absolute top-4 left-4 h-6 w-20 bg-slate-200 rounded-full" />
        <div className="absolute bottom-4 left-4 h-5 w-24 bg-slate-200 rounded-full" />
      </div>
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded-full w-3/4" />
          <div className="h-3 bg-slate-50 rounded-full w-full" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-7 bg-slate-100 rounded-lg w-28" />
          <div className="h-8 w-8 bg-slate-100 rounded-xl" />
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
