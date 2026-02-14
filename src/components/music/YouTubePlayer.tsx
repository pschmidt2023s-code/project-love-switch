import { useEffect, useRef, useCallback } from 'react';

interface YouTubePlayerProps {
  videoId: string;
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

  useEffect(() => {
    let destroyed = false;

    loadYouTubeAPI().then(() => {
      if (destroyed || !containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          start: Math.floor(startAt),
          playsinline: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(volume * 100);
            if (isMuted) e.target.mute();
            if (startAt > 0) e.target.seekTo(startAt, true);
            onDuration?.(e.target.getDuration());
            onReady?.();
            if (isPlaying) startTimeUpdates();
          },
          onStateChange: (e: any) => {
            onStateChange?.(e.data);
            if (e.data === window.YT.PlayerState.ENDED) {
              stopTimeUpdates();
              onEnded?.();
            } else if (e.data === window.YT.PlayerState.PLAYING) {
              startTimeUpdates();
            } else {
              stopTimeUpdates();
            }
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
  }, [videoId]); // Only recreate on videoId change

  // Sync play/pause
  useEffect(() => {
    if (!playerRef.current?.getPlayerState) return;
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    playerRef.current?.setVolume?.(volume * 100);
  }, [volume]);

  // Sync mute
  useEffect(() => {
    if (isMuted) playerRef.current?.mute?.();
    else playerRef.current?.unMute?.();
  }, [isMuted]);

  return (
    <div
      ref={containerRef}
      className="absolute w-0 h-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  );
}
