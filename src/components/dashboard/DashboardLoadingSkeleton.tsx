import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export const DashboardLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-background via-card/30 to-background border-b border-border/20 sticky top-0 z-40 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between h-12 lg:h-16">
            <LoadingSkeleton type="card" count={1} />
          </div>
        </div>
      </div>
      
      {/* Content Skeleton - Responsive Grid */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 space-y-6">
        <LoadingSkeleton type="overview" />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="chart" />
          <div className="xl:col-span-1">
            <LoadingSkeleton type="list" count={3} />
          </div>
        </div>
      </div>
    </div>
  );
};