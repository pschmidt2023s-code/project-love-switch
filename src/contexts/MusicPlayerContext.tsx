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

  const playTrack = useCallback((track: Track, playlist?: Track[]) => {
    const audio = audioRef.current;
    console.log('[Player] playTrack called:', track.title, 'audioRef exists:', !!audio);
    
    if (!audio) {
      console.error('[Player] No audio element ref!');
      return;
    }

    if (playlist) {
      playlistRef.current = playlist;
    }

    const idx = playlistRef.current.findIndex(t => t.id === track.id);
    currentIndexRef.current = idx >= 0 ? idx : 0;

    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(0);

    // Reset handlers
    audio.oncanplay = null;
    audio.onerror = null;

    console.log('[Player] Setting src:', track.audio_url?.substring(0, 80));
    audio.src = track.audio_url;
    audio.load();

    // Error handler
    audio.onerror = () => {
      const e = audio.error;
      console.error('[Player] Audio error:', e?.code, e?.message);
      setIsPlaying(false);
    };

    // Try to play immediately
    console.log('[Player] Attempting play...');
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        console.log('[Player] ✅ Play started!');
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('[Player] Play blocked:', err.name, err.message);
        
        // Try muted fallback (mobile browsers)
        console.log('[Player] Trying muted fallback...');
        audio.muted = true;
        const p2 = audio.play();
        if (p2 && typeof p2.then === 'function') {
          p2.then(() => {
            console.log('[Player] ✅ Muted play started, unmuting...');
            setIsPlaying(true);
            setTimeout(() => {
              audio.muted = false;
              console.log('[Player] Unmuted');
            }, 500);
          }).catch((err2) => {
            console.error('[Player] ❌ Muted play also failed:', err2.name, err2.message);
            setIsPlaying(false);
            
            // Last resort: wait for canplay event
            console.log('[Player] Waiting for canplay event...');
            audio.oncanplay = () => {
              audio.oncanplay = null;
              console.log('[Player] canplay fired, retrying...');
              audio.play().then(() => {
                console.log('[Player] ✅ Delayed play succeeded');
                setIsPlaying(true);
                audio.muted = false;
              }).catch((err3) => {
                console.error('[Player] ❌ Final attempt failed:', err3.message);
                setIsPlaying(false);
              });
            };
          });
        }
      });
    }

    // Also set canplay as backup for slow loads
    audio.oncanplay = () => {
      console.log('[Player] canplay event fired');
      if (audio.paused && audio.src && audio.readyState >= 2) {
        console.log('[Player] Audio paused at canplay, retrying play...');
        audio.play().then(() => {
          console.log('[Player] ✅ canplay retry succeeded');
          setIsPlaying(true);
        }).catch(() => {});
      }
    };
  }, []);

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
      audio.play().then(() => setIsPlaying(true)).catch((e) => {
        console.warn('[Player] Resume failed:', e.message);
      });
    }
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      resume();
    } else {
      pause();
    }
  }, [resume, pause]);

  const next = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < playlistRef.current.length) {
      playByIndex(nextIdx);
    } else if (playlistRef.current.length > 0) {
      playByIndex(0);
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
        playByIndex(playlistRef.current.length - 1);
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

  return (
    <MusicPlayerContext.Provider value={{
      currentTrack, isPlaying, currentTime, duration, volume, isMuted,
      playTrack, pause, resume, toggle, next, previous, seek, setVolume, toggleMute,
      isMinimized, setIsMinimized,
    }}>
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); }}
        onDurationChange={() => { if (audioRef.current) setDuration(audioRef.current.duration || 0); }}
        onEnded={() => { console.log('[Player] Track ended, playing next'); next(); }}
        onError={() => {
          const e = audioRef.current?.error;
          console.error('[Player] <audio> error event:', e?.code, e?.message);
          setIsPlaying(false);
        }}
        onLoadStart={() => console.log('[Player] loadstart')}
        onCanPlay={() => console.log('[Player] canplay (element event)')}
        onPlaying={() => { console.log('[Player] playing event'); setIsPlaying(true); }}
        onPause={() => { console.log('[Player] pause event'); }}
        onStalled={() => console.warn('[Player] stalled')}
        onWaiting={() => console.log('[Player] waiting for data')}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
      />
      {children}
    </MusicPlayerContext.Provider>
  );
}
