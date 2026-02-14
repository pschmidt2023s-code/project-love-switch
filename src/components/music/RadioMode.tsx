import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Track, useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { calculateRadioState, extractYouTubeId, getScheduledTrack, ScheduleEntry } from '@/lib/radio-sync';
import { YouTubePlayer } from './YouTubePlayer';
import { RadioScheduleManager } from './RadioScheduleManager';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radio, Disc3, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function RadioMode() {
  const { isAdmin } = useAdminRole();
  const queryClient = useQueryClient();
  const player = useMusicPlayer();
  const [radioActive, setRadioActive] = useState(false);
  const [ytVideoId, setYtVideoId] = useState<string | null>(null);
  const [currentRadioTrack, setCurrentRadioTrack] = useState<Track | null>(null);
  // Track which leak tracks have already been played this session (one-time only)
  const [playedLeaks, setPlayedLeaks] = useState<Set<string>>(new Set());

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
      return data as { id: string; is_live: boolean; loop_start_epoch: number; mode: string };
    },
  });

  // Fetch ALL tracks including hidden (for radio playback of leaks)
  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks-radio-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as (Track & { youtube_url?: string; is_hidden?: boolean })[];
    },
  });

  // Fetch schedule
  const { data: schedule = [] } = useQuery({
    queryKey: ['radio-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radio_schedule')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data as ScheduleEntry[];
    },
  });

  // Toggle radio
  const toggleRadioMutation = useMutation({
    mutationFn: async (isLive: boolean) => {
      const { error } = await supabase
        .from('radio_config')
        .update({ is_live: isLive, loop_start_epoch: Math.floor(Date.now() / 1000) })
        .eq('id', 'default');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radio-config'] });
      toast.success(radioConfig?.is_live ? 'Radio gestoppt' : 'Radio ist LIVE!');
    },
  });

  // Change mode
  const modeMutation = useMutation({
    mutationFn: async (mode: string) => {
      const { error } = await supabase
        .from('radio_config')
        .update({ mode })
        .eq('id', 'default');
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['radio-config'] }),
  });

  // Sync loop
  useEffect(() => {
    if (!radioActive || !radioConfig?.is_live || tracks.length === 0) return;

    const tick = () => {
      let track: (Track & { youtube_url?: string; is_hidden?: boolean }) | null = null;
      let isFromSchedule = false;
      const nonHiddenTracks = tracks.filter(t => !(t as any).is_hidden);

      // Check scheduled tracks first (if mode is 'scheduled' or 'hybrid')
      if (radioConfig.mode !== 'rotation') {
        const scheduled = getScheduledTrack(schedule, tracks);
        if (scheduled) {
          track = scheduled as Track & { youtube_url?: string; is_hidden?: boolean };
          isFromSchedule = true;
        }
      }

      // If the scheduled track is a leak that was already played,
      // only skip if there are public tracks to fall back to
      if (track && (track as any).is_hidden && playedLeaks.has(track.id) && nonHiddenTracks.length > 0) {
        track = null;
        isFromSchedule = false;
      }

      // Fallback to rotation (only non-hidden tracks)
      if (!track && nonHiddenTracks.length > 0) {
        const state = calculateRadioState(nonHiddenTracks, radioConfig.loop_start_epoch);
        if (state) track = state.currentTrack as Track & { youtube_url?: string };
      }

      if (!track) {
        return;
      }
      console.log('[Radio] Playing track:', track.title, 'audio_url:', track.audio_url?.substring(0, 60));
      setCurrentRadioTrack(track);

      // Mark leak as played after first play (for future skipping when alternatives exist)
      if (isFromSchedule && (track as any).is_hidden && !playedLeaks.has(track.id)) {
        setPlayedLeaks(prev => new Set(prev).add(track!.id));
      }

      // Play the track via HTML Audio - use track.id to avoid restarting
      setYtVideoId(null);
      const alreadyPlaying = player.currentTrack?.id === track.id && player.isPlaying;
      if (!alreadyPlaying) {
        player.setQueue(nonHiddenTracks.length > 0 ? nonHiddenTracks : [track]);
        player.play(track);
        if (!isFromSchedule && nonHiddenTracks.length > 0) {
          const state = calculateRadioState(nonHiddenTracks, radioConfig.loop_start_epoch);
          if (state) {
            setTimeout(() => player.seek(state.positionInTrack), 200);
          }
        }
      }
    };

    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, [radioActive, radioConfig, tracks, schedule, playedLeaks]);

  const isLive = radioConfig?.is_live ?? false;

  return (
    <div className="p-6 rounded-xl bg-card border border-border space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
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
                  <Wifi className="h-3 w-3 text-destructive" /> LIVE · {radioConfig?.mode === 'scheduled' ? 'Sendeplan' : radioConfig?.mode === 'hybrid' ? 'Hybrid' : 'Rotation'} · {tracks.length} Tracks
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

      {/* Admin: Mode selector */}
      {isAdmin && (
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <Label className="text-sm text-muted-foreground">Modus:</Label>
          <Select value={radioConfig?.mode || 'rotation'} onValueChange={v => modeMutation.mutate(v)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rotation">Playlist-Rotation</SelectItem>
              <SelectItem value="scheduled">Sendeplan (Uhrzeiten)</SelectItem>
              <SelectItem value="hybrid">Hybrid (Sendeplan + Rotation)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Admin: Schedule manager */}
      {isAdmin && radioConfig?.mode !== 'rotation' && (
        <div className="pt-2 border-t border-border">
          <RadioScheduleManager />
        </div>
      )}

      {/* Hidden YouTube player */}
      {radioActive && ytVideoId && (
        <YouTubePlayer
          videoId={ytVideoId}
          isPlaying={radioActive}
          volume={player.volume}
          isMuted={player.isMuted}
          onEnded={() => {}}
        />
      )}

      {/* Currently playing */}
      {radioActive && isLive && currentRadioTrack && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-medium">
              {(currentRadioTrack as any).is_hidden && !isAdmin
                ? 'Exklusiver Leak läuft...'
                : `Jetzt: ${currentRadioTrack.title}`}
            </span>
            {(!((currentRadioTrack as any).is_hidden) || isAdmin) && (
              <span className="text-xs text-muted-foreground">von {currentRadioTrack.artist}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
