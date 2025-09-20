import { useState, useRef, TouchEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SwipeGestureProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  className?: string;
  disabled?: boolean;
}

export const MobileSwipeGesture = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  swipeThreshold = 50,
  className,
  disabled = false
}: SwipeGestureProps) => {
  const [startX, setStartX] = useState<number | null>(null);
  const [isGesturing, setIsGesturing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled) return;
    setStartX(e.touches[0].clientX);
    setIsGesturing(false);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || startX === null) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = Math.abs(currentX - startX);
    
    if (diffX > swipeThreshold) {
      setIsGesturing(true);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (disabled || startX === null) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;
    
    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (diffX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    setStartX(null);
    setIsGesturing(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "touch-manipulation",
        isGesturing && "select-none",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};