import { useEffect } from 'react';

export function TouchOptimizations() {
  useEffect(() => {
    document.body.style.touchAction = 'manipulation';

    const style = document.createElement('style');
    style.textContent = `
      button, a, [role="button"] {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent !important;
        user-select: none;
        -webkit-user-select: none;
      }

      input, textarea, select {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent !important;
        user-select: text;
        -webkit-user-select: text;
      }

      * {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
        -webkit-touch-callout: none;
      }

      @media (hover: none) and (pointer: coarse) {
        button, a, [role="button"] {
          min-height: 44px;
          min-width: 44px;
        }
      }

      html {
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);

    let lastY = 0;
    const preventPullToRefresh = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      if (window.scrollY === 0 && y > lastY) {
        // Do nothing - allow normal behavior
      }
      lastY = y;
    };

    document.addEventListener('touchstart', (e) => {
      lastY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', preventPullToRefresh, { passive: true });

    return () => {
      document.head.removeChild(style);
      document.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);

  return null;
}
