/**
 * Formatting for company-wide figures (spec §5). An election's consequence
 * is a company figure, and the decision is "which order of magnitude":
 * `৳ 2.40 crore` reads, `৳ 2,40,00,000` is digit counting. Per-employee
 * figures keep the full amount -- a gratuity of `৳ 4.5 lakh` hides a
 * ৳47,000 difference between two bases.
 */

import { formatBDT, formatDate } from '@/app/dashboard/hris/employee/employees/_bd/format';

const MINUS = '−';

/** ৳ 2.40 crore from 1 crore, ৳ 3.3 lakh from 1 lakh, the full amount below. */
export function lakh(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? MINUS : '';
  if (abs >= 10_000_000) return `৳ ${sign}${(abs / 10_000_000).toFixed(2)} crore`;
  if (abs >= 100_000) return `৳ ${sign}${(abs / 100_000).toFixed(1)} lakh`;
  return formatBDT(String(Math.round(n)));
}

/** A delta with its sign: `+ ৳ 3.3 lakh`, `− ৳ 4,200`, `no change`. */
export function delta(value: string | number | null | undefined, short = true): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!n) return 'no change';
  const body = short ? lakh(Math.abs(n)) : formatBDT(String(Math.abs(n)));
  return `${n > 0 ? '+' : MINUS} ${body}`;
}

/** DD/MM/YYYY: Bangladesh is day-first, and so is a statutory document. */
export const dateBD = (iso: string | null | undefined) => formatDate(iso ?? null);

export const valueLabel = (options: { value: string; label: string }[], value: string | null | undefined) =>
  options.find((o) => o.value === value)?.label ?? value ?? '—';
