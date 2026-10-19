/** Pay library API shapes (backend `weapi/django_rest/views/bd_paylib.py`). */

export type Tab = 'components' | 'templates' | 'floors' | 'bulk';

export interface Can {
  edit: boolean; flags: boolean; editTemplates: boolean; publish: boolean; preview: boolean; apply: boolean;
  gl: boolean; policy: boolean; figures: boolean;
}

export interface BaseMeta { field: string; key: string; label: string; governs: string; index: number }
export interface Gl { uid: string; code: string; title: string; kind: string }

export interface Component {
  uid: string; code: string; version: number; name: string; nameBn: string | null; kind: string; isDeduction: boolean;
  calcBasis: string; calcExpression: string | null; flags: boolean[]; bases: Record<string, boolean>;
  lockedFlags: string[]; flagsFrozen: boolean; isStatutory: boolean; statutoryBasis: string | null; gl: Gl | null;
  suggestedGl: { code: string; title: string } | null; isActive: boolean; effectiveFrom: string; displayOrder: number;
  usage: number | null;
}

export interface Bases {
  sums: Record<string, string>; overtimeHourly: string; pfEmployee: string; pfEmployer: string; gratuityMonthly: string;
  festivalMonthly: string; constants: Record<string, string>;
  sources: Record<string, { key: string; citation: string | null; confidence: string }>;
}

export interface Effects { gross: string; template: string; lines: { code: string; amount: string }[]; now: Bases; basicOnly: Bases }
export interface Readiness { blocked: { code: string; name: string }[]; ready: boolean; message: string | null }

export interface Summary { bases: BaseMeta[]; components: Component[]; effects: Effects; readiness: Readiness; can: Can }

export interface Row { code: string; basis: 'PCT_OF_GROSS' | 'PCT_OF_BASIC' | 'FIXED'; value: string }
export interface Template {
  uid: string; code: string; version: number; name: string; nameBn: string | null; mode: 'GROSS_DOWN' | 'BASIC_UP';
  note: string; balancingCode: string; gazette: boolean; gradeScope: string[] | null; siteScope: string[] | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; locked: boolean; effectiveFrom: string; displayOrder: number;
  publishedAt: string | null; publishedBy: string | null; superseded: boolean; rows: Row[]; usage: number | null;
}
export interface TemplateRow extends Template { draft: Template | null; versions: { uid: string; version: number; status: string; effectiveFrom: string }[] }

export interface Preview {
  lines: { code: string; amount: string }[]; gross: string; basic: string; basicShare: string; basicShareWarning: string | null;
  bases: Bases;
}

export interface Floors {
  grades: { grade: string; label: string; floorBasic: string; floorTotal: string | null; employees: number; companyFloorBinds: boolean }[];
  companyFloor: string | null; citation: string; confidence: string; breaches: Breach[]; breachCount: number; masked?: boolean;
  pfRateEmployee: string; pfRateEmployer: string; basicShareWarnPct: string; can: Can;
}
export interface Breach { code: string; nameEn: string; grade: string | null; gradeLabel: string; basic: string; floor: string; short: string; which: 'gazette' | 'company'; template: string }

export interface Bulk {
  uid: string; reference: string; scope: { grades: string[]; departments: string[]; sites: string[]; employeeCodes: string[] };
  method: 'PCT_INCREASE' | 'FIXED_INCREASE' | 'NEW_GROSS' | 'CHANGE_TEMPLATE'; value: string | null; targetTemplate: string | null;
  rounding: string; effectiveFrom: string; includeOverridden: boolean; reason: string | null;
  status: 'DRAFT' | 'PREVIEWED' | 'APPLIED' | 'REVERSED'; affected: number; refused: number; previewedAt: string | null;
  appliedAt: string | null; appliedBy: string | null; createdBy: string | null; createdAt: string;
  preview?: { rows: BulkRow[]; refusals: { code: string; nameEn: string; reason: string }[]; at: string; total: string } | null;
}
export interface BulkRow { code: string; nameEn: string; grade: string | null; template: string; newTemplate: string; currentGross: string; proposedGross: string; delta: string; basic: string; warnings: string[] }
