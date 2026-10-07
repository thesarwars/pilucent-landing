'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Step 6 — Review Accounting Impact
//
// We don't fetch here. The parent calls
//   POST /we/data-migrations/<uid>/review-impact
//   POST /we/data-migrations/<uid>/dry-run
// when the user clicks Continue from Step 5, then renders both responses
// on this step:
//
//   • dry-run summary  → row counters, debit/credit totals, pre-flight checks
//   • review-impact    → impact_level, total_transactions, total_value,
//                        affected_reports, and the per-line "Transaction
//                        Posting Preview" table.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { DryRunResponse, ImpactLine, ReviewImpactResponse } from './types';

interface Step6Props {
  impactReviewed: boolean;
  impactReview: ReviewImpactResponse | null;
  dryRun: DryRunResponse | null;
}

// Snake_case API enums (e.g. "accounts_receivable") presented as Title Case
// so the table reads naturally.
const humanise = (value?: string | null) =>
  (value || '')
    .split(/[_-]/g)
    .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : p))
    .join(' ');

// Money-ish formatter that tolerates both numbers and decimal strings the
// backend ships. We don't assume currency here because the impact lines are
// agnostic to the company's display currency.
const formatAmount = (v: number | string | null | undefined) => {
  if (v === null || v === undefined || v === '') return '—';
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (Number.isNaN(n)) return String(v);
  if (n === 0) return '-';
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const Step6ReviewImpact: React.FC<Step6Props> = ({
  impactReviewed,
  impactReview,
  dryRun,
}) => {
  const summary = dryRun?.summary || {};
  const checks = summary.checks || {};
  const totals = summary.impact_totals || {};
  const counts = summary.row_counts || {};

  const debit = totals.debit?.toString() || '0';
  const credit = totals.credit?.toString() || '0';
  const variance = totals.variance?.toString() || '0';

  const lines: ImpactLine[] = impactReview?.lines || [];
  const affectedReports = impactReview?.affected_reports || [];

  return (
    <div className="rounded-2xl border border-accent_border_gray bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-accent_text_black">Review Accounting Impact</h2>
      <p className="mt-1 text-sm text-accent_text_gray">
        Shows a detailed preview of the financial impact of the import on accounts, transactions,
        and reports.
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-accent_bg_deep_yellow bg-accent_bg_cornsilk p-3 text-sm text-accent_text_black">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent_bg_deep_yellow" />
        <span>
          <strong>Warning:</strong> Financial transactions will update your books after posting.
          Please review the impact carefully before confirming.
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-accent_border_gray bg-white p-4">
          <p className="text-xs font-medium text-accent_text_gray">Total Rows</p>
          <p className="mt-2 text-xl font-semibold text-accent_text_black">
            {counts.total ?? '—'}
          </p>
        </div>
        <div className="rounded-xl border border-accent_border_gray bg-white p-4">
          <p className="text-xs font-medium text-accent_text_gray">Ready Rows</p>
          <p className="mt-2 text-xl font-semibold text-table_success">{counts.ready ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-accent_border_gray bg-white p-4">
          <p className="text-xs font-medium text-accent_text_gray">Error Rows</p>
          <p className="mt-2 text-xl font-semibold text-table_error">{counts.error ?? 0}</p>
        </div>
      </div>

      <h3 className="mt-7 text-base font-semibold text-accent_text_black">Impact Totals</h3>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-accent_border_gray bg-white p-4">
          <p className="text-xs font-medium text-accent_text_gray">Total Debit</p>
          <p className="mt-2 text-xl font-semibold text-accent_text_black">{debit}</p>
        </div>
        <div className="rounded-xl border border-accent_border_gray bg-white p-4">
          <p className="text-xs font-medium text-accent_text_gray">Total Credit</p>
          <p className="mt-2 text-xl font-semibold text-accent_text_black">{credit}</p>
        </div>
        <div className="rounded-xl border border-accent_border_gray bg-white p-4">
          <p className="text-xs font-medium text-accent_text_gray">Variance</p>
          <p
            className={`mt-2 text-xl font-semibold ${
              parseFloat(variance) === 0 ? 'text-table_success' : 'text-table_error'
            }`}
          >
            {variance}
          </p>
        </div>
      </div>

      <h3 className="mt-7 text-base font-semibold text-accent_text_black">Pre-flight Checks</h3>
      <div className="mt-3 space-y-2">
        {Object.entries(checks).length ? (
          Object.entries(checks).map(([key, check]) => (
            <div
              key={key}
              className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                check.passed
                  ? 'border-table_success/30 bg-table_success_light/40'
                  : 'border-table_error/30 bg-table_error_light/40'
              }`}
            >
              {check.passed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-table_success" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 text-table_error" />
              )}
              <div>
                <p className="font-medium text-accent_text_black">
                  {key
                    .split('_')
                    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                    .join(' ')}
                </p>
                <p className="text-accent_text_gray">{check.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-accent_border_gray bg-accent_bg_gray/30 p-4 text-center text-sm text-accent_text_gray">
            {impactReviewed ? 'Dry-run details unavailable.' : 'Computing accounting impact…'}
          </div>
        )}
      </div>

      {dryRun && !dryRun.can_commit && (
        <div className="mt-5 rounded-lg border border-table_error/30 bg-table_error_light p-3 text-sm text-table_error">
          <strong>Cannot commit:</strong> Resolve the failing checks above before continuing.
        </div>
      )}

      {/* ─── /review-impact body ────────────────────────────────────────────
          The three summary cards, the posting-preview table, and the affected
          reports below all come from POST /we/data-migrations/<uid>/review-impact.
          They appear underneath the dry-run section so users see safety checks
          first, then the detailed accounting effect of the import. */}
      <h3 className="mt-7 text-base font-semibold text-accent_text_black">
        Accounting Impact Summary
      </h3>
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-accent_border_gray bg-white p-4 text-center">
          <p className="text-xs font-medium text-accent_soft_blue">Accounting Impact Summary</p>
          <p className="mt-2 text-xl font-semibold text-accent_text_black">
            {impactReview?.impact_level || '—'}
          </p>
        </div>
        <div className="rounded-xl border border-accent_border_gray bg-white p-4 text-center">
          <p className="text-xs font-medium text-accent_soft_blue">Total Transactions</p>
          <p className="mt-2 text-xl font-semibold text-accent_text_black">
            {impactReview?.total_transactions ?? '—'}
          </p>
        </div>
        <div className="rounded-xl border border-accent_border_gray bg-white p-4 text-center">
          <p className="text-xs font-medium text-accent_soft_blue">Total Value</p>
          <p className="mt-2 text-xl font-semibold text-accent_text_black">
            {impactReview ? `$${formatAmount(impactReview.total_value)}` : '—'}
          </p>
        </div>
      </div>

      <h3 className="mt-7 text-base font-semibold text-accent_text_black">
        Transaction Posting Preview
      </h3>
      <div className="mt-3 overflow-hidden rounded-xl border border-accent_border_gray">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent_bg_gray">
              <tr>
                {[
                  'Transaction Type',
                  'Account',
                  'Debit',
                  'Credit',
                  'Customer/Vendor',
                  'Tax',
                  'Location',
                  'Report Impact',
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-accent_text_gray"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-accent_border_gray bg-white">
              {!lines.length ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-accent_text_gray"
                  >
                    {impactReviewed
                      ? 'No impact lines were produced.'
                      : 'Computing accounting impact…'}
                  </td>
                </tr>
              ) : (
                lines.map((line) => (
                  <tr key={line.uid} className="hover:bg-accent_bg_light_gray">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-accent_soft_blue">
                      {humanise(line.transaction_type)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-accent_text_black">
                      {line.account_title || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-accent_text_gray">
                      {Number(line.debit) > 0 ? `$${formatAmount(line.debit)}` : '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-accent_text_gray">
                      {Number(line.credit) > 0 ? `$${formatAmount(line.credit)}` : '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-accent_text_gray">
                      {line.customer_name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-accent_text_gray">
                      {line.tax || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-accent_text_gray">
                      {line.location || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-accent_text_gray">
                      {line.report_impact || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="mt-7 text-base font-semibold text-accent_text_black">Affected Reports</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {affectedReports.length ? (
          affectedReports.map((report) => (
            <span
              key={report}
              className="rounded-md bg-accent_bg_light_blue px-3 py-1.5 text-xs font-medium text-accent_soft_blue"
            >
              {report}
            </span>
          ))
        ) : (
          <span className="text-sm text-accent_text_gray">
            {impactReviewed ? 'No reports affected.' : 'Loading…'}
          </span>
        )}
      </div>
    </div>
  );
};

export default Step6ReviewImpact;
