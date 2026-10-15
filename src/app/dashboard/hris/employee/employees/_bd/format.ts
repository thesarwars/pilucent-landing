/**
 * Display formatting for the BD screens (backend `common/words.py`, the
 * prototype's `words.js` / `i18n.js`).
 *
 * Money arrives as a decimal string and is grouped as a string — it never
 * passes through a float. Bangla numerals are a transliteration applied after
 * formatting, never a separate number path. A year is a label: month-year is
 * built from the date string, so 2026 can never come out as 2,026.
 */

import type { ISODate } from './types';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaNumerals(text: string): string {
  return text.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** Transliterate when Bangla numerals are on. */
export function digits(text: string | number, bangla: boolean): string {
  const s = String(text);
  return bangla ? toBanglaNumerals(s) : s;
}

/** `12,34,567` — the last three digits, then pairs. Integer part only. */
function groupInteger(whole: string): string {
  if (whole.length <= 3) return whole;
  const tail = whole.slice(-3);
  let head = whole.slice(0, -3);
  const pairs: string[] = [];
  while (head.length > 2) {
    pairs.unshift(head.slice(-2));
    head = head.slice(0, -2);
  }
  if (head) pairs.unshift(head);
  return [...pairs, tail].join(',');
}

/**
 * Group a decimal string South Asian style. `places` fixes the decimals
 * (truncating extra digits is never needed: the API sends two). By default a
 * whole amount shows none and any other shows two.
 */
export function groupSouthAsian(value: string | number | null | undefined, places?: number): string {
  if (value === null || value === undefined || value === '') return '—';
  const text = String(value).trim();
  const negative = text.startsWith('-');
  const [rawWhole, rawFraction = ''] = text.replace(/^[-+]/, '').split('.');
  const whole = rawWhole.replace(/^0+(?=\d)/, '') || '0';
  let fraction = rawFraction.replace(/0+$/, '');
  if (places === undefined) places = fraction ? 2 : 0;
  fraction = (fraction + '00').slice(0, places);
  const body = groupInteger(whole) + (places ? '.' + fraction : '');
  return (negative && /[1-9]/.test(body) ? '−' : '') + body;
}

/** `৳ 22,000` / `৳ ২২,০০০`. */
export function formatBDT(value: string | number | null | undefined, opts: { places?: number; bangla?: boolean } = {}): string {
  if (value === null || value === undefined || value === '') return '—';
  const s = groupSouthAsian(value, opts.places);
  return '৳ ' + (opts.bangla ? toBanglaNumerals(s) : s);
}

/** DD/MM/YYYY from YYYY-MM-DD, compared and split as a string (§4.5). */
export function formatDate(iso: ISODate | null | undefined, bangla = false): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!d) return digits(iso, bangla);
  return digits(`${d}/${m}/${y}`, bangla);
}

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
};

/** `February 2027` from `2027-02` or `2027-02-01`; the year is never grouped. */
export function formatMonthYear(value: string, lang: 'en' | 'bn' = 'en', bangla = false): string {
  const [y, m] = value.split('-');
  const name = MONTHS[lang][Number(m) - 1] ?? m;
  return `${name} ${digits(y, bangla || lang === 'bn')}`;
}

/** Today as YYYY-MM-DD in the browser's zone (the server's clock is the authority). */
export function todayISO(): ISODate {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "7y 11m 25d" from service parts. */
export function serviceLabel(s: { years: number; months: number; days: number } | null | undefined, bangla = false): string {
  if (!s) return '—';
  return digits(`${s.years}y ${s.months}m ${s.days}d`, bangla);
}

/** One helper for count + noun, so a pill can't read "1 items" (§3.3). */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Strip a typed amount ("৳50,000", "50 000") to a decimal string, or "". */
export function parseAmount(input: string): string {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  const fraction = rest.join('').slice(0, 2);
  if (!whole && !fraction) return '';
  return fraction ? `${whole || '0'}.${fraction}` : whole;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((p) => p && /[A-Za-zঀ-৿]/.test(p[0]) && !/^(md|mohammad|mohammed|mst)\.?$/i.test(p))
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}

/* ── money arithmetic, in integer paisa ───────────────────────────── */

/** "22000.50" → 2200050n. Anything past the paisa is dropped (the API sends two places). */
export function toPaisa(value: string | null | undefined): bigint {
  if (!value) return BigInt(0);
  const text = String(value).trim();
  const negative = text.startsWith('-');
  const [whole = '0', fraction = ''] = text.replace(/^[-+]/, '').split('.');
  const paisa = BigInt(whole || '0') * BigInt(100) + BigInt((fraction + '00').slice(0, 2) || '0');
  return negative ? -paisa : paisa;
}

export function fromPaisa(paisa: bigint): string {
  const negative = paisa < BigInt(0);
  const abs = negative ? -paisa : paisa;
  const hundred = BigInt(100);
  return `${negative ? '-' : ''}${abs / hundred}.${String(abs % hundred).padStart(2, '0')}`;
}

/** Sum decimal strings exactly. */
export function addMoney(...values: (string | null | undefined)[]): string {
  return fromPaisa(values.reduce((sum, v) => sum + toPaisa(v), BigInt(0)));
}

export function subtractMoney(a: string | null | undefined, b: string | null | undefined): string {
  return fromPaisa(toPaisa(a) - toPaisa(b));
}

/** (b − a) / a as a one-decimal percentage string, or null when a is zero. */
export function percentChange(a: string | null | undefined, b: string | null | undefined): string | null {
  const from = toPaisa(a);
  if (from === BigInt(0)) return null;
  const tenths = ((toPaisa(b) - from) * BigInt(1000)) / from;
  const sign = tenths < BigInt(0) ? '−' : '+';
  const abs = tenths < BigInt(0) ? -tenths : tenths;
  return `${sign}${abs / BigInt(10)}.${abs % BigInt(10)}%`;
}
