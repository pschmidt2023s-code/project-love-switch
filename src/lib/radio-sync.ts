/**
 * Synchronous Radio Logic
 * 
 * All visitors hear the same track at the same position.
 * Uses modular arithmetic on Unix epoch to calculate current position in the playlist loop.
 */

import { Track } from '@/contexts/MusicPlayerContext';

export interface RadioState {
  currentTrack: Track;
  currentTrackIndex: number;
  positionInTrack: number; // seconds into the current track
  totalLoopDuration: number;
}

/**
 * Given a playlist of tracks with known durations and a loop start epoch,
 * calculate which track should be playing RIGHT NOW and at what position.
 */
export function calculateRadioState(
  tracks: Track[],
  loopStartEpoch: number
): RadioState | null {
  if (tracks.length === 0) return null;

  // Filter tracks with valid durations, fallback to 180s (3min)
  const tracksWithDuration = tracks.map(t => ({
    ...t,
    duration_seconds: t.duration_seconds || 180,
  }));

  const totalLoopDuration = tracksWithDuration.reduce(
    (sum, t) => sum + t.duration_seconds!, 0
  );

  if (totalLoopDuration <= 0) return null;

  // Current position in the infinite loop
  const now = Date.now() / 1000; // current epoch in seconds
  const elapsed = now - loopStartEpoch;
  const positionInLoop = ((elapsed % totalLoopDuration) + totalLoopDuration) % totalLoopDuration;

  // Walk through tracks to find which one is active
  let accumulated = 0;
  for (let i = 0; i < tracksWithDuration.length; i++) {
    const trackDuration = tracksWithDuration[i].duration_seconds!;
    if (accumulated + trackDuration > positionInLoop) {
      return {
        currentTrack: tracksWithDuration[i],
        currentTrackIndex: i,
        positionInTrack: positionInLoop - accumulated,
        totalLoopDuration,
      };
    }
    accumulated += trackDuration;
  }

  // Fallback to first track
  return {
    currentTrack: tracksWithDuration[0],
    currentTrackIndex: 0,
    positionInTrack: 0,
    totalLoopDuration,
  };
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
