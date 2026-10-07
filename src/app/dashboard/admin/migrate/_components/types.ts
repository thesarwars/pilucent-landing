// ─────────────────────────────────────────────────────────────────────────────
// Data Migration — shared types
// All types here mirror the backend API contract documented in
// UPDATE_DATA_MIGRATION_API.md. The wizard's root state lives in
//   src/app/dashboard/admin/migrate/new/page.tsx
// and is threaded down to every step component as props.
// ─────────────────────────────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ImpactLevel = 'GL Impact' | 'Posting' | 'Non-posting';

// ── Step 1 — Data type selection ─────────────────────────────────────────────
// Visual model for the UI cards on Step 1. We map API-supplied data types into
// this shape for rendering.
export interface DataTypeOption {
  id: string;
  title: string;
  description: string;
  category: 'Master Data' | 'Sales' | 'Purchases' | 'Accounting' | 'Banking' | 'Contacts' | 'Inventory' | 'Payroll' | 'Settings' | 'Expenses';
  badges: ImpactLevel[];
  icon: string;
  importAvailable?: boolean;
  templateAvailable?: boolean;
}

// Raw shape returned from GET /we/data-migrations/data-types
export interface ApiDataType {
  data_type: string;
  label: string;
  category: string;
  description?: string;
  has_gl_impact?: boolean;
  is_posting_transaction?: boolean;
  import_available: boolean;
  template_available: boolean;
  target_fields?: string[];
  required_target_fields?: string[];
  accounting_target_fields?: string[];
  message?: string;
}

// ── Step 2 — File upload + parse config ──────────────────────────────────────
export interface FileConfig {
  fileName: string;
  hasHeaderRow: boolean;
  dateFormat: string;
  currency: string;
  decimalFormat: string;
  duplicateHandling: 'skip_duplicates' | 'update_existing' | 'create_new';
}

export const DEFAULT_FILE_CONFIG: FileConfig = {
  fileName: '',
  hasHeaderRow: true,
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD',
  decimalFormat: '1,234.56',
  duplicateHandling: 'skip_duplicates',
};

// Response from POST /we/data-migrations (create job + upload)
export interface CreateJobResponse {
  job_uid: string;
  total_rows: number;
  total_columns: number;
  file_type: string;
  columns: string[];
  success?: boolean;
}

// ── Step 3 — Field mapping ───────────────────────────────────────────────────
export interface FieldMapping {
  sourceColumn: string;
  targetField: string;
  status: 'Mapped' | 'Missing';
  isRequired?: boolean;
  affectsAccounting?: boolean;
}

// ── Step 4 — Preview rows (GET /preview) ─────────────────────────────────────
export interface PreviewRow {
  row_number: number;
  uid: string;
  raw_data: Record<string, any>;
}

export interface PreviewResponse {
  job_uid: string;
  total_rows: number;
  total_columns: number;
  file_type: string;
  preview_rows: PreviewRow[];
}

// ── Step 5 — Validation ──────────────────────────────────────────────────────
export type ValidationSeverity = 'error' | 'warning' | 'duplicate';

export interface ValidationIssue {
  uid: string;
  row: string; // row primary key from server
  issue_type: string;
  severity: ValidationSeverity;
  description: string;
  suggested_fix?: string;
  is_resolved: boolean;
  resolved_at?: string | null;
  created_at?: string;
  row_uid: string;
}

// ── Step 6 — Review impact + Dry run ─────────────────────────────────────────

// One ledger line returned by POST /review-impact. The handler emits a row
// per accounting effect (e.g. for an invoice: A/R debit + income credit +
// tax credit), each tagged with the report it lands on.
export interface ImpactLine {
  uid: string;
  transaction_type: string;
  account_title: string;
  debit: number | string;
  credit: number | string;
  customer_name?: string | null;
  tax?: string | null;
  location?: string | null;
  report_impact?: string | null;
}

// Top-level body of POST /review-impact. The wizard renders this as the
// "Transaction Posting Preview" + "Affected Reports" sections on Step 6.
export interface ReviewImpactResponse {
  job_uid: string;
  impact_level: string;
  total_transactions: number;
  total_value: string | number;
  affected_reports: string[];
  lines: ImpactLine[];
}

export interface DryRunResponse {
  implemented: boolean;
  can_commit: boolean;
  data_type: string;
  message: string;
  summary?: {
    row_counts?: Record<string, number>;
    impact_totals?: Record<string, string | number>;
    checks?: Record<string, { passed: boolean; message: string }>;
  };
}

// ── Step 7 — Confirm body ────────────────────────────────────────────────────
export interface ConfirmImportPayload {
  understood_financial_impact: boolean;
  skip_error_rows: boolean;
  send_email: boolean;
  approval_note?: string;
  idempotency_key: string;
}

// ── Step 8 — Results ─────────────────────────────────────────────────────────
export type ImportRowStatus = 'imported' | 'failed' | 'skipped' | 'partially_imported';

export interface ImportResultDetail {
  row_number: number;
  reference: string;
  party: string;
  status: ImportRowStatus;
  message: string;
  linked_record_uid?: string | null;
}

export interface ImportResultsResponse {
  job_uid: string;
  status: string;
  imported: number;
  failed: number;
  skipped: number;
  partially_imported: number;
  completed_at?: string;
  details: ImportResultDetail[];
}

export interface ReconciliationResponse {
  job_uid: string;
  data_type: string;
  status: string;
  row_counts: Record<string, number>;
  impact_totals: Record<string, string>;
  checks: Record<string, { passed: boolean; message: string }>;
}

// ── Migration job summary (GET /<uid> or list) ───────────────────────────────
export interface MigrationJob {
  uid: string;
  data_type: string;
  file_name: string;
  file_type: string;
  status: string;
  current_step?: string;
  total_rows: number;
  ready_rows: number;
  warning_rows: number;
  error_rows: number;
  duplicate_rows: number;
  skipped_rows: number;
  imported_rows: number;
  failed_rows: number;
  created_at: string;
  updated_at: string;
}
