'use client';

import * as React from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  Search,
  Download,
  Plus,
  ChevronDown,
  MoreVertical,
  Columns3,
  Clock,
  Pencil,
  Trash2,
  GripVertical,
  Lock,
  Ban,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Calendar as CalendarIcon,
  FileBarChart2,
  X,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { CONTROL_ACCOUNT_HINT, toastApiError } from '@/lib/helpers/apiErrors';
import { reactivateAccount } from '@/app/helpers/backend';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Breadcrumb,
  VioletButton,
  VioletCard,
  Chip,
  money,
  type VioletTone,
} from '@/components/violet';
import { DeactivateAccountDialog } from './DeactivateAccountDialog';

/* ── account category + tone helpers ─────────────────────────────── */

const CATEGORIES = ['All', 'Asset', 'Liability', 'Equity', 'Income', 'Expense'] as const;
type Category = (typeof CATEGORIES)[number];

/** UI category → backend `kind` query value (server-side filter). */
const CATEGORY_KIND: Record<Exclude<Category, 'All'>, string> = {
  Asset: 'ASSETS',
  Liability: 'LIABILITIES',
  Equity: 'EQUITIES',
  Income: 'INCOMES',
  Expense: 'EXPENSES',
};

function categoryOf(typeTitle?: string): Exclude<Category, 'All'> | null {
  const t = (typeTitle || '').toLowerCase();
  if (/(asset|bank|cash|receivable|debtor|inventory|prepaid|deposit)/.test(t)) return 'Asset';
  if (/(liabilit|payable|creditor|credit card|loan|tax|accrual|trust|provision)/.test(t))
    return 'Liability';
  if (/(equity|retained|capital|drawing|owner|partner)/.test(t)) return 'Equity';
  // Expense before Income: 'Cost of Sales' contains 'sales' but is a COGS/Expense type.
  if (/(expense|cost|depreciation|amortis|amortiz)/.test(t)) return 'Expense';
  if (/(income|revenue|sales|fee)/.test(t)) return 'Income';
  return null;
}

const CAT_TONE: Record<Exclude<Category, 'All'>, VioletTone> = {
  Asset: 'violet',
  Liability: 'warn',
  Equity: 'teal',
  Income: 'success',
  Expense: 'neutral',
};

const TILE: Record<VioletTone, string> = {
  violet: 'bg-v-tint100 text-v-primary',
  success: 'bg-v-success-bg text-v-success-fg',
  warn: 'bg-v-warn-bg text-v-warn-fg',
  danger: 'bg-v-danger-bg text-v-danger-fg',
  rose: 'bg-v-rose-bg text-v-rose-fg',
  teal: 'bg-v-teal-bg text-v-teal-fg',
  neutral: 'bg-v-wash2 text-v-ink500',
};

function toneOf(typeTitle?: string): VioletTone {
  const cat = categoryOf(typeTitle);
  return cat ? CAT_TONE[cat] : 'violet';
}

const ymd = (d?: Date) =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    : undefined;
const prettyDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── columns ─────────────────────────────────────────────────────── */

type ColKey = 'account' | 'type' | 'detail' | 'currency' | 'balance';
type SortKey = 'title' | 'type' | 'detail' | 'balance' | null;

const COLUMN_DEFS: Record<
  ColKey,
  { label: string; w: string; align: 'left' | 'right'; sortKey: SortKey; locked?: boolean }
> = {
  account: { label: 'Account', w: 'minmax(0,2fr)', align: 'left', sortKey: 'title', locked: true },
  type: { label: 'Type', w: '150px', align: 'left', sortKey: 'type' },
  detail: { label: 'Detail type', w: 'minmax(0,1.4fr)', align: 'left', sortKey: 'detail' },
  currency: { label: 'Currency', w: '92px', align: 'left', sortKey: null },
  balance: { label: 'Balance', w: '150px', align: 'right', sortKey: 'balance' },
};
const DEFAULT_ORDER: ColKey[] = ['account', 'type', 'detail', 'currency', 'balance'];
const DEFAULT_VISIBLE: Record<ColKey, boolean> = {
  account: true,
  type: true,
  detail: true,
  currency: true,
  balance: true,
};

/* ── small atoms ─────────────────────────────────────────────────── */

function Checkbox({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors',
        checked ? 'border-v-primary bg-v-primary' : 'border-v-border bg-white hover:border-v-300',
        className
      )}
      aria-pressed={checked}
    >
      {checked && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      )}
    </button>
  );
}

const ICON_BTN =
  'flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border-none bg-transparent text-v-ink400 transition-colors hover:bg-v-tint100 hover:text-v-primary';

/** Control accounts (`is_fixed`) keep their controls visible but inert. */
const DISABLED_ICON_BTN =
  'cursor-not-allowed text-v-ink300 hover:bg-transparent hover:text-v-ink300';

/* ── props ───────────────────────────────────────────────────────── */

export interface AccountsTableProps {
  data?: { count?: number; results?: any[]; data?: any[] };
  loading?: boolean;
  params?: any;
  setParams?: (p: any) => void;
  permissions?: string[];
  onCreate?: () => void;
  onEdit?: (uid: string) => void;
  onDelete?: (uid: string) => void;
  /** Refreshes the list after a make-inactive / reactivate call succeeds. */
  refetch?: () => void;
}

export default function AccountsTable({
  data,
  loading,
  params,
  setParams,
  permissions = [],
  onCreate,
  onEdit,
  onDelete,
  refetch,
}: AccountsTableProps) {
  const results: any[] = data?.results || data?.data || [];
  const total = data?.count ?? results.length;

  const perms = Array.isArray(permissions) ? permissions : [];
  const canAdd = perms.includes('add_chartofaccount');
  const canEdit = perms.includes('change_chartofaccount');
  const canDelete = perms.includes('delete_chartofaccount');

  // server-driven
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({});
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  // client-side
  const [cat, setCat] = React.useState<Category>('All');
  const [sortKey, setSortKey] = React.useState<SortKey>(null);
  const [sortDir, setSortDir] = React.useState<1 | -1>(1);
  const [order, setOrder] = React.useState<ColKey[]>(DEFAULT_ORDER);
  const [visible, setVisible] = React.useState<Record<ColKey, boolean>>(DEFAULT_VISIBLE);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [menuUid, setMenuUid] = React.useState<string | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [dragKey, setDragKey] = React.useState<ColKey | null>(null);
  const [deactivateTarget, setDeactivateTarget] = React.useState<{ uid: string; title: string } | null>(
    null
  );

  // `POST/DELETE .../deactivate` — is_fixed is NOT the gate here (COA doc §10.1:
  // the refusal keys off `system_key`, which the client never sees), so this is
  // offered on every row and the four refusal codes are handled after the call,
  // never predicted beforehand.
  const reactivate = useMutation({
    mutationFn: (uid: string) => reactivateAccount(uid),
    onSuccess: (_res, uid) => {
      const row = results.find((r) => r.uid === uid);
      toast.success(`${row?.title || 'Account'} is active again.`);
      refetch?.();
    },
    onError: (err: any) => toastApiError(err?.response?.data, 'Could not reactivate the account.'),
  });

  // close popovers on outside click
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.('[data-coa-keep]')) {
        setMenuUid(null);
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Sync the server page-size with the UI on mount (useFetch defaults limit:20;
  // the original Table did the same so the footer and the fetched page agree).
  React.useEffect(() => {
    setParams?.({ page: 1, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* server params */
  const pushParams = React.useCallback(
    (next: Record<string, any>) => {
      setParams?.({
        page,
        limit,
        // always send search (even '') — setQueryParams MERGES, so omitting it
        // would leave a stale term in params state and never clear the filter.
        search,
        ...(dateRange.from ? { created_at_after: ymd(dateRange.from) } : {}),
        ...(dateRange.to ? { created_at_before: ymd(dateRange.to) } : {}),
        ...next,
      });
    },
    [setParams, page, limit, search, dateRange]
  );

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
    setSelected(new Set());
    // always include the key so clearing the box sends search:'' and resets the filter
    setParams?.({ page: 1, limit, search: v });
  };

  const goPage = (p: number) => {
    setPage(p);
    setSelected(new Set());
    pushParams({ page: p });
  };

  const changeLimit = (l: number) => {
    setLimit(l);
    setPage(1);
    pushParams({ page: 1, limit: l });
  };

  const applyDateRange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    setPage(1);
    setSelected(new Set());
    setParams?.({
      ...params,
      page: 1,
      limit,
      search,
      created_at_after: ymd(range.from),
      created_at_before: ymd(range.to),
    });
  };

  /* category filter — server-side via the `kind` query param */
  const applyCategory = (c: Category) => {
    setCat(c);
    setPage(1);
    setSelected(new Set());
    // setQueryParams MERGES, so send kind:'' for "All" to clear a previous filter.
    setParams?.({ page: 1, limit, search, kind: c === 'All' ? '' : CATEGORY_KIND[c] });
  };

  /* client transforms (sorting only — category & search are server-driven) */
  const processed = React.useMemo(() => {
    let rows = results;
    if (sortKey) {
      const dir = sortDir;
      rows = [...rows].sort((a, b) => {
        if (sortKey === 'balance') return ((Number(a?.opening_balance) || 0) - (Number(b?.opening_balance) || 0)) * dir;
        const av =
          sortKey === 'type'
            ? a?.account_type?.title
            : sortKey === 'detail'
              ? a?.detail_type?.title
              : a?.title;
        const bv =
          sortKey === 'type'
            ? b?.account_type?.title
            : sortKey === 'detail'
              ? b?.detail_type?.title
              : b?.title;
        return String(av || '').localeCompare(String(bv || '')) * dir;
      });
    }
    return rows;
  }, [results, sortKey, sortDir]);

  const visibleCols = order.filter((k) => visible[k]);
  const gridCols = `44px ${visibleCols.map((k) => COLUMN_DEFS[k].w).join(' ')} 96px`;

  const allSelected = processed.length > 0 && processed.every((r) => selected.has(r.uid));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(processed.map((r) => r.uid)));
  const toggleRow = (uid: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(uid)) n.delete(uid);
      else n.add(uid);
      return n;
    });
  const selCount = selected.size;

  const setSort = (k: Exclude<SortKey, null>) =>
    setSortKey((prev) => {
      if (prev !== k) {
        setSortDir(1);
        return k;
      }
      if (sortDir === 1) {
        setSortDir(-1);
        return k;
      }
      return null;
    });

  /* columns panel */
  const moveCol = (i: number, dir: -1 | 1) =>
    setOrder((o) => {
      const j = i + dir;
      if (j < 0 || j >= o.length) return o;
      const next = [...o];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const reorderTo = (drag: ColKey, over: ColKey) =>
    setOrder((o) => {
      const from = o.indexOf(drag);
      const to = o.indexOf(over);
      if (from < 0 || to < 0 || from === to) return o;
      const next = o.filter((k) => k !== drag);
      next.splice(to, 0, drag);
      return next;
    });
  const resetCols = () => {
    setOrder(DEFAULT_ORDER);
    setVisible(DEFAULT_VISIBLE);
  };
  const hiddenCount = (Object.keys(visible) as ColKey[]).filter((k) => !visible[k]).length;

  const handleExport = () => {
    const rows = selCount ? results.filter((r) => selected.has(r.uid)) : processed;
    if (!rows.length) return;
    const sheet = rows.map((r) => ({
      Name: r?.title ?? '',
      Type: r?.account_type?.title ?? '',
      'Detail type': r?.detail_type?.title ?? '',
      Currency: r?.currency || 'USD',
      Balance: Number(r?.opening_balance) || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(sheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chart of Accounts');
    XLSX.writeFile(wb, 'chart-of-accounts.xlsx');
  };

  const pageCount = Math.max(1, Math.ceil(total / limit));
  const pages = pageRange(page, pageCount);
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="font-jakarta text-v-ink900">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Transactions' },
          { label: 'Chart of Accounts' },
        ]}
      />

      {/* Header row */}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-[32px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Chart of Accounts
          </h1>
          <p className="mt-1.5 text-sm text-v-ink500">
            Manage your ledger accounts, types and running balances.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <VioletButton
            variant="secondary"
            onClick={handleExport}
            leftIcon={<Download className="h-[15px] w-[15px]" />}
          >
            Export
          </VioletButton>
          {canAdd && (
            <VioletButton onClick={onCreate} leftIcon={<Plus className="h-[15px] w-[15px]" />}>
              Add New
            </VioletButton>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="my-[14px] mt-[22px] flex flex-wrap items-center gap-3">
        <div className="flex w-[290px] items-center gap-2.5 rounded-xl border border-white/75 bg-white/[0.62] px-3.5 py-2.5 backdrop-blur-md">
          <Search className="h-3.5 w-3.5 shrink-0 text-v-ink400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search accounts…"
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-medium text-v-ink900 outline-none placeholder:text-v-ink400"
          />
        </div>

        {selCount > 0 && (
          <div className="flex animate-v-pop items-center gap-2.5 rounded-xl border border-white/75 bg-v-tint100 px-3.5 py-2.5">
            <span className="text-[12.5px] font-semibold text-v-primary">{selCount} selected</span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-[12.5px] font-semibold text-[#8B5CF6] underline"
            >
              Clear
            </button>
          </div>
        )}

        <span className="flex-1" />

        {/* Date range */}
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-white/75 bg-white/[0.62] px-3.5 py-2.5 text-[13px] font-medium text-v-ink700 backdrop-blur-md transition-colors hover:bg-white/85"
            >
              <CalendarIcon className="h-[14px] w-[14px] text-v-ink400" />
              {dateRange.from ? (
                <>
                  {prettyDate(dateRange.from)}
                  {dateRange.to ? ` – ${prettyDate(dateRange.to)}` : ''}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      applyDateRange({});
                    }}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-v-wash2"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </>
              ) : (
                'Date range'
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange as any}
              onSelect={(range: any) => {
                if (range) {
                  applyDateRange(range);
                  if (range.from && range.to) setDatePickerOpen(false);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Columns */}
        <div className="relative" data-coa-keep>
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            title="Customize columns"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border border-white/75 bg-white/[0.62] backdrop-blur-md transition-colors hover:bg-white/85',
              panelOpen || hiddenCount > 0 ? 'text-v-primary' : 'text-v-ink500'
            )}
          >
            <Columns3 className="h-4 w-4" />
          </button>
          {panelOpen && (
            <div
              className="absolute right-0 top-12 z-[70] w-[298px] animate-v-pop rounded-2xl border border-v-border bg-white p-3 shadow-v-card"
              data-coa-keep
            >
              <div className="flex items-center px-1.5 pt-0.5">
                <div className="flex-1 text-[11px] font-bold uppercase tracking-[0.06em] text-v-ink400">
                  Customize columns
                </div>
                <button
                  type="button"
                  onClick={resetCols}
                  className="text-[11.5px] font-semibold text-v-primary hover:underline"
                >
                  Reset
                </button>
              </div>
              <div className="px-1.5 pb-2.5 pt-1 text-[11.5px] text-v-ink400">
                {visibleCols.length} of {order.length} shown · Drag to reorder
              </div>
              {order.map((k, i) => {
                const def = COLUMN_DEFS[k];
                const on = visible[k];
                const dragging = dragKey === k;
                return (
                  <div
                    key={k}
                    draggable
                    onDragStart={() => setDragKey(k)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragKey && dragKey !== k) reorderTo(dragKey, k);
                    }}
                    onDragEnd={() => setDragKey(null)}
                    className={cn(
                      'flex items-center gap-2 rounded-[11px] border border-dashed p-2',
                      dragging ? 'border-v-300 bg-v-tint150' : 'border-transparent hover:bg-[#F7F5FC]'
                    )}
                  >
                    <GripVertical className="h-[13px] w-[13px] shrink-0 text-v-ink300" />
                    <div className="flex-1 truncate text-[13px] font-medium text-v-ink900">
                      {def.label}
                    </div>
                    {def.locked && <Lock className="h-[13px] w-[13px] shrink-0 text-v-ink300" />}
                    <button
                      type="button"
                      onClick={() => moveCol(i, -1)}
                      disabled={i === 0}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-[7px] text-v-ink700 enabled:hover:bg-v-tint100 disabled:text-[#E2DDF0]"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCol(i, 1)}
                      disabled={i === order.length - 1}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-[7px] text-v-ink700 enabled:hover:bg-v-tint100 disabled:text-[#E2DDF0]"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => !def.locked && setVisible((v) => ({ ...v, [k]: !v[k] }))}
                      disabled={def.locked}
                      className={cn(
                        'relative h-[18px] w-8 shrink-0 rounded-full transition-colors',
                        on ? (def.locked ? 'bg-v-300' : 'bg-v-primary') : 'bg-v-border',
                        def.locked ? 'cursor-default' : 'cursor-pointer'
                      )}
                      aria-pressed={on}
                    >
                      <span
                        className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_3px_rgba(22,23,42,0.25)] transition-all"
                        style={{ left: on ? '16px' : '2px' }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Table card */}
      <VioletCard className="overflow-visible">
        {/* Category chips */}
        <div className="flex items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
          {CATEGORIES.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => applyCategory(c)}
                className={cn(
                  'rounded-full px-3.5 py-[7px] text-[12.5px] font-semibold transition-colors',
                  active ? 'bg-v-primary text-white' : 'bg-v-wash2 text-v-ink500 hover:bg-v-tint100'
                )}
              >
                {c}
              </button>
            );
          })}
          <span className="flex-1" />
          <span className="text-[12.5px] text-v-ink400">
            {total === 0 ? 'No accounts' : `Showing ${start}–${end} of ${total}`}
          </span>
        </div>

        {/* Header */}
        <div
          className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2.5"
          style={{ gridTemplateColumns: gridCols }}
        >
          <Checkbox checked={allSelected} onChange={toggleAll} />
          {visibleCols.map((k) => {
            const def = COLUMN_DEFS[k];
            const active = def.sortKey && sortKey === def.sortKey;
            return (
              <button
                key={k}
                type="button"
                onClick={() => def.sortKey && setSort(def.sortKey)}
                className={cn(
                  'flex items-center gap-1 border-none bg-transparent p-0 text-[12px] font-semibold transition-colors',
                  def.align === 'right' ? 'justify-end' : 'justify-start',
                  active ? 'text-v-primary' : 'text-v-ink400',
                  def.sortKey ? 'cursor-pointer hover:text-v-primary' : 'cursor-default'
                )}
              >
                {def.label}
                {active && <span className="text-[11px]">{sortDir === 1 ? '↑' : '↓'}</span>}
              </button>
            );
          })}
          <div className="text-right text-[12px] font-semibold text-v-ink400">Actions</div>
        </div>

        {/* Body */}
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3"
              style={{ gridTemplateColumns: gridCols }}
            >
              <div className="h-[18px] w-[18px] rounded-[5px] bg-v-wash2" />
              {visibleCols.map((k) => (
                <div key={k} className="h-4 w-3/4 rounded bg-v-wash2" />
              ))}
              <div className="ml-auto h-4 w-16 rounded bg-v-wash2" />
            </div>
          ))
        ) : processed.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
              <Search className="h-[19px] w-[19px]" />
            </span>
            {cat !== 'All' ? (
              <>
                <div className="text-sm font-semibold text-v-ink900">No {cat} accounts</div>
                <div className="text-[13px] text-v-ink400">
                  No accounts match the “{cat}” filter.
                </div>
                <button
                  type="button"
                  onClick={() => applyCategory('All')}
                  className="mt-1 rounded-full bg-v-tint100 px-3.5 py-[7px] text-[12.5px] font-semibold text-v-primary transition-colors hover:bg-v-tint150"
                >
                  Show all
                </button>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-v-ink900">No accounts found</div>
                <div className="text-[13px] text-v-ink400">
                  Try a different search or category filter.
                </div>
              </>
            )}
          </div>
        ) : (
          processed.map((row, i) => {
            const uid = row.uid;
            const sel = selected.has(uid);
            const open = menuUid === uid;
            const type = row?.account_type?.title;
            const tone = toneOf(type);
            const bal = Number(row?.opening_balance) || 0;
            const name = row?.title || '';
            const inactive = row?.status === 'INACTIVE';
            return (
              <div
                key={uid || i}
                className={cn(
                  'relative grid animate-v-pop items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-2.5 transition-colors',
                  sel ? 'bg-v-tint150' : 'hover:bg-[#F7F5FC]'
                )}
                style={{ gridTemplateColumns: gridCols, animationDelay: `${i * 0.03}s`, zIndex: open ? 50 : undefined }}
              >
                <Checkbox checked={sel} onChange={() => toggleRow(uid)} />

                {visibleCols.map((k) => {
                  if (k === 'account')
                    return (
                      <div key={k} className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-sm font-bold',
                            TILE[tone]
                          )}
                        >
                          {(name[0] || '?').toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                'truncate text-[13.5px] font-semibold',
                                inactive ? 'text-v-ink500' : 'text-v-ink900'
                              )}
                            >
                              {name}
                            </span>
                            {inactive && (
                              <Chip
                                tone="neutral"
                                className="shrink-0"
                                title="Hidden from new documents — balance and history are kept."
                              >
                                Inactive
                              </Chip>
                            )}
                          </div>
                          {!visible.detail && row?.detail_type?.title && (
                            <div className="truncate text-[11.5px] text-v-ink400">
                              {row.detail_type.title}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  if (k === 'type')
                    return (
                      <div key={k} className="min-w-0">
                        {type ? (
                          <Chip tone={tone} className="max-w-full">
                            <span className="block truncate">{type}</span>
                          </Chip>
                        ) : (
                          <span className="text-[13px] text-v-ink400">—</span>
                        )}
                      </div>
                    );
                  if (k === 'detail')
                    return (
                      <div key={k} className="truncate text-[13px] text-v-ink500">
                        {row?.detail_type?.title || '—'}
                      </div>
                    );
                  if (k === 'currency')
                    return (
                      <div key={k}>
                        <span className="rounded-md bg-[#E9E5F5] px-1.5 py-[3px] text-[11.5px] font-semibold text-v-ink500">
                          {row?.currency || 'USD'}
                        </span>
                      </div>
                    );
                  // balance
                  return (
                    <div
                      key={k}
                      className={cn(
                        'text-right text-[13.5px] font-bold tabular-nums',
                        bal === 0 ? 'text-v-ink400' : bal < 0 ? 'text-[#D2483E]' : 'text-v-ink900'
                      )}
                    >
                      {money(bal)}
                    </div>
                  );
                })}

                {/* actions */}
                <div className="relative flex items-center justify-end gap-1" data-coa-keep>
                  <Link
                    href={`/dashboard/transactions/chart-of-accounts/${uid}`}
                    title="Account history"
                    className={ICON_BTN}
                  >
                    <Clock className="h-[15px] w-[15px]" />
                  </Link>
                  {canEdit && (
                    <button
                      type="button"
                      title={row?.is_fixed ? CONTROL_ACCOUNT_HINT : 'Edit account'}
                      disabled={row?.is_fixed}
                      className={cn(ICON_BTN, row?.is_fixed && DISABLED_ICON_BTN)}
                      onClick={() => !row?.is_fixed && onEdit?.(uid)}
                    >
                      <Pencil className="h-[14px] w-[14px]" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="More actions"
                    className={ICON_BTN}
                    onClick={() => setMenuUid((m) => (m === uid ? null : uid))}
                  >
                    <MoreVertical className="h-[15px] w-[15px]" />
                  </button>

                  {open && (
                    <div className="absolute right-0 top-[34px] z-[60] w-[190px] animate-v-pop rounded-[14px] border border-v-border bg-white p-1.5 shadow-v-card">
                      <Link
                        href={`/dashboard/transactions/chart-of-accounts/${uid}`}
                        onClick={() => setMenuUid(null)}
                        className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[13px] font-medium text-v-ink900 hover:bg-v-tint100"
                      >
                        <Clock className="h-[14px] w-[14px] text-v-ink400" />
                        View account history
                      </Link>
                      {canEdit && (
                        <button
                          type="button"
                          disabled={row?.is_fixed}
                          title={row?.is_fixed ? CONTROL_ACCOUNT_HINT : undefined}
                          onClick={() => {
                            setMenuUid(null);
                            onEdit?.(uid);
                          }}
                          className={cn(
                            'flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-left text-[13px] font-medium text-v-ink900',
                            row?.is_fixed
                              ? 'cursor-not-allowed text-v-ink300'
                              : 'hover:bg-v-tint100'
                          )}
                        >
                          <Pencil
                            className={cn(
                              'h-[14px] w-[14px]',
                              row?.is_fixed ? 'text-v-ink300' : 'text-v-ink400'
                            )}
                          />
                          Edit account
                        </button>
                      )}
                      <Link
                        href="/dashboard/reports"
                        onClick={() => setMenuUid(null)}
                        className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[13px] font-medium text-v-ink900 hover:bg-v-tint100"
                      >
                        <FileBarChart2 className="h-[14px] w-[14px] text-v-ink400" />
                        Report
                      </Link>
                      {canEdit &&
                        // Not gated on is_fixed — the deactivate refusal keys off a
                        // field the client never sees (COA doc §10.1). Attempt the
                        // call and let the dialog handle whatever code comes back.
                        (inactive ? (
                          <button
                            type="button"
                            disabled={reactivate.isPending}
                            onClick={() => {
                              setMenuUid(null);
                              reactivate.mutate(uid);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-left text-[13px] font-medium text-v-ink900 hover:bg-v-tint100 disabled:opacity-60"
                          >
                            <RotateCcw className="h-[14px] w-[14px] text-v-ink400" />
                            Reactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setMenuUid(null);
                              setDeactivateTarget({ uid, title: name });
                            }}
                            className="flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-left text-[13px] font-medium text-v-ink900 hover:bg-v-tint100"
                          >
                            <Ban className="h-[14px] w-[14px] text-v-ink400" />
                            Make inactive
                          </button>
                        ))}
                      {canDelete && (
                        <>
                          <div className="mx-1 my-1.5 h-px bg-[rgba(22,23,42,0.07)]" />
                          {/* Control accounts stay visible but disabled — hiding the
                              control made the account look editable-but-broken. */}
                          <button
                            type="button"
                            disabled={row?.is_fixed}
                            title={row?.is_fixed ? CONTROL_ACCOUNT_HINT : undefined}
                            onClick={() => {
                              setMenuUid(null);
                              onDelete?.(uid);
                            }}
                            className={cn(
                              'flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-left text-[13px] font-medium',
                              row?.is_fixed
                                ? 'cursor-not-allowed text-v-ink300'
                                : 'text-[#EF4444] hover:bg-v-danger-bg'
                            )}
                          >
                            {row?.is_fixed ? (
                              <Lock className="h-[14px] w-[14px]" />
                            ) : (
                              <Trash2 className="h-[14px] w-[14px]" />
                            )}
                            Delete account
                          </button>
                          {row?.is_fixed && (
                            <p className="px-3 pb-1.5 pt-0.5 text-[11px] leading-snug text-v-ink400">
                              Control accounts are permanent — the ledger posts to them.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Footer / pager */}
        <div className="flex items-center gap-2 px-[22px] py-3">
          <RowsPerPage value={limit} onChange={changeLimit} />
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => page > 1 && goPage(page - 1)}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink700 transition-colors enabled:hover:bg-v-tint100 enabled:hover:text-v-primary disabled:opacity-40"
          >
            <ChevronDown className="h-[13px] w-[13px] rotate-90" />
          </button>
          {pages.map((p, idx) =>
            p === '…' ? (
              <span key={`g${idx}`} className="px-1 text-[12.5px] text-v-ink400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goPage(p as number)}
                className={cn(
                  'h-8 min-w-8 rounded-[10px] px-2 text-[12.5px] font-semibold transition-colors',
                  p === page ? 'bg-v-primary text-white' : 'bg-v-wash2 text-v-ink700 hover:bg-v-tint100'
                )}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => page < pageCount && goPage(page + 1)}
            disabled={page >= pageCount}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink700 transition-colors enabled:hover:bg-v-tint100 enabled:hover:text-v-primary disabled:opacity-40"
          >
            <ChevronDown className="h-[13px] w-[13px] -rotate-90" />
          </button>
        </div>
      </VioletCard>

      <DeactivateAccountDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        uid={deactivateTarget?.uid ?? ''}
        title={deactivateTarget?.title ?? ''}
        onDone={refetch}
      />
    </div>
  );
}

/* ── pager helpers ───────────────────────────────────────────────── */

function RowsPerPage({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative" data-coa-keep>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-[10px] bg-v-wash2 px-2.5 py-[7px] text-[12.5px] font-medium text-v-ink700"
      >
        Rows: {value}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div
          className="absolute bottom-10 left-0 z-[60] w-24 animate-v-pop rounded-xl border border-v-border bg-white p-1 shadow-v-card"
          data-coa-keep
        >
          {[10, 20, 50, 100].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                onChange(n);
                setOpen(false);
              }}
              className={cn(
                'block w-full rounded-lg px-3 py-1.5 text-left text-[12.5px] font-medium hover:bg-v-tint100',
                n === value ? 'text-v-primary' : 'text-v-ink700'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function pageRange(current: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const lo = Math.max(2, current - 1);
  const hi = Math.min(count - 1, current + 1);
  if (lo > 2) out.push('…');
  for (let p = lo; p <= hi; p++) out.push(p);
  if (hi < count - 1) out.push('…');
  out.push(count);
  return out;
}
