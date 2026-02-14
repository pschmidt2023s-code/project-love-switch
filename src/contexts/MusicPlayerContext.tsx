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
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  return ctx;
}

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  // Bind events to the DOM audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setState(s => ({ ...s, currentTime: audio.currentTime }));
    };

    const onDurationChange = () => {
      setState(s => ({ ...s, duration: audio.duration || 0 }));
    };

    const onEnded = () => {
      setQueueIndex(prev => {
        const nextIdx = prev + 1;
        if (nextIdx < state.queue.length) {
          return nextIdx;
        }
        setState(s => ({ ...s, isPlaying: false }));
        return prev;
      });
    };

    const onPlay = () => {
      console.log('[MusicPlayer] Playing');
      setState(s => ({ ...s, isPlaying: true }));
    };

    const onPause = () => {
      setState(s => ({ ...s, isPlaying: false }));
    };

    const onError = () => {
      const err = audio.error;
      console.error('[MusicPlayer] Audio error:', err?.code, err?.message);
      setState(s => ({ ...s, isPlaying: false }));
    };

    const onWaiting = () => console.log('[MusicPlayer] Buffering...');
    const onCanPlay = () => console.log('[MusicPlayer] Can play');

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplaythrough', onCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplaythrough', onCanPlay);
    };
  }, [state.queue.length]);

  // Auto-advance when queueIndex changes (for next/prev)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (queueIndex >= 0 && queueIndex < state.queue.length) {
      const track = state.queue[queueIndex];
      // Check if this track is already loaded
      if (state.currentTrack?.id === track.id && audio.src) return;
      
      setState(s => ({ ...s, currentTrack: track, currentTime: 0 }));
      audio.src = track.audio_url;
      audio.load();
      audio.play().catch((e) => {
        console.warn('[MusicPlayer] Auto-advance play failed:', e.message);
      });
    }
  }, [queueIndex]);

  const play = useCallback((track?: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (track) {
      console.log('[MusicPlayer] Play track:', track.title);
      // Set source and play - MUST happen synchronously in user gesture
      audio.src = track.audio_url;
      audio.load();
      
      // iOS Safari fallback: if unmuted play fails, try muted then unmute
      audio.play().then(() => {
        console.log('[MusicPlayer] Play succeeded');
      }).catch((e) => {
        console.warn('[MusicPlayer] Play failed, trying muted fallback:', e.message);
        audio.muted = true;
        audio.play().then(() => {
          console.log('[MusicPlayer] Muted play succeeded, unmuting...');
          // Unmute after a short delay - works on most iOS versions
          setTimeout(() => {
            audio.muted = false;
          }, 100);
        }).catch((e2) => {
          console.error('[MusicPlayer] Even muted play failed:', e2.message);
        });
      });
      
      const currentQueue = state.queue;
      const idx = currentQueue.findIndex(t => t.id === track.id);
      if (idx >= 0) {
        setQueueIndex(idx);
      } else {
        const newQueue = [...currentQueue, track];
        setState(s => ({ ...s, queue: newQueue }));
        setQueueIndex(newQueue.length - 1);
      }
      setState(s => ({ ...s, currentTrack: track, currentTime: 0 }));
    } else if (state.currentTrack) {
      audio.play().catch(() => {});
    }
  }, [state.queue, state.currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
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
      audioRef,
    }}>
      {/* DOM-based audio element - critical for mobile playback */}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        webkit-playsinline="true"
        style={{ display: 'none' }}
      />
      {children}
    </MusicPlayerContext.Provider>
  );
}
