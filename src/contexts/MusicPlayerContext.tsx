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
  playTrack: (track: Track, playlist?: Track[]) => void;
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
  const playlistRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(-1);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  const attemptPlay = useCallback((audio: HTMLAudioElement) => {
    const p = audio.play();
    if (p) {
      p.then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Mobile fallback: try muted first
        audio.muted = true;
        audio.play().then(() => {
          setIsPlaying(true);
          setTimeout(() => { audio.muted = false; }, 300);
        }).catch(() => {
          setIsPlaying(false);
        });
      });
    }
  }, []);

  const playTrack = useCallback((track: Track, playlist?: Track[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playlist) {
      playlistRef.current = playlist;
    }

    const idx = playlistRef.current.findIndex(t => t.id === track.id);
    currentIndexRef.current = idx >= 0 ? idx : 0;

    setCurrentTrack(track);
    setCurrentTime(0);

    audio.oncanplay = null;
    audio.src = track.audio_url;
    audio.load();

    attemptPlay(audio);

    // Backup: if browser needs to buffer first
    audio.oncanplay = () => {
      audio.oncanplay = null;
      if (audio.paused && audio.src) {
        attemptPlay(audio);
      }
    };
  }, [attemptPlay]);

  const playByIndex = useCallback((index: number) => {
    const pl = playlistRef.current;
    if (index >= 0 && index < pl.length) {
      currentIndexRef.current = index;
      playTrack(pl[index]);
    }
  }, [playTrack]);

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

  const next = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    // Loop back to start for 24/7 mode
    if (nextIdx < playlistRef.current.length) {
      playByIndex(nextIdx);
    } else if (playlistRef.current.length > 0) {
      playByIndex(0); // Loop!
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
      } else if (playlistRef.current.length > 0) {
        playByIndex(playlistRef.current.length - 1); // Loop to end
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

  const handleEnded = useCallback(() => {
    // Auto-advance to next track, loop at end
    next();
  }, [next]);

  return (
    <MusicPlayerContext.Provider value={{
      currentTrack, isPlaying, currentTime, duration, volume, isMuted,
      playTrack, pause, resume, toggle, next, previous, seek, setVolume, toggleMute,
      isMinimized, setIsMinimized,
    }}>
      <audio
        ref={audioRef}
        preload="none"
        playsInline
        onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); }}
        onDurationChange={() => { if (audioRef.current) setDuration(audioRef.current.duration || 0); }}
        onEnded={handleEnded}
        onError={() => { setIsPlaying(false); }}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
      />
      {children}
    </MusicPlayerContext.Provider>
  );
}
