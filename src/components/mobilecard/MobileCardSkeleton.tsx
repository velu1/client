import { cn } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";

interface MobileCardSkeletonProps {
  className?: string;
}

export function MobileCardSkeleton({ className }: MobileCardSkeletonProps) {
  // Number of field rows to show in the skeleton
  const fieldCount = 5;

  return (
    <div
      className={cn(
        "rounded-md overflow-hidden shadow-sm mb-4 bg-white",
        className
      )}
    >
      {/* Card Header - Skeleton */}
      <div className="flex justify-between items-center p-3 bg-amber-50">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-5 w-16" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>

      {/* Card Body - Skeleton */}
      <div className="divide-y">
        {Array.from({ length: fieldCount }).map((_, idx) => (
          <div key={idx} className="flex justify-between p-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobileCardSkeletonLoader({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <MobileCardSkeleton key={`skeleton-${idx}`} />
      ))}
    </div>
  );
}
