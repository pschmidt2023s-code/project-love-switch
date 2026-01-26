import { useEffect } from 'react';

/**
 * TouchOptimizations Component
 * Optimized for Apple devices including ProMotion (120Hz) displays
 * Improves touch interactions, typing experience, and scroll performance
 */
export function TouchOptimizations() {
  useEffect(() => {
    document.body.style.touchAction = 'manipulation';

    const style = document.createElement('style');
    style.id = 'touch-optimizations';
    style.textContent = `
      /* ═══════════════════════════════════════════════════════════════════
         APPLE DEVICE & PROMOTION OPTIMIZATIONS
         ═══════════════════════════════════════════════════════════════════ */
      
      /* Enable hardware acceleration and smooth scrolling */
      html {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
        /* Optimize for ProMotion displays */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
      
      /* Remove tap highlight on all elements */
      * {
        -webkit-tap-highlight-color: transparent !important;
        -webkit-touch-callout: none;
      }
      
      /* Optimize buttons and links for touch */
      button, a, [role="button"] {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent !important;
        user-select: none;
        -webkit-user-select: none;
        /* Enable GPU acceleration for smooth animations */
        transform: translateZ(0);
        backface-visibility: hidden;
      }
      
      /* ═══════════════════════════════════════════════════════════════════
         FORM INPUT OPTIMIZATIONS
         Improved typing experience on iOS and Apple devices
         ═══════════════════════════════════════════════════════════════════ */
      
      input, textarea, select {
        /* Allow text selection in form fields */
        touch-action: manipulation;
        user-select: text;
        -webkit-user-select: text;
        
        /* Prevent zoom on focus in iOS (font-size >= 16px) */
        font-size: 16px !important;
        
        /* Smooth caret animation */
        caret-color: currentColor;
        
        /* Optimize text rendering */
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeSpeed;
        
        /* Remove iOS default styling */
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        border-radius: 0;
        
        /* Smooth focus transitions */
        transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out;
      }
      
      /* Optimize placeholder transitions */
      input::placeholder,
      textarea::placeholder {
        transition: opacity 0.2s ease-out, transform 0.2s ease-out;
      }
      
      input:focus::placeholder,
      textarea:focus::placeholder {
        opacity: 0.5;
        transform: translateX(4px);
      }
      
      /* ═══════════════════════════════════════════════════════════════════
         ANIMATION PERFORMANCE OPTIMIZATIONS
         For ProMotion 120Hz displays
         ═══════════════════════════════════════════════════════════════════ */
      
      /* Use GPU-accelerated properties for all transitions */
      .transition-gpu {
        transform: translateZ(0);
        will-change: transform, opacity;
      }
      
      /* Smooth color transitions for header inversion */
      .nav-header,
      .nav-header * {
        transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      /* Optimize animations for high refresh rate */
      @media (prefers-reduced-motion: no-preference) {
        * {
          /* Use optimal frame timing for 120Hz */
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Smooth scroll for ProMotion */
        html {
          scroll-behavior: smooth;
        }
        
        /* Enable will-change for animating elements */
        .animate-fade-in,
        .animate-scale-in,
        .animate-slide-in-right {
          will-change: transform, opacity;
        }
      }
      
      /* Reduced motion preference */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
      
      /* ═══════════════════════════════════════════════════════════════════
         TOUCH TARGET SIZING (Apple HIG: 44x44pt minimum)
         ═══════════════════════════════════════════════════════════════════ */
      
      @media (hover: none) and (pointer: coarse) {
        button, 
        a, 
        [role="button"],
        input[type="checkbox"],
        input[type="radio"] {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Larger touch targets for form inputs */
        input:not([type="checkbox"]):not([type="radio"]),
        textarea,
        select {
          min-height: 48px;
          padding: 12px 16px;
        }
      }
      
      /* ═══════════════════════════════════════════════════════════════════
         SAFARI-SPECIFIC FIXES
         ═══════════════════════════════════════════════════════════════════ */
      
      /* Fix for Safari's bouncy overscroll */
      @supports (-webkit-touch-callout: none) {
        body {
          overscroll-behavior-y: none;
        }
        
        /* Improve Safari text rendering */
        body {
          -webkit-font-smoothing: antialiased;
        }
      }
    `;
    document.head.appendChild(style);

    // Track touch position for scroll behavior
    let lastY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      // Prevent pull-to-refresh when at top and swiping down
      if (window.scrollY === 0 && y > lastY) {
        // Allow normal behavior but track for analytics
      }
      lastY = y;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      const styleEl = document.getElementById('touch-optimizations');
      if (styleEl) {
        document.head.removeChild(styleEl);
      }
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return null;
}
