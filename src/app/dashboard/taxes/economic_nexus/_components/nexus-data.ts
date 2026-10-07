/**
 * Economic Nexus — demo data model + pure helpers.
 *
 * Compute-ahead / read-fast: the UI reads pre-computed per-state rows and only
 * derives status/segments/meters from them (nothing aggregates network data on
 * load). When a backend lands, swap {@link DEMO_STATES} for the fetched rows —
 * every helper here is pure and keeps working.
 */
import type { VioletTone } from '@/components/violet';

export type NexusStatus = 'registered' | 'met' | 'approaching' | 'monitored' | 'na';
/** Segment filter, mirrored by the four stat tiles. `all` === "Monitored" (everything tracked). */
export type Segment = 'all' | 'registered' | 'action' | 'approaching';

export type Combination = 'sales_or_txn' | 'sales_and_txn' | 'sales_only';

export interface StateRule {
  /** Statewide sales threshold in dollars, or `null` for no statewide sales tax. */
  salesThreshold: number | null;
  /** Transaction-count threshold, or `null` when the state has no transaction test. */
  txnThreshold: number | null;
  combination: Combination;
  /** e.g. "Gross sales", "Retail sales". */
  includableSales: string;
  /** Long form, e.g. "Current calendar year · Jan 1 – Dec 31, 2026". */
  measurementPeriod: string;
  note?: string;
}

export interface Contributing {
  customer: string;
  ref: string;
  date: string;
  amount: number;
}

export interface NexusState {
  code: string;
  name: string;
  /** Short measurement-window sub shown on the row + hero, e.g. "Jan 1 – Dec 31 2026". */
  window: string;
  taxableSales: number;
  txnCount: number | null;
  rule: StateRule;
  /** Baseline registration (may be overridden at runtime by the wizard). */
  registered?: boolean;
  /** When the threshold was crossed / registration took effect (for exposure + history). */
  since?: string;
  /** Effective blended rate used for estimated-exposure math (demo only). */
  avgRate?: number;
  contributing?: Contributing[];
  /** Server-computed verdict (nexus_frontend.md §1). Preferred over local math when present. */
  serverStatus?: NexusStatus;
}

export interface NexusAlert {
  /** Backend alert id — present for API alerts, absent for locally-derived ones. */
  uid?: string;
  code: string;
  name: string;
  kind: 'crossed' | 'approaching';
  /** Percent of the governing threshold at trigger time. */
  pct: number;
  when: string;
  acknowledged?: boolean;
}

/* ── API mapping (nexus_frontend.md) ──────────────────────────────────── */

// `status` verdict → local status. `combination_logic` → local combination.
const STATUS_FROM_API: Record<string, NexusStatus> = {
  NOT_APPROACHING: 'monitored',
  APPROACHING: 'approaching',
  MET: 'met',
  REGISTERED: 'registered',
  NOT_APPLICABLE: 'na',
};
const COMBINATION_FROM_API: Record<string, Combination> = {
  SALES_ONLY: 'sales_only',
  OR: 'sales_or_txn',
  AND: 'sales_and_txn',
  NONE: 'sales_only',
};
const BASIS_LABEL: Record<string, string> = {
  GROSS: 'Gross sales',
  RETAIL: 'Retail sales',
  TAXABLE: 'Taxable sales',
};
const PERIOD_LABEL: Record<string, string> = {
  CURRENT_YEAR: 'Current calendar year',
  PREVIOUS_YEAR: 'Prior calendar year',
  CURRENT_OR_PREVIOUS_YEAR: 'Current or previous calendar year',
  TRAILING_12_MONTHS: 'Trailing 12 months',
  PRIOR_FOUR_QUARTERS: 'Trailing four sales-tax quarters',
};

const titleCase = (v: string): string =>
  `${v || ''}`.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const parseDate = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const d = new Date(`${iso}`.length <= 10 ? `${iso}T00:00:00` : `${iso}`);
  return isNaN(d.getTime()) ? null : d;
};

/** "2026-01-01" + "2026-07-07" → "Jan 1 – Jul 7 2026". */
function fmtWindow(start?: string, end?: string): string {
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e) return '';
  const md = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${md(s)} – ${md(e)} ${e.getFullYear()}`;
}

/** "2026-06-01" → "Jun 2026". */
function fmtMonthYear(iso?: string | null): string | undefined {
  const d = parseDate(iso);
  return d ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : undefined;
}

/** ISO timestamp → "Jun 1" (falls back to "recently"). */
function fmtWhen(iso?: string | null): string {
  const d = parseDate(iso);
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'recently';
}

/** Map one `/nexus/dashboard` (or `/nexus/state`) row to a {@link NexusState}. */
export function fromApiState(r: any): NexusState {
  const hasTax = r.has_sales_tax !== false;
  return {
    code: r.state_code,
    name: r.state_name ?? r.state_code,
    window: fmtWindow(r.window_start, r.window_end),
    // sales_amount governs the sales threshold (pct_of_sales_threshold = sales_amount / sales_threshold)
    taxableSales: Number(r.sales_amount ?? r.taxable_sales_amount ?? 0),
    txnCount: r.txn_count ?? null,
    registered: r.registration_status === 'REGISTERED' || r.status === 'REGISTERED',
    serverStatus: STATUS_FROM_API[r.status],
    since: fmtMonthYear(r.threshold_met_date),
    rule: {
      salesThreshold: r.sales_threshold ?? null,
      txnThreshold: r.txn_threshold ?? null,
      combination: COMBINATION_FROM_API[r.combination_logic] ?? 'sales_or_txn',
      includableSales: BASIS_LABEL[r.includable_sales_basis] ?? (hasTax ? 'Gross sales' : '—'),
      measurementPeriod: hasTax
        ? PERIOD_LABEL[r.measurement_period_type] ?? titleCase(r.measurement_period_type)
        : 'No statewide sales tax',
      note: hasTax ? undefined : 'No statewide sales tax (DE · MT · NH · OR).',
    },
    contributing: [],
  };
}

/**
 * Normalize a {@link fetchNexusDashboard} response ({ count, rows }) to
 * `NexusState[]`, or `null` when there are no rows (so the page can fall back to
 * demo data before the backend is wired / the first recompute has run).
 */
export function mapNexusStates(data: any): NexusState[] | null {
  const rows = data?.rows ?? data?.results ?? data?.data ?? null;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows.map(fromApiState);
}

/** Map a `/nexus/alerts` response to {@link NexusAlert}[] (needs states for names). */
export function mapNexusAlerts(data: any, states: NexusState[]): NexusAlert[] | null {
  const rows = data?.results ?? data?.rows ?? null;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const nameByCode = new Map(states.map((s) => [s.code, s.name]));
  return rows.map((r: any) => ({
    uid: r.uid,
    code: r.state_code,
    name: nameByCode.get(r.state_code) ?? r.state_code,
    kind: r.alert_type === 'CROSSED' ? 'crossed' : 'approaching',
    pct: Math.round((r.threshold_pct_at_alert ?? 0) * 100),
    when: fmtWhen(r.triggered_at),
    acknowledged: !!r.acknowledged,
  }));
}

/* ── Pure helpers ─────────────────────────────────────────────────────── */

/** Resolved registration: a runtime override wins, else the baseline flag. */
export const resolveRegistered = (s: NexusState, reg: Record<string, boolean>): boolean =>
  reg[s.code] ?? !!s.registered;

export const estTax = (s: NexusState): number => s.taxableSales * (s.avgRate || 0);

export const pct = (v: number, t: number | null): number =>
  t && t > 0 ? (v / t) * 100 : 0;

export const salesMet = (s: NexusState): boolean =>
  s.rule.salesThreshold != null && s.taxableSales >= s.rule.salesThreshold;

export const txnMet = (s: NexusState): boolean =>
  s.rule.txnThreshold != null && s.txnCount != null && s.txnCount >= s.rule.txnThreshold;

/** Whether the governing combination test is satisfied by sales/transactions. */
export function isMet(s: NexusState): boolean {
  const sm = salesMet(s);
  const tm = txnMet(s);
  switch (s.rule.combination) {
    case 'sales_only':
      return sm;
    case 'sales_and_txn':
      return sm && tm;
    case 'sales_or_txn':
    default:
      return sm || tm;
  }
}

/**
 * Resolved status given runtime registration + manual physical-nexus marks.
 * Registration and a physical mark both resolve to REGISTERED (§4.1). When the
 * backend supplied a verdict we trust it; otherwise we compute numerically (demo).
 */
export function statusOf(
  s: NexusState,
  registered: boolean,
  marked: boolean
): NexusStatus {
  if (registered || marked) return 'registered';
  if (s.serverStatus) return s.serverStatus;
  if (s.rule.salesThreshold == null) return 'na';
  if (isMet(s)) return 'met';
  const sp = pct(s.taxableSales, s.rule.salesThreshold);
  const tp = s.rule.txnThreshold ? pct(s.txnCount || 0, s.rule.txnThreshold) : 0;
  if (sp >= 80 || tp >= 80) return 'approaching';
  return 'monitored';
}

export function statusMeta(st: NexusStatus): { label: string; tone: VioletTone } {
  switch (st) {
    case 'registered':
      return { label: 'Registered', tone: 'success' };
    case 'met':
      return { label: 'Met', tone: 'danger' };
    case 'approaching':
      return { label: 'Approaching', tone: 'warn' };
    case 'monitored':
      return { label: 'Monitored', tone: 'violet' };
    case 'na':
    default:
      return { label: 'N/A', tone: 'neutral' };
  }
}

/** Progress-meter color: met→green, ≥80%→amber, else violet. */
export function meterTone(percent: number, met: boolean): VioletTone {
  if (met) return 'success';
  if (percent >= 80) return 'warn';
  return 'violet';
}

export const METER_COLOR: Record<VioletTone, string> = {
  violet: '#7C4DFF',
  success: '#1FA97A',
  warn: '#F5B22E',
  danger: '#D2483E',
  rose: '#B43A6B',
  teal: '#0E7490',
  neutral: '#C9C4D6',
};

/** Status-colored detail-hero gradient + glow orb. */
export const HERO_GRAD: Record<NexusStatus, string> = {
  registered: 'linear-gradient(135deg,#0E5C3E,#1FA97A)',
  met: 'linear-gradient(135deg,#7A2018,#D2483E)',
  approaching: 'linear-gradient(135deg,#7A5106,#D9930B)',
  monitored: 'linear-gradient(135deg,#211B38,#5B46A0)',
  na: 'linear-gradient(135deg,#33323F,#6F6A85)',
};
export const HERO_ORB: Record<NexusStatus, string> = {
  registered: 'radial-gradient(circle, rgba(110,231,183,0.45), transparent 70%)',
  met: 'radial-gradient(circle, rgba(249,168,199,0.4), transparent 70%)',
  approaching: 'radial-gradient(circle, rgba(245,178,46,0.42), transparent 70%)',
  monitored: 'radial-gradient(circle, rgba(167,139,255,0.45), transparent 70%)',
  na: 'radial-gradient(circle, rgba(255,255,255,0.16), transparent 70%)',
};

export const COMBINATION_LABEL: Record<Combination, string> = {
  sales_or_txn: 'Sales OR transactions',
  sales_and_txn: 'Sales AND transactions',
  sales_only: 'Sales only',
};

/** Compact money for meters / thresholds: 500000 → "$500k", 1000000 → "$1m". */
export function shortMoney(n: number | null): string {
  if (n == null) return '—';
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return '$' + (v % 1 ? v.toFixed(1) : v.toFixed(0)) + 'm';
  }
  if (n >= 1000) {
    const v = n / 1000;
    return '$' + (v % 1 ? v.toFixed(1) : v.toFixed(0)) + 'k';
  }
  return '$' + n;
}

/** One-line verdict for the detail hero. */
export function verdict(s: NexusState, st: NexusStatus): string {
  if (st === 'registered') return 'Registered — collecting here.';
  if (st === 'na') return 'No statewide sales tax to collect.';
  const sm = salesMet(s);
  const tm = txnMet(s);
  if (st === 'met') {
    if (s.rule.combination === 'sales_and_txn') return 'Both the sales and transaction tests are met.';
    if (sm && tm) return 'Both tests met.';
    if (tm) return 'Met on the transaction test.';
    return 'Met on the sales test.';
  }
  const sp = Math.round(pct(s.taxableSales, s.rule.salesThreshold));
  return `${sp}% of the sales threshold.`;
}

/* ── Demo data ────────────────────────────────────────────────────────── */

const CY = 'Current calendar year · Jan 1 – Dec 31, 2026';
const PC = 'Prior + current calendar year';
const T12 = 'Trailing 12 months';

export const DEMO_STATES: NexusState[] = [
  {
    code: 'CA',
    name: 'California',
    window: 'Jan 1 – Dec 31 2026',
    taxableSales: 512300,
    txnCount: null,
    registered: true,
    since: 'Mar 2026',
    avgRate: 0.0863,
    rule: {
      salesThreshold: 500000,
      txnThreshold: null,
      combination: 'sales_only',
      includableSales: 'Gross sales',
      measurementPeriod: CY,
      note: 'Higher dollar threshold; no transaction test.',
    },
    contributing: [
      { customer: 'Northwind Retail', ref: 'INV-2041', date: 'Jun 18, 2026', amount: 42800 },
      { customer: 'Bayside Grocers', ref: 'INV-1994', date: 'May 30, 2026', amount: 38150 },
      { customer: 'Pacific Outfitters', ref: 'INV-1902', date: 'Apr 22, 2026', amount: 29940 },
    ],
  },
  {
    code: 'NV',
    name: 'Nevada',
    window: 'Jan 1 – Dec 31 2026',
    taxableSales: 128400,
    txnCount: 640,
    registered: true,
    since: 'Feb 2026',
    avgRate: 0.0823,
    rule: {
      salesThreshold: 100000,
      txnThreshold: 200,
      combination: 'sales_or_txn',
      includableSales: 'Retail sales',
      measurementPeriod: PC,
    },
    contributing: [
      { customer: 'Silver State Supply', ref: 'INV-2088', date: 'Jun 09, 2026', amount: 12400 },
      { customer: 'Reno Hospitality Co', ref: 'INV-2012', date: 'May 14, 2026', amount: 9600 },
    ],
  },
  {
    code: 'TX',
    name: 'Texas',
    window: 'Jul 2025 – Jun 2026',
    taxableSales: 623900,
    txnCount: 1240,
    since: 'Jun 2026',
    avgRate: 0.0819,
    rule: {
      salesThreshold: 500000,
      txnThreshold: null,
      combination: 'sales_only',
      includableSales: 'Gross sales',
      measurementPeriod: T12,
      note: 'Single $500k threshold; measured over the trailing year.',
    },
    contributing: [
      { customer: 'Lone Star Wholesale', ref: 'INV-2101', date: 'Jun 26, 2026', amount: 58200 },
      { customer: 'Gulf Coast Traders', ref: 'INV-2077', date: 'Jun 03, 2026', amount: 41100 },
      { customer: 'Hill Country Foods', ref: 'INV-2039', date: 'May 19, 2026', amount: 33750 },
    ],
  },
  {
    code: 'NY',
    name: 'New York',
    window: 'Jun 2025 – May 2026',
    taxableSales: 612300,
    txnCount: 940,
    since: 'May 2026',
    avgRate: 0.0852,
    rule: {
      salesThreshold: 500000,
      txnThreshold: 100,
      combination: 'sales_and_txn',
      includableSales: 'Gross sales',
      measurementPeriod: 'Trailing four sales-tax quarters',
      note: 'Both the sales AND transaction tests must be met.',
    },
    contributing: [
      { customer: 'Empire Distributors', ref: 'INV-2120', date: 'May 28, 2026', amount: 47600 },
      { customer: 'Hudson Valley Mkt', ref: 'INV-2064', date: 'Apr 30, 2026', amount: 35200 },
    ],
  },
  {
    code: 'IL',
    name: 'Illinois',
    window: 'Jan 1 – Dec 31 2026',
    taxableSales: 142800,
    txnCount: 260,
    since: 'Jun 2026',
    avgRate: 0.0881,
    rule: {
      salesThreshold: 100000,
      txnThreshold: 200,
      combination: 'sales_or_txn',
      includableSales: 'Retail sales',
      measurementPeriod: PC,
    },
  },
  {
    code: 'WA',
    name: 'Washington',
    window: 'Jan 1 – Dec 31 2026',
    taxableSales: 118700,
    txnCount: 205,
    since: 'Jun 2026',
    avgRate: 0.0921,
    rule: {
      salesThreshold: 100000,
      txnThreshold: 200,
      combination: 'sales_or_txn',
      includableSales: 'Gross sales',
      measurementPeriod: CY,
    },
  },
  {
    code: 'GA',
    name: 'Georgia',
    window: 'Jan 1 – Dec 31 2026',
    taxableSales: 92400,
    txnCount: 182,
    avgRate: 0.0735,
    rule: {
      salesThreshold: 100000,
      txnThreshold: 200,
      combination: 'sales_or_txn',
      includableSales: 'Retail sales',
      measurementPeriod: PC,
    },
  },
  {
    code: 'CO',
    name: 'Colorado',
    window: 'Jan 1 – Dec 31 2026',
    taxableSales: 86300,
    txnCount: 150,
    avgRate: 0.0770,
    rule: {
      salesThreshold: 100000,
      txnThreshold: null,
      combination: 'sales_only',
      includableSales: 'Retail sales',
      measurementPeriod: PC,
    },
  },
  {
    code: 'FL',
    name: 'Florida',
    window: 'Jan 1 – Dec 31 2026',
    taxableSales: 88900,
    txnCount: null,
    avgRate: 0.0705,
    rule: {
      salesThreshold: 100000,
      txnThreshold: null,
      combination: 'sales_only',
      includableSales: 'Retail sales',
      measurementPeriod: 'Prior calendar year',
    },
  },
  {
    code: 'AZ',
    name: 'Arizona',
    window: 'Jan 1 – Dec 31 2026',
    taxableSales: 34900,
    txnCount: 90,
    avgRate: 0.0837,
    rule: {
      salesThreshold: 100000,
      txnThreshold: null,
      combination: 'sales_only',
      includableSales: 'Gross sales',
      measurementPeriod: PC,
    },
  },
  {
    code: 'AL',
    name: 'Alabama',
    window: 'Jan 1 – Dec 31 2026',
    taxableSales: 0,
    txnCount: 0,
    avgRate: 0.0922,
    rule: {
      salesThreshold: 250000,
      txnThreshold: null,
      combination: 'sales_only',
      includableSales: 'Retail sales',
      measurementPeriod: 'Prior calendar year',
    },
  },
  {
    code: 'AK',
    name: 'Alaska',
    window: 'Jan 1 – Dec 31 2026',
    taxableSales: 22100,
    txnCount: 61,
    avgRate: 0,
    rule: {
      salesThreshold: null,
      txnThreshold: null,
      combination: 'sales_only',
      includableSales: '—',
      measurementPeriod: 'No statewide measurement',
      note: 'No statewide sales tax — only local ARSSTC jurisdictions collect.',
    },
  },
];
