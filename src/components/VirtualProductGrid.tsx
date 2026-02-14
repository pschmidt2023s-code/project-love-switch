import { useRef, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface VirtualProductGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  rowHeight?: number;
  overscan?: number;
  className?: string;
}

/**
 * Lightweight Virtual Scrolling Grid using scroll-position tracking.
 * Only renders visible rows + overscan for dramatically better performance on 100+ items.
 * Falls back to normal rendering for small lists (<24 items).
 */
export function VirtualProductGrid<T>({
  items,
  renderItem,
  rowHeight = 480,
  overscan = 3,
  className,
}: VirtualProductGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 8 });

  const columnCount = isMobile ? 2 : 4;
  const rowCount = Math.ceil(items.length / columnCount);
  const isSmallList = items.length < 24;

  // Virtualization via scroll position tracking
  useEffect(() => {
    if (isSmallList) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const containerTop = containerRef.current?.offsetTop || 0;
      const viewportHeight = window.innerHeight;

      const relativeScroll = scrollTop - containerTop;
      const startRow = Math.max(0, Math.floor(relativeScroll / rowHeight) - overscan);
      const endRow = Math.min(
        rowCount,
        Math.ceil((relativeScroll + viewportHeight) / rowHeight) + overscan
      );

      setVisibleRange({ start: startRow, end: endRow });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isSmallList, rowCount, rowHeight, overscan]);

  // Small list: regular rendering
  if (isSmallList) {
    return (
      <div ref={containerRef} className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 ${className || ''}`}>
        {items.map((item, i) => renderItem(item, i))}
      </div>
    );
  }

  // Large list: virtualized rendering
  const totalHeight = rowCount * rowHeight;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', height: totalHeight }}
    >
      {Array.from({ length: visibleRange.end - visibleRange.start }, (_, rowOffset) => {
        const rowIndex = visibleRange.start + rowOffset;
        const startItemIndex = rowIndex * columnCount;

        return (
          <div
            key={rowIndex}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 absolute left-0 right-0"
            style={{
              top: rowIndex * rowHeight,
              height: rowHeight,
            }}
          >
            {Array.from({ length: columnCount }, (_, colIndex) => {
              const itemIndex = startItemIndex + colIndex;
              if (itemIndex >= items.length) return null;
              return (
                <div key={itemIndex}>
                  {renderItem(items[itemIndex], itemIndex)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
