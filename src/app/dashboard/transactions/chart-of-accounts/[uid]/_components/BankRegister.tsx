'use client';

import * as React from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { useDebounce } from 'use-debounce';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumb, VioletCard } from '@/components/violet';
import { RegisterHero } from './RegisterHero';
import { RegisterTable } from './RegisterTable';
import { DEFAULT_VISIBLE, RegisterToolbar, type DisplaySettings } from './RegisterToolbar';
import {
  applyClientFilters,
  canReconcileAccount,
  columnLabels,
  countDirections,
  countStatuses,
  EMPTY_FILTERS,
  isCreditCardAccount,
  isUnfiltered,
  kindOptions,
  toMDY,
  toRegisterRow,
  toServerParams,
  totalsFor,
  type RegisterFilters,
} from './registerModel';

export interface BankRegisterProps {
  account: any;
  accountLoading?: boolean;
  data?: { count?: number; results?: any[]; data?: any[] };
  loading?: boolean;
  /** True on a failed fetch — kept distinct from "no rows" so the empty state never lies. */
  error?: boolean;
  /** The rejected request, for the 401 / 403 / 404 branches below. */
  queryError?: any;
  params: any;
  setParams: (p: any, replace?: boolean) => void;
  permissions?: string[];
}

const DEFAULT_SETTINGS: DisplaySettings = {
  visible: DEFAULT_VISIBLE,
  compact: false,
  groupByMonth: true,
};

/** `limit` is capped at 100 by the endpoint; a larger value is not honoured. */
const MAX_LIMIT = 100;

/**
 * There is no single error envelope on these routes.
 *
 * A 403 has two unrelated causes behind the same status — a missing role and a
 * missing plan — so the message has to be branched on the server's own string,
 * or the screen tells someone to upgrade their plan when they need a role.
 */
function describeError(err: any): { title: string; message: string } {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const detail =
    typeof data?.detail === 'string'
      ? data.detail
      : Array.isArray(data) && typeof data[0] === 'string'
        ? data[0]
        : '';

  if (status === 401) {
    return {
      title: 'Your session has expired',
      message: detail || 'Sign in again to load this register.',
    };
  }
  if (status === 403) {
    if (/plan/i.test(detail)) {
      return {
        title: 'Not included in your plan',
        message: detail || 'Chart of Accounts is not part of your current plan.',
      };
    }
    return {
      title: "Your role can't open this register",
      message:
        detail || 'Viewing an account register needs the Chart of Accounts view permission.',
    };
  }
  if (status === 404) {
    if (/invalid page/i.test(detail)) {
      return {
        title: 'That page is past the end of the ledger',
        message: 'Jump back to the first page to keep reading.',
      };
    }
    return {
      title: 'Account not found',
      message: detail || 'This account does not exist, or belongs to another company.',
    };
  }
  if (status === 400) {
    return {
      title: "That filter wasn't accepted",
      message: detail || 'Clear the filters and try again.',
    };
  }
  return {
    title: "Couldn't load the register",
    message: 'Something went wrong fetching these transactions. Try again in a moment.',
  };
}

export default function BankRegister({
  account,
  accountLoading,
  data,
  loading,
  error,
  queryError,
  params,
  setParams,
  permissions = [],
}: BankRegisterProps) {
  const perms = Array.isArray(permissions) ? permissions : [];

  const [filters, setFilters] = React.useState<RegisterFilters>({ ...EMPTY_FILTERS });
  const [settings, setSettings] = React.useState<DisplaySettings>(DEFAULT_SETTINGS);
  const [pageInput, setPageInput] = React.useState('1');

  const page = Number(params?.page) || 1;
  const limit = Math.min(Number(params?.limit) || 25, MAX_LIMIT);
  const search: string = params?.search ?? '';

  // Memoised: the `|| []` fallback would otherwise mint a new array on every
  // render and invalidate every derivation below it.
  const raw: any[] = React.useMemo(() => data?.results || data?.data || [], [data]);
  const total = data?.count ?? raw.length;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  React.useEffect(() => setPageInput(String(page)), [page]);

  // Presentation only. The money columns take their names from the header's
  // `column_labels` and their direction from the server-signed amounts.
  const creditCard = isCreditCardAccount(account);
  const labels = React.useMemo(() => columnLabels(account), [account]);

  const rows = React.useMemo(() => raw.map(toRegisterRow), [raw]);
  const visible = React.useMemo(() => applyClientFilters(rows, filters), [rows, filters]);

  const totals = React.useMemo(() => totalsFor(visible), [visible]);
  const counts = React.useMemo(() => countStatuses(rows), [rows]);
  const directions = React.useMemo(() => countDirections(rows), [rows]);
  const kinds = React.useMemo(() => kindOptions(rows), [rows]);

  /* ── the account's current balance ─────────────────────────────────────
     The header carries no balance field — `opening_balance` is a drifting
     lifetime total, not an opening balance, and `bank_balance` is written by
     nothing. The real one is `running_balance` on row 0 of an unfiltered
     page 1, since rows are always newest-first. Captured when such a page
     loads and held while the user filters or pages away from it. */

  const unfilteredView = isUnfiltered(filters, search);
  const [accountBalance, setAccountBalance] = React.useState<number | null>(null);

  React.useEffect(() => setAccountBalance(null), [account?.uid]);

  React.useEffect(() => {
    if (loading || error) return;
    if (!unfilteredView || page !== 1) return;
    setAccountBalance(rows.length ? (rows[0].balance ?? 0) : 0);
  }, [loading, error, unfilteredView, page, rows]);

  /* ── server params ─────────────────────────────────────────────────── */

  // Keyed on the server-relevant fields only, so toggling a page-scoped filter
  // (direction, category, store) never costs a request.
  const { dateFrom, dateTo, status, kinds: kindFilter, customer, supplier } = filters;
  const serverFilters = React.useMemo(
    () => toServerParams({ dateFrom, dateTo, status, kinds: kindFilter, customer, supplier }),
    [dateFrom, dateTo, status, kindFilter, customer, supplier]
  );

  const push = React.useCallback(
    (next: Record<string, any>) => {
      setParams({ page, limit, search, ...serverFilters, ...next });
    },
    [setParams, page, limit, search, serverFilters]
  );

  const goPage = React.useCallback(
    (p: number) => push({ page: Math.min(Math.max(1, p), pageCount) }),
    [push, pageCount]
  );

  React.useEffect(() => {
    if (!loading && !error && total > 0 && page > pageCount) goPage(pageCount);
  }, [loading, error, total, page, pageCount, goPage]);

  const onSearch = (v: string) => push({ page: 1, search: v });

  const onLimit = (n: number) => push({ page: 1, limit: Math.min(n, MAX_LIMIT) });

  const onFilters = (f: RegisterFilters) => setFilters(f);

  // Every filter with a server equivalent is pushed together, debounced so a
  // typed date or a rapid chip toggle does not fire a request per keystroke.
  const [debouncedServerFilters] = useDebounce(serverFilters, 450);
  const firstFilterRun = React.useRef(true);
  React.useEffect(() => {
    if (firstFilterRun.current) {
      firstFilterRun.current = false;
      return;
    }
    setParams({ page: 1, limit, search, ...debouncedServerFilters });
    // Only the debounced filter slice retriggers this — page / limit / search
    // changes go through `push` directly and must not be re-sent here.
  }, [debouncedServerFilters]);

  const clearFilters = () => onFilters({ ...EMPTY_FILTERS });

  /* ── export / print ────────────────────────────────────────────────── */

  const handleExport = () => {
    if (!visible.length) return;
    const sheet = visible.map((r) => ({
      Date: toMDY(r.date),
      'Ref no.': r.refNo,
      Type: r.kind,
      Payee: r.payee,
      Memo: r.memo,
      Category: r.category,
      Store: r.store,
      [labels.payment]: r.payment || '',
      [labels.deposit]: r.deposit || '',
      Balance: r.balance ?? '',
      Status: r.status,
      Adjustment: r.isAdjustment ? 'Yes' : '',
      Document: r.documentUid,
    }));
    const ws = XLSX.utils.json_to_sheet(sheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bank Register');
    const name = (account?.title || 'bank-register').replace(/[^\w.-]+/g, '-').toLowerCase();
    XLSX.writeFile(wb, `${name}-page-${page}.xlsx`);
  };

  const handlePrint = () => window.print();

  /* ── render ────────────────────────────────────────────────────────── */

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const isFiltered = !unfilteredView;
  const described = error ? describeError(queryError) : null;

  return (
    <div className="font-jakarta text-v-ink900">
      <style>{`@media print { [data-noprint] { display: none !important; } }`}</style>

      <div data-noprint>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Transactions' },
            { label: 'Chart of Accounts', href: '/dashboard/transactions/chart-of-accounts' },
            { label: account?.title || 'Bank Register' },
          ]}
        />
      </div>

      <div className="mt-3">
        <RegisterHero
          account={account}
          accountLoading={accountLoading}
          creditCard={creditCard}
          labels={labels}
          totals={totals}
          counts={counts}
          pageRows={visible.length}
          totalRows={total}
          accountBalance={accountBalance}
          // Reconcile needs an ACTIVE money account as well as the role: the
          // picker refuses a DRAFT account, and API-created accounts are DRAFT.
          canReconcile={
            canReconcileAccount(account) &&
            (perms.length === 0 || perms.includes('view_bankreconciliation'))
          }
          filtered={isFiltered}
        />
      </div>

      <div className="my-3.5">
        <RegisterToolbar
          search={search}
          onSearch={onSearch}
          filters={filters}
          onFilters={onFilters}
          kinds={kinds}
          rows={rows}
          settings={settings}
          onSettings={setSettings}
          limit={limit}
          onLimit={onLimit}
          onExport={handleExport}
          onPrint={handlePrint}
          labels={labels}
          shown={visible.length}
          total={rows.length}
          directions={directions}
        />
      </div>

      <VioletCard className="overflow-hidden">
        <RegisterTable
          rows={visible}
          loading={loading}
          error={error}
          errorTitle={described?.title}
          errorMessage={described?.message}
          settings={settings}
          labels={labels}
          filtered={isFiltered}
          onClearFilters={clearFilters}
        />

        {/* Page footer */}
        <div
          data-noprint
          className="flex flex-wrap items-center gap-3 border-t border-[rgba(22,23,42,0.07)] px-5 py-3"
        >
          <Link
            href="/dashboard/transactions/chart-of-accounts"
            className="text-[12.5px] font-semibold text-v-primary hover:underline"
          >
            ← All accounts
          </Link>

          <span className="flex-1" />

          <span className="text-[12.5px] tabular-nums text-v-ink500">
            {total === 0 ? 'No lines' : `${start}–${end} of ${total}`}
          </span>

          <div className="flex items-center gap-1.5">
            <label className="flex items-center gap-1.5 text-[12.5px] text-v-ink500">
              Page
              <input
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => goPage(parseInt(pageInput, 10) || 1)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goPage(parseInt(pageInput, 10) || 1);
                }}
                inputMode="numeric"
                aria-label="Go to page"
                className="h-8 w-12 rounded-lg border border-v-border bg-white text-center text-[12.5px] tabular-nums text-v-ink900 outline-none focus:border-v-primary"
              />
              <span className="tabular-nums">of {pageCount}</span>
            </label>

            <PagerButton label="First page" onClick={() => goPage(1)} disabled={page <= 1}>
              <ChevronsLeft className="h-[14px] w-[14px]" />
            </PagerButton>
            <PagerButton
              label="Previous page"
              onClick={() => goPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-[14px] w-[14px]" />
            </PagerButton>
            <PagerButton
              label="Next page"
              onClick={() => goPage(page + 1)}
              disabled={page >= pageCount}
            >
              <ChevronRight className="h-[14px] w-[14px]" />
            </PagerButton>
            <PagerButton
              label="Last page"
              onClick={() => goPage(pageCount)}
              disabled={page >= pageCount}
            >
              <ChevronsRight className="h-[14px] w-[14px]" />
            </PagerButton>
          </div>
        </div>
      </VioletCard>

      {/* Legend — `reconciliation_status` is on every row, so this always
          applies. It is read-only here: a line's state belongs to a
          reconciliation session, so it is ticked in the Reconcile workspace. */}
      <div
        data-noprint
        className="mt-3 flex flex-wrap items-center gap-4 px-1 text-[11.5px] text-v-ink400"
      >
        <LegendSwatch className="border-v-border bg-white text-v-ink300" glyph="U">
          Unreconciled
        </LegendSwatch>
        <LegendSwatch className="border-v-warn-fg/40 bg-v-warn-bg text-v-warn-fg" glyph="C">
          Cleared
        </LegendSwatch>
        <LegendSwatch className="border-v-success-fg/40 bg-v-success-bg text-v-success-fg" glyph="R">
          Reconciled
        </LegendSwatch>
        <span className="flex-1" />
        <span>Reconcile state is set in the Reconcile flow.</span>
      </div>
    </div>
  );
}

function PagerButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink700 transition-colors enabled:hover:bg-v-tint100 enabled:hover:text-v-primary disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function LegendSwatch({
  className,
  glyph,
  children,
}: {
  className: string;
  glyph: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          'flex h-[18px] w-5 items-center justify-center rounded-[5px] border text-[10.5px] font-bold',
          className
        )}
      >
        {glyph}
      </span>
      {children}
    </span>
  );
}
