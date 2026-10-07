'use client';
import * as React from 'react';
import { useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Search, Download, Columns3, GripVertical, Lock, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VioletButton } from '@/components/violet';
import { EXPENSE_TYPES } from './expenseHelpers';
import type { ExpenseColumn } from './expenseColumns';

export interface ExpensesListTableProps {
  /** current table type + setter (drives the type dropdown) */
  type: string;
  setType: (t: string) => void;
  data?: { count?: number; results?: any[]; data?: any[] };
  loading?: boolean;
  params?: any;
  setParams?: (p: any) => void;
  columns: ExpenseColumn[];
  renderActions?: (row: any) => React.ReactNode;
  searchPlaceholder?: string;
  exportName?: string;
}

function pageRange(page: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', count];
  if (page >= count - 3) return [1, '…', count - 4, count - 3, count - 2, count - 1, count];
  return [1, '…', page - 1, page, page + 1, '…', count];
}

export default function ExpensesListTable({
  type,
  setType,
  data,
  loading,
  params,
  setParams,
  columns,
  renderActions,
  searchPlaceholder = 'Search payee or reference',
  exportName = 'expenses',
}: ExpensesListTableProps) {
  const colMap = React.useMemo(() => {
    const m: Record<string, ExpenseColumn> = {};
    columns.forEach((c) => (m[c.key] = c));
    return m;
  }, [columns]);

  const results: any[] = data?.results || data?.data || [];
  const total = data?.count ?? results.length;

  // server-driven
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  // client-side
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<1 | -1>(1);
  const [order, setOrder] = React.useState<string[]>(columns.map((c) => c.key));
  const [visible, setVisible] = React.useState<Record<string, boolean>>(() => {
    const v: Record<string, boolean> = {};
    columns.forEach((c) => (v[c.key] = !c.defaultHidden));
    return v;
  });
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [dragKey, setDragKey] = React.useState<string | null>(null);

  // sync server page-size with the UI on mount (the shared admin Table did this)
  useEffect(() => {
    setParams?.({ page: 1, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.('[data-exp-keep]')) setPanelOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  /* server params — always send search so clearing resets the filter (merge semantics) */
  const pushParams = (next: Record<string, any>) => setParams?.({ page, limit, search, ...next });
  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
    setParams?.({ page: 1, limit, search: v });
  };
  const goPage = (p: number) => {
    setPage(p);
    pushParams({ page: p });
  };
  const changeLimit = (l: number) => {
    setLimit(l);
    setPage(1);
    setParams?.({ page: 1, limit: l, search });
  };

  const processed = React.useMemo(() => {
    if (!sortKey) return results;
    const col = colMap[sortKey];
    if (!col?.sortValue) return results;
    const dir = sortDir;
    return [...results].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [results, sortKey, sortDir, colMap]);

  const hasActions = !!renderActions;
  const visibleCols = order.filter((k) => visible[k]);
  const gridCols = `${visibleCols.map((k) => colMap[k].w).join(' ')}${hasActions ? ' 96px' : ''}`;

  const setSort = (k: string) =>
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

  const moveCol = (i: number, dir: -1 | 1) =>
    setOrder((o) => {
      const j = i + dir;
      if (j < 0 || j >= o.length) return o;
      if (colMap[o[i]].locked || colMap[o[j]].locked) return o;
      const next = [...o];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const reorderTo = (drag: string, over: string) =>
    setOrder((o) => {
      if (colMap[drag].locked || colMap[over].locked) return o;
      const from = o.indexOf(drag);
      const to = o.indexOf(over);
      if (from < 0 || to < 0 || from === to) return o;
      const next = o.filter((k) => k !== drag);
      next.splice(to, 0, drag);
      return next;
    });
  const resetCols = () => {
    setOrder(columns.map((c) => c.key));
    const v: Record<string, boolean> = {};
    columns.forEach((c) => (v[c.key] = !c.defaultHidden));
    setVisible(v);
  };
  const hiddenCount = order.filter((k) => !visible[k]).length;

  const handleExport = () => {
    if (!processed.length) return;
    const exportCols = columns.filter((c) => c.exportValue);
    const sheet = processed.map((r) => {
      const o: Record<string, any> = {};
      exportCols.forEach((c) => (o[c.label] = c.exportValue!(r)));
      return o;
    });
    const ws = XLSX.utils.json_to_sheet(sheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, `${exportName}.xlsx`);
  };

  const pageCount = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
      setParams?.({ page: pageCount, limit, search });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  const pages = pageRange(page, pageCount);
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="mt-4 animate-v-rise overflow-hidden rounded-v-card bg-white font-jakarta text-v-ink900 shadow-v-card">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
        {/* type select */}
        <div className="relative">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="cursor-pointer appearance-none rounded-[10px] border border-v-border bg-white py-2 pl-3.5 pr-9 text-[13px] font-semibold text-v-ink900 outline-none transition-colors hover:border-v-primary focus:border-v-primary"
          >
            {EXPENSE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-v-ink400" />
        </div>

        <span className="flex-1" />

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-v-ink400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-[240px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
          />
        </div>

        <div className="relative" data-exp-keep>
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
            <div className="absolute right-0 top-11 z-50 w-[298px] animate-v-pop rounded-v-card border border-v-border bg-white p-3 shadow-v-modal">
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
              {order.map((k, i) => {
                const def = colMap[k];
                return (
                  <div
                    key={k}
                    draggable={!def.locked}
                    onDragStart={() => setDragKey(k)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragKey && dragKey !== k) reorderTo(dragKey, k);
                      setDragKey(null);
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-[9px] px-1.5 py-1.5',
                      dragKey === k ? 'bg-v-tint100' : 'hover:bg-v-wash'
                    )}
                  >
                    <span className={cn('cursor-grab text-v-ink300', def.locked && 'opacity-30')}>
                      <GripVertical className="h-[15px] w-[15px]" />
                    </span>
                    <span className="flex-1 text-[12.5px] font-medium text-v-ink700">{def.label}</span>
                    {def.locked ? (
                      <Lock className="h-[13px] w-[13px] text-v-ink300" />
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => moveCol(i, -1)}
                          disabled={i === 0 || !!colMap[order[i - 1]]?.locked}
                          className="text-v-ink400 transition-colors hover:text-v-primary disabled:opacity-25"
                        >
                          <ArrowUp className="h-[14px] w-[14px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCol(i, 1)}
                          disabled={i === order.length - 1 || !!colMap[order[i + 1]]?.locked}
                          className="text-v-ink400 transition-colors hover:text-v-primary disabled:opacity-25"
                        >
                          <ArrowDown className="h-[14px] w-[14px]" />
                        </button>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={visible[k]}
                          onClick={() => setVisible((v) => ({ ...v, [k]: !v[k] }))}
                          className={cn(
                            'relative inline-flex h-[18px] w-8 shrink-0 rounded-full transition-colors',
                            visible[k] ? 'bg-v-primary' : 'bg-v-border'
                          )}
                        >
                          <span
                            className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_3px_rgba(22,23,42,0.3)] transition-all"
                            style={{ left: visible[k] ? '16px' : '2px' }}
                          />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
              {hiddenCount > 0 && (
                <p className="mt-1 px-1 text-[11px] text-v-ink400">{hiddenCount} column(s) hidden</p>
              )}
            </div>
          )}
        </div>

        <VioletButton variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={handleExport}>
          Export
        </VioletButton>
      </div>

      {/* header */}
      <div
        className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2.5"
        style={{ gridTemplateColumns: gridCols }}
      >
        {visibleCols.map((k) => {
          const def = colMap[k];
          const active = !!def.sortValue && sortKey === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => def.sortValue && setSort(k)}
              className={cn(
                'flex items-center gap-1 border-none bg-transparent p-0 text-[12px] font-semibold uppercase tracking-[0.04em] transition-colors',
                def.align === 'right' ? 'justify-end' : def.align === 'center' ? 'justify-center' : 'justify-start',
                active ? 'text-v-primary' : 'text-v-ink400',
                def.sortValue ? 'cursor-pointer hover:text-v-primary' : 'cursor-default'
              )}
            >
              {def.label}
              {active && <span className="text-[11px]">{sortDir === 1 ? '↑' : '↓'}</span>}
            </button>
          );
        })}
        {hasActions && <div className="text-right text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400">Actions</div>}
      </div>

      {/* body */}
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3"
            style={{ gridTemplateColumns: gridCols }}
          >
            {visibleCols.map((k) => (
              <div key={k} className="h-4 w-3/4 rounded bg-v-wash2" />
            ))}
            {hasActions && <div className="ml-auto h-4 w-16 rounded bg-v-wash2" />}
          </div>
        ))
      ) : processed.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
            <Search className="h-[19px] w-[19px]" />
          </span>
          <div className="text-sm font-semibold text-v-ink900">No records found</div>
          <div className="text-[13px] text-v-ink400">Try a different search or type.</div>
        </div>
      ) : (
        processed.map((row, i) => (
          <div
            key={row?.uid || i}
            className="grid animate-v-pop items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-2.5 transition-colors hover:bg-[#F7F5FC]"
            style={{ gridTemplateColumns: gridCols, animationDelay: `${i * 0.03}s` }}
          >
            {visibleCols.map((k) => (
              <div key={k} className="min-w-0">
                {colMap[k].render(row)}
              </div>
            ))}
            {hasActions && (
              <div className="flex items-center justify-end gap-1" data-exp-keep>
                {renderActions?.(row)}
              </div>
            )}
          </div>
        ))
      )}

      {/* footer / pager */}
      <div className="flex flex-wrap items-center gap-3 px-[22px] py-3.5">
        <span className="text-[12.5px] text-v-ink400">
          {total === 0 ? 'No records' : `Showing ${start}–${end} of ${total}`}
        </span>
        <span className="flex-1" />
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-v-ink400">Rows</span>
          <select
            value={limit}
            onChange={(e) => changeLimit(Number(e.target.value))}
            className="cursor-pointer rounded-[8px] bg-v-wash2 px-2 py-1 text-[12.5px] font-semibold text-v-ink700 outline-none"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => page > 1 && goPage(page - 1)}
            disabled={page <= 1}
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
                  p === page ? 'bg-v-primary text-white' : 'text-v-ink500 hover:bg-v-wash2'
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
            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-v-ink500 transition-colors hover:bg-v-wash2 disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
