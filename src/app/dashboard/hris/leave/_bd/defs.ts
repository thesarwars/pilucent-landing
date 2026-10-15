/** Leave console vocabulary: colours (spec §4), figures, dates and the CSV export (§6.4). */

import type { AccrualOutcome, Phase, Position, TypeCode } from './types';

/** Days for display: one place, client-side (backend §2.2). The API sends exact decimal strings. */
export function fmtDays(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export const plural = (value: string | number, one: string, many = one + 's') => `${fmtDays(value)} ${Number(value) === 1 ? one : many}`;

/** §6.3: never a negative spendable — `0`, with the shortfall named. */
export function spendableShown(p: Position): { figure: string; note: string } {
  const sp = Number(p.spendable);
  const parts: string[] = [];
  if (Number(p.held)) parts.push(`${fmtDays(p.held)} held`);
  if (Number(p.committed)) parts.push(`${fmtDays(p.committed)} booked ahead`);
  const decomposition = parts.length ? `${fmtDays(p.balance)} less ${parts.join(', ')}` : `${fmtDays(p.balance)} on the ledger`;
  if (sp < 0) return { figure: '0', note: `${decomposition} · ${fmtDays(-sp)} short` };
  return { figure: fmtDays(sp), note: decomposition };
}

/** §4.3: pending is the only hatch; statutory-and-not-refusable is its own violet. */
export function kindFill(type: TypeCode, pending: boolean, nonRefusable: boolean): string {
  if (pending) return 'repeating-linear-gradient(45deg, #D69E2E 0 3px, rgba(255,255,255,0.55) 3px 6px)';
  if (nonRefusable) return '#6B3FA0';
  return TYPE_COLOUR[type] ?? '#157A5B';
}

export const TYPE_COLOUR: Record<string, string> = {
  EARNED: '#157A5B',
  CASUAL: '#0E6C93',
  SICK: '#BE123C',
  COMPENSATORY: '#9A5B13',
  BEREAVEMENT: '#44405C',
  MATERNITY: '#6B3FA0',
};

export const TYPE_SHORT: Record<string, string> = {
  EARNED: 'Earned',
  CASUAL: 'Casual',
  SICK: 'Sick',
  MATERNITY: 'Maternity',
  COMPENSATORY: 'Compensatory',
  BEREAVEMENT: 'Bereavement',
};

export type Tone = 'pos' | 'warn' | 'neg' | 'violet' | 'neutral';

export const PHASE: Record<Phase, { label: string; tone: Tone }> = {
  SUBMITTED: { label: 'Waiting', tone: 'warn' },
  APPROVED: { label: 'Approved', tone: 'pos' },
  IN_PROGRESS: { label: 'On leave now', tone: 'violet' },
  TAKEN: { label: 'Taken', tone: 'neutral' },
  DECLINED: { label: 'Declined', tone: 'neg' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
  WITHDRAWN: { label: 'Withdrawn', tone: 'neutral' },
};

export const OUTCOME: Record<AccrualOutcome, { label: string; tone: Tone }> = {
  OK: { label: 'Will post', tone: 'pos' },
  CAPPED: { label: 'At the cap', tone: 'warn' },
  NOT_ELIGIBLE: { label: 'Not eligible', tone: 'neutral' },
  ALREADY_POSTED: { label: 'Already posted', tone: 'violet' },
  REFUSED: { label: 'Refused', tone: 'neg' },
  NEEDS_DAYS: { label: 'Needs days worked', tone: 'warn' },
};

export const ESTABLISHMENT: Record<string, string> = {
  FACTORY: 'Factory',
  SHOP: 'Shop',
  COMMERCIAL_ESTABLISHMENT: 'Commercial establishment',
  INDUSTRIAL_ESTABLISHMENT: 'Industrial establishment',
  ROAD_TRANSPORT: 'Road transport',
  TEA_PLANTATION: 'Tea plantation',
  NEWSPAPER: 'Newspaper',
};

/* ── dates, from string parts (backend §2.3) ───────────────────────── */

const parts = (iso: string) => iso.split('-').map(Number);

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = parts(iso);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function longDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = parts(iso);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function span(from: string, to: string): string {
  return from === to ? longDate(from) : `${shortDate(from)} – ${longDate(to)}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function monthLabel(month: string): string {
  const [y, m] = parts(month);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function shiftMonth(month: string, by: number): string {
  const [y, m] = parts(month);
  const d = new Date(y, m - 1 + by, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/* ── CSV (§6.4) ─────────────────────────────────────────────────────── */

/** Every field quoted, quotes doubled, CRLF line ends. */
export function csv<T>(cols: { label: string; get: (row: T) => unknown }[], rows: T[]): string {
  const cell = (v: unknown) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  return [cols.map((c) => cell(c.label)).join(',')].concat(rows.map((r) => cols.map((c) => cell(c.get(r))).join(','))).join('\r\n');
}

/** With a UTF-8 BOM: without it Excel on Windows renders Bangla as mojibake. */
export function download(name: string, text: string) {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const MIN_REASON = 10;
export const reasonError = (text: string) =>
  text.trim().length >= MIN_REASON ? null : `A reason of at least ${MIN_REASON} characters (${text.trim().length} so far).`;
