import { useState, useEffect } from "react";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface ProgressiveLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  type?: 'overview' | 'list' | 'chart' | 'card';
  skeletonCount?: number;
  delay?: number;
}

export const ProgressiveLoader = ({ 
  isLoading, 
  children, 
  type = 'card', 
  skeletonCount = 3,
  delay = 0 
}: ProgressiveLoaderProps) => {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
    } else {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isLoading, delay]);

  if (showSkeleton) {
    return <LoadingSkeleton type={type} count={skeletonCount} />;
  }

  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
};

// Enhanced hook for progressive loading states
export const useProgressiveLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingStage, setLoadingStage] = useState<'initial' | 'loading' | 'complete'>('initial');

  const startLoading = () => {
    setLoadingStage('loading');
    setIsLoading(true);
  };

  const stopLoading = () => {
    setLoadingStage('complete');
    // Add a small delay for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  return {
    isLoading,
    loadingStage,
    startLoading,
    stopLoading
  };
};