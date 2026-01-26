import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Package, ShoppingBag, TrendingUp } from 'lucide-react';

interface LiveEvent {
  id: string;
  type: 'view' | 'purchase' | 'low_stock';
  message: string;
  timestamp: Date;
}

export function LiveIndicators() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<LiveEvent | null>(null);

  // Simulate live events (in production, this would use Supabase Realtime)
  useEffect(() => {
    const productNames = [
      'ALDENAIR 111',
      'ALDENAIR 632',
      'ALDENAIR 888',
      'ALDENAIR Prestige',
    ];
    const cities = ['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt', 'Stuttgart'];
    
    const generateEvent = (): LiveEvent => {
      const types: LiveEvent['type'][] = ['view', 'purchase', 'low_stock'];
      const type = types[Math.floor(Math.random() * types.length)];
      const product = productNames[Math.floor(Math.random() * productNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      let message = '';
      switch (type) {
        case 'view':
          message = `Jemand aus ${city} sieht sich ${product} an`;
          break;
        case 'purchase':
          message = `${product} wurde gerade in ${city} gekauft`;
          break;
        case 'low_stock':
          message = `${product} - Nur noch wenige verfügbar!`;
          break;
      }
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message,
        timestamp: new Date(),
      };
    };

    // Show initial event after 5 seconds
    const initialTimeout = setTimeout(() => {
      const event = generateEvent();
      setEvents([event]);
      setCurrentEvent(event);
    }, 5000);

    // Generate new events periodically
    const interval = setInterval(() => {
      const event = generateEvent();
      setEvents(prev => [event, ...prev].slice(0, 10));
      setCurrentEvent(event);
      
      // Hide event after 5 seconds
      setTimeout(() => {
        setCurrentEvent(null);
      }, 5000);
    }, 15000 + Math.random() * 20000); // Random interval between 15-35 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const getIcon = (type: LiveEvent['type']) => {
    switch (type) {
      case 'view':
        return <Eye className="w-4 h-4" />;
      case 'purchase':
        return <ShoppingBag className="w-4 h-4" />;
      case 'low_stock':
        return <Package className="w-4 h-4" />;
    }
  };

  const getColors = (type: LiveEvent['type']) => {
    switch (type) {
      case 'view':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'purchase':
        return 'bg-success/10 text-success border-success/20';
      case 'low_stock':
        return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  return (
    <AnimatePresence>
      {currentEvent && (
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, x: -100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.9 }}
          className="fixed bottom-24 md:bottom-6 left-4 z-40"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl shadow-lg ${getColors(currentEvent.type)}`}>
            <div className="flex-shrink-0">
              {getIcon(currentEvent.type)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{currentEvent.message}</span>
              <span className="text-xs opacity-70">Gerade eben</span>
            </div>
            {currentEvent.type === 'purchase' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-success animate-pulse"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
