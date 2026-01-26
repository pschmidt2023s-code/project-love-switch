import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground px-4 py-2"
        >
          <div className="container mx-auto flex items-center justify-center gap-2 text-sm">
            <WifiOff className="w-4 h-4" />
            <span>Du bist offline. Einige Funktionen sind möglicherweise eingeschränkt.</span>
          </div>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-success text-success-foreground px-4 py-2"
        >
          <div className="container mx-auto flex items-center justify-center gap-2 text-sm">
            <Wifi className="w-4 h-4" />
            <span>Verbindung wiederhergestellt!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
