import { useState, useEffect, useCallback, useRef } from 'react';

interface ColorInversionState {
  isInverted: boolean;
  isTransitioning: boolean;
}

// Routes that start with a dark hero section
const DARK_HERO_ROUTES = ['/', '/products'];

/**
 * Hook that detects if the header is over a dark or light background
 * and returns whether colors should be inverted (white on dark)
 */
export function useHeaderColorInversion(
  headerRef: React.RefObject<HTMLElement>,
  pathname: string
) {
  // Start inverted on routes known to have dark heroes
  const initialInverted = DARK_HERO_ROUTES.includes(pathname);
  
  const [state, setState] = useState<ColorInversionState>({
    isInverted: initialInverted,
    isTransitioning: false,
  });
  
  const rafRef = useRef<number>();
  const lastValueRef = useRef<boolean>(initialInverted);
  
  const checkBackgroundColor = useCallback(() => {
    if (!headerRef.current) return;
    
    const headerRect = headerRef.current.getBoundingClientRect();
    
    // Sample multiple points below the header
    const sampleY = headerRect.bottom + 20;
    const samplePoints = [
      { x: window.innerWidth * 0.25, y: sampleY },
      { x: window.innerWidth * 0.5, y: sampleY },
      { x: window.innerWidth * 0.75, y: sampleY },
    ];
    
    let darkCount = 0;
    
    // Temporarily hide header's background effect for sampling
    const originalPointerEvents = headerRef.current.style.pointerEvents;
    headerRef.current.style.pointerEvents = 'none';
    
    for (const point of samplePoints) {
      const elementBehind = document.elementFromPoint(point.x, point.y);
      
      if (!elementBehind) continue;
      
      // Check for data attribute first (most reliable)
      let element: Element | null = elementBehind;
      let foundDarkSection = false;
      
      while (element && element !== document.body) {
        if (element.hasAttribute('data-header-dark')) {
          foundDarkSection = true;
          break;
        }
        
        // Skip header element itself
        if (element === headerRef.current) {
          element = element.parentElement;
          continue;
        }
        
        // Check for explicit dark backgrounds
        const computed = window.getComputedStyle(element);
        const bg = computed.backgroundColor;
        
        // Check for background image (hero images are usually dark)
        const bgImage = computed.backgroundImage;
        if (bgImage && bgImage !== 'none' && bgImage.includes('url')) {
          foundDarkSection = true;
          break;
        }
        
        // Parse RGB and check luminance
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          const rgbMatch = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1], 10);
            const g = parseInt(rgbMatch[2], 10);
            const b = parseInt(rgbMatch[3], 10);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            if (luminance < 0.3) {
              foundDarkSection = true;
              break;
            } else if (luminance > 0.7) {
              // Light background found, stop searching
              break;
            }
          }
        }
        
        element = element.parentElement;
      }
      
      if (foundDarkSection) darkCount++;
    }
    
    // Restore pointer events
    headerRef.current.style.pointerEvents = originalPointerEvents;
    
    // If majority of sample points are on dark background, invert
    const shouldInvert = darkCount >= 2;
    
    // Only update if value changed
    if (shouldInvert !== lastValueRef.current) {
      lastValueRef.current = shouldInvert;
      setState({ isInverted: shouldInvert, isTransitioning: true });
      
      // Reset transitioning state after animation
      setTimeout(() => {
        setState(prev => ({ ...prev, isTransitioning: false }));
      }, 300);
    }
  }, [headerRef]);
  
  // Reset on route change
  useEffect(() => {
    const newInverted = DARK_HERO_ROUTES.includes(pathname);
    lastValueRef.current = newInverted;
    setState({ isInverted: newInverted, isTransitioning: false });
  }, [pathname]);
  
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(checkBackgroundColor);
    };
    
    // Initial check after a brief delay
    const initialTimer = setTimeout(checkBackgroundColor, 50);
    
    // Check on scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check on resize
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [checkBackgroundColor]);
  
  return state;
}
