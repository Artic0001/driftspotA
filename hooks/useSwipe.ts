
import { useEffect, useRef } from 'react';

interface SwipeOptions {
  onSwipeBack: () => void;
  threshold?: number;
  edgeThreshold?: number;
}

export const useSwipe = ({ onSwipeBack, threshold = 100, edgeThreshold = 50 }: SwipeOptions) => {
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };

      const diffX = touchEnd.x - touchStartRef.current.x;
      const diffY = touchEnd.y - touchStartRef.current.y;

      // Logic:
      // 1. Swipe must be from left to right (diffX > 0)
      // 2. Swipe distance > threshold
      // 3. Start position must be near the left edge (touchStart.x < edgeThreshold)
      // 4. Horizontal movement must be significantly larger than vertical movement (to avoid scrolling triggers)
      
      if (
        diffX > threshold && 
        Math.abs(diffX) > Math.abs(diffY * 2) &&
        touchStartRef.current.x < edgeThreshold
      ) {
        onSwipeBack();
      }

      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeBack, threshold, edgeThreshold]);
};
