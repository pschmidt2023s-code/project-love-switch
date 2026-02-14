import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 2 * 60 * 1000; // Show warning 2 min before logout
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'] as const;

export function useIdleTimeout() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const warningRef = useRef<ReturnType<typeof setTimeout>>();
  const lastActivityRef = useRef(Date.now());

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (!user) return;

    warningRef.current = setTimeout(() => {
      toast({
        title: 'Sitzung läuft ab',
        description: 'Sie werden in 2 Minuten automatisch abgemeldet. Bewegen Sie die Maus um aktiv zu bleiben.',
        duration: 10000,
      });
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    timeoutRef.current = setTimeout(() => {
      toast({
        title: 'Automatisch abgemeldet',
        description: 'Ihre Sitzung ist aus Sicherheitsgründen abgelaufen.',
        variant: 'destructive',
      });
      signOut();
    }, IDLE_TIMEOUT_MS);
  }, [user, signOut, toast]);

  useEffect(() => {
    if (!user) return;

    resetTimers();

    const handleActivity = () => {
      // Throttle: only reset if >30s since last reset
      if (Date.now() - lastActivityRef.current > 30000) {
        resetTimers();
      }
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, resetTimers]);
}
