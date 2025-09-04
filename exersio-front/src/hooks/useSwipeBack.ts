import { useEffect, useRef } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useIsMobile } from './useIsMobile';

interface SwipeBackOptions {
  /** Minimum distance to trigger swipe (default: 100px) */
  minDistance?: number;
  /** Maximum vertical movement allowed (default: 100px) */
  maxVertical?: number;
  /** Minimum horizontal velocity (default: 0.3 px/ms) */
  minVelocity?: number;
  /** Enable/disable swipe back (default: true) */
  enabled?: boolean;
  /** Custom back handler (overrides default navigation) */
  onSwipeBack?: () => void;
}

export function useSwipeBack(options: SwipeBackOptions = {}) {
  const {
    minDistance = 100,
    maxVertical = 100,
    minVelocity = 0.3,
    enabled = true,
    onSwipeBack
  } = options;

  const { goBack } = useNavigation();
  const isMobile = useIsMobile();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const startTouch = touchStartRef.current;
      
      const deltaX = touch.clientX - startTouch.x;
      const deltaY = Math.abs(touch.clientY - startTouch.y);
      const deltaTime = Date.now() - startTouch.time;
      const velocity = Math.abs(deltaX) / deltaTime;

      // Check if it's a valid right swipe (left to right)
      if (
        deltaX > minDistance && // Sufficient horizontal distance
        deltaY < maxVertical && // Limited vertical movement
        velocity > minVelocity && // Minimum velocity
        startTouch.x < 50 // Started from left edge of screen
      ) {
        if (onSwipeBack) {
          onSwipeBack();
        } else {
          goBack();
        }
      }

      touchStartRef.current = null;
    };

    const handleTouchCancel = () => {
      touchStartRef.current = null;
    };

    // Add listeners to document or specific element
    const target = elementRef.current || document;
    
    target.addEventListener('touchstart', handleTouchStart, { passive: true });
    target.addEventListener('touchend', handleTouchEnd, { passive: true });
    target.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchend', handleTouchEnd);
      target.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [enabled, isMobile, minDistance, maxVertical, minVelocity, onSwipeBack, goBack]);

  return {
    /** Ref to attach swipe detection to specific element */
    swipeRef: elementRef,
    /** Whether swipe back is enabled */
    isEnabled: enabled && isMobile
  };
}