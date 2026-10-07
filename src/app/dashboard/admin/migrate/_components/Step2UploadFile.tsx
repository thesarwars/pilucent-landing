'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Upload File / Connect Source
//
// This is a controlled form. The actual File object lives in the parent's
// state, and so does the parse-config (date_format / currency / decimal /
// duplicate_handling / has_header_row).
//
// We still parse the file locally with XLSX so the user gets immediate
// feedback (filename + headers preview) before pressing "Upload & Continue".
// On Continue, the parent uploads the file via multipart to:
//   POST /we/data-migrations           (first upload — creates the job)
//   POST /we/data-migrations/<uid>/upload  (re-upload — destructive)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import { Download, UploadCloud, Info, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

import { CreateJobResponse, DataTypeOption, FileConfig } from './types';

interface Step2Props {
  selectedDataType: DataTypeOption | null;
  selectedFile: File | null;
  parseConfig: FileConfig;
  jobInfo: CreateJobResponse | null;
  localHeaders: string[];
  onFileSelected: (file: File, headers: string[]) => void;
  onParseConfigChange: React.Dispatch<React.SetStateAction<FileConfig>>;
  onDownloadTemplate: () => void;
}

// Small reusable controlled select. Kept inline because it's only used here.
const SelectField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) => (
  <div>
    <label className="mb-1.5 block text-xs font-medium text-accent_text_gray">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-accent_border_gray bg-white px-3 py-2 text-sm text-accent_text_black focus:border-accent_soft_blue focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const Step2UploadFile: React.FC<Step2Props> = ({
  selectedDataType,
  selectedFile,
  parseConfig,
  jobInfo,
  localHeaders,
  onFileSelected,
  onParseConfigChange,
  onDownloadTemplate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleBrowse = () => fileInputRef.current?.click();

  // Parse file headers locally for instant feedback. The server is still the
  // source of truth — we replace these headers with the server-side `columns`
  // once the upload succeeds.
  const extractHeadersAndPushUp = (file: File) => {
    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv = file.name.endsWith('.csv');

    reader.onload = (e) => {
      let headers: string[] = [];
      try {
        if (isExcel && e.target) {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          headers = (jsonData[0] as string[]) || [];
        } else if (isCsv && e.target) {
          const csvText = e.target.result as string;
          const firstLine = csvText.split('\n')[0] || '';
          headers = firstLine.split(',').map((h) => h.trim());
        }
      } catch {
        headers = [];
      }
      onFileSelected(file, headers);
    };

    if (isExcel) {
      reader.readAsBinaryString(file);
    } else if (isCsv) {
      reader.readAsText(file);
    } else {
      onFileSelected(file, []);
    }
  };

  // The upload zone uses the same handler whether the user drags a file in
  // or browses for it via the file input.
  const handleFile = (file: File) => {
    if (!file) return;
    if (
      !file.name.endsWith('.csv') &&
      !file.name.endsWith('.xls') &&
      !file.name.endsWith('.xlsx')
    ) {
      alert('Unsupported file format. Only .csv, .xls and .xlsx are allowed.');
      return;
    }
    extractHeadersAndPushUp(file);
  };

  const updateConfig = <K extends keyof FileConfig>(key: K, value: FileConfig[K]) => {
    onParseConfigChange((prev) => ({ ...prev, [key]: value }));
  };

  // Server-side "columns" override the local preview once the upload lands.
  const headers = jobInfo?.columns || localHeaders;

  return (
    <div className="rounded-2xl border border-accent_border_gray bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-accent_text_black">
        Upload File / Connect Source
      </h2>
      <p className="mt-1 text-sm text-accent_sunset_orange">
        Upload your data file or connect to a source for migration.
      </p>

      <div className="mt-2 flex items-center gap-2 border-b border-accent_border_gray pb-1">
        <button
          type="button"
          className="border-accent_soft_blue px-4 py-2 text-sm font-medium text-accent_soft_blue"
        >
          Upload CSV / Excel
        </button>
        <button
          type="button"
          disabled={!selectedDataType}
          onClick={onDownloadTemplate}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-accent_soft_blue px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" /> Download Template
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border py-14 text-center transition-colors ${
              isDragging
                ? 'border-accent_soft_blue bg-accent_bg_light_blue'
                : 'border-accent_soft_blue bg-accent_bg_light_blue/40'
            }`}
          >
            <UploadCloud className="h-9 w-9 text-accent_soft_blue" />
            <p className="text-sm font-medium text-accent_soft_blue">
              Drag &amp; Drop your file here
            </p>
            <p className="text-xs text-accent_text_gray">or</p>
            <button
              type="button"
              onClick={handleBrowse}
              className="rounded-md bg-accent_soft_blue px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            >
              Browse File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <p className="text-xs text-accent_text_gray">Supported formats: CSV, XLS, XLSX</p>
          </div>

          {selectedFile && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-accent_border_gray bg-accent_bg_gray/40 p-3 text-sm">
              <FileSpreadsheet className="h-5 w-5 text-accent_soft_blue" />
              <div className="flex-1">
                <p className="font-medium text-accent_text_black">{selectedFile.name}</p>
                <p className="text-xs text-accent_text_gray">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {headers.length} columns detected
                </p>
              </div>
              {jobInfo && (
                <span className="rounded bg-table_success_light px-2 py-0.5 text-[11px] font-medium text-table_success">
                  Uploaded
                </span>
              )}
            </div>
          )}
          <div className="flex items-start gap-2 mt-3 rounded-lg border  bg-accent_bg_light_blue p-3 text-xs text-accent_text_black">
            {/* <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent_soft_blue" /> */}
            <span>
              <strong>Info:</strong> A backup will be created before import. Your data will be
              encrypted during upload and processing.
            </span>
          </div>
        </div>

        <div className="rounded-xl">
          <h3 className="text-sm font-semibold text-accent_text_black">
            File Summary &amp; Configuration
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-accent_text_gray">
                File Name
              </label>
              <input
                type="text"
                readOnly
                value={parseConfig.fileName}
                placeholder="No file selected"
                className="w-full rounded-lg border border-accent_border_gray bg-white px-3 py-2 text-sm text-accent_text_black focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-accent_text_black">
              <input
                type="checkbox"
                checked={parseConfig.hasHeaderRow}
                onChange={(e) => updateConfig('hasHeaderRow', e.target.checked)}
                className="h-4 w-4 rounded border-accent_border_gray accent-accent_soft_blue"
              />
              My file has a header row
            </label>

            <SelectField
              label="Date Format"
              value={parseConfig.dateFormat}
              options={[
                { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
                { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
                { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
              ]}
              onChange={(v) => updateConfig('dateFormat', v)}
            />
            <SelectField
              label="Currency"
              value={parseConfig.currency}
              options={[
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'GBP (£)', value: 'GBP' },
                { label: 'BDT (৳)', value: 'BDT' },
              ]}
              onChange={(v) => updateConfig('currency', v)}
            />
            <SelectField
              label="Decimal Format"
              value={parseConfig.decimalFormat}
              options={[
                { label: '1,234.56', value: '1,234.56' },
                { label: '1.234,56', value: '1.234,56' },
                { label: '1 234,56', value: '1 234,56' },
              ]}
              onChange={(v) => updateConfig('decimalFormat', v)}
            />
            <SelectField
              label="Duplicate Handling"
              value={parseConfig.duplicateHandling}
              options={[
                { label: 'Skip duplicates', value: 'skip_duplicates' },
                { label: 'Update existing', value: 'update_existing' },
                { label: 'Create new', value: 'create_new' },
              ]}
              onChange={(v) =>
                updateConfig('duplicateHandling', v as FileConfig['duplicateHandling'])
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2UploadFile;
