'use client';

import * as React from 'react';
import { AlertTriangle, ExternalLink, FileText, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money } from '@/components/violet';
import { groupByMonth, toMDY, type ColumnLabels, type RegisterRow } from './registerModel';
import { COLUMN_LABELS, type ColKey, type DisplaySettings } from './RegisterToolbar';

/* ── column geometry ─────────────────────────────────────────────────── */

const COLUMN_WIDTH: Record<ColKey, string> = {
  date: '96px',
  refNo: '124px',
  type: '132px',
  payee: 'minmax(140px,1.2fr)',
  memo: 'minmax(150px,1.5fr)',
  category: 'minmax(140px,1.2fr)',
  store: '120px',
  payment: '112px',
  deposit: '112px',
  status: '64px',
  balance: '124px',
};

const RIGHT_ALIGNED: ColKey[] = ['payment', 'deposit', 'balance'];
const CENTER_ALIGNED: ColKey[] = ['status'];

const COLUMN_ORDER: ColKey[] = [
  'date',
  'refNo',
  'type',
  'payee',
  'memo',
  'category',
  'store',
  'payment',
  'deposit',
  'status',
  'balance',
];

/**
 * `reconciliation_status` is `U` / `C` / `R` and is present on every row. It is
 * read-only here: a line's status belongs to a reconciliation session, so it is
 * set in the Reconcile workspace, never from this grid.
 */
export const STATUS_STYLE = {
  R: {
    cls: 'border-v-success-fg/40 bg-v-success-bg text-v-success-fg',
    glyph: 'R',
    title: 'Reconciled',
  },
  C: { cls: 'border-v-warn-fg/40 bg-v-warn-bg text-v-warn-fg', glyph: 'C', title: 'Cleared' },
  U: { cls: 'border-v-border bg-white text-v-ink300', glyph: 'U', title: 'Unreconciled' },
} as const;

export interface RegisterTableProps {
  rows: RegisterRow[];
  loading?: boolean;
  settings: DisplaySettings;
  /** Money-column headings, from the account header's `column_labels`. */
  labels: ColumnLabels;
  filtered: boolean;
  onClearFilters: () => void;
  error?: boolean;
  /** Title + body for the error state, branched on the server's own message. */
  errorTitle?: string;
  errorMessage?: string;
}

export function RegisterTable({
  rows,
  loading,
  settings,
  labels,
  filtered,
  onClearFilters,
  error,
  errorTitle,
  errorMessage,
}: RegisterTableProps) {
  const [openKey, setOpenKey] = React.useState<string | null>(null);

  const cols = COLUMN_ORDER.filter((k) => settings.visible[k]);
  const template = cols.map((k) => COLUMN_WIDTH[k]).join(' ');
  const minWidth = cols.reduce(
    (w, k) => w + (COLUMN_WIDTH[k].startsWith('minmax') ? 150 : parseInt(COLUMN_WIDTH[k], 10)),
    40
  );
  const padY = settings.compact ? 'py-1.5' : 'py-2.5';

  const label = (k: ColKey) =>
    k === 'payment' ? labels.payment : k === 'deposit' ? labels.deposit : COLUMN_LABELS[k];

  const groups = settings.groupByMonth
    ? groupByMonth(rows)
    : [{ ym: 'all', label: '', rows, net: 0 }];

  return (
    <div className="max-h-[70vh] overflow-auto">
      <div style={{ minWidth }}>
        {/* Header */}
        <div
          className="sticky top-0 z-10 grid items-center gap-3 border-y border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-5 py-2"
          style={{ gridTemplateColumns: template }}
        >
          {cols.map((k) => (
            <div
              key={k}
              className={cn(
                'text-[10.5px] font-extrabold uppercase tracking-[0.07em] text-v-ink500',
                RIGHT_ALIGNED.includes(k) && 'text-right',
                CENTER_ALIGNED.includes(k) && 'text-center'
              )}
            >
              {label(k)}
            </div>
          ))}
        </div>

        {loading ? (
          <SkeletonRows template={template} count={cols.length} />
        ) : error ? (
          <ErrorState title={errorTitle} message={errorMessage} />
        ) : rows.length === 0 ? (
          <EmptyState filtered={filtered} onClearFilters={onClearFilters} />
        ) : (
          groups.map((g, gi) => (
            <React.Fragment key={`${g.ym}-${gi}`}>
              {settings.groupByMonth && (
                <div className="flex items-center gap-3 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-5 py-2">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-[0.09em] text-v-primary">
                    {g.label}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-[rgba(22,23,42,0.1)] to-transparent" />
                  {/* Scoped to the rows on screen — a month spanning pages is
                      only partly represented here, so the count says so. */}
                  <span
                    title="Totals the lines shown on this page"
                    className="text-[11px] tabular-nums text-v-ink500"
                  >
                    {g.rows.length} {g.rows.length === 1 ? 'line' : 'lines'} shown · net{' '}
                    <strong
                      className={cn(
                        'font-semibold',
                        g.net < 0 ? 'text-v-danger-fg' : 'text-v-ink700'
                      )}
                    >
                      {money(g.net)}
                    </strong>
                  </span>
                </div>
              )}

              {g.rows.map((r, i) => {
                const open = openKey === r.key;
                const st = STATUS_STYLE[r.status];
                return (
                  <div
                    key={r.key}
                    className={cn(
                      'border-b border-[rgba(22,23,42,0.06)] transition-colors',
                      open ? 'bg-v-tint150' : i % 2 ? 'bg-v-card-subtle/50' : 'bg-white'
                    )}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpenKey(open ? null : r.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenKey(open ? null : r.key);
                        }
                      }}
                      className={cn(
                        'grid cursor-pointer items-center gap-3 px-5 text-[13px] hover:bg-v-tint100/60',
                        padY
                      )}
                      style={{ gridTemplateColumns: template }}
                    >
                      {cols.map((k) => (
                        <Cell key={k} col={k} row={r} status={st} />
                      ))}
                    </div>

                    {open && <DetailPanel row={r} labels={labels} />}
                  </div>
                );
              })}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}

function Cell({
  col,
  row,
  status,
}: {
  col: ColKey;
  row: RegisterRow;
  status: (typeof STATUS_STYLE)[keyof typeof STATUS_STYLE];
}) {
  switch (col) {
    case 'date':
      // The leg's own date, not `journal.date` — the two legitimately differ.
      return (
        <div className="tabular-nums text-[12.5px] text-v-ink700">{toMDY(row.date) || '—'}</div>
      );
    case 'refNo':
      return (
        <div className="truncate tabular-nums text-[12.5px] text-v-ink500" title={row.refNo}>
          {row.refNo || '—'}
        </div>
      );
    case 'type':
      // `model_kind`. Never `request_kind` — that would read "Created" on every row.
      return (
        <div className="flex min-w-0 items-center gap-1.5">
          {row.kind ? (
            <span
              title={row.kind}
              className="inline-block min-w-0 truncate rounded-full bg-[rgba(22,23,42,0.045)] px-2.5 py-[3px] text-[10.5px] font-bold text-v-ink500"
            >
              {row.kind}
            </span>
          ) : (
            <span className="text-v-ink300">—</span>
          )}
          {/* An amendment appends a delta leg and a void appends reversing legs;
              both are real ledger events sharing the original's document. */}
          {row.isAdjustment && (
            <span
              title="Adjustment — a delta or reversing leg appended to the original document"
              className="shrink-0 rounded-full border border-v-warn-fg/40 bg-v-warn-bg px-1.5 py-[1px] text-[9.5px] font-extrabold uppercase tracking-[0.04em] text-v-warn-fg"
            >
              Adj
            </span>
          )}
        </div>
      );
    case 'payee':
      return <div className="truncate pr-2 font-semibold text-v-ink900">{row.payee || '—'}</div>;
    case 'memo':
      // Null on most sale / purchase / pay-bill rows — normal, not a gap.
      return <div className="truncate pr-2 text-v-ink500">{row.memo || '—'}</div>;
    case 'category':
      // `null` is normal: one-legged entries have no contra account.
      return (
        <div
          className={cn(
            'truncate pr-2 text-[12.5px]',
            row.category === '-Split-' ? 'font-semibold text-v-primary' : 'text-v-ink500'
          )}
        >
          {row.category || '—'}
        </div>
      );
    case 'store':
      // Null on most bank rows by design — only Sales, Purchases and Credit
      // Notes carry a warehouse.
      return <div className="truncate text-[12.5px] text-v-ink500">{row.store || '—'}</div>;
    case 'payment':
      return (
        <div className="text-right tabular-nums text-[12.5px] text-v-ink900">
          {row.payment ? money(row.payment) : ''}
        </div>
      );
    case 'deposit':
      return (
        <div className="text-right tabular-nums text-[12.5px] text-v-success-fg">
          {row.deposit ? money(row.deposit) : ''}
        </div>
      );
    case 'status':
      return (
        <div className="flex justify-center">
          <span
            title={status.title}
            aria-label={status.title}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-[7px] border text-[11px] font-bold tabular-nums',
              status.cls
            )}
          >
            {status.glyph}
          </span>
        </div>
      );
    case 'balance':
      // `running_balance` — correct under every filter and across pages.
      return (
        <div
          className={cn(
            'text-right text-[12.5px] font-semibold tabular-nums',
            row.balance === null
              ? 'text-v-ink300'
              : row.balance < 0
                ? 'text-v-danger-fg'
                : 'text-v-ink900'
          )}
        >
          {row.balance === null ? '—' : money(row.balance)}
        </div>
      );
    default:
      return <div />;
  }
}

/**
 * Row detail — read-only.
 *
 * `/sessions` is GET-only and no per-leg write endpoint exists anywhere, so
 * there is nothing here to edit. Reconcile state is not editable either: it
 * belongs to a session, and a line has no status outside an open one.
 */
function DetailPanel({ row, labels }: { row: RegisterRow; labels: ColumnLabels }) {
  const statusStyle = STATUS_STYLE[row.status];

  const facts: { label: string; value: React.ReactNode; title?: string }[] = [
    { label: 'Date', value: toMDY(row.date) || '—' },
    { label: 'Transaction type', value: row.kind || '—' },
    { label: 'Entry number', value: row.refNo || '—' },
    {
      label: 'Payee',
      value: row.payee ? `${row.payee}${row.payeeKind ? ` · ${row.payeeKind}` : ''}` : '—',
    },
    { label: 'Category account', value: row.category || '—' },
    { label: 'Store', value: row.store || '—' },
    { label: labels.payment, value: row.payment ? money(row.payment) : '—' },
    { label: labels.deposit, value: row.deposit ? money(row.deposit) : '—' },
    {
      label: 'Running balance',
      value: row.balance === null ? '—' : money(row.balance),
    },
    {
      label: 'Posting side',
      value: row.side || '—',
      title: 'DEBIT / CREDIT — the accounting side, not the transaction type',
    },
    {
      label: 'Document total',
      value: row.documentTotal ? money(row.documentTotal) : '—',
      title: "The whole document's total, repeated on each of its legs",
    },
    {
      label: 'Status',
      value: (
        <span
          title={statusStyle.title}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-[7px] border text-[11px] font-bold tabular-nums',
            statusStyle.cls
          )}
        >
          {statusStyle.glyph}
        </span>
      ),
    },
  ];
  if (row.clearedOn) facts.push({ label: 'Cleared on', value: toMDY(row.clearedOn) });
  if (row.requestKind && row.requestKind !== 'CREATED') {
    facts.push({ label: 'Audit action', value: row.requestKind });
  }

  return (
    <div className="animate-v-pop border-t border-[rgba(22,23,42,0.07)] bg-white px-5 py-4">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <FileText className="h-4 w-4 text-v-primary" />
        <span className="text-sm font-extrabold text-v-ink900">{row.kind || 'Ledger line'}</span>
        {row.isAdjustment && (
          <span className="rounded-full border border-v-warn-fg/40 bg-v-warn-bg px-2 py-[2px] text-[10.5px] font-bold text-v-warn-fg">
            Adjustment
          </span>
        )}
        <span className="flex-1" />
        {/* The document uid, not the leg's — this is the id Reconcile ticks
            against, and every leg of the document moves with it. */}
        {row.documentUid && (
          <span
            title="Journal entry (document) — shared by every leg of this transaction"
            className="text-[11.5px] tabular-nums text-v-ink500"
          >
            Doc {row.documentUid}
          </span>
        )}
      </div>

      <dl className="grid gap-x-5 gap-y-3 [grid-template-columns:repeat(auto-fit,minmax(148px,1fr))]">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0" title={f.title}>
            <dt className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-v-ink500">
              {f.label}
            </dt>
            <dd className="mt-0.5 truncate text-[13px] font-medium text-v-ink900">{f.value}</dd>
          </div>
        ))}
      </dl>

      {row.memo && (
        <div className="mt-3 rounded-xl bg-v-wash2 px-3.5 py-2.5">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-v-ink500">
            Memo
          </div>
          <p className="mt-0.5 text-[13px] leading-snug text-v-ink700">{row.memo}</p>
        </div>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-[11.5px] text-v-ink500">
        <ExternalLink className="h-3 w-3" />
        Ledger lines are posted by their source document — edit the originating transaction to
        change them, and set reconcile state in Reconcile.
      </p>
    </div>
  );
}

/* ── states ──────────────────────────────────────────────────────────── */

function SkeletonRows({ template, count }: { template: string; count: number }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-5 py-3"
          style={{ gridTemplateColumns: template }}
        >
          {Array.from({ length: count }).map((__, j) => (
            <div key={j} className="h-3.5 w-3/4 animate-pulse rounded bg-v-wash2" />
          ))}
        </div>
      ))}
    </>
  );
}

function ErrorState({ title, message }: { title?: string; message?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-danger-bg text-v-danger-fg">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <div className="text-sm font-bold text-v-ink900">
        {title || "Couldn't load the register"}
      </div>
      <div className="max-w-sm text-[13px] text-v-ink500">
        {message || 'Something went wrong fetching these transactions. Try again in a moment.'}
      </div>
    </div>
  );
}

function EmptyState({
  filtered,
  onClearFilters,
}: {
  filtered: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
        <SearchX className="h-5 w-5" />
      </span>
      <div className="text-sm font-bold text-v-ink900">
        {filtered ? 'No lines match these filters' : 'No transactions in this register'}
      </div>
      <div className="max-w-sm text-[13px] text-v-ink500">
        {filtered
          ? 'Widen the date range or clear a filter to see the rest of the ledger.'
          : 'Transactions posted to this account will appear here.'}
      </div>
      {filtered && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-1.5 rounded-full bg-v-tint100 px-3.5 py-[7px] text-[12.5px] font-semibold text-v-primary transition-colors hover:bg-v-tint150"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
