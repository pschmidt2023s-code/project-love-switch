import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Tag } from 'lucide-react';

export function PromoBanner() {
  const [banner, setBanner] = useState<{ enabled: boolean; message: string; link: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('settings')
        .select('announce_bar_enabled, announce_bar_message, announce_bar_link')
        .eq('id', 'shop_settings')
        .maybeSingle();

      if (data && data.announce_bar_enabled && data.announce_bar_message) {
        setBanner({
          enabled: true,
          message: data.announce_bar_message,
          link: data.announce_bar_link || '',
        });
      }
    }
    fetchSettings();
  }, []);

  if (!banner?.enabled || dismissed) return null;

  return (
    <div className="relative bg-accent text-accent-foreground">
      <div className="container-premium py-3 flex items-center justify-center gap-3">
        <Tag className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
        {banner.link ? (
          <a href={banner.link} className="text-xs tracking-wide hover:underline">
            {banner.message}
          </a>
        ) : (
          <p className="text-xs tracking-wide">{banner.message}</p>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
          aria-label="Banner schließen"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
