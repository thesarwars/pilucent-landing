'use client';

// ─────────────────────────────────────────────────────────────────────────────
// MigrationWizard — pure presentational shell.
//
// Owns NO long-lived state. It receives the entire wizard's view model from
// the root page (`src/app/dashboard/admin/migrate/new/page.tsx`) and routes
// the right step component for the active step.
//
// All API calls happen on the parent — this file just lays out the step
// indicator, the step body, and the Back / Save Draft / Continue toolbar.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

import StepIndicator from './StepIndicator';
import Step1SelectDataType from './Step1SelectDataType';
import Step2UploadFile from './Step2UploadFile';
import Step3MapFields from './Step3MapFields';
import Step4PreviewData from './Step4PreviewData';
import Step5ValidateData from './Step5ValidateData';
import Step6ReviewImpact from './Step6ReviewImpact';
import Step7ConfirmImport from './Step7ConfirmImport';
import Step8ImportResults from './Step8ImportResults';
import {
  CreateJobResponse,
  DataTypeOption,
  DryRunResponse,
  FieldMapping,
  FileConfig,
  ImportResultsResponse,
  PreviewResponse,
  ReconciliationResponse,
  ReviewImpactResponse,
  ValidationIssue,
  WizardStep,
} from './types';

export interface MigrationWizardProps {
  currentStep: WizardStep;
  isProcessing: boolean;

  // Step 1
  dataTypes: DataTypeOption[];
  selectedDataType: DataTypeOption | null;
  onLoadDataTypes: () => void | Promise<void>;
  onSelectDataType: (option: DataTypeOption) => void;

  // Step 2
  selectedFile: File | null;
  parseConfig: FileConfig;
  onParseConfigChange: React.Dispatch<React.SetStateAction<FileConfig>>;
  onFileSelected: (file: File, headers: string[]) => void;
  onDownloadTemplate: () => void;
  jobInfo: CreateJobResponse | null;
  localHeaders: string[];

  // Step 3
  mappings: FieldMapping[];
  targetFields: string[];
  onAutoMap: () => void | Promise<void>;
  onResetMapping: () => void;
  onChangeMappings: (next: FieldMapping[]) => void;

  // Step 4
  previewData: PreviewResponse | null;

  // Step 5
  validationIssues: ValidationIssue[];
  validationCounters: {
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

  // Step 6
  impactReviewed: boolean;
  impactReview: ReviewImpactResponse | null;
  dryRun: DryRunResponse | null;

  // Step 7
  confirmOptions: {
    agreementChecked: boolean;
    skipErrorRows: boolean;
    sendEmail: boolean;
    approvalNote: string;
  };
  onChangeConfirmOptions: React.Dispatch<
    React.SetStateAction<{
      agreementChecked: boolean;
      skipErrorRows: boolean;
      sendEmail: boolean;
      approvalNote: string;
    }>
  >;

  // Step 8
  results: ImportResultsResponse | null;
  reconciliation: ReconciliationResponse | null;
  onRollback: (reason: string) => Promise<boolean>;
  onDownloadErrorReport: () => void;
  onRestart: () => void;

  // Nav
  onContinue: () => void | Promise<void>;
  onBack: () => void;
  onStepClick: (step: WizardStep) => void;
}

const MigrationWizard: React.FC<MigrationWizardProps> = (props) => {
  const router = useRouter();
  const {
    currentStep,
    isProcessing,
    selectedDataType,
    confirmOptions,
    onContinue,
    onBack,
    onStepClick,
  } = props;

  // Disable the Continue button when the active step isn't ready to advance.
  // Each step has different prerequisites so we centralise the rule here.
  const canProceed = () => {
    if (isProcessing) return false;
    if (currentStep === 1) return !!selectedDataType;
    if (currentStep === 2) return !!props.selectedFile;
    if (currentStep === 3) return props.mappings.some((m) => m.targetField);
    if (currentStep === 7) return confirmOptions.agreementChecked;
    return true;
  };

  // The Continue button changes its label per step to better describe the
  // action it triggers (validate, review, confirm, …).
  const primaryLabel =
    currentStep === 1
      ? 'Continue'
      : currentStep === 2
        ? 'Upload & Continue'
        : currentStep === 3
          ? 'Save Mapping & Continue'
          : currentStep === 4
            ? 'Continue to Validation'
            : currentStep === 5
              ? 'Continue to Review'
              : currentStep === 6
                ? 'Confirm & Continue'
                : currentStep === 7
                  ? 'Confirm Import'
                  : 'Done';

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1SelectDataType
            dataTypes={props.dataTypes}
            selectedId={selectedDataType?.id ?? null}
            onLoad={props.onLoadDataTypes}
            onSelect={props.onSelectDataType}
          />
        );
      case 2:
        return (
          <Step2UploadFile
            selectedDataType={selectedDataType}
            selectedFile={props.selectedFile}
            parseConfig={props.parseConfig}
            jobInfo={props.jobInfo}
            localHeaders={props.localHeaders}
            onFileSelected={props.onFileSelected}
            onParseConfigChange={props.onParseConfigChange}
            onDownloadTemplate={props.onDownloadTemplate}
          />
        );
      case 3:
        return (
          <Step3MapFields
            mappings={props.mappings}
            targetFields={props.targetFields}
            onChangeMappings={props.onChangeMappings}
            onAutoMap={props.onAutoMap}
            onReset={props.onResetMapping}
            isProcessing={isProcessing}
          />
        );
      case 4:
        return <Step4PreviewData previewData={props.previewData} />;
      case 5:
        return (
          <Step5ValidateData
            issues={props.validationIssues}
            counters={props.validationCounters}
            onFixRow={props.onFixRow}
            isProcessing={isProcessing}
          />
        );
      case 6:
        return (
          <Step6ReviewImpact
            impactReviewed={props.impactReviewed}
            impactReview={props.impactReview}
            dryRun={props.dryRun}
          />
        );
      case 7:
        return (
          <Step7ConfirmImport
            options={confirmOptions}
            onChangeOptions={props.onChangeConfirmOptions}
            counters={props.validationCounters}
            selectedDataType={selectedDataType}
            jobInfo={props.jobInfo}
          />
        );
      case 8:
        return (
          <Step8ImportResults
            results={props.results}
            reconciliation={props.reconciliation}
            onRollback={props.onRollback}
            onDownloadErrorReport={props.onDownloadErrorReport}
            onRestart={props.onRestart}
          />
        );
    }
  };

  return (
    <div className="space-y-5 pb-8 font-lexend">
      <StepIndicator currentStep={currentStep} onStepClick={onStepClick} />

      {renderStep()}

      {currentStep < 8 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={currentStep === 1 || isProcessing}
            className="inline-flex items-center gap-2 rounded-md border border-accent_border_gray bg-white px-4 py-2 text-sm font-medium text-accent_text_black hover:bg-accent_bg_gray disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            {/* <button
              type="button"
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-md border border-accent_border_gray bg-white px-4 py-2 text-sm font-medium text-accent_text_black hover:bg-accent_bg_gray disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Save Draft
            </button> */}
            {currentStep === 7 && (
              <button
                type="button"
                onClick={() => router.push('/dashboard/admin/migrate')}
                disabled={isProcessing}
                className="rounded-md border border-table_error/40 bg-white px-4 py-2 text-sm font-medium text-table_error hover:bg-table_error_light disabled:opacity-50"
              >
                Cancel Import
              </button>
            )}
            <button
              type="button"
              onClick={() => onContinue()}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 rounded-md bg-accent_soft_blue px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {primaryLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationWizard;
