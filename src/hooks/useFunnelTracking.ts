import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate or retrieve session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('funnel_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('funnel_session_id', sessionId);
  }
  return sessionId;
}

export function useFunnelTracking() {
  const trackEvent = useCallback(async (step: string, page?: string, metadata?: Record<string, unknown>) => {
    try {
      const sessionId = getSessionId();
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('funnel_events').insert([{
        session_id: sessionId,
        user_id: user?.id || null,
        step,
        page: page || window.location.pathname,
        metadata: (metadata || {}) as any,
      }]);
    } catch (e) {
      // Silent fail - don't block UX for tracking
      console.debug('Funnel tracking error:', e);
    }
  }, []);

  // Track page views automatically
  useEffect(() => {
    trackEvent('page_view');
  }, [trackEvent]);

  return { trackEvent };
}
