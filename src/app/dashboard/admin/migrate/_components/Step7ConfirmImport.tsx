'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Step 7 — Confirm Import
//
// User-facing controls for the body of POST /we/data-migrations/<uid>/confirm:
//   • understood_financial_impact (the big checkbox at the bottom)
//   • skip_error_rows
//   • send_email
//   • approval_note
//
// The idempotency_key is generated and stored in the parent ref — it does
// not appear in the UI but ensures a double-click on Confirm Import never
// produces two imports.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { CheckSquare } from 'lucide-react';
import { CreateJobResponse, DataTypeOption } from './types';

interface Step7Props {
  options: {
    agreementChecked: boolean;
    skipErrorRows: boolean;
    sendEmail: boolean;
    approvalNote: string;
  };
  onChangeOptions: React.Dispatch<
    React.SetStateAction<{
      agreementChecked: boolean;
      skipErrorRows: boolean;
      sendEmail: boolean;
      approvalNote: string;
    }>
  >;
  counters: {
    total: number;
    ready: number;
    errors: number;
    warnings: number;
    duplicates: number;
  };
  selectedDataType: DataTypeOption | null;
  jobInfo: CreateJobResponse | null;
}

const CHECKLIST = [
  'Required fields mapped',
  'Validation completed',
  'Backup created',
  'Duplicate rules selected',
  'Accounting impact reviewed',
  'Permission approved',
];

const Step7ConfirmImport: React.FC<Step7Props> = ({
  options,
  onChangeOptions,
  counters,
  selectedDataType,
  jobInfo,
}) => {
  const update = <K extends keyof Step7Props['options']>(
    key: K,
    value: Step7Props['options'][K]
  ) => {
    onChangeOptions((prev) => ({ ...prev, [key]: value }));
  };

  const summaryRows = [
    { label: 'Data Type', value: selectedDataType?.title ?? '—' },
    { label: 'File Name', value: (jobInfo as any)?.file_name ?? '—' },
    { label: 'Total Records', value: counters.total.toLocaleString() },
    { label: 'Ready to Import', value: counters.ready.toLocaleString() },
    { label: 'Errors Remaining', value: counters.errors.toLocaleString() },
    { label: 'Warnings', value: counters.warnings.toLocaleString() },
    { label: 'Duplicates', value: counters.duplicates.toLocaleString() },
  ];

  return (
    <div className="rounded-2xl border border-accent_border_gray bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-accent_text_black">Confirm Import</h2>
      <p className="mt-1 text-sm text-accent_text_gray">
        Review the final details before initiating the import process.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-accent_border_gray bg-white p-5">
          <h3 className="text-sm font-semibold text-accent_text_black">Import Summary</h3>
          <dl className="mt-3 space-y-2 text-sm">
            {summaryRows.map((row) => (
              <div key={row.label} className="grid grid-cols-2 gap-2">
                <dt className="text-accent_text_gray">{row.label}:</dt>
                <dd className="font-medium text-accent_text_black">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-accent_border_gray bg-white p-5">
          <h3 className="text-sm font-semibold text-accent_text_black">Pre-Import Checklist</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-table_success" />
                <span className="text-accent_text_charcoal">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-accent_text_gray">
            Approval note (optional)
          </label>
          <textarea
            rows={3}
            value={options.approvalNote}
            onChange={(e) => update('approvalNote', e.target.value)}
            placeholder="e.g. Audited by finance"
            className="w-full rounded-lg border border-accent_border_gray bg-white px-3 py-2 text-sm text-accent_text_black focus:border-accent_soft_blue focus:outline-none"
          />
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-accent_text_black">
            <input
              type="checkbox"
              checked={options.skipErrorRows}
              onChange={(e) => update('skipErrorRows', e.target.checked)}
              className="h-4 w-4 rounded border-accent_border_gray accent-accent_soft_blue"
            />
            Skip rows with validation errors
          </label>
          <label className="flex items-center gap-2 text-sm text-accent_text_black">
            <input
              type="checkbox"
              checked={options.sendEmail}
              onChange={(e) => update('sendEmail', e.target.checked)}
              className="h-4 w-4 rounded border-accent_border_gray accent-accent_soft_blue"
            />
            Send me an email when import completes
          </label>
        </div>
      </div>

      {counters.errors > 0 && (
        <div className="mt-5 rounded-lg border border-table_error/30 bg-table_error_light p-3 text-sm text-table_error">
          <strong>Warning:</strong> This import has {counters.errors} record
          {counters.errors === 1 ? '' : 's'} with errors.
          {options.skipErrorRows
            ? ' These records will be skipped.'
            : ' Confirm with skip-errors to proceed, or fix them on the validation step.'}
        </div>
      )}

      <label className="mt-5 flex items-center gap-2 text-sm text-accent_text_black">
        <input
          type="checkbox"
          checked={options.agreementChecked}
          onChange={(e) => update('agreementChecked', e.target.checked)}
          className="h-4 w-4 rounded border-accent_border_gray accent-accent_soft_blue"
        />
        I understand this import may update financial records, customer/vendor balances, and
        reports.
      </label>
    </div>
  );
};

export default Step7ConfirmImport;
