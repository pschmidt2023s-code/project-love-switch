import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMusicPlayer, Track } from '@/contexts/MusicPlayerContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { PageLayout } from '@/components/PageLayout';
import { RadioMode } from '@/components/music/RadioMode';
import { LeakCountdown } from '@/components/music/LeakCountdown';
import { YouTubePlayer } from '@/components/music/YouTubePlayer';
import { extractYouTubeId } from '@/lib/radio-sync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Upload, Plus, Trash2, Sparkles, Music as MusicIcon, 
  ListMusic, Clock, Disc3, Shuffle, Youtube, EyeOff, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Music() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAdminRole();
  const player = useMusicPlayer();
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [automixing, setAutomixing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [ytVideoId, setYtVideoId] = useState<string | null>(null);
  const [ytStartAt, setYtStartAt] = useState(0);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '', artist: 'ALDENAIR',
    audioFile: null as File | null,
    externalUrl: '', isExternal: false, youtubeUrl: '',
    sourceType: 'file' as 'file' | 'url' | 'youtube',
    isHidden: false,
    scheduleTime: '', // HH:MM for leak scheduling
  });

  // Fetch ALL tracks (admin sees hidden too)
  const { data: allTracks = [], isLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as (Track & { is_hidden?: boolean })[];
    },
  });

  // Public tracks (non-hidden) for regular users
  const publicTracks = allTracks.filter(t => !t.is_hidden);
  // Display tracks: admins see all, users see only public
  const displayTracks = isAdmin ? allTracks : publicTracks;
  // For automix/playback use public tracks
  const tracks = publicTracks;

  // YouTube playback integration - when current track has youtube_url, use YT player
  useEffect(() => {
    const current = player.currentTrack;
    if (current?.youtube_url) {
      const vid = extractYouTubeId(current.youtube_url);
      console.log('[Music] Extracted YouTube ID:', vid);
      setYtVideoId(vid);
    } else {
      setYtVideoId(null);
    }
  }, [player.currentTrack?.id]);

  // Resolve YouTube URL (single video or playlist)
  const resolveYouTube = async (url: string) => {
    setResolving(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-resolve', {
        body: { url },
      });
      if (error) throw error;
      if (!data?.tracks?.length) throw new Error('Keine Tracks gefunden');

      if (data.type === 'playlist' && data.tracks.length > 1) {
        const inserts = data.tracks.map((t: any, i: number) => ({
          title: t.title,
          artist: uploadForm.artist || t.artist,
          audio_url: `https://youtube.com/watch?v=${t.videoId}`,
          youtube_url: `https://youtube.com/watch?v=${t.videoId}`,
          cover_url: t.coverUrl || null,
          duration_seconds: t.durationSeconds || null,
          is_external: true,
          is_hidden: uploadForm.isHidden,
          sort_order: allTracks.length + i,
        }));
        const { error: insertErr } = await supabase.from('tracks').insert(inserts);
        if (insertErr) throw insertErr;
        toast.success(`${data.tracks.length} Tracks ${uploadForm.isHidden ? 'als Leak ' : ''}hinzugefügt!`);
      } else {
        const t = data.tracks[0];
        const { data: inserted, error: insertErr } = await supabase.from('tracks').insert({
          title: uploadForm.title || t.title,
          artist: uploadForm.artist || t.artist,
          audio_url: `https://youtube.com/watch?v=${t.videoId}`,
          youtube_url: `https://youtube.com/watch?v=${t.videoId}`,
          cover_url: t.coverUrl || null,
          duration_seconds: t.durationSeconds || null,
          is_external: true,
          is_hidden: uploadForm.isHidden,
          sort_order: allTracks.length,
        }).select('id').single();
        if (insertErr) throw insertErr;

        // Auto-create schedule entry for leak with time
        if (uploadForm.isHidden && uploadForm.scheduleTime && inserted) {
          const [h, m] = uploadForm.scheduleTime.split(':');
          const endH = parseInt(h) + 1;
          await supabase.from('radio_schedule').insert({
            track_id: inserted.id,
            start_time: uploadForm.scheduleTime,
            end_time: `${String(endH % 24).padStart(2, '0')}:${m}`,
            priority: 10,
            is_active: true,
          });
        }
        toast.success(`YouTube Track ${uploadForm.isHidden ? 'als Leak ' : ''}hinzugefügt!`);
      }
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      setShowUpload(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || 'YouTube-Auflösung fehlgeschlagen');
    } finally {
      setResolving(false);
    }
  };

  const resetForm = () => {
    setUploadForm({ title: '', artist: 'ALDENAIR', audioFile: null, externalUrl: '', isExternal: false, youtubeUrl: '', sourceType: 'file', isHidden: false, scheduleTime: '' });
  };

  // Upload track (file/url)
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (uploadForm.sourceType === 'youtube') {
        await resolveYouTube(uploadForm.youtubeUrl);
        return;
      }

      let audioUrl = uploadForm.externalUrl;

      if (uploadForm.sourceType === 'file' && uploadForm.audioFile) {
        const path = `tracks/${Date.now()}-${uploadForm.audioFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('audio')
          .upload(path, uploadForm.audioFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('audio').getPublicUrl(path);
        audioUrl = urlData.publicUrl;
      }

      if (!audioUrl) throw new Error('Keine Audio-URL');

      const { data: inserted, error } = await supabase.from('tracks').insert({
        title: uploadForm.title,
        artist: uploadForm.artist,
        audio_url: audioUrl,
        is_external: uploadForm.sourceType !== 'file',
        is_hidden: uploadForm.isHidden,
        sort_order: allTracks.length,
      }).select('id').single();
      if (error) throw error;

      // Auto-create schedule entry for leak with time
      if (uploadForm.isHidden && uploadForm.scheduleTime && inserted) {
        const [h, m] = uploadForm.scheduleTime.split(':');
        const endH = parseInt(h) + 1;
        await supabase.from('radio_schedule').insert({
          track_id: inserted.id,
          start_time: uploadForm.scheduleTime,
          end_time: `${String(endH % 24).padStart(2, '0')}:${m}`,
          priority: 10,
          is_active: true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      setShowUpload(false);
      resetForm();
      toast.success('Track hochgeladen!');
    },
    onError: (e) => {
      if (e.message) toast.error(e.message);
    },
  });

  // Delete track
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tracks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast.success('Track gelöscht');
    },
  });

  // AI Automix
  const handleAutomix = async () => {
    if (tracks.length < 2) {
      toast.error('Mindestens 2 Tracks für Automix nötig');
      return;
    }
    setAutomixing(true);
    try {
      const { data, error } = await supabase.functions.invoke('automix', {
        body: { tracks: tracks.map(t => ({ id: t.id, title: t.title, bpm: t.bpm, genre: t.genre, mood: t.mood, energy: t.energy })) },
      });
      if (error) throw error;

      if (data?.order) {
        const reordered = data.order
          .map((id: string) => tracks.find(t => t.id === id))
          .filter(Boolean) as Track[];
        player.setQueue(reordered);
        toast.success(data.summary || 'Automix erstellt!');
      }
    } catch (e: any) {
      toast.error(e.message || 'Automix fehlgeschlagen');
    } finally {
      setAutomixing(false);
    }
  };

  const playAll = () => {
    if (tracks.length > 0) {
      player.setQueue(tracks);
    }
  };

  // Handle YouTube time updates and ended events
  const handleYtTimeUpdate = (time: number) => {
    // Sync MusicPlayerContext currentTime (optional visual sync)
  };

  const handleYtEnded = () => {
    player.next();
  };

  const handleYtDuration = (dur: number) => {
    // Could sync to player state
  };

  

  return (
    <PageLayout mainClassName="container mx-auto px-4 py-24 pb-32">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Disc3 className="h-8 w-8 text-accent" />
            Beats & Musik
          </h1>
          <p className="text-muted-foreground mt-1">{tracks.length} Tracks verfügbar</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={playAll} disabled={tracks.length === 0} className="gap-2">
            <Play className="h-4 w-4" /> Alle abspielen
          </Button>
          <Button variant="outline" onClick={handleAutomix} disabled={automixing || tracks.length < 2} className="gap-2">
            <Sparkles className={cn("h-4 w-4", automixing && "animate-spin")} />
            {automixing ? 'Mixing...' : 'AI Automix'}
          </Button>
          {isAdmin && (
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" /> Track hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Neuen Track hinzufügen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <Button 
                      variant={uploadForm.sourceType === 'file' ? 'default' : 'outline'} size="sm"
                      onClick={() => setUploadForm(f => ({ ...f, sourceType: 'file' }))}
                    >
                      <Upload className="h-3 w-3 mr-1" /> Datei
                    </Button>
                    <Button 
                      variant={uploadForm.sourceType === 'url' ? 'default' : 'outline'} size="sm"
                      onClick={() => setUploadForm(f => ({ ...f, sourceType: 'url' }))}
                    >
                      <Plus className="h-3 w-3 mr-1" /> URL
                    </Button>
                    <Button 
                      variant={uploadForm.sourceType === 'youtube' ? 'default' : 'outline'} size="sm"
                      onClick={() => setUploadForm(f => ({ ...f, sourceType: 'youtube' }))}
                    >
                      <Youtube className="h-3 w-3 mr-1" /> YouTube
                    </Button>
                  </div>

                  {/* Leak toggle */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <Label htmlFor="leak-mode" className="text-sm font-medium cursor-pointer">Leak-Modus</Label>
                      <p className="text-xs text-muted-foreground">Track ist versteckt – nur über Sendeplan spielbar</p>
                    </div>
                    <Switch
                      id="leak-mode"
                      checked={uploadForm.isHidden}
                      onCheckedChange={v => setUploadForm(f => ({ ...f, isHidden: v }))}
                    />
                  </div>

                  <div>
                    <Label>Titel {uploadForm.sourceType !== 'youtube' && '*'}</Label>
                    <Input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Artist</Label>
                    <Input value={uploadForm.artist} onChange={e => setUploadForm(f => ({ ...f, artist: e.target.value }))} />
                  </div>

                  {uploadForm.sourceType === 'youtube' ? (
                    <div>
                      <Label>YouTube URL oder Playlist *</Label>
                      <Input placeholder="https://youtube.com/watch?v=... oder Playlist-Link" value={uploadForm.youtubeUrl} onChange={e => setUploadForm(f => ({ ...f, youtubeUrl: e.target.value }))} />
                      <p className="text-xs text-muted-foreground mt-1">Einzelvideos & ganze Playlists werden erkannt – Cover wird automatisch übernommen</p>
                    </div>
                  ) : uploadForm.sourceType === 'url' ? (
                    <div>
                      <Label>Audio URL *</Label>
                      <Input placeholder="https://..." value={uploadForm.externalUrl} onChange={e => setUploadForm(f => ({ ...f, externalUrl: e.target.value }))} />
                    </div>
                  ) : (
                    <div>
                      <Label>Audio Datei * (MP3, WAV)</Label>
                      <Input type="file" accept="audio/*" onChange={e => setUploadForm(f => ({ ...f, audioFile: e.target.files?.[0] || null }))} />
                    </div>
                  )}

                  {/* Schedule time for leak mode */}
                  {uploadForm.isHidden && (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Wann soll der Leak live gehen?
                      </Label>
                      <Input
                        type="time"
                        value={uploadForm.scheduleTime}
                        onChange={e => setUploadForm(f => ({ ...f, scheduleTime: e.target.value }))}
                        className="w-40"
                      />
                      <p className="text-xs text-muted-foreground">
                        Der Track wird automatisch zur eingestellten Zeit über das Radio abgespielt.
                        {!uploadForm.scheduleTime && ' (Optional – du kannst den Zeitslot auch später im Sendeplan setzen)'}
                      </p>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => uploadMutation.mutate()}
                    disabled={uploadMutation.isPending || resolving || (!uploadForm.title && uploadForm.sourceType !== 'youtube') || (uploadForm.sourceType === 'file' && !uploadForm.audioFile) || (uploadForm.sourceType === 'url' && !uploadForm.externalUrl) || (uploadForm.sourceType === 'youtube' && !uploadForm.youtubeUrl)}
                  >
                    {resolving ? 'YouTube wird aufgelöst...' : uploadMutation.isPending ? 'Lädt hoch...' : uploadForm.sourceType === 'youtube' ? (uploadForm.isHidden ? '🔒 Als Leak importieren' : 'YouTube importieren') : (uploadForm.isHidden ? '🔒 Als Leak speichern' : 'Track speichern')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Leak Countdown */}
      <div className="mb-4">
        <LeakCountdown />
      </div>

      {/* Radio Mode */}
      <div className="mb-8">
        <RadioMode />
      </div>

      {/* Now Playing */}
      {player.currentTrack && (
        <div className="mb-8 p-6 rounded-xl bg-card border border-border">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {ytVideoId ? (
              <div className="w-full sm:w-auto sm:min-w-[320px] max-w-md">
                <YouTubePlayer
                  videoId={ytVideoId}
                  isPlaying={player.isPlaying}
                  volume={player.volume}
                  isMuted={player.isMuted}
                  onTimeUpdate={handleYtTimeUpdate}
                  onEnded={handleYtEnded}
                  onDuration={handleYtDuration}
                />
              </div>
            ) : (
              <div className={cn(
                "w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden",
                player.isPlaying && "ring-2 ring-accent ring-offset-2 ring-offset-background"
              )}>
                {player.currentTrack.cover_url ? (
                  <img src={player.currentTrack.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Disc3 className={cn("h-10 w-10 text-muted-foreground", player.isPlaying && "animate-spin")} style={{ animationDuration: '3s' }} />
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{player.currentTrack.title}</h2>
              <p className="text-muted-foreground">{player.currentTrack.artist}</p>
              
              {!ytVideoId && (
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-muted-foreground tabular-nums">{formatTime(player.currentTime)}</span>
                  <Slider
                    value={[player.currentTime]}
                    max={player.duration || 100}
                    step={0.1}
                    onValueChange={([v]) => player.seek(v)}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground tabular-nums">{formatTime(player.duration)}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-3">
                <Button variant="ghost" size="icon" onClick={player.previous}><SkipBack className="h-4 w-4" /></Button>
                <Button size="icon" className="h-10 w-10 rounded-full" onClick={player.toggle}>
                  {player.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={player.next}><SkipForward className="h-4 w-4" /></Button>
                
                <div className="hidden sm:flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={player.toggleMute}>
                    {player.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[player.isMuted ? 0 : player.volume]}
                    max={1} step={0.01}
                    onValueChange={([v]) => player.setVolume(v)}
                    className="w-24"
                  />
                </div>

                <div className="hidden sm:flex items-center gap-2 ml-auto">
                  <Label className="text-xs text-muted-foreground">Crossfade</Label>
                  <Slider
                    value={[player.crossfadeDuration]}
                    max={10} step={0.5}
                    onValueChange={([v]) => player.setCrossfadeDuration(v)}
                    className="w-20"
                  />
                  <span className="text-xs text-muted-foreground tabular-nums">{player.crossfadeDuration}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Track List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : displayTracks.length === 0 ? (
        <div className="text-center py-20">
          <MusicIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">Noch keine Tracks</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? 'Lade deinen ersten Beat hoch!' : 'Bald verfügbar – stay tuned!'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <span className="w-8">#</span>
            <span>Titel</span>
            <span className="w-16 text-right">
              <Clock className="h-3 w-3 inline" />
            </span>
          </div>
          {displayTracks.map((track, idx) => {
            const isActive = player.currentTrack?.id === track.id;
            const isHidden = (track as any).is_hidden;
            return (
              <button
                key={track.id}
                onClick={() => {
                  player.setQueue(isAdmin ? allTracks : publicTracks);
                  player.play(track);
                }}
                className={cn(
                  "w-full grid grid-cols-[auto_1fr_auto] gap-4 items-center px-4 py-3 rounded-lg text-left transition-colors group",
                  isActive ? "bg-accent/10 text-accent" : "hover:bg-muted/50",
                  isHidden && "border border-dashed border-muted-foreground/30"
                )}
              >
                <span className="w-8 text-sm tabular-nums text-muted-foreground group-hover:hidden">
                  {idx + 1}
                </span>
                <span className="w-8 hidden group-hover:block">
                  {isActive && player.isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </span>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {track.cover_url ? (
                      <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <MusicIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-medium truncate flex items-center gap-1.5", isActive && "text-accent")}>
                      {isHidden && <EyeOff className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artist}
                      {isHidden && <span className="ml-2 text-[10px] uppercase tracking-wider opacity-60">Leak</span>}
                    </p>
                  </div>
                </div>

                <div className="w-16 flex items-center justify-end gap-1">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {track.duration_seconds ? formatTime(track.duration_seconds) : '–'}
                  </span>
                  {isAdmin && (
                    <Button 
                      variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(track.id); }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Queue */}
      {player.queue.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <ListMusic className="h-5 w-5" /> Warteschlange
            <span className="text-sm text-muted-foreground font-normal">({player.queue.length} Tracks)</span>
          </h3>
          <div className="space-y-1">
            {player.queue.map((track, idx) => {
              const isActive = player.currentTrack?.id === track.id;
              return (
                <div key={`${track.id}-${idx}`} className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg text-sm",
                  isActive ? "bg-accent/10 text-accent" : "text-muted-foreground"
                )}>
                  <span className="w-6 tabular-nums">{idx + 1}</span>
                  <span className="flex-1 truncate">{track.title}</span>
                  <span className="text-xs">{track.artist}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
