'use client';

/**
 * Shared metadata + time helpers for the Shifts screen.
 * UI-only: the API still speaks the same `kind` values (DAY / NIGHT / SWING / …)
 * and `HH:MM` time strings — these helpers just map them to Violet-Suite visuals.
 */

import * as React from 'react';
import { Sun, Sunset, Moon, CalendarDays, Clock3, Zap } from 'lucide-react';

export type Period = 'day' | 'evening' | 'night';

/** The shift `kind` choices the API accepts (unchanged). */
export const SHIFT_TYPES: { value: string; label: string }[] = [
  { value: 'DAY', label: 'Day' },
  { value: 'NIGHT', label: 'Night' },
  { value: 'SWING', label: 'Swing' },
  { value: 'WEEKEND', label: 'Weekend' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'OVERTIME', label: 'Overtime' },
];

/** Day → amber, Evening → violet, Night → deep. */
export const PERIOD_META: Record<
  Period,
  { label: string; bar: string; soft: string; chipBg: string; chipFg: string; gradient: string }
> = {
  day: {
    label: 'Day',
    bar: '#F5B22E',
    soft: '#FBD27A',
    chipBg: '#FDF2DE',
    chipFg: '#B97608',
    gradient: 'linear-gradient(135deg,#F5B22E,#FBD27A)',
  },
  evening: {
    label: 'Evening',
    bar: '#7C4DFF',
    soft: '#A78BFF',
    chipBg: '#EEE9FF',
    chipFg: '#7C4DFF',
    gradient: 'linear-gradient(135deg,#7C4DFF,#A78BFF)',
  },
  night: {
    label: 'Night',
    bar: '#4A3B7A',
    soft: '#5B46A0',
    chipBg: '#EAE6F5',
    chipFg: '#4A3B7A',
    gradient: 'linear-gradient(135deg,#2A2440,#5B46A0)',
  },
};

export const PERIOD_ORDER: Period[] = ['day', 'evening', 'night'];

type KindMeta = { label: string; period: Period; Icon: React.ComponentType<{ className?: string }> };

const KIND_META: Record<string, KindMeta> = {
  DAY: { label: 'Day', period: 'day', Icon: Sun },
  NIGHT: { label: 'Night', period: 'night', Icon: Moon },
  SWING: { label: 'Swing', period: 'evening', Icon: Sunset },
  WEEKEND: { label: 'Weekend', period: 'evening', Icon: CalendarDays },
  PART_TIME: { label: 'Part Time', period: 'day', Icon: Clock3 },
  OVERTIME: { label: 'Overtime', period: 'night', Icon: Zap },
};

export function humanize(s?: string): string {
  if (!s) return '—';
  return s
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function kindMeta(kind?: string): KindMeta {
  const k = `${kind || ''}`.toUpperCase();
  return KIND_META[k] ?? { label: humanize(kind), period: 'day', Icon: Sun };
}

/** `"HH:MM"` → minutes past midnight, or `null` when blank/invalid. */
export function toMinutes(t?: string): number | null {
  if (!t || typeof t !== 'string') return null;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  return ((h % 24) * 60 + min) % 1440;
}

/** `"10:00"` → `"10a"`, `"17:30"` → `"5:30p"`, `"00:00"` → `"12a"`. */
export function fmtTime(t?: string): string {
  const total = toMinutes(t);
  if (total == null) return '—';
  const h = Math.floor(total / 60);
  const min = total % 60;
  const ap = h < 12 ? 'a' : 'p';
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return min ? `${hh}:${String(min).padStart(2, '0')}${ap}` : `${hh}${ap}`;
}

/** Bucket a shift into Day / Evening / Night by its start hour. */
export function periodOf(inTime?: string): Period {
  const total = toMinutes(inTime);
  if (total == null) return 'day';
  const h = total / 60;
  if (h >= 5 && h < 12) return 'day';
  if (h >= 12 && h < 18) return 'evening';
  return 'night';
}

/**
 * Positioned bands across a 24-hour (1440-min) track, in percentages.
 * A shift that ends at/before it starts wraps past midnight → two bands.
 */
export function shiftBands(inTime?: string, outTime?: string): { left: number; width: number }[] {
  const a = toMinutes(inTime);
  let b = toMinutes(outTime);
  if (a == null || b == null) return [];
  if (b === a) b = (a + 1) % 1440; // zero-length guard
  const span = (start: number, end: number) => ({
    left: (start / 1440) * 100,
    width: ((end - start) / 1440) * 100,
  });
  if (b > a) return [span(a, b)];
  // wraps midnight
  return [span(a, 1440), span(0, b)];
}
