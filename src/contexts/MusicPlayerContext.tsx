import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  bpm?: number;
  duration_seconds?: number;
  audio_url: string;
  cover_url?: string;
  is_external: boolean;
  mood?: string;
  energy?: string;
  youtube_url?: string | null;
  is_hidden?: boolean;
}

interface MusicPlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  crossfadeDuration: number;
}

interface MusicPlayerContextType extends MusicPlayerState {
  play: (track?: Track) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  setCrossfadeDuration: (seconds: number) => void;
  isMinimized: boolean;
  setIsMinimized: (v: boolean) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  return ctx;
}

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<MusicPlayerState>({
    currentTrack: null,
    queue: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    crossfadeDuration: 3,
  });
  const [isMinimized, setIsMinimized] = useState(true);
  const [queueIndex, setQueueIndex] = useState(-1);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume;
    
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setState(s => ({ ...s, currentTime: audio.currentTime }));
      
      // Crossfade logic: preload next track near end
      if (audio.duration && audio.currentTime > audio.duration - state.crossfadeDuration) {
        // Start fading out current and fading in next
        const remaining = audio.duration - audio.currentTime;
        const fadeRatio = remaining / state.crossfadeDuration;
        audio.volume = state.volume * fadeRatio;
      }
    };
    
    const onDurationChange = () => {
      setState(s => ({ ...s, duration: audio.duration || 0 }));
    };
    
    const onEnded = () => {
      // Auto-advance to next track
      setQueueIndex(prev => {
        const nextIdx = prev + 1;
        if (nextIdx < state.queue.length) {
          return nextIdx;
        }
        setState(s => ({ ...s, isPlaying: false }));
        return prev;
      });
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  // Update audio src when queue index changes
  useEffect(() => {
    if (queueIndex >= 0 && queueIndex < state.queue.length) {
      const track = state.queue[queueIndex];
      setState(s => ({ ...s, currentTrack: track, currentTime: 0 }));
      
      // Skip HTMLAudioElement for YouTube tracks - handled by YouTubePlayer component
      if (track.youtube_url) {
        // Pause any playing HTML audio first
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
        setState(s => ({ ...s, isPlaying: true }));
        console.log('[MusicPlayer] YouTube track selected:', track.title, track.youtube_url);
        return;
      }
      
      if (audioRef.current) {
        audioRef.current.src = track.audio_url;
        audioRef.current.volume = state.volume;
        audioRef.current.play().catch((e) => {
          console.warn('[MusicPlayer] Audio play failed:', e.message);
        });
        setState(s => ({ ...s, isPlaying: true }));
      }
    }
  }, [queueIndex, state.queue]);

  const play = useCallback((track?: Track) => {
    if (track) {
      setState(s => {
        const idx = s.queue.findIndex(t => t.id === track.id);
        if (idx >= 0) {
          // Use setTimeout to let state settle, then set index
          setTimeout(() => setQueueIndex(idx), 0);
          return s;
        } else {
          const newQueue = [...s.queue, track];
          setTimeout(() => setQueueIndex(newQueue.length - 1), 0);
          return { ...s, queue: newQueue };
        }
      });
    } else if (audioRef.current && state.currentTrack) {
      if (state.currentTrack.youtube_url) {
        setState(s => ({ ...s, isPlaying: true }));
      } else {
        audioRef.current.play().catch(() => {});
        setState(s => ({ ...s, isPlaying: true }));
      }
    }
  }, [state.currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState(s => ({ ...s, isPlaying: false }));
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) pause();
    else play();
  }, [state.isPlaying, play, pause]);

  const next = useCallback(() => {
    setQueueIndex(prev => Math.min(prev + 1, state.queue.length - 1));
  }, [state.queue.length]);

  const previous = useCallback(() => {
    if (state.currentTime > 3) {
      seek(0);
    } else {
      setQueueIndex(prev => Math.max(prev - 1, 0));
    }
  }, [state.currentTime]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(s => ({ ...s, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) audioRef.current.volume = vol;
    setState(s => ({ ...s, volume: vol, isMuted: vol === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !state.isMuted;
    }
    setState(s => ({ ...s, isMuted: !s.isMuted }));
  }, [state.isMuted]);

  const setQueue = useCallback((tracks: Track[]) => {
    setState(s => ({ ...s, queue: tracks }));
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setState(s => ({ ...s, queue: [...s.queue, track] }));
  }, []);

  const setCrossfadeDuration = useCallback((seconds: number) => {
    setState(s => ({ ...s, crossfadeDuration: seconds }));
  }, []);

  return (
    <MusicPlayerContext.Provider value={{
      ...state,
      play, pause, toggle, next, previous, seek,
      setVolume, toggleMute, setQueue, addToQueue,
      setCrossfadeDuration, isMinimized, setIsMinimized,
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}
