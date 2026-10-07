'use client';

import * as React from 'react';
import { Download, Info, Printer, Search, SlidersHorizontal, Settings2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiSelect, VioletButton } from '@/components/violet';
import {
  countActiveFilters,
  EMPTY_FILTERS,
  personName,
  type ColumnLabels,
  type Direction,
  type DirectionCounts,
  type RegisterFilters,
  type RegisterRow,
  type RegisterStatus,
} from './registerModel';

/* ── column set ──────────────────────────────────────────────────────── */

/**
 * `CLASS` from the design mock is deliberately absent: no class / department
 * dimension exists in the data model. `STORE` maps to the backend's Warehouse,
 * and is null on most bank rows by design — only Sales, Purchases and Credit
 * Notes carry one — so it ships hidden.
 *
 * The two money columns are keyed `deposit` / `payment` after the row fields
 * they render. They are never `debit` / `credit`: the server already signs
 * these in the account's own direction, so a credit card inverts server-side.
 */
export type ColKey =
  | 'date'
  | 'refNo'
  | 'type'
  | 'payee'
  | 'memo'
  | 'category'
  | 'store'
  | 'payment'
  | 'deposit'
  | 'status'
  | 'balance';

/** Fallback headings; the two money columns are overridden by `column_labels`. */
export const COLUMN_LABELS: Record<ColKey, string> = {
  date: 'Date',
  refNo: 'Ref no.',
  type: 'Type',
  payee: 'Payee',
  memo: 'Memo',
  category: 'Category',
  store: 'Store',
  payment: 'Payment',
  deposit: 'Deposit',
  status: 'Status',
  balance: 'Balance',
};

/** Locked columns anchor the row's meaning and cannot be hidden. */
export const LOCKED_COLUMNS: ColKey[] = ['date', 'payee'];

export const DEFAULT_VISIBLE: Record<ColKey, boolean> = {
  date: true,
  refNo: true,
  type: true,
  payee: true,
  memo: true,
  category: true,
  store: false,
  payment: true,
  deposit: true,
  status: true,
  balance: true,
};

export interface DisplaySettings {
  visible: Record<ColKey, boolean>;
  compact: boolean;
  groupByMonth: boolean;
}

/* ── props ───────────────────────────────────────────────────────────── */

export interface RegisterToolbarProps {
  search: string;
  onSearch: (v: string) => void;
  filters: RegisterFilters;
  onFilters: (f: RegisterFilters) => void;
  /** Type options derived from the loaded rows. */
  kinds: { value: string; label: string }[];
  rows: RegisterRow[];
  settings: DisplaySettings;
  onSettings: (s: DisplaySettings) => void;
  limit: number;
  onLimit: (n: number) => void;
  onExport: () => void;
  onPrint: () => void;
  /** Money-column headings, from the account header's `column_labels`. */
  labels: ColumnLabels;
  /** Rows after filtering / rows on the page. */
  shown: number;
  total: number;
  directions: DirectionCounts;
}

const STATUS_CHIPS: { value: RegisterStatus | 'ANY'; label: string; dot?: string }[] = [
  { value: 'ANY', label: 'Any status' },
  { value: 'U', label: 'Unreconciled', dot: 'bg-v-border' },
  { value: 'C', label: 'Cleared', dot: 'bg-v-warn-fg' },
  { value: 'R', label: 'Reconciled', dot: 'bg-v-success-solid' },
];

/** `limit` is capped at 100 server-side; anything larger is not honoured. */
const PAGE_SIZES = [25, 50, 75, 100];

export function RegisterToolbar({
  search,
  onSearch,
  filters,
  onFilters,
  kinds,
  rows,
  settings,
  onSettings,
  limit,
  onLimit,
  onExport,
  onPrint,
  labels,
  shown,
  total,
  directions,
}: RegisterToolbarProps) {
  const [openPanel, setOpenPanel] = React.useState<'filter' | 'gear' | null>(null);
  const [draft, setDraft] = React.useState(search);

  // Keep the box in step when the page resets the term (e.g. account switch).
  React.useEffect(() => setDraft(search), [search]);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      // ApiSelect portals its menu to <body>; treat it as inside the panel.
      if (t.closest?.('[data-register-keep]') || t.closest?.('[role="listbox"]')) return;
      setOpenPanel(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const active = countActiveFilters(filters);
  const set = (patch: Partial<RegisterFilters>) => onFilters({ ...filters, ...patch });
  const setVisible = (k: ColKey, on: boolean) =>
    onSettings({ ...settings, visible: { ...settings.visible, [k]: on } });

  const toggleKind = (v: string) =>
    set({
      kinds: filters.kinds.includes(v)
        ? filters.kinds.filter((k) => k !== v)
        : [...filters.kinds, v],
    });

  const colLabel = (k: ColKey) =>
    k === 'payment' ? labels.payment : k === 'deposit' ? labels.deposit : COLUMN_LABELS[k];

  return (
    <div className="flex flex-wrap items-center gap-2.5" data-noprint>
      {/* Direction chips. `deposit`/`payment` arrive signed in the account's own
          direction, so these read Deposit/Payment on a bank and Charge/Payment
          on a credit card without the client flipping anything. Page-scoped:
          the endpoint has no direction parameter. */}
      <div className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/70 p-1 shadow-[0_8px_22px_-14px_rgba(22,23,42,0.4)] backdrop-blur">
        {(
          [
            { value: 'ANY', label: 'All', count: directions.all, dot: '' },
            {
              value: 'IN',
              label: labels.deposit,
              count: directions.in,
              dot: 'bg-v-success-solid',
            },
            {
              value: 'OUT',
              label: labels.payment,
              count: directions.out,
              dot: 'bg-v-warn-fg',
            },
          ] as { value: Direction; label: string; count: number; dot: string }[]
        ).map((c) => {
          const on = filters.direction === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => set({ direction: c.value })}
              aria-pressed={on}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors',
                on ? 'bg-v-ink900 text-white' : 'text-v-ink700 hover:bg-v-tint100'
              )}
            >
              {c.dot && <span className={cn('h-[7px] w-[7px] rounded-full', c.dot)} />}
              {c.label}
              <span
                className={cn(
                  'text-[10.5px] font-semibold tabular-nums',
                  on ? 'text-white/65' : 'text-v-ink400'
                )}
              >
                {c.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search — server-side. Matches the memo, the entry number, the journal
          description and customer / supplier / employee names; multiple words
          are ANDed. It does not match amounts or the category. */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(draft);
        }}
        className="flex w-[260px] items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3.5 py-2.5 backdrop-blur"
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-v-ink400" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Search the ledger…"
          aria-label="Search the ledger"
          className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-medium text-v-ink900 outline-none placeholder:text-v-ink400"
        />
        {(draft || search) && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setDraft('');
              onSearch('');
            }}
            className="shrink-0 rounded-full p-0.5 text-v-ink400 hover:bg-v-wash2 hover:text-v-ink900"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </form>

      {/* Filters */}
      <div className="relative" data-register-keep>
        <button
          type="button"
          onClick={() => setOpenPanel((p) => (p === 'filter' ? null : 'filter'))}
          className={cn(
            'flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3.5 py-2.5 text-[13px] font-semibold backdrop-blur transition-colors hover:bg-white/90',
            active ? 'text-v-primary' : 'text-v-ink700'
          )}
        >
          <SlidersHorizontal className="h-[14px] w-[14px]" />
          {active ? `${active} filter${active > 1 ? 's' : ''}` : 'Filters'}
        </button>

        {openPanel === 'filter' && (
          <div
            data-register-keep
            className="absolute left-0 top-12 z-[80] w-[380px] animate-v-pop rounded-2xl border border-v-border bg-white p-4 shadow-v-card"
          >
            <div className="mb-3 flex items-center">
              <span className="flex-1 text-sm font-extrabold text-v-ink900">Filter register</span>
              <button
                type="button"
                onClick={() => onFilters({ ...EMPTY_FILTERS })}
                className="rounded-lg px-2 py-1 text-[12.5px] font-semibold text-v-primary hover:bg-v-tint150"
              >
                Clear all
              </button>
            </div>

            {/* Date range → `date_after` / `date_before`, the transaction date,
                inclusive at both ends. */}
            <div className="mb-3 grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-v-ink400">
                  Date from
                </span>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => set({ dateFrom: e.target.value })}
                  className="w-full rounded-v-input border border-v-border bg-white px-3 py-2 text-[13px] tabular-nums text-v-ink900 outline-none focus:border-v-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-v-ink400">
                  Date to
                </span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => set({ dateTo: e.target.value })}
                  className="w-full rounded-v-input border border-v-border bg-white px-3 py-2 text-[13px] tabular-nums text-v-ink900 outline-none focus:border-v-primary"
                />
              </label>
            </div>

            {/* Category account — page-scoped; the endpoint has no category param */}
            <FilterRow
              label="Category account"
              onClear={filters.category ? () => set({ category: null }) : undefined}
            >
              <ApiSelect
                endpoint="/we/chart-of-accounts"
                filters={{ status: 'ACTIVE' }}
                value={filters.category}
                onChange={(a: any) => set({ category: a })}
                getLabel={(a: any) => a?.title ?? ''}
                getMeta={(a: any) => a?.account_type?.title ?? ''}
                placeholder="Any account"
              />
            </FilterRow>

            {/* Payee — customers and suppliers are separate resources, and each
                has its own exact server filter (`customer__uid`/`supplier__uid`) */}
            <FilterRow
              label="Customer"
              onClear={filters.customer ? () => set({ customer: null }) : undefined}
            >
              <ApiSelect
                endpoint="/we/customers"
                filters={{ status: 'ACTIVE' }}
                value={filters.customer}
                onChange={(c: any) => set({ customer: c })}
                getLabel={personName}
                getMeta={(c: any) => c?.company_name ?? ''}
                placeholder="Any customer"
              />
            </FilterRow>

            <FilterRow
              label="Supplier"
              onClear={filters.supplier ? () => set({ supplier: null }) : undefined}
            >
              <ApiSelect
                endpoint="/we/suppliers"
                filters={{ status: 'ACTIVE' }}
                value={filters.supplier}
                onChange={(s: any) => set({ supplier: s })}
                getLabel={personName}
                getMeta={(s: any) => s?.company_name ?? ''}
                placeholder="Any supplier"
              />
            </FilterRow>

            {/* Store — the API models this as a Warehouse. Page-scoped. */}
            <FilterRow
              label="Store"
              onClear={filters.store ? () => set({ store: null }) : undefined}
            >
              <ApiSelect
                endpoint="/we/warehouses"
                value={filters.store}
                onChange={(w: any) => set({ store: w })}
                getLabel={(w: any) => w?.title ?? ''}
                placeholder="Any store"
              />
            </FilterRow>

            {/* Transaction type → `journal__kind`. One selection is account-wide;
                two or more stay page-scoped (the param takes a single value). */}
            <div className="mb-1 mt-3">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.05em] text-v-ink400">
                Transaction type
              </span>
              {kinds.length === 0 ? (
                <p className="text-[12px] text-v-ink400">No types on this page yet.</p>
              ) : (
                <div className="flex max-h-[104px] flex-wrap gap-1.5 overflow-y-auto">
                  {kinds.map((k) => {
                    const on = filters.kinds.includes(k.value);
                    return (
                      <button
                        key={k.value}
                        type="button"
                        onClick={() => toggleKind(k.value)}
                        aria-pressed={on}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors',
                          on
                            ? 'border-v-primary bg-v-tint150 text-v-primary'
                            : 'border-v-border bg-white text-v-ink500 hover:border-v-300'
                        )}
                      >
                        {k.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reconcile status → `reconciliation_status`, account-wide. */}
            <div className="mt-3">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.05em] text-v-ink400">
                Reconcile status
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_CHIPS.map((c) => {
                  const on = filters.status === c.value;
                  return (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => set({ status: c.value })}
                      aria-pressed={on}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors',
                        on
                          ? 'border-v-primary bg-v-tint150 text-v-primary'
                          : 'border-v-border bg-white text-v-ink500 hover:border-v-300'
                      )}
                    >
                      {c.dot && <span className={cn('h-[7px] w-[7px] rounded-full', c.dot)} />}
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-3 flex items-start gap-2 rounded-xl bg-v-wash2 px-3 py-2 text-[11.5px] leading-snug text-v-ink500">
              <Info className="mt-px h-3.5 w-3.5 shrink-0 text-v-ink400" />
              <span>
                Search, the date range, reconcile status, customer, supplier and a single
                transaction type are applied by the server across the whole account. Category,
                store, direction and a multi-type selection narrow the {rows.length}{' '}
                {rows.length === 1 ? 'line' : 'lines'} loaded on this page — raise rows per page to
                widen them.
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Display settings */}
      <div className="relative" data-register-keep>
        <button
          type="button"
          aria-label="Display settings"
          onClick={() => setOpenPanel((p) => (p === 'gear' ? null : 'gear'))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/80 bg-white/70 text-v-ink500 backdrop-blur transition-colors hover:bg-white/90 hover:text-v-primary"
        >
          <Settings2 className="h-4 w-4" />
        </button>

        {openPanel === 'gear' && (
          <div
            data-register-keep
            className="absolute right-0 top-12 z-[80] w-[292px] animate-v-pop rounded-2xl border border-v-border bg-white p-3.5 shadow-v-card"
          >
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-v-ink400">
              Columns
            </div>
            {(Object.keys(COLUMN_LABELS) as ColKey[]).map((k) => {
              const locked = LOCKED_COLUMNS.includes(k);
              return (
                <Switch
                  key={k}
                  label={colLabel(k)}
                  on={settings.visible[k]}
                  locked={locked}
                  onToggle={() => !locked && setVisible(k, !settings.visible[k])}
                />
              );
            })}

            <div className="mb-2 mt-3 border-t border-[rgba(22,23,42,0.07)] pt-3 text-[11px] font-bold uppercase tracking-[0.06em] text-v-ink400">
              Display
            </div>
            <Switch
              label="Group by month"
              on={settings.groupByMonth}
              onToggle={() => onSettings({ ...settings, groupByMonth: !settings.groupByMonth })}
            />
            <Switch
              label="Compact rows"
              on={settings.compact}
              onToggle={() => onSettings({ ...settings, compact: !settings.compact })}
            />

            <div className="mb-2 mt-3 border-t border-[rgba(22,23,42,0.07)] pt-3 text-[11px] font-bold uppercase tracking-[0.06em] text-v-ink400">
              Rows per page
            </div>
            <div className="flex gap-1.5">
              {PAGE_SIZES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onLimit(n)}
                  className={cn(
                    'flex-1 rounded-lg border py-1.5 text-[12.5px] font-semibold tabular-nums transition-colors',
                    limit === n
                      ? 'border-v-primary bg-v-tint150 text-v-primary'
                      : 'border-v-border bg-white text-v-ink500 hover:border-v-300'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <span className="flex-1" />

      <span className="text-[12.5px] tabular-nums text-v-ink400">
        {shown === total ? `${total} lines` : `${shown} of ${total} lines`}
      </span>

      <VioletButton
        variant="secondary"
        onClick={onPrint}
        leftIcon={<Printer className="h-[15px] w-[15px]" />}
      >
        Print
      </VioletButton>
      <VioletButton
        variant="secondary"
        onClick={onExport}
        title={`Export the ${shown} ${shown === 1 ? 'line' : 'lines'} shown on this page to XLSX`}
        leftIcon={<Download className="h-[15px] w-[15px]" />}
      >
        Export
      </VioletButton>
    </div>
  );
}

/* ── atoms ───────────────────────────────────────────────────────────── */

function FilterRow({
  label,
  onClear,
  children,
}: {
  label: string;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5">
      <div className="mb-1 flex items-center">
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-v-ink400">
          {label}
        </span>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-semibold text-v-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Switch({
  label,
  on,
  locked,
  onToggle,
}: {
  label: string;
  on: boolean;
  locked?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      disabled={locked}
      className={cn(
        'flex w-full items-center justify-between gap-3 py-1.5 text-left',
        locked && 'cursor-default'
      )}
    >
      <span className={cn('text-[13px]', locked ? 'text-v-ink400' : 'text-v-ink900')}>{label}</span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          on ? (locked ? 'bg-v-300' : 'bg-v-primary') : 'bg-v-border'
        )}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_rgba(22,23,42,0.28)] transition-all"
          style={{ left: on ? '18px' : '2px' }}
        />
      </span>
    </button>
  );
}
