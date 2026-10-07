'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Map Fields
//
// Each row represents a column from the uploaded file. The user picks a
// matching Balanzify target field per column. The list of target fields
// comes from the data-type handler (`get_target_fields()` on the backend) —
// it is supplied by the parent via `targetFields`.
//
// Two parent actions:
//   • onAutoMap   →  POST /we/data-migrations/<uid>/auto-map
//   • onReset     →  local clear of all mappings
// The "Save Mapping & Continue" button (in MigrationWizard) calls the parent
// which posts the final mappings to /we/data-migrations/<uid>/mapping.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Wand2, RotateCcw, ArrowRight, Info, Loader2 } from 'lucide-react';
import { FieldMapping } from './types';

interface Step3Props {
  mappings: FieldMapping[];
  targetFields: string[];
  onChangeMappings: (next: FieldMapping[]) => void;
  onAutoMap: () => void | Promise<void>;
  onReset: () => void;
  isProcessing: boolean;
}

const StatusBadge = ({ status }: { status: FieldMapping['status'] }) => (
  <span
    className={`rounded px-2 py-0.5 text-[11px] font-medium ${
      status === 'Mapped'
        ? 'bg-table_success_light text-table_success'
        : 'bg-table_error_light text-table_error'
    }`}
  >
    {status}
  </span>
);

// Pretty-print a snake_case target field as Title Case for the dropdown.
const humanise = (slug: string) =>
  slug
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

const Step3MapFields: React.FC<Step3Props> = ({
  mappings,
  targetFields,
  onChangeMappings,
  onAutoMap,
  onReset,
  isProcessing,
}) => {
  const updateMapping = (index: number, targetField: string) => {
    const next = mappings.map((m, i) =>
      i === index
        ? {
            ...m,
            targetField,
            status: targetField ? ('Mapped' as const) : ('Missing' as const),
          }
        : m
    );
    onChangeMappings(next);
  };

  // Subset of fields used to call out which target fields impact accounting.
  // The aside list mirrors the handler's `get_accounting_target_fields()`.
  const accountingHints = targetFields.filter((f) =>
    [
      'income_account',
      'expense_account',
      'tax_code',
      'currency_kind',
      'currency_rate',
      'amount',
      'debit',
      'credit',
    ].includes(f)
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
      <div className="rounded-2xl border border-accent_border_gray bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-accent_text_black">Map Fields</h2>
        <p className="mt-1 text-sm text-accent_text_gray">
          Connect your imported file columns to the corresponding Balanzify fields.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onAutoMap}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-md bg-accent_soft_blue px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            Auto Map Fields
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-md border border-accent_border_gray bg-white px-4 py-2 text-sm font-medium text-accent_text_black hover:bg-accent_bg_gray disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" /> Reset Mapping
          </button>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr_auto] items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-wide text-accent_text_gray">
          <span>Imported File Columns</span>
          <span />
          <span>Balanzify Fields</span>
          <span />
        </div>

        <div className="mt-2 space-y-2">
          {!mappings.length && (
            <div className="rounded-lg border border-dashed border-accent_border_gray bg-accent_bg_gray/30 p-6 text-center text-sm text-accent_text_gray">
              Upload a file first — columns will appear here.
            </div>
          )}
          {mappings.map((mapping, index) => {
            const isMissing = mapping.status === 'Missing';
            return (
              <div
                key={`${mapping.sourceColumn}-${index}`}
                className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3"
              >
                <input
                  readOnly
                  value={mapping.sourceColumn}
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isMissing
                      ? 'border-table_error/40 bg-table_error_light/40 text-accent_text_black'
                      : 'border-accent_border_gray bg-white text-accent_text_black'
                  }`}
                />
                <ArrowRight className="h-4 w-4 text-accent_text_gray" />
                <select
                  value={mapping.targetField}
                  onChange={(e) => updateMapping(index, e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-accent_soft_blue focus:outline-none ${
                    isMissing
                      ? 'border-table_error/40 text-accent_text_gray'
                      : 'border-accent_border_gray text-accent_text_black'
                  }`}
                >
                  <option value="">Select Balanzify Field</option>
                  {targetFields.map((f) => (
                    <option key={f} value={f}>
                      {humanise(f)}
                    </option>
                  ))}
                </select>
                <StatusBadge status={mapping.status} />
              </div>
            );
          })}
        </div>
      </div>

      <aside className="rounded-2xl border border-accent_border_gray bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-accent_text_black">
          Fields that affect accounting posting
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-accent_text_charcoal">
          {(accountingHints.length ? accountingHints : ['No accounting fields for this type']).map(
            (f) => (
              <li key={f} className="flex items-center gap-2">
                <Info className="h-4 w-4 text-accent_soft_blue" />
                <span>{humanise(f)}</span>
              </li>
            )
          )}
        </ul>
      </aside>
    </div>
  );
};

export default Step3MapFields;
