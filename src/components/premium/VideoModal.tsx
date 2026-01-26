import { useState, useEffect } from 'react';
import { X, Play, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  const [isMuted, setIsMuted] = useState(true);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Default video - brand showcase
  const defaultVideoContent = (
    <div className="relative w-full h-full bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(180,140,70,0.2)_0%,transparent_60%)]" />
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-amber-500 font-medium mb-6">
            Premium Parfüm Kollektion
          </span>
          
          <h2 className="font-display text-4xl md:text-6xl text-white mb-6 leading-tight">
            ALDENAIR
          </h2>
          
          <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-8">
            Entdecke die Kunst der Parfümerie. Luxusdüfte, inspiriert von weltbekannten Marken.
          </p>

          {/* Animated perfume bottle silhouette */}
          <motion.div
            className="w-24 h-32 mx-auto mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <svg viewBox="0 0 100 140" className="w-full h-full">
              {/* Bottle cap */}
              <motion.rect 
                x="35" y="0" width="30" height="20" rx="2"
                fill="none" stroke="rgba(180,140,70,0.6)" strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              {/* Bottle neck */}
              <motion.rect 
                x="40" y="20" width="20" height="15" 
                fill="none" stroke="rgba(180,140,70,0.6)" strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              />
              {/* Bottle body */}
              <motion.path 
                d="M20 45 L20 130 Q20 140 30 140 L70 140 Q80 140 80 130 L80 45 Q80 35 70 35 L30 35 Q20 35 20 45"
                fill="none" stroke="rgba(180,140,70,0.8)" strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.7 }}
              />
              {/* Liquid level */}
              <motion.rect 
                x="25" y="60" width="50" height="70" rx="5"
                fill="url(#goldGradient)" opacity="0.4"
                initial={{ height: 0, y: 130 }}
                animate={{ height: 70, y: 60 }}
                transition={{ duration: 1.5, delay: 1.2 }}
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#B4A04A" />
                  <stop offset="100%" stopColor="#8B7A3A" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex items-center justify-center gap-8"
          >
            <div className="text-center">
              <p className="text-2xl font-display text-amber-500">500+</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Düfte</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-display text-amber-500">10k+</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Kunden</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-display text-amber-500">4.8★</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Bewertung</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl aspect-video mx-4"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
              <span className="sr-only">Schließen</span>
            </button>

            {/* Video Content */}
            <div className="w-full h-full overflow-hidden border border-white/10">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                />
              ) : (
                defaultVideoContent
              )}
            </div>

            {/* Controls */}
            {videoUrl && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 p-3 bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                )}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
