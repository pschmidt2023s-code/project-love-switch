import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMusicPlayer, Track } from '@/contexts/MusicPlayerContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { PageLayout } from '@/components/PageLayout';
import { RadioMode } from '@/components/music/RadioMode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Upload, Trash2, Music as MusicIcon, 
  ListMusic, Clock, Disc3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertWavToMp3, isWavFile } from '@/lib/audio-converter';

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

  // Upload track
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadForm.audioFile) throw new Error('Keine Audio-Datei');
      
      let file = uploadForm.audioFile;
      
      // Convert WAV to MP3 automatically
      if (isWavFile(file)) {
        toast.info('WAV wird zu MP3 konvertiert...');
        setConvertProgress(0);
        try {
          file = await convertWavToMp3(file, (p) => setConvertProgress(p));
          toast.success('Konvertierung abgeschlossen!');
        } catch (e) {
          console.error('Conversion failed:', e);
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
      const audioUrl = urlData.publicUrl;

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
        audio_url: audioUrl,
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

  // Simple: tap track → play it, set full list as queue
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
            Beats & Musik
          </h1>
          <p className="text-muted-foreground mt-1">{tracks.length} Tracks verfügbar</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={playAll} disabled={tracks.length === 0} className="gap-2">
            <Play className="h-4 w-4" /> Alle abspielen
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
                  <div>
                    <Label>Titel *</Label>
                    <Input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Artist</Label>
                    <Input value={uploadForm.artist} onChange={e => setUploadForm(f => ({ ...f, artist: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Audio Datei * (MP3, WAV)</Label>
                    <Input type="file" accept="audio/wav,audio/mpeg,audio/mp3,audio/*,.wav,.mp3" onChange={e => setUploadForm(f => ({ ...f, audioFile: e.target.files?.[0] || null }))} />
                  </div>
                  <div>
                    <Label>Cover Bild (optional)</Label>
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
                    {convertProgress !== null ? 'Konvertiert...' : uploadMutation.isPending ? 'Lädt hoch...' : 'Track speichern'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Radio (optional, collapsed) */}
      {isAdmin && (
        <div className="mb-8">
          <RadioMode />
        </div>
      )}

      {/* Now Playing */}
      {player.currentTrack && (
        <div className="mb-8 p-6 rounded-xl bg-card border border-border">
          <div className="flex flex-col sm:flex-row items-start gap-6">
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

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{player.currentTrack.title}</h2>
              <p className="text-muted-foreground">{player.currentTrack.artist}</p>
              
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
                  <Slider value={[player.isMuted ? 0 : player.volume]} max={1} step={0.01} onValueChange={([v]) => player.setVolume(v)} className="w-24" />
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
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <span className="w-8">#</span>
            <span>Titel</span>
            <span className="w-16 text-right"><Clock className="h-3 w-3 inline" /></span>
          </div>
          {tracks.map((track, idx) => {
            const isActive = player.currentTrack?.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => handleTrackClick(track)}
                className={cn(
                  "w-full grid grid-cols-[auto_1fr_auto] gap-4 items-center px-4 py-3 rounded-lg text-left transition-colors group",
                  isActive ? "bg-accent/10 text-accent" : "hover:bg-muted/50"
                )}
              >
                <span className="w-8 text-sm tabular-nums text-muted-foreground group-hover:hidden">{idx + 1}</span>
                <span className="w-8 hidden group-hover:block">
                  {isActive && player.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
                    <p className={cn("text-sm font-medium truncate", isActive && "text-accent")}>
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
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
      {player.queue.length > 1 && (
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
