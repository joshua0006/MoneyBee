import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/useTouchGestures';
import { mobileService } from '@/utils/mobileService';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className
}) => {
  const { ref, isPulling, pullDistance, isRefreshing } = usePullToRefresh(async () => {
    mobileService.mediumHaptic();
    await onRefresh();
    mobileService.successHaptic();
  });

  const pullThreshold = 60;
  const maxPull = 100;
  const rotation = (pullDistance / maxPull) * 360;
  const opacity = Math.min(pullDistance / pullThreshold, 1);

  return (
    <div 
      ref={ref}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10",
          "bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm"
        )}
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
          opacity: opacity
        }}
      >
        <div className="flex flex-col items-center gap-1 py-2">
          <RefreshCw 
            size={24} 
            className={cn(
              "text-primary transition-transform duration-200",
              isRefreshing ? "animate-spin" : ""
            )}
            style={{
              transform: isRefreshing ? 'rotate(360deg)' : `rotate(${rotation}deg)`
            }}
          />
          <span className="text-xs text-muted-foreground font-medium">
            {isRefreshing 
              ? "Refreshing..." 
              : pullDistance > pullThreshold 
                ? "Release to refresh" 
                : "Pull to refresh"
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${isPulling || isRefreshing ? Math.min(pullDistance, maxPull) : 0}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};