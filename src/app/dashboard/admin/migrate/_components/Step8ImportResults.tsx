'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Step 8 — Import Results
//
// Reads:
//   GET /we/data-migrations/<uid>/results          → row-by-row outcome
//   GET /we/data-migrations/<uid>/reconciliation   → balance summary
//
// Writes:
//   POST /we/data-migrations/<uid>/rollback        → reverse the import
//
// "Download Error Report" hits
//   GET /we/data-migrations/<uid>/error-report     (CSV stream)
// which the parent handles via fetch+blob to preserve auth headers.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  Download,
  RefreshCw,
  FileSearch,
  FileText,
  Loader2,
  X,
} from 'lucide-react';
import Link from 'next/link';

import {
  ImportResultDetail,
  ImportResultsResponse,
  ReconciliationResponse,
} from './types';

interface Step8Props {
  results: ImportResultsResponse | null;
  reconciliation: ReconciliationResponse | null;
  onRollback: (reason: string) => Promise<boolean>;
  onDownloadErrorReport: () => void;
  onRestart: () => void;
}

const STATUS_LABEL: Record<ImportResultDetail['status'], string> = {
  imported: 'Imported',
  failed: 'Failed',
  skipped: 'Skipped',
  partially_imported: 'Partial',
};

const StatusBadge = ({ status }: { status: ImportResultDetail['status'] }) => {
  const map: Record<ImportResultDetail['status'], string> = {
    imported: 'text-table_success',
    failed: 'text-table_error',
    skipped: 'text-accent_sunset_orange',
    partially_imported: 'text-accent_sunset_orange',
  };
  return <span className={`text-sm font-medium ${map[status]}`}>{STATUS_LABEL[status]}</span>;
};

// Compact rollback prompt — collects a free-text "reason" and posts it as
// the body of POST /rollback via the parent.
const RollbackModal = ({
  onClose,
  onSubmit,
  isProcessing,
}: {
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  isProcessing: boolean;
}) => {
  const [reason, setReason] = useState('');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-accent_text_black">Rollback Import</h3>
          <button onClick={onClose} className="text-accent_text_gray hover:text-accent_text_black">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-sm text-accent_text_gray">
          This will reverse every imported record from this job. Sales journal entries will be
          deleted and customer balances restored. This action cannot be undone.
        </p>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-accent_text_gray">
            Reason (audit log)
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Wrong currency rate on the source file"
            className="w-full rounded-lg border border-accent_border_gray bg-white px-3 py-2 text-sm text-accent_text_black focus:border-accent_soft_blue focus:outline-none"
          />
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-md border border-accent_border_gray bg-white px-4 py-2 text-sm font-medium text-accent_text_black hover:bg-accent_bg_gray disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={isProcessing || !reason.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-table_error px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            Rollback
          </button>
        </div>
      </div>
    </div>
  );
};

const Step8ImportResults: React.FC<Step8Props> = ({
  results,
  reconciliation,
  onRollback,
  onDownloadErrorReport,
  onRestart,
}) => {
  const [showRollback, setShowRollback] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const stats = [
    { label: 'Imported', value: results?.imported ?? 0, color: 'text-table_success' },
    { label: 'Skipped', value: results?.skipped ?? 0, color: 'text-accent_sunset_orange' },
    { label: 'Failed', value: results?.failed ?? 0, color: 'text-table_error' },
    {
      label: 'Partially Imported',
      value: results?.partially_imported ?? 0,
      color: 'text-accent_sunset_orange',
    },
  ];

  const handleRollback = async (reason: string) => {
    setIsRolling(true);
    try {
      const ok = await onRollback(reason);
      if (ok) setShowRollback(false);
    } finally {
      setIsRolling(false);
    }
  };

  const checks = reconciliation?.checks || {};

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-accent_border_gray bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-accent_text_black">Import Results</h2>
        <p className="mt-1 text-sm text-accent_text_gray">
          Review the outcome of your data migration.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-accent_border_gray bg-white p-4"
            >
              <p className="text-xs font-medium text-accent_text_gray">{s.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${s.color}`}>
                {s.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <h3 className="mt-7 text-base font-semibold text-accent_text_black">
          Import Result Details
        </h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-accent_border_gray">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-accent_bg_gray">
                <tr>
                  {['Row', 'Reference', 'Party', 'Status', 'Message', 'Linked Record'].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-accent_text_gray"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-accent_border_gray bg-white">
                {!results?.details?.length ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-accent_text_gray"
                    >
                      No result details yet — import may still be in progress.
                    </td>
                  </tr>
                ) : (
                  results.details.map((row) => (
                    <tr key={row.row_number} className="hover:bg-accent_bg_light_gray">
                      <td className="px-4 py-3 text-accent_text_gray">{row.row_number}</td>
                      <td className="px-4 py-3 font-medium text-accent_text_black">
                        {row.reference || '—'}
                      </td>
                      <td className="px-4 py-3 text-accent_text_gray">{row.party || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-accent_text_gray">{row.message}</td>
                      <td className="px-4 py-3 text-sm">
                        {row.linked_record_uid ? (
                          <span className="font-medium text-accent_soft_blue">
                            {row.linked_record_uid.slice(0, 8)}…
                          </span>
                        ) : (
                          <span className="text-accent_text_gray">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-md border border-accent_border_gray bg-white px-4 py-2 text-sm font-medium text-accent_text_black hover:bg-accent_bg_gray"
          >
            <FileSearch className="h-4 w-4" /> View Imported Records
          </button>
          <button
            onClick={onDownloadErrorReport}
            className="inline-flex items-center gap-2 rounded-md border border-accent_border_gray bg-white px-4 py-2 text-sm font-medium text-accent_text_black hover:bg-accent_bg_gray"
          >
            <Download className="h-4 w-4" /> Download Error Report
          </button>
          <button
            onClick={() => setShowRollback(true)}
            disabled={!results?.imported}
            className="inline-flex items-center gap-2 rounded-md border border-table_error/40 bg-white px-4 py-2 text-sm font-medium text-table_error hover:bg-table_error_light disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" /> Rollback Import
          </button>
          <Link
            href="/dashboard/admin/migrate"
            className="ml-auto inline-flex items-center gap-2 rounded-md bg-accent_soft_blue px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            <FileText className="h-4 w-4" /> Go to Audit Log
          </Link>
        </div>
      </div>

      {reconciliation && (
        <div className="rounded-2xl border border-accent_border_gray bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-accent_text_black">Reconciliation</h3>
          <p className="mt-1 text-sm text-accent_text_gray">
            Final balance summary and post-import safety checks.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Object.entries(reconciliation.impact_totals || {}).map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl border border-accent_border_gray bg-white p-4"
              >
                <p className="text-xs font-medium text-accent_text_gray">
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </p>
                <p className="mt-2 text-xl font-semibold text-accent_text_black">{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {Object.entries(checks).map(([key, c]) => (
              <div
                key={key}
                className={`rounded-lg border p-3 text-sm ${
                  c.passed
                    ? 'border-table_success/30 bg-table_success_light/40 text-table_success'
                    : 'border-table_error/30 bg-table_error_light/40 text-table_error'
                }`}
              >
                <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong> {c.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {showRollback && (
        <RollbackModal
          isProcessing={isRolling}
          onClose={() => setShowRollback(false)}
          onSubmit={handleRollback}
        />
      )}
    </div>
  );
};

export default Step8ImportResults;
