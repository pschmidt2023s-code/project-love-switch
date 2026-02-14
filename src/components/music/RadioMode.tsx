import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Track, useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { calculateRadioState, extractYouTubeId } from '@/lib/radio-sync';
import { YouTubePlayer } from './YouTubePlayer';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Radio, Disc3, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function RadioMode() {
  const { isAdmin } = useAdminRole();
  const queryClient = useQueryClient();
  const player = useMusicPlayer();
  const [radioActive, setRadioActive] = useState(false);
  const [ytVideoId, setYtVideoId] = useState<string | null>(null);

  // Fetch radio config
  const { data: radioConfig } = useQuery({
    queryKey: ['radio-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radio_config')
        .select('*')
        .eq('id', 'default')
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch all tracks for radio rotation
  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as (Track & { youtube_url?: string })[];
    },
  });

  // Toggle radio live status (admin only)
  const toggleRadioMutation = useMutation({
    mutationFn: async (isLive: boolean) => {
      const { error } = await supabase
        .from('radio_config')
        .update({ 
          is_live: isLive, 
          loop_start_epoch: Math.floor(Date.now() / 1000),
        })
        .eq('id', 'default');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radio-config'] });
      toast.success(radioConfig?.is_live ? 'Radio gestoppt' : 'Radio ist LIVE!');
    },
  });

  // Calculate current radio state every second
  useEffect(() => {
    if (!radioActive || !radioConfig?.is_live || tracks.length === 0) return;

    const tick = () => {
      const state = calculateRadioState(tracks, radioConfig.loop_start_epoch);
      if (!state) return;

      const track = state.currentTrack as Track & { youtube_url?: string };
      
      // Check if it's a YouTube track
      const ytId = track.youtube_url ? extractYouTubeId(track.youtube_url) : null;
      
      if (ytId) {
        setYtVideoId(ytId);
        // Pause native audio if YouTube track
        if (player.isPlaying && player.currentTrack?.id !== track.id) {
          player.pause();
        }
      } else {
        setYtVideoId(null);
        // Use native audio player
        if (player.currentTrack?.id !== track.id) {
          player.setQueue(tracks);
          player.play(track);
          // Seek to correct position
          setTimeout(() => player.seek(state.positionInTrack), 200);
        }
      }
    };

    tick();
    const interval = setInterval(tick, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [radioActive, radioConfig, tracks]);

  const isLive = radioConfig?.is_live ?? false;

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isLive ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted text-muted-foreground"
          )}>
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">ALDENAIR Radio</h3>
            <p className="text-sm text-muted-foreground">
              {isLive ? (
                <span className="flex items-center gap-1">
                  <Wifi className="h-3 w-3 text-destructive" /> LIVE – {tracks.length} Tracks in Rotation
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" /> Offline
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLive && (
            <Button
              variant={radioActive ? 'default' : 'outline'}
              onClick={() => setRadioActive(!radioActive)}
              className="gap-2"
            >
              <Disc3 className={cn("h-4 w-4", radioActive && "animate-spin")} style={{ animationDuration: '3s' }} />
              {radioActive ? 'Hört zu...' : 'Einschalten'}
            </Button>
          )}

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Label htmlFor="radio-live" className="text-sm">Live</Label>
              <Switch
                id="radio-live"
                checked={isLive}
                onCheckedChange={(v) => toggleRadioMutation.mutate(v)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Hidden YouTube player for audio */}
      {radioActive && ytVideoId && (
        <YouTubePlayer
          videoId={ytVideoId}
          isPlaying={radioActive}
          volume={player.volume}
          isMuted={player.isMuted}
          onEnded={() => {
            // Radio sync will pick up next track automatically
          }}
        />
      )}

      {/* Currently playing info */}
      {radioActive && isLive && tracks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          {(() => {
            const state = calculateRadioState(tracks, radioConfig!.loop_start_epoch);
            if (!state) return null;
            return (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm font-medium">Jetzt: {state.currentTrack.title}</span>
                <span className="text-xs text-muted-foreground">von {state.currentTrack.artist}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  Nächster: {tracks[(state.currentTrackIndex + 1) % tracks.length]?.title}
                </span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
