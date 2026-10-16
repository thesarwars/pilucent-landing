/** Attendance intake API shapes (backend `weapi/django_rest/views/bd_intake.py`). */

export type Tab = 'import' | 'profiles' | 'mapping' | 'periods' | 'history';
export type Severity = 'BLOCKS' | 'WARNS' | 'INFO';
export type BatchStatus = 'UPLOADED' | 'PARSED' | 'VALIDATED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'REVERSED';
export type PeriodState = 'OPEN' | 'PROCESSING' | 'REVIEW' | 'LOCKED';

export interface Can {
  import: boolean; process: boolean; override: boolean; reverse: boolean; map: boolean;
  advance: boolean; profiles: boolean; lock: boolean; unlock: boolean;
}

export interface Site { uid: string; name: string; isDefault: boolean }

export interface ColumnMap { source: string; target: string; start?: number; width?: number }

export interface Profile {
  uid: string; code: string; version: number; site: { uid: string; name: string }; isActive: boolean;
  createdBy: string | null; createdAt: string; name: string; nameBn: string; deviceLabel: string; deviceModel: string;
  location: string; format: string; encoding: string; delimiter: string; headerRows: number; rowStructure: string;
  dateFormat: string; timeFormat: string; combinedDateTime: boolean; directionHandling: string; employeeMatching: string;
  timezone: string; centuryBase: number; columns: ColumnMap[]; pairs: { in: string; out: string }[] | null;
  sampleHeader: string; batches?: number;
}

export interface Enums {
  formats: string[]; encodings: string[]; rowStructures: string[]; directions: string[]; matching: string[];
  dateFormats: string[]; timeFormats: string[]; targets: string[];
}

export interface Summary {
  sites: Site[]; profiles: Profile[]; enums: Enums; can: Can;
  counts: { unmappedIds: number; orphanPunches: number; batches: number; awaiting: number };
}

export interface ParseError { row: number; field: string; value: string; message: string }

export interface ParseSummary {
  rowsTotal: number; rowsParsed: number; rowsFailed: number; punches: number; discarded: number;
  dateRange: { from: string; to: string } | null; errorsTotal: number;
  deviceIds: { deviceUserId: string; punches: number }[];
}

export interface FindingGroup {
  id: string; severity: Severity; title: string; count: number; behaviour: string;
  items: { label: string; detail: string }[];
}

export interface Findings { groups: FindingGroup[]; blocks: string[]; warns: string[]; canProcess: boolean; checkedAt: string }

export interface AuditRow { action: string; label: string; by: string | null; at: string; reason: string | null; batch: string | null; month: string | null; after: Record<string, unknown> | null }

export interface ReverseImpact {
  punches: number; days: number; employees: number; lockedPeriods: string[];
  adjustments: { code: string; nameEn: string; date: string; reason: string }[];
}

export interface Batch {
  uid: string; reference: string; fileName: string; bytes: number; sha256: string; status: BatchStatus;
  site: { uid: string; name: string }; profile: { uid: string; code: string; name: string; version: number } | null;
  statedRange: { from: string; to: string } | null; parsedRange: { from: string; to: string } | null;
  rows: { total: number; parsed: number; failed: number };
  punches: { imported: number; skipped: number; orphaned: number };
  uploadedBy: string | null; uploadedAt: string; processedAt: string | null; processedBy: string | null;
  reversedAt: string | null; reversedBy: string | null; reverseReason: string | null;
  parse?: ParseSummary | null; errors?: ParseError[]; findings?: Findings | null;
  processedOver?: { warnings: string[]; by: string; at: string } | null;
  now?: { active: number; held: number; skipped: number; reversed: number; relinked: number };
}

export interface BatchDetail extends Batch {
  reverseImpact?: ReverseImpact; audit: AuditRow[]; can: Can;
  sample: { row: number; deviceUserId: string; date: string; time: string; direction: string | null; state: string; skipReason: string | null; employee: { code: string; nameEn: string } | null }[];
}

export interface Unmapped {
  deviceLabel: string; deviceUserId: string; punches: number; firstSeen: string; lastSeen: string; batches: string[];
  suggestion: { code: string; nameEn: string } | null;
}

export interface Mapping {
  uid: string; deviceLabel: string; deviceUserId: string; employee: { code: string; nameEn: string };
  effectiveFrom: string; effectiveTo: string | null; relinked: number; createdBy: string | null; createdAt: string;
}

export interface Period {
  uid: string; month: string; label: string; state: PeriodState; status: string; stage: string;
  exceptions: number | null; gates: { key: string; label: string; count: number; blocks: boolean }[] | null;
  imports: number; lockedOn: string | null; lockedBy: string | null; reopenedAt: string | null; reopenReason: string | null;
  acknowledgeReason: string | null; exceptionsAcknowledged: number; payrollRun: string | null;
  payrollProcessedOn: string | null; payrollInvalidated: string | null;
}

export interface ProfileTest extends ParseSummary {
  errors: ParseError[];
  sample: { row: number; deviceUserId: string; date: string; time: string; direction: string | null; discarded: boolean }[];
}
