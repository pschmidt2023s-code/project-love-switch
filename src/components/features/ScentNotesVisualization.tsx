import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Note {
  name: string;
  intensity?: number;
}

interface ScentNotesVisualizationProps {
  topNotes: Note[] | string[];
  middleNotes: Note[] | string[];
  baseNotes: Note[] | string[];
  className?: string;
}

const normalizeNotes = (notes: Note[] | string[]): Note[] => {
  return notes.map(note => 
    typeof note === 'string' ? { name: note, intensity: 0.8 } : note
  );
};

const noteColors = {
  top: { bg: 'from-amber-400/20 to-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', glow: 'shadow-amber-500/20' },
  middle: { bg: 'from-rose-400/20 to-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-600 dark:text-rose-400', glow: 'shadow-rose-500/20' },
  base: { bg: 'from-stone-400/20 to-stone-500/10', border: 'border-stone-500/30', text: 'text-stone-600 dark:text-stone-400', glow: 'shadow-stone-500/20' },
};

export function ScentNotesVisualization({
  topNotes,
  middleNotes,
  baseNotes,
  className = '',
}: ScentNotesVisualizationProps) {
  const [activeLayer, setActiveLayer] = useState<'top' | 'middle' | 'base' | null>(null);
  
  const normalizedTop = normalizeNotes(topNotes);
  const normalizedMiddle = normalizeNotes(middleNotes);
  const normalizedBase = normalizeNotes(baseNotes);

  const layers = [
    { id: 'top', label: 'Kopfnote', sublabel: '0-30 Min', notes: normalizedTop, colors: noteColors.top, delay: 0 },
    { id: 'middle', label: 'Herznote', sublabel: '30 Min - 3 Std', notes: normalizedMiddle, colors: noteColors.middle, delay: 0.1 },
    { id: 'base', label: 'Basisnote', sublabel: '3+ Stunden', notes: normalizedBase, colors: noteColors.base, delay: 0.2 },
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Visual Pyramid */}
      <div className="relative flex flex-col items-center gap-3">
        {layers.map((layer, index) => (
          <motion.div
            key={layer.id}
            className="relative group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: layer.delay }}
            onMouseEnter={() => setActiveLayer(layer.id as 'top' | 'middle' | 'base')}
            onMouseLeave={() => setActiveLayer(null)}
            onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id as 'top' | 'middle' | 'base')}
          >
            {/* Pyramid Layer */}
            <motion.div
              className={`relative overflow-hidden border ${layer.colors.border} transition-all duration-500`}
              style={{
                width: `${180 + index * 60}px`,
                clipPath: index === 0 ? 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' : 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)',
              }}
              animate={{
                scale: activeLayer === layer.id ? 1.05 : 1,
                boxShadow: activeLayer === layer.id ? `0 0 30px rgba(180, 140, 70, 0.3)` : '0 0 0 transparent',
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-b ${layer.colors.bg}`} />
              
              {/* Animated Particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full ${layer.colors.text} opacity-40`}
                    initial={{ y: '100%', x: `${20 + i * 15}%` }}
                    animate={{
                      y: activeLayer === layer.id ? ['-20%', '100%'] : '100%',
                      opacity: activeLayer === layer.id ? [0.6, 0] : 0,
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: activeLayer === layer.id ? Infinity : 0,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
              
              {/* Content */}
              <div className="relative p-4 text-center">
                <p className={`text-[10px] tracking-[0.2em] uppercase font-medium ${layer.colors.text}`}>
                  {layer.label}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {layer.sublabel}
                </p>
              </div>
            </motion.div>

            {/* Connection Line */}
            {index < 2 && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 w-px h-3 bg-gradient-to-b from-border to-transparent"
                style={{ bottom: '-12px' }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Notes Display */}
      <AnimatePresence mode="wait">
        {layers.map((layer) => (
          activeLayer === layer.id && (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className={`p-4 rounded-lg border ${layer.colors.border} bg-gradient-to-br ${layer.colors.bg}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${layer.colors.text.replace('text-', 'bg-')}`} />
                  <span className={`text-sm font-medium ${layer.colors.text}`}>{layer.label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {layer.notes.map((note, i) => (
                    <motion.span
                      key={note.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`px-3 py-1.5 text-xs rounded-full border ${layer.colors.border} ${layer.colors.text} bg-background/50 backdrop-blur-sm`}
                    >
                      {note.name}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Hint Text */}
      {!activeLayer && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground"
        >
          Tippe auf eine Ebene, um die Duftnoten zu sehen
        </motion.p>
      )}
    </div>
  );
}