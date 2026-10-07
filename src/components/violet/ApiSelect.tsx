'use client';

/**
 * Violet Suite — API-backed select.
 *
 * The Violet kit's `VioletSelect` wraps a native `<select>` over static options.
 * `ApiSelect` is its remote sibling: a violet-styled combobox that pages a
 * paginated DRF list endpoint (`{ results, next }`) through `get()`, debounces
 * the search box, and appends pages on scroll — the same contract the legacy
 * `InfiniteSelect` speaks, so every existing `apiEndPoint` works unchanged.
 *
 *   <ApiSelect
 *     endpoint="/we/chart-of-accounts"
 *     filters={{ status: 'ACTIVE', account_type__title: 'Bank,Credit Card' }}
 *     value={account}
 *     onChange={setAccount}
 *     getLabel={(a) => a?.title ?? ''}
 *     getMeta={(a) => a?.account_type?.title}
 *   />
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { get } from '@/app/helpers/api';
import { cn } from '@/lib/utils';

export interface ApiSelectProps<T = any> {
  /** REST path handed to `get()`, e.g. `/we/chart-of-accounts`. */
  endpoint: string;
  /** Extra query params merged into every request (server-side filters). */
  filters?: Record<string, any>;
  value?: T | null;
  onChange: (item: T) => void;
  /** Label for the closed control and the list row. */
  getLabel: (item: T) => string;
  /** Right-aligned secondary text on a list row. */
  getMeta?: (item: T) => React.ReactNode;
  /** Stable identity for selection/dedupe. Defaults to `item.uid`. */
  getKey?: (item: T) => string;
  placeholder?: string;
  disabled?: boolean;
  /** Render the control in its error state. */
  invalid?: boolean;
  /** Hide the search box for short, fully-loaded lists. */
  searchable?: boolean;
  /** Shows a "+ Add new" row at the top of the list. */
  onAddNew?: () => void;
  addNewLabel?: string;
  /** Bump to force a refetch from page 1 (e.g. after creating a record). */
  refreshToken?: number | string;
  /** Replace the default control. Receives the open state and a toggle. */
  renderTrigger?: (ctx: {
    open: boolean;
    toggle: () => void;
    label: string;
    disabled: boolean;
  }) => React.ReactNode;
  className?: string;
  /** Popover width in px. Defaults to matching the trigger. */
  menuWidth?: number;
  /** Extra classes for the popover panel. */
  menuClassName?: string;
  'aria-label'?: string;
}

const PANEL =
  'z-[300] overflow-hidden rounded-[14px] border border-v-border bg-white font-jakarta shadow-v-card animate-v-pop';

export function ApiSelect<T = any>({
  endpoint,
  filters,
  value,
  onChange,
  getLabel,
  getMeta,
  getKey = (i: any) => i?.uid,
  placeholder = 'Select…',
  disabled = false,
  invalid = false,
  searchable = true,
  onAddNew,
  addNewLabel = 'Add new',
  refreshToken,
  renderTrigger,
  className,
  menuWidth,
  menuClassName,
  'aria-label': ariaLabel,
}: ApiSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [term, setTerm] = React.useState('');
  const [debounced] = useDebounce(term, 400);
  const [page, setPage] = React.useState(1);
  const [items, setItems] = React.useState<T[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [rect, setRect] = React.useState<{ top: number; left: number; width: number } | null>(null);

  const triggerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  // `filters` is usually an inline object literal — a new identity every render.
  // Serialising it keeps the query key and the reset stable.
  const filterKey = JSON.stringify(filters ?? {});
  /** Identity of the result set the accumulated pages belong to. */
  const listKey = `${endpoint}|${filterKey}|${debounced}|${refreshToken ?? ''}`;

  /**
   * Restart paging during render rather than in an effect.
   *
   * An effect would run *after* this render, so a term change while scrolled to
   * page 3 would let `useQuery` fire for (newTerm, page 3) first and append that
   * page to a fresh search. Resetting here makes React re-run the render
   * immediately, so the query below only ever sees page 1 for a new list.
   */
  const [listKeyRef, setListKeyRef] = React.useState(listKey);
  if (listKeyRef !== listKey) {
    setListKeyRef(listKey);
    setPage(1);
    setItems([]);
    setHasMore(true);
  }

  const { isFetching } = useQuery({
    queryKey: ['api-select', listKey, page],
    enabled: open,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const requestedPage = page;
      const requestedList = listKey;
      const res = await get(endpoint, { page: requestedPage, search: debounced, ...(filters ?? {}) });
      const results: T[] = Array.isArray(res?.results) ? res.results : [];
      // A response that outlived its list (rapid typing) must not be merged.
      if (requestedList !== listKeyRef && requestedList !== listKey) return res;
      setHasMore(!!res?.next);
      setItems((prev) => {
        if (requestedPage === 1) return results;
        const seen = new Set(prev.map((i) => getKey(i)));
        return [...prev, ...results.filter((i) => !seen.has(getKey(i)))];
      });
      return res;
    },
  });

  /* Position the portalled panel under the trigger and keep it there. */
  const place = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: r.left, width: menuWidth ?? r.width });
  }, [menuWidth]);

  React.useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  /* Outside click + Escape close. */
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = React.useCallback(() => {
    if (disabled) return;
    setOpen((o) => {
      if (!o) setTerm('');
      return !o;
    });
  }, [disabled]);

  const label = value ? getLabel(value) : '';
  const selectedKey = value ? getKey(value) : undefined;

  const onScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 24 && hasMore && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  const panel =
    open && rect
      ? createPortal(
          <div
            ref={panelRef}
            role="listbox"
            className={cn(PANEL, menuClassName)}
            style={{ position: 'fixed', top: rect.top, left: rect.left, width: rect.width }}
          >
            {(searchable || onAddNew) && (
              <div className="flex items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-3 py-2">
                {searchable && (
                  <>
                    <Search className="h-3.5 w-3.5 shrink-0 text-v-ink400" />
                    <input
                      autoFocus
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      placeholder="Search…"
                      className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-medium text-v-ink900 outline-none placeholder:text-v-ink400"
                    />
                  </>
                )}
                {onAddNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onAddNew();
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-v-tint150 px-2.5 py-1 text-[11.5px] font-bold text-v-primary transition-colors hover:bg-v-tint100"
                  >
                    <Plus className="h-3 w-3" />
                    {addNewLabel}
                  </button>
                )}
              </div>
            )}

            <ul ref={listRef} onScroll={onScroll} className="max-h-64 overflow-y-auto p-1.5">
              {items.map((item, i) => {
                const k = getKey(item);
                const selected = selectedKey != null && k === selectedKey;
                const meta = getMeta?.(item);
                return (
                  <li key={k ?? i}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onChange(item);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-[9px] px-2.5 py-2 text-left transition-colors',
                        selected ? 'bg-v-tint150' : 'hover:bg-v-tint100'
                      )}
                    >
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate text-[13px]',
                          selected ? 'font-bold text-v-primary' : 'font-medium text-v-ink900'
                        )}
                      >
                        {getLabel(item)}
                      </span>
                      {meta != null && meta !== '' && (
                        <span className="shrink-0 text-[11px] text-v-ink400">{meta}</span>
                      )}
                      {selected && <Check className="h-3.5 w-3.5 shrink-0 text-v-primary" />}
                    </button>
                  </li>
                );
              })}

              {isFetching && (
                <li className="px-2.5 py-2 text-center text-[12px] text-v-ink400">Loading…</li>
              )}
              {!isFetching && items.length === 0 && (
                <li className="px-2.5 py-5 text-center text-[12.5px] text-v-ink400">
                  No matches{term ? ` for “${term}”` : ''}.
                </li>
              )}
              {!hasMore && items.length > 0 && (
                <li className="px-2.5 py-1.5 text-center text-[10.5px] text-v-ink300">
                  End of list
                </li>
              )}
            </ul>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div ref={triggerRef} className={cn('relative', className)}>
        {renderTrigger ? (
          renderTrigger({ open, toggle, label, disabled })
        ) : (
          <button
            type="button"
            onClick={toggle}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              'flex w-full items-center gap-2 rounded-v-input border bg-white px-3.5 py-2.5 text-left font-jakarta text-[13.5px] font-medium outline-none transition-shadow',
              invalid ? 'border-v-danger-fg' : 'border-v-border',
              disabled
                ? 'cursor-not-allowed bg-v-wash2 text-v-ink400'
                : 'text-v-ink900 hover:border-v-300',
              open && !invalid && 'border-v-primary shadow-[0_0_0_3px_#EEE9FF]'
            )}
          >
            <span className={cn('min-w-0 flex-1 truncate', !label && 'text-v-ink400')}>
              {label || placeholder}
            </span>
            <ChevronDown
              className={cn(
                'h-[13px] w-[13px] shrink-0 text-v-ink400 transition-transform',
                open && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>
      {panel}
    </>
  );
}
