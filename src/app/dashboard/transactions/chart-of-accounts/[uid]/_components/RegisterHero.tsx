'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, CreditCard, Landmark, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiSelect, Chip, VioletButton, money } from '@/components/violet';
import {
  isControlAccount,
  toMDY,
  toISODate,
  type ColumnLabels,
  type RegisterTotals,
  type StatusCounts,
} from './registerModel';

export interface RegisterHeroProps {
  account: any;
  accountLoading?: boolean;
  /** Presentation only — the icon and chip tone. Never the money direction. */
  creditCard: boolean;
  /** Money labels from the header's `column_labels`. */
  labels: ColumnLabels;
  totals: RegisterTotals;
  counts: StatusCounts;
  pageRows: number;
  totalRows: number;
  accountBalance: number | null;
  /** True once the account has been read at least once. */
  canReconcile?: boolean;
  filtered?: boolean;
}

export function RegisterHero({
  account,
  accountLoading,
  creditCard,
  labels,
  totals,
  counts,
  pageRows,
  totalRows,
  accountBalance,
  canReconcile = true,
  filtered = false,
}: RegisterHeroProps) {
  const router = useRouter();

  const typeTitle: string = account?.account_type?.title ?? '';
  const detailTitle: string = account?.detail_type?.title ?? '';
  // Displayed as an account attribute only. There is no FX machinery in the
  // system — amounts of different document currencies are summed unconverted —
  // so `money()` deliberately does not localise by this field.
  const currency: string = account?.currency || '';

  // Known: the true account balance. Unknown (a filtered page, or page 2+):
  // fall back to the balance after the last line shown, and say which it is.
  const known = accountBalance !== null;
  const headline = known ? (accountBalance as number) : totals.closing;

  /** The statement date of the latest closed reconciliation, or null. */
  const reconciledThrough = toMDY(toISODate(account?.reconciled_through));

  const pct = (n: number) => (counts.total ? Math.round((n / counts.total) * 100) : 0);

  return (
    <section className="relative overflow-hidden rounded-v-card border border-v-chip-border bg-gradient-to-br from-white to-v-tint50 shadow-v-card">
      <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-v-primary via-v-300 to-v-ink900" />

      <div className="flex flex-wrap items-start gap-6 px-6 pb-4 pt-5">
        {/* Account identity + picker */}
        <div className="min-w-[300px] flex-1">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-v-ink400">
            Bank Register
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <ApiSelect
              endpoint="/we/chart-of-accounts"
              // `account_type__title` is the proven filter param; a comma-joined
              // list is the established multi-value convention on this endpoint.
              filters={{ status: 'ACTIVE', account_type__title: 'Bank,Credit Cards' }}
              value={account ?? null}
              onChange={(a: any) => {
                if (a?.uid) router.push(`/dashboard/transactions/chart-of-accounts/${a.uid}`);
              }}
              getLabel={(a: any) => a?.title ?? ''}
              getMeta={(a: any) => a?.account_type?.title ?? ''}
              menuWidth={360}
              aria-label="Select account"
              renderTrigger={({ open, toggle, label }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-haspopup="listbox"
                  aria-expanded={open}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border bg-white py-1.5 pl-2 pr-3.5 text-left shadow-[0_6px_16px_-12px_rgba(22,23,42,0.4)] transition-colors',
                    open ? 'border-v-primary' : 'border-v-border hover:border-v-300'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      creditCard ? 'bg-v-warn-bg text-v-warn-fg' : 'bg-v-tint100 text-v-primary'
                    )}
                  >
                    {creditCard ? (
                      <CreditCard className="h-[18px] w-[18px]" />
                    ) : (
                      <Landmark className="h-[18px] w-[18px]" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[21px] font-extrabold leading-tight tracking-[-0.02em] text-v-ink900">
                      {label || (accountLoading ? 'Loading…' : 'Select an account')}
                    </span>
                    <span className="block truncate text-[11.5px] text-v-ink400">
                      {[account?.code, detailTitle || typeTitle, currency]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </span>
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn(
                      'shrink-0 text-v-ink500 transition-transform',
                      open && 'rotate-180'
                    )}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              )}
            />

            {typeTitle && <Chip tone={creditCard ? 'warn' : 'violet'}>{typeTitle}</Chip>}
            {/* `is_control_account`, derived from the posting engine's own key —
                not `is_fixed`, which only means "came from the industry seed". */}
            {isControlAccount(account) && <Chip tone="neutral">Control account</Chip>}
          </div>
        </div>

        {/* Balances */}
        <div className="flex flex-wrap items-stretch gap-3">
          <div className="min-w-[212px] rounded-2xl border border-v-chip-border bg-gradient-to-br from-v-tint50 to-white px-4 pb-3 pt-3 text-right">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-v-ink400">
              {known ? 'Current balance' : 'Balance'}
            </div>
            <div
              className={cn(
                'mt-1 text-[27px] font-semibold leading-tight tabular-nums tracking-[-0.01em]',
                (headline ?? 0) < 0 ? 'text-v-danger-fg' : 'text-v-ink900'
              )}
            >
              {money(headline ?? 0)}
            </div>
            <div className="mt-0.5 text-[11px] text-v-ink400">
              {known
                ? totalRows === 0
                  ? 'No ledger lines yet'
                  : "The newest line's running balance"
                : 'After the last line shown'}
            </div>
          </div>

          <div className="min-w-[186px] rounded-2xl border border-v-border bg-white px-4 pb-3 pt-3 text-right">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-v-ink400">
              Reconciled through
            </div>
            <div className="mt-1.5 text-[20px] font-semibold leading-tight tabular-nums text-v-ink700">
              {reconciledThrough || '—'}
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-v-wash2 px-2.5 py-[3px] text-[10.5px] font-bold text-v-ink500">
              <ShieldCheck className="h-3 w-3" />
              {reconciledThrough ? 'Last closed statement' : 'Never reconciled'}
            </div>
          </div>

          {/* Shown only for an ACTIVE money account — the reconcile picker
              refuses anything else, and API-created accounts are left DRAFT. */}
          {canReconcile && (
            <VioletButton
              className="self-center"
              // The reconcile screen holds its own local state and reads no
              // query params, so the account cannot be pre-selected from here.
              onClick={() => router.push('/dashboard/transactions/reconcile')}
              leftIcon={<CheckCheck className="h-[15px] w-[15px]" />}
            >
              Reconcile
            </VioletButton>
          )}
        </div>
      </div>

      {/* Page facts. Every money figure here is scoped to the rows below —
          server-side pagination means there is no account-wide total to show,
          and a filter can legitimately zero one side. The reconcile counts are
          page-scoped too; `reconciliation_status` itself spans the account and
          is filterable from the toolbar. */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-v-ink500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-v-ink700">
              {filtered
                ? `${pageRows} filtered of ${totalRows} lines:`
                : `${pageRows} of ${totalRows} lines:`}
            </span>
            <span
              className="inline-flex items-center gap-1.5"
              title="Totals only the lines shown below"
            >
              <span className="h-2 w-2 rounded-[3px] bg-v-success-solid" />
              {labels.deposit}{' '}
              <strong className="font-semibold tabular-nums text-v-ink900">
                {money(totals.deposit)}
              </strong>
            </span>
            <span
              className="inline-flex items-center gap-1.5"
              title="Totals only the lines shown below"
            >
              <span className="h-2 w-2 rounded-[3px] bg-v-warn-fg" />
              {labels.payment}{' '}
              <strong className="font-semibold tabular-nums text-v-ink900">
                {money(totals.payment)}
              </strong>
            </span>
            {!filtered && (
              <span
                className="inline-flex items-center gap-1.5"
                title="Totals only the lines shown below"
              >
                <span className="h-2 w-2 rounded-[3px] bg-v-primary" />
                Net{' '}
                <strong
                  className={cn(
                    'font-semibold tabular-nums',
                    totals.net < 0 ? 'text-v-danger-fg' : 'text-v-ink900'
                  )}
                >
                  {money(totals.net)}
                </strong>
              </span>
            )}

            {counts.available && (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-[3px] bg-v-success-fg" />
                  Reconciled{' '}
                  <strong className="font-semibold tabular-nums text-v-ink900">
                    {counts.reconciled}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-[3px] bg-v-warn-fg" />
                  Cleared{' '}
                  <strong className="font-semibold tabular-nums text-v-ink900">
                    {counts.cleared}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-[3px] bg-v-border" />
                  Unreconciled{' '}
                  <strong className="font-semibold tabular-nums text-v-ink900">
                    {counts.unreconciled}
                  </strong>
                </span>
              </>
            )}
          </div>
        </div>

        {counts.available && (
          <div className="mt-2 flex h-2 overflow-hidden rounded-md bg-v-wash2">
            <div
              className="bg-gradient-to-r from-v-success-fg to-v-success-solid transition-[width] duration-500"
              style={{ width: `${pct(counts.reconciled)}%` }}
            />
            <div
              className="bg-gradient-to-r from-[#FCD34D] to-v-warn-fg transition-[width] duration-500"
              style={{ width: `${pct(counts.cleared)}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
