export function SidebarSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2 px-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-md animate-pulse">
          <div className="h-8 w-8 rounded-md bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
