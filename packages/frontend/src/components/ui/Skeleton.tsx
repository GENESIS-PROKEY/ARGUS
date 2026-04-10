interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-3 bg-argus-card-border/50 rounded animate-pulse ${i === lines - 1 ? 'w-2/3' : 'w-full'} ${className}`}
          />
        ))}
      </div>
    );
  }

  return <div className={`h-3 bg-argus-card-border/50 rounded animate-pulse ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="card-glow p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-argus-card-border/50 animate-pulse" />
        <Skeleton className="w-32 h-4" />
      </div>
      <Skeleton lines={3} />
    </div>
  );
}
