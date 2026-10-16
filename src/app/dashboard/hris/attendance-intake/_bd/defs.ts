/** Labels, tones and formatting for the intake screens. Pure: tested on its own. */

import type { BatchStatus, ParseError, PeriodState, Severity } from './types';

export const ROW_STRUCTURE: Record<string, string> = {
  EVENT_LOG: 'Event log — one row per punch',
  PAIRED_COLUMNS: 'Paired columns — in and out on one row',
};
export const DIRECTION: Record<string, string> = {
  EXPLICIT_COLUMN: 'Explicit column',
  ALTERNATE: 'Alternate — odd in, even out',
  FIRST_LAST: 'First and last of day',
  PAIRED: 'Paired columns',
};
export const MATCHING: Record<string, string> = {
  DEVICE_ID_MAP: 'Device ID map',
  EMPLOYEE_CODE: 'Employee code',
  NID: 'NID',
};
export const TARGET_LABEL: Record<string, string> = {
  deviceUserId: 'Device user ID', employeeCode: 'Employee code', date: 'Date', time: 'Time', inTime: 'In time',
  outTime: 'Out time', direction: 'Direction', terminal: 'Terminal', datetime: 'Date and time',
};

export const SEVERITY: Record<Severity, { label: string; tone: string }> = {
  BLOCKS: { label: 'Blocks', tone: 'neg' },
  WARNS: { label: 'Warns', tone: 'warn' },
  INFO: { label: 'Info', tone: 'neutral' },
};

export const BATCH_STATUS: Record<BatchStatus, { label: string; tone: string }> = {
  UPLOADED: { label: 'Uploaded', tone: 'neutral' },
  PARSED: { label: 'Parsed', tone: 'neutral' },
  VALIDATED: { label: 'Checked', tone: 'violet' },
  PROCESSING: { label: 'Processing', tone: 'violet' },
  PROCESSED: { label: 'Processed', tone: 'pos' },
  FAILED: { label: 'Failed', tone: 'neg' },
  REVERSED: { label: 'Reversed', tone: 'neutral' },
};

export const PERIOD_STATE: Record<PeriodState, { label: string; tone: string }> = {
  OPEN: { label: 'Open', tone: 'neutral' },
  PROCESSING: { label: 'Processing', tone: 'violet' },
  REVIEW: { label: 'Review', tone: 'warn' },
  LOCKED: { label: 'Locked', tone: 'pos' },
};
export const NEXT_STATE: Record<PeriodState, PeriodState | null> = { OPEN: 'PROCESSING', PROCESSING: 'REVIEW', REVIEW: 'LOCKED', LOCKED: null };

/** The step a batch is on, for the stepper: upload, parse, validate, process. */
export function stepOf(status: BatchStatus | null | undefined): number {
  switch (status) {
    case 'UPLOADED': return 1;
    case 'PARSED': return 2;
    case 'VALIDATED': return 3;
    case 'PROCESSED': case 'REVERSED': return 4;
    default: return 0;
  }
}

/** "row 47 · date "32/03/2027" is not a valid date" -- the row and the raw value, always (§6.2). */
export const errorLine = (e: ParseError) => `row ${e.row} · ${e.message}`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function shortDate(iso?: string | null) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : '—';
}
export function when(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${shortDate(iso.slice(0, 10))}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
export const range = (r?: { from: string; to: string } | null) => (r ? `${r.from} → ${r.to}` : '—');
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
export function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Device user 0217 suggests EMP-0217 -- the same rule as the server, shown, never applied. */
export function lastFour(code: string) {
  const digits = code.replace(/\D/g, '');
  return digits ? digits.slice(-4).padStart(4, '0') : '';
}

export const MIN_REASON = 10;
export const reasonShort = (s: string) => s.trim().length < MIN_REASON;
