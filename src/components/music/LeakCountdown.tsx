import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/contexts/MusicPlayerContext';
import { ScheduleEntry } from '@/lib/radio-sync';
import { Clock, EyeOff, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeakInfo {
  track: Track;
  entry: ScheduleEntry;
  isLive: boolean;
  startsIn: number; // seconds until start (0 if live)
  dayLabel: string;
  timeLabel: string;
}

const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function isWithinTimeRange(entry: ScheduleEntry, now: Date): boolean {
  const currentDay = now.getUTCDay();
  if (entry.day_of_week !== null && entry.day_of_week !== currentDay) return false;

  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const [startH, startM] = entry.start_time.split(':').map(Number);
  const [endH, endM] = entry.end_time.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (endMinutes <= startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

function getLeakInfo(
  schedule: ScheduleEntry[],
  tracks: (Track & { is_hidden?: boolean })[],
  now: Date
): LeakInfo | null {
  const hiddenIds = new Set(tracks.filter(t => t.is_hidden).map(t => t.id));
  const leakEntries = schedule.filter(e => e.is_active && hiddenIds.has(e.track_id));
  if (leakEntries.length === 0) return null;

  // First check: is any leak currently LIVE?
  for (const entry of leakEntries) {
    if (isWithinTimeRange(entry, now)) {
      const track = tracks.find(t => t.id === entry.track_id);
      if (!track) continue;
      const [startH, startM] = entry.start_time.split(':').map(Number);
      return {
        track,
        entry,
        isLive: true,
        startsIn: 0,
        dayLabel: 'Heute',
        timeLabel: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
      };
    }
  }

  // Otherwise find the next upcoming leak
  const currentDay = now.getUTCDay();
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const currentSeconds = now.getUTCSeconds();

  let best: { entry: ScheduleEntry; minutesUntil: number } | null = null;

  for (const entry of leakEntries) {
    const [startH, startM] = entry.start_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDay = (currentDay + dayOffset) % 7;
      if (entry.day_of_week !== null && entry.day_of_week !== checkDay) continue;

      let minutesUntil: number;
      if (dayOffset === 0) {
        minutesUntil = startMinutes - currentMinutes;
        if (minutesUntil <= 0) {
          // Already passed today, try next occurrence
          if (entry.day_of_week === null) {
            // Runs every day, so try tomorrow
            minutesUntil = (24 * 60) - currentMinutes + startMinutes;
          } else {
            continue;
          }
        }
      } else {
        minutesUntil = (dayOffset * 24 * 60) + startMinutes - currentMinutes;
      }

      if (!best || minutesUntil < best.minutesUntil) {
        best = { entry, minutesUntil };
      }
      break;
    }
  }

  if (!best) return null;

  const track = tracks.find(t => t.id === best!.entry.track_id);
  if (!track) return null;

  const startsInSeconds = best.minutesUntil * 60 - currentSeconds;
  const [startH, startM] = best.entry.start_time.split(':').map(Number);
  const targetDay = best.minutesUntil >= 24 * 60
    ? DAY_NAMES[(currentDay + Math.floor(best.minutesUntil / (24 * 60))) % 7]
    : best.minutesUntil > (24 * 60 - currentMinutes)
      ? 'Morgen'
      : 'Heute';

  return {
    track,
    entry: best.entry,
    isLive: false,
    startsIn: Math.max(0, startsInSeconds),
    dayLabel: targetDay,
    timeLabel: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
  };
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'JETZT LIVE';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function LeakCountdown() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const { data: schedule = [] } = useQuery({
    queryKey: ['radio-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radio_schedule')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data as ScheduleEntry[];
    },
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks-radio-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as (Track & { is_hidden?: boolean })[];
    },
  });

  const leakInfo = getLeakInfo(schedule, tracks, now);
  if (!leakInfo) return null;

  const isImminent = !leakInfo.isLive && leakInfo.startsIn < 300;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-4 transition-all",
      leakInfo.isLive
        ? "bg-destructive/10 border-destructive/30 animate-pulse"
        : isImminent
          ? "bg-accent/10 border-accent/30"
          : "bg-card border-border"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
          leakInfo.isLive ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
        )}>
          {leakInfo.isLive ? <Flame className="h-6 w-6" /> : <EyeOff className="h-5 w-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {leakInfo.isLive ? '🔥 Leak ist LIVE' : 'Nächster Leak'}
            </span>
          </div>
          <p className="font-bold text-lg">
            {leakInfo.isLive ? 'Jetzt reinhören! Schalte das Radio ein.' : `in ${formatCountdown(leakInfo.startsIn)}`}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 justify-end text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{leakInfo.dayLabel} {leakInfo.timeLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
