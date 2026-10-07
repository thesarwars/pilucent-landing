'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Data Migration — Root state container for the "New Migration" wizard.
//
// This file is intentionally the SINGLE SOURCE OF TRUTH for the wizard.
// All useState lives here. Nothing below this file owns its own slice of
// long-lived state — every step component is a controlled view that reads
// from props and calls action callbacks defined here.
//
// Why this shape?
//   1. It mirrors the backend job state machine in
//      `UPDATE_DATA_MIGRATION_API.md` (DRAFT → UPLOADED → MAPPED → VALIDATED
//      → IMPACT_REVIEWED → CONFIRMED → IN_PROGRESS → COMPLETED).
//   2. Each "Continue" click on a step performs the API call associated with
//      that step's transition before advancing the UI step number.
//   3. No global store, no context, no redux — just props.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import { toast } from '@/lib/ToastService';

import MigrationWizard from '../_components/MigrationWizard';
import {
  ApiDataType,
  ConfirmImportPayload,
  CreateJobResponse,
  DataTypeOption,
  DEFAULT_FILE_CONFIG,
  DryRunResponse,
  FieldMapping,
  FileConfig,
  ImportResultsResponse,
  PreviewResponse,
  ReconciliationResponse,
  ReviewImpactResponse,
  ValidationIssue,
  WizardStep,
} from '../_components/types';

import {
  autoMapMigrationFields,
  confirmMigration,
  createMigrationJob,
  downloadDemoFile,
  dryRunMigration,
  fetchMigrationDataTypes,
  fetchMigrationPreview,
  fetchMigrationReconciliation,
  fetchMigrationResults,
  fetchMigrationValidationIssues,
  fixMigrationRow,
  reviewMigrationImpact,
  rollbackMigration,
  saveMigrationMapping,
  uploadMigrationFile,
  validateMigration,
} from '@/app/helpers/backend';
import { baseURL } from '@/app/helpers/api';
// ─── helpers ─────────────────────────────────────────────────────────────────

// Map an API "category" string to one of the four UI categories we render
// pill-grouped on Step 1. Anything we don't recognise falls back to Sales so
// the card still appears.
const CATEGORY_MAP: Record<string, DataTypeOption['category']> = {
  'Master Data': 'Master Data',
  Sales: 'Sales',
  Purchases: 'Purchases',
  Accounting: 'Accounting',
  Banking: 'Banking',
  Contacts: 'Contacts',
  Inventory: 'Inventory',
  Payroll: 'Payroll',
  Settings: 'Settings',
  Expenses: 'Expenses',
};

const toUiDataType = (dt: ApiDataType): DataTypeOption => {
  const badges: DataTypeOption['badges'] = [];
  if (dt.has_gl_impact) badges.push('GL Impact');
  if (dt.is_posting_transaction) badges.push('Posting');
  if (!dt.is_posting_transaction && !dt.has_gl_impact) badges.push('Non-posting');

  return {
    id: dt.data_type,
    title: dt.label || dt.data_type,
    description: dt.description || '',
    category: CATEGORY_MAP[dt.category] || 'Sales',
    badges,
    icon: dt.data_type,
    importAvailable: dt.import_available,
    templateAvailable: dt.template_available,
  };
};

const newIdempotencyKey = () => {
  // Fallback when crypto.randomUUID is unavailable in older browsers.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

// ─── component ───────────────────────────────────────────────────────────────

const Page: React.FC = () => {
  const router = useRouter();

  // ── STEP 0: which step is visible. ─────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── STEP 1: data type catalog + selection. ─────────────────────────────────
  // We keep both the UI-friendly list (rendered as cards) and the raw API
  // payload so we can look up target_fields / required_target_fields without
  // a second network call when the user picks a data type.
  const [dataTypes, setDataTypes] = useState<DataTypeOption[]>([]);
  const [rawDataTypes, setRawDataTypes] = useState<ApiDataType[]>([]);
  const [selectedDataType, setSelectedDataType] = useState<DataTypeOption | null>(null);
  const [targetFields, setTargetFields] = useState<string[]>([]);
  const [requiredTargetFields, setRequiredTargetFields] = useState<string[]>([]);

  // ── STEP 2: chosen file + file parse config + result of upload. ───────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseConfig, setParseConfig] = useState<FileConfig>(DEFAULT_FILE_CONFIG);
  const [jobUid, setJobUid] = useState<string | null>(null);
  const [jobInfo, setJobInfo] = useState<CreateJobResponse | null>(null);
  // Local-only parsed preview headers — used purely for instant feedback
  // before the server confirms via /preview.
  const [localHeaders, setLocalHeaders] = useState<string[]>([]);

  // ── STEP 3: column → target field mappings. ───────────────────────────────
  const [mappings, setMappings] = useState<FieldMapping[]>([]);

  // ── STEP 4: server-supplied preview rows. ─────────────────────────────────
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);

  // ── STEP 5: validation. ───────────────────────────────────────────────────
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [validationCounters, setValidationCounters] = useState({
    total: 0,
    ready: 0,
    errors: 0,
    warnings: 0,
    duplicates: 0,
  });

  // ── STEP 6: impact + dry-run. ─────────────────────────────────────────────
  // `impactReview` holds the POST /review-impact response — it drives the
  // "Transaction Posting Preview" table and the "Affected Reports" pills on
  // Step 6. `dryRun` holds the safety-check summary used by the same step.
  const [impactReviewed, setImpactReviewed] = useState(false);
  const [impactReview, setImpactReview] = useState<ReviewImpactResponse | null>(null);
  const [dryRun, setDryRun] = useState<DryRunResponse | null>(null);

  // ── STEP 7: confirm options. ──────────────────────────────────────────────
  const [confirmOptions, setConfirmOptions] = useState({
    agreementChecked: false,
    skipErrorRows: true,
    sendEmail: false,
    approvalNote: '',
  });
  // We freeze the idempotency key per-job so retries on the confirm endpoint
  // remain safe and do not accidentally double-import.
  const idempotencyKeyRef = useRef<string>(newIdempotencyKey());

  // ── STEP 8: post-import. ──────────────────────────────────────────────────
  const [results, setResults] = useState<ImportResultsResponse | null>(null);
  const [reconciliation, setReconciliation] = useState<ReconciliationResponse | null>(null);

  // ─── ACTION: Step 1 ──────────────────────────────────────────────────────
  // Loaded lazily by Step1SelectDataType on mount via this callback so the
  // page itself owns the cache.
  const loadDataTypes = useCallback(async () => {
    if (dataTypes.length > 0) return;
    try {
      const res: any = await fetchMigrationDataTypes();
      // The API returns either a raw array or { results: [...] } depending on
      // pagination — accept either.
      const list: ApiDataType[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.results)
          ? res.results
          : [];
      setRawDataTypes(list);
      setDataTypes(list.map(toUiDataType));
    } catch (err) {
      toast.error('Could not load data types');
    }
  }, [dataTypes.length]);

  const handleSelectDataType = useCallback(
    (option: DataTypeOption) => {
      setSelectedDataType(option);
      // The listing endpoint already supplies target_fields per data type, so
      // we just look it up in the cached raw list — no extra request.
      const match = rawDataTypes.find((d) => d.data_type === option.id);
      setTargetFields(match?.target_fields || []);
      setRequiredTargetFields(match?.required_target_fields || []);
    },
    [rawDataTypes]
  );

  // ─── ACTION: Step 2 ──────────────────────────────────────────────────────
  const handleFileSelected = useCallback((file: File, headers: string[]) => {
    setSelectedFile(file);
    setLocalHeaders(headers);
    setParseConfig((prev) => ({ ...prev, fileName: file.name }));
  }, []);

  const handleDownloadTemplate = useCallback(async () => {
    if (!selectedDataType) return;
    try {
      const safeName = (selectedDataType?.title || selectedDataType?.id || 'template')
        .toString()
        .replace(/[^a-z0-9-_]+/gi, '_')
        .toLowerCase();

      const blob: Blob = await downloadDemoFile(selectedDataType.id, { binary: true });
      if (!blob || !(blob instanceof Blob) || blob.size === 0) {
        toast.error('Template is empty');
        return;
      }

      // Decide extension from MIME type — xlsx is binary, csv/plain is text.
      const type = blob.type || '';
      const isXlsx =
        type.includes('spreadsheetml') ||
        type.includes('officedocument') ||
        type.includes('excel') ||
        type === 'application/octet-stream';
      const extension = isXlsx ? 'xlsx' : 'csv';

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}_template.${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Template download failed');
    }
  }, [selectedDataType]);

  // POST /we/data-migrations (multipart) — also used for re-upload via
  // POST /we/data-migrations/<uid>/upload when we already have a jobUid.
  const persistFileToServer = useCallback(async () => {
    if (!selectedDataType || !selectedFile) {
      toast.error('Select a data type and a file before continuing.');
      return false;
    }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('data_type', selectedDataType.id);
      formData.append('file', selectedFile);
      formData.append('date_format', parseConfig.dateFormat);
      formData.append('currency', parseConfig.currency);
      formData.append('decimal_format', parseConfig.decimalFormat);
      formData.append('duplicate_handling', parseConfig.duplicateHandling);
      formData.append('has_header_row', String(parseConfig.hasHeaderRow));

      const res: any = jobUid
        ? await uploadMigrationFile(jobUid, formData)
        : await createMigrationJob(formData);

      if (!res || res.success === false) {
        toast.error('File upload failed');
        return false;
      }

      const uid: string | undefined = res.job_uid || res.uid;
      if (uid) setJobUid(uid);
      setJobInfo(res as CreateJobResponse);

      // Seed the mappings list from the server-confirmed columns. Each
      // column starts unmapped — Step 3 will let the user (or auto-map) fill
      // in the target fields.
      const cols: string[] = res.columns || [];
      setMappings(
        cols.map((c) => ({
          sourceColumn: c,
          targetField: '',
          status: 'Missing',
        }))
      );
      // Reset downstream state because re-uploading wipes server-side rows.
      setPreviewData(null);
      setValidationIssues([]);
      setValidationCounters({ total: 0, ready: 0, errors: 0, warnings: 0, duplicates: 0 });
      setImpactReviewed(false);
      setImpactReview(null);
      setDryRun(null);
      setResults(null);
      setReconciliation(null);
      toast.success('File uploaded');
      return true;
    } catch (e) {
      toast.error('File upload failed');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedDataType, selectedFile, parseConfig, jobUid]);

  // ─── ACTION: Step 3 ──────────────────────────────────────────────────────
  const handleAutoMap = useCallback(async () => {
    if (!jobUid) return;
    setIsProcessing(true);
    try {
      const res: any = await autoMapMigrationFields(jobUid);
      if (!res || res.success === false) {
        toast.error('Auto-map failed');
        return;
      }
      // The response can be a list of mapping rows, {mappings: [...]}, or
      // a paginated {results: [...]} envelope. Accept all three.
      const rows: any[] = Array.isArray(res)
        ? res
        : Array.isArray(res.mappings)
          ? res.mappings
          : Array.isArray(res.results)
            ? res.results
            : [];
      if (rows.length) {
        const required = new Set(requiredTargetFields);
        setMappings((prev) => {
          // Build a quick index of server-supplied mappings keyed by source
          // column for O(1) lookup against the existing UI rows.
          const bySource = new Map<string, any>();
          rows.forEach((r) => bySource.set(r.source_column, r));
          return prev.map((m) => {
            const found = bySource.get(m.sourceColumn);
            const target = found?.target_field || '';
            return {
              ...m,
              targetField: target,
              status: target ? 'Mapped' : 'Missing',
              isRequired: required.has(target),
              affectsAccounting: !!found?.affects_accounting,
            };
          });
        });
      }
      toast.success('Auto-mapped fields');
    } catch (e) {
      toast.error('Auto-map failed');
    } finally {
      setIsProcessing(false);
    }
  }, [jobUid, requiredTargetFields]);

  const handleResetMapping = useCallback(() => {
    setMappings((prev) => prev.map((m) => ({ ...m, targetField: '', status: 'Missing' })));
  }, []);

  const handleChangeMappings = useCallback((next: FieldMapping[]) => {
    setMappings(next);
  }, []);

  const persistManualMapping = useCallback(async () => {
    if (!jobUid) return false;
    const payload = {
      mappings: mappings
        .filter((m) => m.targetField)
        .map((m) => ({ source_column: m.sourceColumn, target_field: m.targetField })),
    };
    if (!payload.mappings.length) {
      toast.warning('Map at least one column before continuing.');
      return false;
    }
    setIsProcessing(true);
    try {
      const res: any = await saveMigrationMapping(jobUid, payload);
      if (!res || res.success === false) {
        toast.error('Saving mapping failed');
        return false;
      }
      return true;
    } finally {
      setIsProcessing(false);
    }
  }, [jobUid, mappings]);

  // ─── ACTION: Step 4 ──────────────────────────────────────────────────────
  const loadPreview = useCallback(async () => {
    if (!jobUid) return;
    setIsProcessing(true);
    try {
      const res: any = await fetchMigrationPreview(jobUid);
      if (res && res.success !== false) {
        setPreviewData(res);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [jobUid]);

  // ─── ACTION: Step 5 ──────────────────────────────────────────────────────
  const runValidation = useCallback(async () => {
    if (!jobUid) return false;
    setIsProcessing(true);
    try {
      const res: any = await validateMigration(jobUid);
      if (!res || res.success === false) {
        toast.error('Validation failed');
        return false;
      }
      // After validate, fetch the full issues list and update counters.
      const issuesRes: any = await fetchMigrationValidationIssues(jobUid);
      const issues: ValidationIssue[] = issuesRes?.issues || [];
      setValidationIssues(issues);
      // Pull updated row counters from the job detail (validate writes them).
      // Some backends include them on the validate response; we read from
      // there if present, otherwise fall back to counting issues.
      setValidationCounters({
        total: res.total_rows ?? jobInfo?.total_rows ?? 0,
        ready: res.ready_rows ?? 0,
        errors: res.error_rows ?? issues.filter((i) => i.severity === 'error').length,
        warnings: res.warning_rows ?? issues.filter((i) => i.severity === 'warning').length,
        duplicates: res.duplicate_rows ?? issues.filter((i) => i.severity === 'duplicate').length,
      });
      return true;
    } catch (e) {
      toast.error('Validation failed');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [jobUid, jobInfo]);

  const reloadValidationIssues = useCallback(async () => {
    if (!jobUid) return;
    const res: any = await fetchMigrationValidationIssues(jobUid);
    if (res && res.success !== false) {
      setValidationIssues(res.issues || []);
    }
  }, [jobUid]);

  const handleFixRow = useCallback(
    async (rowUid: string, field: string, value: string, applyToSimilar: boolean) => {
      if (!jobUid) return false;
      setIsProcessing(true);
      try {
        const res: any = await fixMigrationRow(jobUid, rowUid, {
          field,
          value,
          apply_to_similar_records: applyToSimilar,
        });
        if (!res || res.success === false) {
          toast.error('Could not apply fix');
          return false;
        }
        await reloadValidationIssues();
        toast.success('Fix applied');
        return true;
      } finally {
        setIsProcessing(false);
      }
    },
    [jobUid, reloadValidationIssues]
  );

  // ─── ACTION: Step 6 ──────────────────────────────────────────────────────
  const runReviewImpact = useCallback(async () => {
    if (!jobUid) return false;
    setIsProcessing(true);
    try {
      const res: any = await reviewMigrationImpact(jobUid);
      if (!res || res.success === false) {
        toast.error('Could not compute accounting impact');
        return false;
      }
      setImpactReviewed(true);
      // Stash the full review-impact body so Step 6 can render the
      // posting-preview table + affected-reports pills + summary cards.
      setImpactReview(res as ReviewImpactResponse);
      // Run dry-run right after; both feed the Step 6 panel.
      const dr: any = await dryRunMigration(jobUid);
      if (dr && dr.success !== false) setDryRun(dr);
      return true;
    } catch (e) {
      toast.error('Could not compute accounting impact');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [jobUid]);

  // ─── ACTION: Step 7 ──────────────────────────────────────────────────────
  const runConfirmImport = useCallback(async () => {
    if (!jobUid) return false;
    if (!confirmOptions.agreementChecked) {
      toast.warning('You must accept the financial-impact disclaimer.');
      return false;
    }
    setIsProcessing(true);
    try {
      const payload: ConfirmImportPayload = {
        understood_financial_impact: true,
        skip_error_rows: confirmOptions.skipErrorRows,
        send_email: confirmOptions.sendEmail,
        approval_note: confirmOptions.approvalNote,
        idempotency_key: idempotencyKeyRef.current,
      };
      const res: any = await confirmMigration(jobUid, payload);
      if (!res || res.success === false || res.implemented === false) {
        toast.error(res?.message || 'Confirm import failed');
        return false;
      }
      toast.success(res.message || 'Import started');
      return true;
    } finally {
      setIsProcessing(false);
    }
  }, [jobUid, confirmOptions]);

  // ─── ACTION: Step 8 ──────────────────────────────────────────────────────
  const loadResultsAndReconciliation = useCallback(async () => {
    if (!jobUid) return;
    setIsProcessing(true);
    try {
      const [r1, r2] = await Promise.all([
        fetchMigrationResults(jobUid),
        fetchMigrationReconciliation(jobUid),
      ]);
      if (r1 && (r1 as any).success !== false) setResults(r1 as ImportResultsResponse);
      if (r2 && (r2 as any).success !== false) setReconciliation(r2 as ReconciliationResponse);
    } finally {
      setIsProcessing(false);
    }
  }, [jobUid]);

  const handleRollback = useCallback(
    async (reason: string) => {
      if (!jobUid) return false;
      setIsProcessing(true);
      try {
        const res: any = await rollbackMigration(jobUid, {
          reason,
          idempotency_key: newIdempotencyKey(),
        });
        if (!res || res.success === false || res.implemented === false) {
          toast.error(res?.message || 'Rollback failed');
          return false;
        }
        toast.success(res.message || 'Rollback completed');
        await loadResultsAndReconciliation();
        return true;
      } finally {
        setIsProcessing(false);
      }
    },
    [jobUid, loadResultsAndReconciliation]
  );

  const handleDownloadErrorReport = useCallback(() => {
    if (!jobUid) return;
    // The endpoint streams CSV; opening the URL lets the browser download it.
    const token =
      typeof window !== 'undefined' ? window.localStorage.getItem('access_token') : null;
    if (!token) {
      window.open(`${baseURL}/we/data-migrations/${jobUid}/error-report`, '_blank');
      return;
    }
    fetch(`${baseURL}/we/data-migrations/${jobUid}/error-report`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-report-${jobUid}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Could not download error report'));
  }, [jobUid]);

  // ─── NAV: per-step Continue handler. ─────────────────────────────────────
  // Each "Continue" first runs the API action that completes the current step
  // and only advances the wizard if the call succeeds. This keeps the UI in
  // lock-step with the backend job state machine.
  const handleContinue = useCallback(async () => {
    switch (currentStep) {
      case 1: {
        if (!selectedDataType) {
          toast.warning('Pick a data type first.');
          return;
        }
        if (selectedDataType.importAvailable === false) {
          toast.warning(
            'Import is not yet available for this data type. You can still download the template.'
          );
        }
        setCurrentStep(2);
        return;
      }
      case 2: {
        if (!selectedFile) {
          toast.warning('Upload a file before continuing.');
          return;
        }
        const ok = await persistFileToServer();
        if (ok) setCurrentStep(3);
        return;
      }
      case 3: {
        const ok = await persistManualMapping();
        if (ok) {
          await loadPreview();
          setCurrentStep(4);
        }
        return;
      }
      case 4: {
        setCurrentStep(5);
        const ok = await runValidation();
        if (!ok) {
          // stay on validation step but still show whatever issues we have
        }
        return;
      }
      case 5: {
        const ok = await runReviewImpact();
        if (ok) setCurrentStep(6);
        return;
      }
      case 6: {
        setCurrentStep(7);
        return;
      }
      case 7: {
        const ok = await runConfirmImport();
        if (ok) {
          setCurrentStep(8);
          await loadResultsAndReconciliation();
        }
        return;
      }
      default:
        return;
    }
  }, [
    currentStep,
    selectedDataType,
    selectedFile,
    persistFileToServer,
    persistManualMapping,
    loadPreview,
    runValidation,
    runReviewImpact,
    runConfirmImport,
    loadResultsAndReconciliation,
  ]);

  const handleBack = useCallback(() => {
    setCurrentStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s));
  }, []);

  const handleStepClick = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  const restart = useCallback(() => {
    setCurrentStep(1);
    setSelectedDataType(null);
    setSelectedFile(null);
    setLocalHeaders([]);
    setJobUid(null);
    setJobInfo(null);
    setMappings([]);
    setPreviewData(null);
    setValidationIssues([]);
    setValidationCounters({ total: 0, ready: 0, errors: 0, warnings: 0, duplicates: 0 });
    setImpactReviewed(false);
    setImpactReview(null);
    setDryRun(null);
    setConfirmOptions({
      agreementChecked: false,
      skipErrorRows: true,
      sendEmail: false,
      approvalNote: '',
    });
    setResults(null);
    setReconciliation(null);
    idempotencyKeyRef.current = newIdempotencyKey();
    router.push('/dashboard/admin/migrate');
  }, [router]);

  // Memoised props bundle keeps prop-diff stable for child memoisation.
  const wizardProps = useMemo(
    () => ({
      currentStep,
      isProcessing,
      // Step 1
      dataTypes,
      selectedDataType,
      onLoadDataTypes: loadDataTypes,
      onSelectDataType: handleSelectDataType,
      // Step 2
      selectedFile,
      parseConfig,
      onParseConfigChange: setParseConfig,
      onFileSelected: handleFileSelected,
      onDownloadTemplate: handleDownloadTemplate,
      jobInfo,
      localHeaders,
      // Step 3
      mappings,
      targetFields,
      onAutoMap: handleAutoMap,
      onResetMapping: handleResetMapping,
      onChangeMappings: handleChangeMappings,
      // Step 4
      previewData,
      // Step 5
      validationIssues,
      validationCounters,
      onFixRow: handleFixRow,
      // Step 6
      impactReviewed,
      impactReview,
      dryRun,
      // Step 7
      confirmOptions,
      onChangeConfirmOptions: setConfirmOptions,
      // Step 8
      results,
      reconciliation,
      onRollback: handleRollback,
      onDownloadErrorReport: handleDownloadErrorReport,
      onRestart: restart,
      // Nav
      onContinue: handleContinue,
      onBack: handleBack,
      onStepClick: handleStepClick,
    }),
    [
      currentStep,
      isProcessing,
      dataTypes,
      selectedDataType,
      loadDataTypes,
      handleSelectDataType,
      selectedFile,
      parseConfig,
      handleFileSelected,
      handleDownloadTemplate,
      jobInfo,
      localHeaders,
      mappings,
      targetFields,
      handleAutoMap,
      handleResetMapping,
      handleChangeMappings,
      previewData,
      validationIssues,
      validationCounters,
      handleFixRow,
      impactReviewed,
      impactReview,
      dryRun,
      confirmOptions,
      results,
      reconciliation,
      handleRollback,
      handleDownloadErrorReport,
      restart,
      handleContinue,
      handleBack,
      handleStepClick,
    ]
  );

  return (
    <div>
      <ManualBreadcrumbs
        items={[
          { label: 'Data Migration', href: '/dashboard/admin/migrate' },
          { label: 'New Migration', href: '/dashboard/admin/migrate/new' },
        ]}
        className="mb-5 mt-0"
      />
      <MigrationWizard {...wizardProps} />
    </div>
  );
};

export default Page;
