'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 — Validate Data
//
// Read-side: shows row counters from the parent (populated when Continue
// from step 4 triggers POST /validate). The list of issues comes from
// GET /we/data-migrations/<uid>/validation-issues.
//
// Write-side: each "Fix It" button opens a modal that posts to
// POST /we/data-migrations/<uid>/rows/<row_uid>/fix and the parent reloads
// the issues list afterwards.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { ValidationIssue, ValidationSeverity } from './types';

interface Step5Props {
  issues: ValidationIssue[];
  counters: {
    total: number;
    ready: number;
    errors: number;
    warnings: number;
    duplicates: number;
  };
  onFixRow: (
    rowUid: string,
    field: string,
    value: string,
    applyToSimilar: boolean
  ) => Promise<boolean>;
  isProcessing: boolean;
}

const SeverityBadge = ({ severity }: { severity: ValidationSeverity }) => {
  const map: Record<ValidationSeverity, string> = {
    error: 'bg-table_error_light text-table_error',
    warning: 'bg-accent_bg_cornsilk text-accent_sunset_orange',
    duplicate: 'bg-accent_bg_light_violet text-accent_text_violet',
  };
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);
  return (
    <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${map[severity]}`}>
      {label}
    </span>
  );
};

// Modal lets the user override `normalized_data[field]` for the row. The
// `apply_to_similar_records` checkbox propagates the same fix to all rows
// whose mapped value matches.
const FixIssueModal = ({
  issue,
  onClose,
  onSubmit,
  isProcessing,
}: {
  issue: ValidationIssue;
  onClose: () => void;
  onSubmit: (field: string, value: string, applyToSimilar: boolean) => Promise<void>;
  isProcessing: boolean;
}) => {
  // We default the field to a sane guess based on the issue type. The user
  // can override either the field key or the new value.
  const initialField = issue.issue_type.replace(/_not_found|_invalid/g, '').replace(/-/g, '_');
  const [field, setField] = useState(initialField);
  const [value, setValue] = useState('');
  const [applyToSimilar, setApplyToSimilar] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-accent_text_black">
            Fix Validation Issue: {issue.issue_type}
          </h3>
          <button onClick={onClose} className="text-accent_text_gray hover:text-accent_text_black">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-sm text-accent_text_gray">
          {issue.description}
          {issue.suggested_fix ? ` ${issue.suggested_fix}` : ''}
        </p>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-accent_text_gray">
            Field to update
          </label>
          <input
            type="text"
            value={field}
            disabled={true}
            onChange={(e) => setField(e.target.value)}
            className="w-full rounded-lg border border-accent_border_gray bg-white px-3 py-2 text-sm text-accent_text_black focus:border-accent_soft_blue focus:outline-none"
          />
        </div>
        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-medium text-accent_text_gray">
            New value
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter the corrected value"
            className="w-full rounded-lg border border-accent_border_gray bg-white px-3 py-2 text-sm text-accent_text_black focus:border-accent_soft_blue focus:outline-none"
          />
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-accent_text_black">
          <input
            type="checkbox"
            checked={applyToSimilar}
            onChange={(e) => setApplyToSimilar(e.target.checked)}
            className="h-4 w-4 rounded border-accent_border_gray accent-accent_soft_blue"
          />
          Apply this fix to all rows with the same mapped value
        </label>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-md border border-accent_border_gray bg-white px-4 py-2 text-sm font-medium text-accent_text_black hover:bg-accent_bg_gray disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(field, value, applyToSimilar)}
            disabled={isProcessing || !field || !value}
            className="inline-flex items-center gap-2 rounded-md bg-accent_soft_blue px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            Apply Fix
          </button>
        </div>
      </div>
    </div>
  );
};

const Step5ValidateData: React.FC<Step5Props> = ({
  issues,
  counters,
  onFixRow,
  isProcessing,
}) => {
  const [activeIssue, setActiveIssue] = useState<ValidationIssue | null>(null);

  const stats = [
    { label: 'Total Records', value: counters.total, color: 'text-accent_text_black' },
    { label: 'Ready Records', value: counters.ready, color: 'text-table_success' },
    { label: 'Errors', value: counters.errors, color: 'text-table_error' },
    { label: 'Warnings', value: counters.warnings, color: 'text-accent_sunset_orange' },
    { label: 'Duplicates', value: counters.duplicates, color: 'text-accent_text_violet' },
  ];

  const handleFix = async (field: string, value: string, applyToSimilar: boolean) => {
    if (!activeIssue) return;
    const ok = await onFixRow(activeIssue.row_uid, field, value, applyToSimilar);
    if (ok) setActiveIssue(null);
  };

  return (
    <div className="rounded-2xl border border-accent_border_gray bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-accent_text_black">Validation Center</h2>
      <p className="mt-1 text-sm text-accent_text_gray">
        Review and fix any issues before importing your data.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-accent_border_gray bg-white p-4"
          >
            <p className="text-xs font-medium text-accent_text_gray">{s.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-7 text-base font-semibold text-accent_text_black">Validation Issues</h3>
      <div className="mt-3 overflow-hidden rounded-xl border border-accent_border_gray">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent_bg_gray">
              <tr>
                {[
                  'Issue Type',
                  'Affected Row',
                  'Severity',
                  'Description',
                  'Suggested Fix',
                  'Action',
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
              {!issues.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-accent_text_gray"
                  >
                    {isProcessing
                      ? 'Running validation…'
                      : 'No issues — your data is ready to import.'}
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.uid} className="hover:bg-accent_bg_light_gray">
                    <td className="px-4 py-3 font-medium text-accent_text_black">
                      {issue.issue_type}
                    </td>
                    <td className="px-4 py-3 text-accent_text_gray">Row {issue.row}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={issue.severity} />
                    </td>
                    <td className="px-4 py-3 text-accent_text_gray">{issue.description}</td>
                    <td className="px-4 py-3 text-accent_text_gray">
                      {issue.suggested_fix || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setActiveIssue(issue)}
                        disabled={issue.is_resolved}
                        className="rounded-md bg-accent_soft_blue text-nowrap px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                      >
                        {issue.is_resolved ? 'Resolved' : 'Fix It'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeIssue && (
        <FixIssueModal
          issue={activeIssue}
          isProcessing={isProcessing}
          onClose={() => setActiveIssue(null)}
          onSubmit={handleFix}
        />
      )}
    </div>
  );
};

export default Step5ValidateData;
