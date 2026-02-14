import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';

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

interface MusicPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  playTrack: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
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
  
  // Use refs for mutable state that the audio element needs - avoids stale closures
  const queueRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(-1);
  
  // React state for UI rendering only
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);

  // Core play function - takes track AND queue to avoid stale closures
  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    const audio = audioRef.current;
    if (!audio) {
      console.error('[MusicPlayer] No audio element!');
      return;
    }

    // Update queue if provided
    if (newQueue) {
      queueRef.current = newQueue;
      setQueue(newQueue);
    }

    // Find index in queue
    const q = queueRef.current;
    const idx = q.findIndex(t => t.id === track.id);
    currentIndexRef.current = idx >= 0 ? idx : 0;

    // Update UI state
    setCurrentTrack(track);
    setCurrentTime(0);

    console.log('[MusicPlayer] playTrack:', track.title, 'url:', track.audio_url?.substring(0, 60));

    // Remove any previous canplay listener
    audio.oncanplay = null;

    try {
      audio.src = track.audio_url;
      audio.load();

      // Try immediate play first (works on desktop & when data is cached)
      const tryPlay = () => {
        const playPromise = audio.play();
        if (playPromise) {
          playPromise.then(() => {
            console.log('[MusicPlayer] ✅ Play succeeded');
            setIsPlaying(true);
          }).catch((err) => {
            console.warn('[MusicPlayer] Play failed:', err.message);
            // On mobile, try muted fallback
            audio.muted = true;
            audio.play().then(() => {
              console.log('[MusicPlayer] ✅ Muted play succeeded');
              setIsPlaying(true);
              setTimeout(() => { audio.muted = false; }, 300);
            }).catch((err2) => {
              console.error('[MusicPlayer] ❌ All play attempts failed:', err2.message);
              setIsPlaying(false);
            });
          });
        }
      };

      // Attempt immediate play
      tryPlay();

      // ALSO set up canplay handler as backup - if the browser couldn't play immediately
      // because data wasn't ready, this fires when enough data is buffered
      audio.oncanplay = () => {
        audio.oncanplay = null; // only fire once
        if (audio.paused && audio.src) {
          console.log('[MusicPlayer] 🔄 canplay fired, retrying play...');
          tryPlay();
        }
      };
    } catch (e) {
      console.error('[MusicPlayer] ❌ Exception during play:', e);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.src) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const playByIndex = useCallback((index: number) => {
    const q = queueRef.current;
    if (index >= 0 && index < q.length) {
      currentIndexRef.current = index;
      playTrack(q[index]);
    }
  }, [playTrack]);

  const next = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < queueRef.current.length) {
      playByIndex(nextIdx);
    }
  }, [playByIndex]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
    } else {
      const prevIdx = currentIndexRef.current - 1;
      if (prevIdx >= 0) {
        playByIndex(prevIdx);
      }
    }
  }, [playByIndex]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) audioRef.current.volume = vol;
    setVolumeState(vol);
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  }, []);

  // Audio element event handlers - defined as stable callbacks
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleDurationChange = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  }, []);

  const handleEnded = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < queueRef.current.length) {
      playByIndex(nextIdx);
    } else {
      setIsPlaying(false);
    }
  }, [playByIndex]);

  const handleError = useCallback(() => {
    const err = audioRef.current?.error;
    console.error('[MusicPlayer] Audio error:', err?.code, err?.message);
    setIsPlaying(false);
  }, []);

  return (
    <MusicPlayerContext.Provider value={{
      currentTrack, isPlaying, currentTime, duration, volume, isMuted, queue,
      playTrack, pause, resume, toggle, next, previous, seek, setVolume, toggleMute,
      isMinimized, setIsMinimized,
    }}>
      {/* Real DOM audio element - critical for iOS/mobile playback */}
      <audio
        ref={audioRef}
        preload="none"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
        onError={handleError}
        onStalled={() => console.warn('[MusicPlayer] ⚠️ Stalled - network too slow')}
        onWaiting={() => console.log('[MusicPlayer] ⏳ Waiting for data...')}
        onCanPlay={() => console.log('[MusicPlayer] ✅ Can play')}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
      />
      {children}
    </MusicPlayerContext.Provider>
  );
}
