/** The status vocabulary (spec §6), the keyboard letters (§6.1) and minute arithmetic. */

import type { DayStatus, PeriodStatus } from './types';

/** `[glyph, label, background, ink]`. PRESENT and PRESENT_OT share a glyph and a colour (§6 decision 1). */
export const STATUS: Record<DayStatus, [string, string, string, string]> = {
  PRESENT: ['P', 'Present', 'rgba(31,169,122,0.10)', '#157A5B'],
  PRESENT_OT: ['P', 'Present with overtime', 'rgba(31,169,122,0.10)', '#157A5B'],
  ABSENT: ['A', 'Absent', 'rgba(244,63,94,0.10)', '#E11D48'],
  HALF_DAY: ['HD', 'Half day', 'rgba(245,178,46,0.13)', '#8A5A06'],
  ON_LEAVE: ['L', 'On leave', 'rgba(124,77,255,0.10)', '#6B3FE8'],
  LEAVE_WITHOUT_PAY: ['LWP', 'Leave without pay', 'rgba(244,63,94,0.07)', '#B4304A'],
  HOLIDAY: ['H', 'Festival or public holiday', 'rgba(34,211,238,0.13)', '#0E7490'],
  WEEKLY_HOLIDAY: ['W', 'Weekly holiday', 'rgba(22,23,42,0.05)', '#6E6883'],
  ON_DUTY: ['OD', 'On duty', 'rgba(34,211,238,0.10)', '#0E7490'],
  EXCEPTION: ['!', 'Unresolved exception', 'rgba(244,63,94,0.16)', '#C21C42'],
};

/** `u` for leave without pay: `w` would collide with weekly holiday, which is not settable. */
export const STATUS_KEYS: Record<string, DayStatus> = {
  p: 'PRESENT',
  a: 'ABSENT',
  l: 'ON_LEAVE',
  h: 'HALF_DAY',
  u: 'LEAVE_WITHOUT_PAY',
  o: 'ON_DUTY',
};

export const SETTABLE: DayStatus[] = ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'LEAVE_WITHOUT_PAY', 'ON_DUTY'];

export const PERIOD: Record<PeriodStatus, { label: string; dot: string; bg: string; bd: string; c: string; meaning: string }> = {
  OPEN: { label: 'Open', dot: '#1FA97A', bg: 'rgba(31,169,122,0.09)', bd: 'rgba(31,169,122,0.28)', c: '#157A5B', meaning: 'Punches still arriving' },
  REVIEW: { label: 'Review', dot: '#F5B22E', bg: 'rgba(245,178,46,0.11)', bd: 'rgba(245,178,46,0.34)', c: '#8A5A06', meaning: 'The month has ended: resolve the exceptions, then lock' },
  LOCKED: { label: 'Locked', dot: '#7C4DFF', bg: 'rgba(124,77,255,0.09)', bd: 'rgba(124,77,255,0.28)', c: '#5A2BE0', meaning: 'Closed: payroll may read it' },
};

export const MIN_REASON = 10;

/** 480 -> "8h", 510 -> "8h 30m". */
export function hours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** 90 -> "1.5". The OT column reads hours to one place. */
export const hoursDecimal = (minutes: number) => (Math.round((minutes / 60) * 10) / 10).toString();

/** "17:30" -> 1050. Past midnight: `nextDay` adds 1440. Empty or malformed -> null. */
export function toMinutes(hhmm: string, nextDay = false): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min + (nextDay ? 1440 : 0);
}

/** 1050 -> "17:30"; 1800 -> "06:00". */
export function fromMinutes(minutes: number): string {
  const rest = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(rest / 60)).padStart(2, '0')}:${String(rest % 60).padStart(2, '0')}`;
}

/** "2026-10" for the month containing `d`. */
export const monthOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split('-').map(Number);
  return monthOf(new Date(y, m - 1 + by, 1));
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/** "2026-10-14" -> "14 Oct". */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** "2026-10-01" -> "Thursday". From the date: a one-letter T or S is two days. */
export function weekdayName(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long' });
}

/** `employeeCode,punchedAt,direction`, one punch a line; a header line is skipped. */
export function parsePunchCsv(text: string): Record<string, string>[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/[,\t;]/).map((c) => c.trim().replace(/^"|"$/g, '')))
    .filter((cells) => !/^employee/i.test(cells[0] ?? ''))
    .map(([employeeCode = '', punchedAt = '', direction = '']) => ({ employeeCode, punchedAt, direction }));
}
