import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const scrollPositions = new Map<string, number>();

/**
 * Saves and restores scroll position per route.
 * Useful for back-navigation and infinite scroll lists.
 */
export function useScrollRestore() {
  const location = useLocation();
  const key = location.key || location.pathname;
  const restored = useRef(false);

  // Save scroll position before navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      scrollPositions.set(key, window.scrollY);
    };

    return () => {
      // Save on unmount (navigation)
      scrollPositions.set(key, window.scrollY);
    };
  }, [key]);

  // Restore scroll position when arriving
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const saved = scrollPositions.get(key);
    if (saved !== undefined && saved > 0) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, saved);
      });
    }
  }, [key]);
}
