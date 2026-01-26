import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Heart, Anchor, ChevronDown, ChevronUp } from 'lucide-react';

interface Note {
  name: string;
  intensity?: number;
}

interface ScentNotesVisualizationProps {
  topNotes: Note[] | string[];
  middleNotes: Note[] | string[];
  baseNotes: Note[] | string[];
  className?: string;
  compact?: boolean;
}

const normalizeNotes = (notes: Note[] | string[]): Note[] => {
  return notes.map(note => 
    typeof note === 'string' ? { name: note, intensity: 0.8 } : note
  );
};

const noteColors = {
  top: { 
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-900/30 dark:to-amber-800/20', 
    border: 'border-amber-300 dark:border-amber-600/50', 
    text: 'text-amber-700 dark:text-amber-400',
    icon: 'text-amber-500',
    glow: 'shadow-amber-200/50 dark:shadow-amber-500/20',
    tag: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700/50'
  },
  middle: { 
    bg: 'bg-gradient-to-br from-rose-50 to-rose-100/80 dark:from-rose-900/30 dark:to-rose-800/20', 
    border: 'border-rose-300 dark:border-rose-600/50', 
    text: 'text-rose-700 dark:text-rose-400',
    icon: 'text-rose-500',
    glow: 'shadow-rose-200/50 dark:shadow-rose-500/20',
    tag: 'bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-700/50'
  },
  base: { 
    bg: 'bg-gradient-to-br from-stone-100 to-stone-200/80 dark:from-stone-800/30 dark:to-stone-700/20', 
    border: 'border-stone-400 dark:border-stone-500/50', 
    text: 'text-stone-700 dark:text-stone-300',
    icon: 'text-stone-500',
    glow: 'shadow-stone-200/50 dark:shadow-stone-500/20',
    tag: 'bg-stone-100 dark:bg-stone-800/40 border-stone-300 dark:border-stone-600/50'
  },
};

const layerIcons = {
  top: Droplet,
  middle: Heart,
  base: Anchor,
};

export function ScentNotesVisualization({
  topNotes,
  middleNotes,
  baseNotes,
  className = '',
  compact = false,
}: ScentNotesVisualizationProps) {
  const [expandedLayer, setExpandedLayer] = useState<'top' | 'middle' | 'base' | null>(null);
  
  const normalizedTop = normalizeNotes(topNotes);
  const normalizedMiddle = normalizeNotes(middleNotes);
  const normalizedBase = normalizeNotes(baseNotes);

  const layers = [
    { id: 'top' as const, label: 'Kopfnote', sublabel: 'Erster Eindruck • 0-30 Min', notes: normalizedTop, colors: noteColors.top, Icon: layerIcons.top },
    { id: 'middle' as const, label: 'Herznote', sublabel: 'Charakter • 30 Min - 3 Std', notes: normalizedMiddle, colors: noteColors.middle, Icon: layerIcons.middle },
    { id: 'base' as const, label: 'Basisnote', sublabel: 'Fondation • 3+ Stunden', notes: normalizedBase, colors: noteColors.base, Icon: layerIcons.base },
  ];

  const toggleLayer = (layerId: 'top' | 'middle' | 'base') => {
    setExpandedLayer(expandedLayer === layerId ? null : layerId);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="font-display text-lg text-foreground mb-1">Duftpyramide</h3>
        <p className="text-xs text-muted-foreground">Entdecke die Schichten dieses Duftes</p>
      </div>

      {/* Pyramid Layers */}
      <div className="space-y-3">
        {layers.map((layer, index) => {
          const isExpanded = expandedLayer === layer.id;
          const Icon = layer.Icon;
          
          return (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="w-full"
            >
              {/* Layer Card */}
              <button
                onClick={() => toggleLayer(layer.id)}
                className={`w-full p-4 border transition-all duration-300 ${layer.colors.border} ${layer.colors.bg} ${
                  isExpanded ? `shadow-lg ${layer.colors.glow}` : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 flex items-center justify-center bg-white/60 dark:bg-black/20 ${layer.colors.border} border`}>
                      <Icon className={`w-5 h-5 ${layer.colors.icon}`} strokeWidth={1.5} />
                    </div>
                    
                    {/* Labels */}
                    <div className="text-left">
                      <p className={`font-medium text-sm ${layer.colors.text}`}>{layer.label}</p>
                      <p className="text-[10px] text-muted-foreground">{layer.sublabel}</p>
                    </div>
                  </div>
                  
                  {/* Note count + Expand icon */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium ${layer.colors.text} opacity-70`}>
                      {layer.notes.length} {layer.notes.length === 1 ? 'Note' : 'Noten'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className={`w-4 h-4 ${layer.colors.text}`} strokeWidth={1.5} />
                    ) : (
                      <ChevronDown className={`w-4 h-4 ${layer.colors.text}`} strokeWidth={1.5} />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Notes */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-4 border border-t-0 ${layer.colors.border} bg-background/50`}>
                      <div className="flex flex-wrap gap-2">
                        {layer.notes.map((note, i) => (
                          <motion.span
                            key={note.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`px-3 py-1.5 text-xs border ${layer.colors.tag} ${layer.colors.text}`}
                          >
                            {note.name}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Pyramid Indicator */}
      <div className="flex justify-center pt-4">
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
          <div className="w-16 h-1 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full" />
          <div className="w-24 h-1 bg-gradient-to-r from-stone-400 to-stone-500 rounded-full" />
          <p className="text-[9px] text-muted-foreground mt-2 tracking-wider uppercase">Duftentwicklung über Zeit</p>
        </div>
      </div>
    </div>
  );
}
