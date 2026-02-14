import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  aspectRatio?: string;
  children?: React.ReactNode; // overlay elements like badges, heart button
}

export function SwipeGallery({ images, alt, className, aspectRatio = '3/4', children }: SwipeGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const paginate = useCallback((newDirection: number) => {
    const next = currentIndex + newDirection;
    if (next >= 0 && next < images.length) {
      setDirection(newDirection);
      setCurrentIndex(next);
    }
  }, [currentIndex, images.length]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      paginate(1);
    } else if (info.offset.x > swipeThreshold) {
      paginate(-1);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  };

  if (images.length === 0) return null;

  return (
    <div
      ref={constraintsRef}
      className={cn('relative overflow-hidden bg-muted select-none', className)}
      style={{ aspectRatio }}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${alt} - Bild ${currentIndex + 1}`}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
          loading="lazy"
          decoding="async"
        />
      </AnimatePresence>

      {/* Desktop arrow buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            disabled={currentIndex === 0}
            className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-colors disabled:opacity-0"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => paginate(1)}
            disabled={currentIndex === images.length - 1}
            className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-colors disabled:opacity-0"
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
              className={cn(
                'w-1.5 h-1.5 transition-all duration-200',
                i === currentIndex ? 'bg-foreground w-4' : 'bg-foreground/40'
              )}
              aria-label={`Bild ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Overlay children (badges, heart, etc.) */}
      {children}
    </div>
  );
}
