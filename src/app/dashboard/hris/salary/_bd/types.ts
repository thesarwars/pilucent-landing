/**
 * The salary profile's wire types (docs/backend/salary-profile.md §6).
 * Money is a decimal string; a masked response omits it (null), never hides it.
 */

import type {
  AnySalaryStructure,
  EmployerCost,
  FloorPosition,
  ISODate,
  Money,
  Paged,
  SalaryTemplate,
} from '@/app/dashboard/hris/employee/employees/_bd/types';

export type SalaryFilter = 'ALL' | 'ASSIGNED' | 'NONE' | 'FLOOR' | 'OVERRIDE';

export interface SalaryListRow {
  code: string;
  nameEn: string;
  nameBn: string;
  designation: string | null;
  department: string | null;
  grade: string | null;
  gradeLabel: string | null;
  fresh: boolean;
  hasStructure: boolean;
  template: string | null;
  templateName: string | null;
  effectiveFrom: ISODate | null;
  /** Null when there is no structure, or when the caller may not see figures. */
  gross: Money | null;
  basic: Money | null;
  floor: Money | null;
  floorStatus: 'CLEARS' | 'BELOW' | 'NONE';
  overrideCount: number;
  scheduledFrom: ISODate | null;
  masked: boolean;
}

export interface SalaryList extends Paged<SalaryListRow> {
  stats: { withStructure: number; noStructure: number; belowFloor: number; overridden: number; monthlyGrossTotal: Money | null };
  counts: Record<SalaryFilter, number>;
  masked: boolean;
  asOf: ISODate;
}

export interface SalaryProfileRead {
  asOf: ISODate;
  masked: boolean;
  canWrite: boolean;
  employee: {
    code: string;
    nameEn: string;
    nameBn: string;
    designation: string | null;
    department: string | null;
    grade: string | null;
    gradeLabel: string;
    classification: string | null;
    dateOfJoining: ISODate | null;
    etinOnFile: boolean;
  };
  structure: AnySalaryStructure | null;
  scheduled: AnySalaryStructure | null;
  scheduledDelta?: { pct: string | null; amount: Money };
  /** The uid every write names, so a change made meanwhile is caught. */
  latest: string | null;
  floor: FloorPosition | { available: false; reason: string } | null;
  employerCost: EmployerCost | null;
  templates: SalaryTemplate[];
  defaults: { joiningDate: ISODate | null; currentPeriodStart: ISODate; nextPeriodStart: ISODate; revision: ISODate | null };
}

export interface SalaryHistoryRow {
  uid: string;
  masked?: boolean;
  status: 'ACTIVE' | 'SCHEDULED' | 'SUPERSEDED' | 'CANCELLED';
  effectiveFrom: ISODate;
  effectiveTo: ISODate | null;
  template: string;
  templateName: string;
  gross?: Money;
  basic?: Money;
  revisionType: string | null;
  revisionTypeLabel: string | null;
  /** Stored type where there is one, inferred where there is not. */
  typeLabel: string;
  reason?: string;
  approvedBy?: string | null;
  arrears?: Money;
  arrearsFrom?: string | null;
  overrideCount?: number;
  cancelledAt?: string | null;
  deltaAmount?: Money | null;
  deltaPct?: string | null;
  floorThen: { floor: Money | null; clears: boolean | null; confidence?: string | null; ruleSet?: string | null };
}

export interface SalaryHistoryRead {
  structures: SalaryHistoryRow[];
  masked: boolean;
  empty: boolean;
  message: string | null;
  grade: string | null;
}

export interface WriteInput {
  templateCode?: string | null;
  gross?: Money | null;
  method?: string | null;
  value?: string | null;
  effectiveFrom?: ISODate | null;
  revisionType?: string | null;
  reason?: string;
  rounding?: number;
  arrearsRun?: string | null;
  expectedStructure?: string | null;
  preview?: boolean;
}

export type OverrideBasis = 'PCT_GROSS' | 'PCT_BASIC' | 'FIXED';

export interface OverrideRowInput {
  code: 'BASIC' | 'HRA' | 'MED' | 'CONV' | 'OTHER';
  basis: OverrideBasis;
  value: string;
}

export interface OverrideInput {
  rows: OverrideRowInput[];
  mode: 'REBALANCE' | 'CHANGE';
  reason: string;
  effectiveFrom?: ISODate | null;
  arrearsRun?: string | null;
  preview?: boolean;
}
