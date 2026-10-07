'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Preview Data
//
// Renders the parsed rows the server returned from
//   GET /we/data-migrations/<uid>/preview
//
// We dynamically build the column list from `total_columns` and the keys of
// the first row's `raw_data`, since each data type produces different
// columns. Showing the first ~20 rows lets the user visually sanity-check
// the data before validation.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { Rows3, Columns3, FileType } from 'lucide-react';
import { PreviewResponse } from './types';

interface Step4Props {
  previewData: PreviewResponse | null;
}

const SummaryItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-accent_text_gray">{icon}</span>
    <span className="text-accent_text_gray">{label}:</span>
    <span className="font-medium text-accent_text_black">{value}</span>
  </div>
);

const Step4PreviewData: React.FC<Step4Props> = ({ previewData }) => {
  // Derive the column list from the first preview row so we render whatever
  // the server actually parsed, no hard-coded headers.
  const columns = useMemo(() => {
    const first = previewData?.preview_rows?.[0]?.raw_data;
    return first ? Object.keys(first) : [];
  }, [previewData]);

  return (
    <div className="rounded-2xl border border-accent_border_gray bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-accent_text_black">Preview Data</h2>
      <p className="mt-1 text-sm text-accent_text_gray">
        Review the first {previewData?.preview_rows?.length ?? 0} rows of your imported data to
        ensure accuracy.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <SummaryItem
          icon={<Rows3 className="h-4 w-4" />}
          label="Total Rows"
          value={previewData?.total_rows ?? '—'}
        />
        <SummaryItem
          icon={<Columns3 className="h-4 w-4" />}
          label="Total Columns"
          value={previewData?.total_columns ?? '—'}
        />
        <SummaryItem
          icon={<FileType className="h-4 w-4" />}
          label="Detected File Type"
          value={(previewData?.file_type ?? '—').toString().toUpperCase()}
        />
      </div>

      {!previewData?.preview_rows?.length ? (
        <div className="mt-5 rounded-xl border border-dashed border-accent_border_gray bg-accent_bg_gray/30 p-8 text-center text-sm text-accent_text_gray">
          No preview data yet — finish mapping to load preview rows.
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-accent_border_gray">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-accent_bg_gray text-accent_text_black">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold">#</th>
                  {columns.map((c) => (
                    <th key={c} className="whitespace-nowrap px-4 py-3 text-xs font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-accent_border_gray bg-white text-accent_soft_blue">
                {previewData.preview_rows.map((row) => (
                  <tr key={row.uid} className="hover:bg-accent_bg_light_blue/40">
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{row.row_number}</td>
                    {columns.map((c) => (
                      <td key={c} className="whitespace-nowrap px-4 py-3">
                        {row.raw_data?.[c] !== undefined && row.raw_data?.[c] !== null
                          ? String(row.raw_data[c])
                          : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4PreviewData;
