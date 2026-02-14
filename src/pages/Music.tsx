import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMusicPlayer, Track } from '@/contexts/MusicPlayerContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Upload, Trash2, Music as MusicIcon, Disc3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertWavToMp3, isWavFile } from '@/lib/audio-converter';

function formatTime(s: number) {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Music() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAdminRole();
  const player = useMusicPlayer();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '', artist: 'ALDENAIR',
    audioFile: null as File | null,
    coverFile: null as File | null,
  });
  const [convertProgress, setConvertProgress] = useState<number | null>(null);

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Track[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadForm.audioFile) throw new Error('Keine Audio-Datei');

      let file = uploadForm.audioFile;

      if (isWavFile(file)) {
        toast.info('WAV wird zu MP3 konvertiert...');
        setConvertProgress(0);
        try {
          file = await convertWavToMp3(file, (p) => setConvertProgress(p));
          toast.success('Konvertierung abgeschlossen!');
        } catch {
          toast.warning('Konvertierung fehlgeschlagen, WAV wird direkt hochgeladen');
        } finally {
          setConvertProgress(null);
        }
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const contentType = ext === 'wav' ? 'audio/wav' : 'audio/mpeg';
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `tracks/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(path, file, { contentType, upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('audio').getPublicUrl(path);

      let coverUrl: string | null = null;
      if (uploadForm.coverFile) {
        const coverPath = `covers/${Date.now()}-${uploadForm.coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from('audio')
          .upload(coverPath, uploadForm.coverFile);
        if (coverError) throw coverError;
        const { data: coverData } = supabase.storage.from('audio').getPublicUrl(coverPath);
        coverUrl = coverData.publicUrl;
      }

      const { error } = await supabase.from('tracks').insert({
        title: uploadForm.title,
        artist: uploadForm.artist,
        audio_url: urlData.publicUrl,
        cover_url: coverUrl,
        sort_order: tracks.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      setShowUpload(false);
      setUploadForm({ title: '', artist: 'ALDENAIR', audioFile: null, coverFile: null });
      toast.success('Track hochgeladen!');
    },
    onError: (e) => { if (e.message) toast.error(e.message); },
  });

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

  const handleTrackClick = (track: Track) => {
    player.playTrack(track, tracks);
  };

  const playAll = () => {
    if (tracks.length > 0) {
      player.playTrack(tracks[0], tracks);
    }
  };

  return (
    <PageLayout mainClassName="container mx-auto px-4 py-24 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Disc3 className="h-8 w-8 text-accent" />
            24/7 Playlist
          </h1>
          <p className="text-muted-foreground mt-1">
            {tracks.length} Tracks · Läuft endlos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={playAll} disabled={tracks.length === 0} className="gap-2">
            <Play className="h-4 w-4" /> Abspielen
          </Button>
          {isAdmin && (
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" /> Hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Track hinzufügen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Titel *</Label>
                    <Input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Artist</Label>
                    <Input value={uploadForm.artist} onChange={e => setUploadForm(f => ({ ...f, artist: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Audio (MP3, WAV)</Label>
                    <Input type="file" accept="audio/*,.wav,.mp3" onChange={e => setUploadForm(f => ({ ...f, audioFile: e.target.files?.[0] || null }))} />
                  </div>
                  <div>
                    <Label>Cover (optional)</Label>
                    <Input type="file" accept="image/*" onChange={e => setUploadForm(f => ({ ...f, coverFile: e.target.files?.[0] || null }))} />
                  </div>
                  {convertProgress !== null && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Konvertiere WAV → MP3...</Label>
                      <Progress value={convertProgress} className="h-2" />
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => uploadMutation.mutate()}
                    disabled={uploadMutation.isPending || !uploadForm.title || !uploadForm.audioFile || convertProgress !== null}
                  >
                    {convertProgress !== null ? 'Konvertiert...' : uploadMutation.isPending ? 'Lädt hoch...' : 'Speichern'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Now Playing Bar */}
      {player.currentTrack && (
        <div className="mb-8 p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-4">
            {/* Cover */}
            <div className={cn(
              "w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden",
              player.isPlaying && "ring-2 ring-accent ring-offset-2 ring-offset-background"
            )}>
              {player.currentTrack.cover_url ? (
                <img src={player.currentTrack.cover_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Disc3 className={cn("h-8 w-8 text-muted-foreground", player.isPlaying && "animate-spin")} style={{ animationDuration: '3s' }} />
                </div>
              )}
            </div>

            {/* Info + Controls */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{player.currentTrack.title}</p>
              <p className="text-sm text-muted-foreground truncate">{player.currentTrack.artist}</p>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={player.previous}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-10 w-10 rounded-full" onClick={player.toggle}>
                {player.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={player.next}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume (desktop only) */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={player.toggleMute}>
                {player.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider value={[player.isMuted ? 0 : player.volume]} max={1} step={0.01} onValueChange={([v]) => player.setVolume(v)} className="w-20" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{formatTime(player.currentTime)}</span>
            <Slider
              value={[player.currentTime]}
              max={player.duration || 100}
              step={0.1}
              onValueChange={([v]) => player.seek(v)}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground tabular-nums w-10">{formatTime(player.duration)}</span>
          </div>
        </div>
      )}

      {/* Track List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-20">
          <MusicIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">Noch keine Tracks</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? 'Lade deinen ersten Beat hoch!' : 'Bald verfügbar – stay tuned!'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {tracks.map((track, idx) => {
            const isActive = player.currentTrack?.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => handleTrackClick(track)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors group",
                  isActive ? "bg-accent/10" : "hover:bg-muted/50"
                )}
              >
                {/* Number / Play icon */}
                <span className="w-8 flex justify-center">
                  <span className="group-hover:hidden text-sm tabular-nums text-muted-foreground">
                    {isActive && player.isPlaying ? (
                      <Disc3 className="h-4 w-4 text-accent animate-spin" style={{ animationDuration: '2s' }} />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span className="hidden group-hover:block">
                    {isActive && player.isPlaying ? <Pause className="h-4 w-4 text-accent" /> : <Play className="h-4 w-4" />}
                  </span>
                </span>

                {/* Cover thumbnail */}
                <div className="w-10 h-10 rounded bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {track.cover_url ? (
                    <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <MusicIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Title / Artist */}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", isActive && "text-accent")}>{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>

                {/* Duration + Delete */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {track.duration_seconds ? formatTime(track.duration_seconds) : '–'}
                  </span>
                  {isAdmin && (
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100"
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
    </PageLayout>
  );
}
