export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-3 bg-muted rounded-full w-16" />
        <div className="h-4 bg-muted rounded-full w-full" />
        <div className="h-4 bg-muted rounded-full w-2/3" />
        <div className="flex items-end justify-between pt-2">
          <div className="space-y-1.5">
            <div className="h-5 bg-muted rounded-full w-20" />
            <div className="h-3 bg-muted rounded-full w-14" />
          </div>
          <div className="h-9 w-9 bg-muted rounded-xl" />
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
