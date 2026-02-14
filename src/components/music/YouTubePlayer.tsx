import { useEffect, useRef, useCallback, useState } from 'react';

interface YouTubePlayerProps {
  videoId: string | null;
  isPlaying: boolean;
  volume: number; // 0-1
  isMuted: boolean;
  startAt?: number; // seconds
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onDuration?: (duration: number) => void;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let apiLoaded = false;
let apiReady = false;
const readyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiReady) { resolve(); return; }
    readyCallbacks.push(resolve);
    if (apiLoaded) return;
    apiLoaded = true;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      readyCallbacks.forEach(cb => cb());
      readyCallbacks.length = 0;
    };
  });
}

export function YouTubePlayer({
  videoId, isPlaying, volume, isMuted, startAt = 0,
  onReady, onStateChange, onDuration, onTimeUpdate, onEnded,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<number>(0);
  const [playerReady, setPlayerReady] = useState(false);
  const currentVideoRef = useRef<string | null>(null);

  const startTimeUpdates = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    const tick = () => {
      if (playerRef.current?.getCurrentTime) {
        onTimeUpdate?.(playerRef.current.getCurrentTime());
      }
      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);
  }, [onTimeUpdate]);

  const stopTimeUpdates = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = 0;
    }
  }, []);

  // Create player once on mount - always keep it alive
  useEffect(() => {
    let destroyed = false;

    loadYouTubeAPI().then(() => {
      if (destroyed || !containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        width: 320,
        height: 180,
        playerVars: {
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            console.log('[YouTubePlayer] Player shell READY');
            setPlayerReady(true);
          },
          onStateChange: (e: any) => {
            console.log('[YouTubePlayer] State:', e.data);
            onStateChange?.(e.data);
            if (e.data === window.YT.PlayerState.PLAYING) {
              // Unmute after playback actually starts (bypasses autoplay restriction)
              if (!isMuted) {
                e.target.unMute();
                e.target.setVolume(volume * 100);
              }
              startTimeUpdates();
            } else if (e.data === window.YT.PlayerState.ENDED) {
              stopTimeUpdates();
              onEnded?.();
            } else {
              stopTimeUpdates();
            }
          },
          onError: (e: any) => {
            console.error('[YouTubePlayer] Error:', e.data);
          },
        },
      });
    });

    return () => {
      destroyed = true;
      stopTimeUpdates();
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, []); // Never recreate

  // Load video when videoId changes (this is called synchronously from user gesture via React state)
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    if (videoId && videoId !== currentVideoRef.current) {
      console.log('[YouTubePlayer] Loading video:', videoId);
      currentVideoRef.current = videoId;
      // Start muted to bypass autoplay restriction, unmute in onStateChange PLAYING
      playerRef.current.mute();
      playerRef.current.loadVideoById({
        videoId,
        startSeconds: startAt,
      });
      onReady?.();
    } else if (!videoId && currentVideoRef.current) {
      currentVideoRef.current = null;
      playerRef.current.stopVideo();
      stopTimeUpdates();
    }
  }, [videoId, playerReady]);

  // Sync play/pause
  useEffect(() => {
    if (!playerReady || !playerRef.current?.getPlayerState) return;
    if (!videoId) return;
    
    const state = playerRef.current.getPlayerState();
    if (isPlaying && state !== 1 && state !== 3) {
      playerRef.current.playVideo();
    } else if (!isPlaying && (state === 1 || state === 3)) {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying, playerReady]);

  // Sync volume
  useEffect(() => {
    if (playerReady) playerRef.current?.setVolume?.(volume * 100);
  }, [volume, playerReady]);

  // Sync mute
  useEffect(() => {
    if (!playerReady) return;
    if (isMuted) playerRef.current?.mute?.();
    else playerRef.current?.unMute?.();
  }, [isMuted, playerReady]);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-video rounded-lg overflow-hidden bg-black"
      style={{ maxWidth: 480 }}
    />
  );
}
