'use client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { IconChip } from './IconChip';
import { Search, Columns3 } from 'lucide-react';

/** One column in a {@link VioletListTable}. `render` returns the cell body for a row. */
export type VListColumn = {
  key: string;
  label: string;
  /** CSS grid track, e.g. `'minmax(0,1.5fr)'` or `'120px'`. */
  w: string;
  align?: 'left' | 'right' | 'center';
  /** Core column that can't be hidden from the columns popover. */
  locked?: boolean;
  /** Hidden until toggled on in the columns popover. */
  defaultHidden?: boolean;
  render: (row: any) => React.ReactNode;
};

export type VListFilter = { key: string; label: string };

export interface VioletListTableProps {
  /** toolbar identity */
  icon?: React.ReactNode;
  title: string;
  /** toolbar sub-line; defaults to "{shown} of {total} shown". */
  subtitle?: (shown: number, total: number) => React.ReactNode;

  /** server data ({count, results}) + loading + merge-param setter */
  data?: { count?: number; results?: any[]; data?: any[] };
  loading?: boolean;
  setParams?: (p: any) => void;

  /**
   * Filter / search / paginate purely client-side over the passed rows.
   * Use when the rows aren't server-paginated (e.g. derived in memory).
   */
  clientSide?: boolean;
  /** client-side search predicate (only used with `clientSide`). */
  searchFn?: (row: any, query: string) => boolean;

  columns: VListColumn[];
  /** show the columns show/hide popover (default true) */
  showColumns?: boolean;

  searchPlaceholder?: string;

  /** client-side filter pills; the first pill is the "no filter" option. */
  filters?: VListFilter[];
  filterFn?: (row: any, key: string) => boolean;

  /** right-aligned per-row actions (e.g. kebab, edit/delete buttons). */
  renderActions?: (row: any) => React.ReactNode;
  actionLabel?: string;
  actionWidth?: string;

  /** extra toolbar control rendered just before the columns button (e.g. a Filter button). */
  toolbarExtra?: React.ReactNode;

  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptySub?: string;

  rowKey?: (row: any, i: number) => string;
  limitOptions?: number[];
  initialLimit?: number;
  className?: string;
}

function pageRange(page: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', count];
  if (page >= count - 3) return [1, '…', count - 4, count - 3, count - 2, count - 1, count];
  return [1, '…', page - 1, page, page + 1, '…', count];
}

export function VioletListTable({
  icon,
  title,
  subtitle,
  data,
  loading,
  setParams,
  clientSide = false,
  searchFn,
  columns,
  showColumns = true,
  searchPlaceholder = 'Search',
  filters,
  filterFn,
  renderActions,
  actionLabel = 'Action',
  actionWidth = '70px',
  toolbarExtra,
  emptyIcon,
  emptyTitle = 'No records found',
  emptySub = 'Try a different search or filter.',
  rowKey,
  limitOptions = [10, 20, 50, 100],
  initialLimit = 10,
  className,
}: VioletListTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [filter, setFilter] = useState(filters?.[0]?.key ?? 'all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>(() => {
    const v: Record<string, boolean> = {};
    columns.forEach((c) => (v[c.key] = !c.defaultHidden));
    return v;
  });

  const base: any[] = data?.results || data?.data || [];
  const serverTotal = data?.count ?? base.length;

  // sync server page-size on mount (matches the legacy admin Table) — server mode only
  useEffect(() => {
    if (!clientSide) setParams?.({ page: 1, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest?.('[data-vtable-cols]')) setPanelOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  /* always send search so clearing resets the server filter (merge semantics) */
  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
    if (!clientSide) setParams?.({ page: 1, limit, search: v });
  };
  const goPage = (p: number) => {
    setPage(p);
    if (!clientSide) setParams?.({ page: p, limit, search });
  };
  const changeLimit = (l: number) => {
    setLimit(l);
    setPage(1);
    if (!clientSide) setParams?.({ page: 1, limit: l, search });
  };

  const firstFilter = filters?.[0]?.key;
  const pillFiltered =
    filters && filterFn && filter !== firstFilter
      ? base.filter((r) => filterFn(r, filter))
      : base;
  const searched =
    clientSide && searchFn && search.trim()
      ? pillFiltered.filter((r) => searchFn(r, search))
      : pillFiltered;

  const pagerTotal = clientSide ? searched.length : serverTotal;
  const subtitleTotal = clientSide ? base.length : serverTotal;

  const hideable = columns.some((c) => !c.locked);
  const visibleCols = columns.filter((c) => visible[c.key]);
  const gridCols = `${visibleCols.map((c) => c.w).join(' ')}${renderActions ? ` ${actionWidth}` : ''}`;

  const resetCols = () => {
    const v: Record<string, boolean> = {};
    columns.forEach((c) => (v[c.key] = !c.defaultHidden));
    setVisible(v);
  };

  const pageCount = Math.max(1, Math.ceil(pagerTotal / limit));
  const curPage = Math.min(page, pageCount);
  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
      if (!clientSide) setParams?.({ page: pageCount, limit, search });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  const rows = clientSide ? searched.slice((curPage - 1) * limit, curPage * limit) : searched;
  const pages = pageRange(curPage, pageCount);
  const start = pagerTotal === 0 ? 0 : (curPage - 1) * limit + 1;
  const end = Math.min(curPage * limit, pagerTotal);

  return (
    <div
      className={cn(
        'animate-v-rise overflow-hidden rounded-v-card bg-white font-jakarta text-v-ink900 shadow-v-card',
        className
      )}
    >
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
        {icon && <IconChip tone="violet">{icon}</IconChip>}
        <div className="min-w-0">
          <div className="text-[14px] font-bold text-v-ink900">{title}</div>
          <div className="text-[11.5px] text-v-ink400">
            {subtitle
              ? subtitle(searched.length, subtitleTotal)
              : `${searched.length} of ${subtitleTotal} shown`}
          </div>
        </div>

        <span className="flex-1" />

        {filters && filters.length > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-v-wash2 p-1">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setFilter(f.key);
                  setPage(1);
                }}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  filter === f.key
                    ? 'bg-white text-v-primary shadow-sm'
                    : 'text-v-ink500 hover:text-v-ink900'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-v-ink400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-[220px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
          />
        </div>

        {toolbarExtra}

        {showColumns && hideable && (
          <div className="relative" data-vtable-cols>
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              title="Columns"
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary',
                panelOpen && 'bg-v-tint100 text-v-primary'
              )}
            >
              <Columns3 className="h-[17px] w-[17px]" />
            </button>
            {panelOpen && (
              <div className="absolute right-0 top-11 z-50 w-[260px] animate-v-pop rounded-v-card border border-v-border bg-white p-3 shadow-v-modal">
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <span className="text-[12.5px] font-bold text-v-ink900">Columns</span>
                  <button
                    type="button"
                    onClick={resetCols}
                    className="text-[11.5px] font-semibold text-v-primary hover:underline"
                  >
                    Reset
                  </button>
                </div>
                {columns.map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center gap-2 rounded-[9px] px-1.5 py-1.5 hover:bg-v-wash"
                  >
                    <span className="flex-1 text-[12.5px] font-medium text-v-ink700">{c.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={visible[c.key]}
                      disabled={c.locked}
                      onClick={() => setVisible((v) => ({ ...v, [c.key]: !v[c.key] }))}
                      className={cn(
                        'relative inline-flex h-[18px] w-8 shrink-0 rounded-full transition-colors disabled:opacity-40',
                        visible[c.key] ? 'bg-v-primary' : 'bg-v-border'
                      )}
                    >
                      <span
                        className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_3px_rgba(22,23,42,0.3)] transition-all"
                        style={{ left: visible[c.key] ? '16px' : '2px' }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* column strip */}
      <div
        className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2.5"
        style={{ gridTemplateColumns: gridCols }}
      >
        {visibleCols.map((c) => (
          <div
            key={c.key}
            className={cn(
              'text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400',
              c.align === 'right' && 'text-right',
              c.align === 'center' && 'text-center'
            )}
          >
            {c.label}
          </div>
        ))}
        {renderActions && (
          <div className="text-right text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400">
            {actionLabel}
          </div>
        )}
      </div>

      {/* body */}
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3"
            style={{ gridTemplateColumns: gridCols }}
          >
            {visibleCols.map((c) => (
              <div key={c.key} className="h-4 w-3/4 rounded bg-v-wash2" />
            ))}
            {renderActions && <div className="ml-auto h-7 w-7 rounded bg-v-wash2" />}
          </div>
        ))
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
            {emptyIcon ?? <Search className="h-[19px] w-[19px]" />}
          </span>
          <div className="text-sm font-semibold text-v-ink900">{emptyTitle}</div>
          <div className="text-[13px] text-v-ink400">{emptySub}</div>
        </div>
      ) : (
        rows.map((row, i) => (
          <div
            key={rowKey?.(row, i) ?? row?.uid ?? i}
            className="grid animate-v-pop items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-2.5 transition-colors hover:bg-[#F7F5FC]"
            style={{ gridTemplateColumns: gridCols, animationDelay: `${i * 0.03}s` }}
          >
            {visibleCols.map((c) => (
              <div
                key={c.key}
                className={cn(
                  'min-w-0',
                  c.align === 'right' && 'text-right',
                  c.align === 'center' && 'text-center'
                )}
              >
                {c.render(row)}
              </div>
            ))}
            {renderActions && (
              <div className="flex items-center justify-end gap-1">{renderActions(row)}</div>
            )}
          </div>
        ))
      )}

      {/* footer / pager */}
      <div className="flex flex-wrap items-center gap-3 px-[22px] py-3.5">
        <span className="text-[12.5px] text-v-ink400">
          {pagerTotal === 0 ? 'No records' : `Showing ${start}–${end} of ${pagerTotal}`}
        </span>
        <span className="flex-1" />
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-v-ink400">Rows</span>
          <select
            value={limit}
            onChange={(e) => changeLimit(Number(e.target.value))}
            className="cursor-pointer rounded-[8px] bg-v-wash2 px-2 py-1 text-[12.5px] font-semibold text-v-ink700 outline-none"
          >
            {limitOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => curPage > 1 && goPage(curPage - 1)}
            disabled={curPage <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-v-ink500 transition-colors hover:bg-v-wash2 disabled:opacity-30"
          >
            ‹
          </button>
          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="px-1 text-v-ink400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goPage(p)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-[8px] text-[12.5px] font-semibold tabular-nums transition-colors',
                  p === curPage ? 'bg-v-primary text-white' : 'text-v-ink500 hover:bg-v-wash2'
                )}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => curPage < pageCount && goPage(curPage + 1)}
            disabled={curPage >= pageCount}
            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-v-ink500 transition-colors hover:bg-v-wash2 disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
