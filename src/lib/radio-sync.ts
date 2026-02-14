/**
 * Synchronous Radio Logic
 * 
 * All visitors hear the same track at the same position.
 * Supports two modes:
 * 1. Rotation: modular arithmetic loop through playlist
 * 2. Scheduled: time-slot based, with fallback to rotation
 */

import { Track } from '@/contexts/MusicPlayerContext';

export interface RadioState {
  currentTrack: Track;
  currentTrackIndex: number;
  positionInTrack: number;
  totalLoopDuration: number;
}

export interface ScheduleEntry {
  id: string;
  track_id: string;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  priority: number;
  is_active: boolean;
}

/**
 * Check if a scheduled entry matches the current time
 */
function matchesSchedule(entry: ScheduleEntry, now: Date): boolean {
  if (!entry.is_active) return false;

  const currentDay = now.getDay();
  if (entry.day_of_week !== null && entry.day_of_week !== currentDay) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = entry.start_time.split(':').map(Number);
  const [endH, endM] = entry.end_time.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Handle overnight slots (e.g., 22:00 - 06:00)
  if (endMinutes <= startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Find the currently scheduled track based on time slots.
 * Returns the highest-priority matching entry.
 */
export function getScheduledTrack(
  schedule: ScheduleEntry[],
  tracks: Track[],
  now: Date = new Date()
): Track | null {
  const matching = schedule
    .filter(e => matchesSchedule(e, now))
    .sort((a, b) => b.priority - a.priority);

  if (matching.length === 0) return null;

  const trackId = matching[0].track_id;
  return tracks.find(t => t.id === trackId) || null;
}

/**
 * Calculate rotation-based radio state (fallback when no schedule matches)
 */
export function calculateRadioState(
  tracks: Track[],
  loopStartEpoch: number
): RadioState | null {
  if (tracks.length === 0) return null;

  const tracksWithDuration = tracks.map(t => ({
    ...t,
    duration_seconds: t.duration_seconds || 180,
  }));

  const totalLoopDuration = tracksWithDuration.reduce(
    (sum, t) => sum + t.duration_seconds!, 0
  );

  if (totalLoopDuration <= 0) return null;

  const now = Date.now() / 1000;
  const elapsed = now - loopStartEpoch;
  const positionInLoop = ((elapsed % totalLoopDuration) + totalLoopDuration) % totalLoopDuration;

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
