import { useEffect, useRef, useState } from 'react';

interface GestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => Promise<void>;
  onLongPress?: () => void;
  enableHaptic?: boolean;
  swipeThreshold?: number;
}

export function useAdvancedGestures(options: GestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    onLongPress,
    enableHaptic = true,
    swipeThreshold = 50,
  } = options;

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (enableHaptic && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;

    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        triggerHaptic('heavy');
        onLongPress();
      }, 500);
    }

    if (onPullToRefresh && window.scrollY === 0) {
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;

    if (isPulling && onPullToRefresh) {
      const distance = touchEndY.current - touchStartY.current;
      if (distance > 0) {
        setPullDistance(distance);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    const diffX = touchEndX.current - touchStartX.current;
    const diffY = touchEndY.current - touchStartY.current;

    if (isPulling && onPullToRefresh && pullDistance > 80) {
      triggerHaptic('medium');
      await onPullToRefresh();
    }

    setIsPulling(false);
    setPullDistance(0);

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0 && onSwipeRight) {
          triggerHaptic('light');
          onSwipeRight();
        } else if (diffX < 0 && onSwipeLeft) {
          triggerHaptic('light');
          onSwipeLeft();
        }
      }
    } else {
      if (Math.abs(diffY) > swipeThreshold) {
        if (diffY > 0 && onSwipeDown) {
          triggerHaptic('light');
          onSwipeDown();
        } else if (diffY < 0 && onSwipeUp) {
          triggerHaptic('light');
          onSwipeUp();
        }
      }
    }

    touchEndX.current = touchStartX.current;
    touchEndY.current = touchStartY.current;
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [isPulling, pullDistance]);

  return { isPulling, pullDistance };
}
