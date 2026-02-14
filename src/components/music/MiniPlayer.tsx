import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function MiniPlayer() {
  const {
    currentTrack, isPlaying, toggle, next, previous,
    currentTime, duration, seek, volume, setVolume, isMuted, toggleMute,
  } = useMusicPlayer();
  const navigate = useNavigate();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl shadow-lg">
      {/* Progress bar */}
      <div 
        className="absolute top-0 left-0 h-[2px] bg-accent transition-all duration-300"
        style={{ width: `${progress}%` }}
      />

      <div className="container mx-auto flex items-center gap-3 px-4 py-2 max-w-7xl">
        {/* Track info */}
        <button 
          onClick={() => navigate('/music')}
          className="flex items-center gap-3 flex-1 min-w-0 press-scale"
        >
          <div className={cn(
            "w-10 h-10 rounded-md bg-muted flex-shrink-0 overflow-hidden",
            isPlaying && "ring-1 ring-accent"
          )}>
            {currentTrack.cover_url ? (
              <img src={currentTrack.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">♪</div>
            )}
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium truncate">{currentTrack.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={previous}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" size="icon" 
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={toggle}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Time + Volume (desktop) */}
        <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={([v]) => seek(v)}
            className="w-32"
          />
          <span className="text-xs text-muted-foreground tabular-nums w-10">
            {formatTime(duration)}
          </span>
          
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={([v]) => setVolume(v)}
            className="w-20"
          />

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/music')}>
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
