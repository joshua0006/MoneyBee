import { useState, useEffect, useRef, useCallback } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
  threshold?: number;
  longPressDelay?: number;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export const useTouchGestures = (options: TouchGestureOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    onPinch,
    threshold = 50,
    longPressDelay = 500
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const startTouch = useRef<TouchPoint | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const lastTouchDistance = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startTouch.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    // Setup long press detection
    if (onLongPress) {
      setIsLongPressing(false);
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true);
        onLongPress();
      }, longPressDelay);
    }

    // Handle pinch gestures
    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      lastTouchDistance.current = distance;
    }
  }, [onLongPress, onPinch, longPressDelay]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cancel long press on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle pinch zoom
    if (e.touches.length === 2 && onPinch && lastTouchDistance.current > 0) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = distance / lastTouchDistance.current;
      onPinch(scale);
      lastTouchDistance.current = distance;
    }
  }, [onPinch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!startTouch.current || isLongPressing) {
      setIsLongPressing(false);
      return;
    }

    const touch = e.changedTouches[0];
    const endTouch = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    const deltaX = endTouch.x - startTouch.current.x;
    const deltaY = endTouch.y - startTouch.current.y;
    const deltaTime = endTouch.timestamp - startTouch.current.timestamp;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check for tap (short duration, small movement)
    if (distance < threshold && deltaTime < 300 && onTap) {
      onTap();
      return;
    }

    // Check for swipe gestures
    if (distance > threshold) {
      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      
      if (Math.abs(angle) < 45) {
        // Right swipe
        onSwipeRight?.();
      } else if (Math.abs(angle) > 135) {
        // Left swipe
        onSwipeLeft?.();
      } else if (angle > 45 && angle < 135) {
        // Down swipe
        onSwipeDown?.();
      } else if (angle < -45 && angle > -135) {
        // Up swipe
        onSwipeUp?.();
      }
    }

    startTouch.current = null;
    setIsLongPressing(false);
  }, [isLongPressing, threshold, onTap, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: elementRef,
    isLongPressing
  };
};

// Hook for detecting swipe to delete
export const useSwipeToDelete = (onDelete: () => void, threshold = 100) => {
  const [isSwipingToDelete, setIsSwipingToDelete] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const { ref } = useTouchGestures({
    onSwipeLeft: () => {
      setIsSwipingToDelete(true);
      setTimeout(() => {
        if (isSwipingToDelete) {
          onDelete();
        }
      }, 300);
    },
    threshold
  });

  return {
    ref,
    isSwipingToDelete,
    swipeProgress,
    resetSwipe: () => {
      setIsSwipingToDelete(false);
      setSwipeProgress(0);
    }
  };
};

// Hook for pull to refresh
export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling) return;

    currentY.current = e.touches[0].clientY;
    const pullDistance = Math.max(0, currentY.current - startY.current);
    
    if (pullDistance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(pullDistance, 100));
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: containerRef,
    isPulling,
    pullDistance,
    isRefreshing
  };
};