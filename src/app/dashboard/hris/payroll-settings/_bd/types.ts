/** Payroll settings on the wire (docs/backend/payroll-settings-done.md §6). Money is a decimal string. */

export type ElectionKey =
  | 'overtime_base'
  | 'proration_method'
  | 'gratuity_basis'
  | 'days_worked_basis'
  | 'festival_bonus_policy'
  | 'rounding_mode'
  | 'balancing_component';

export type Tab = 'elections' | 'schedule' | 'schemes' | 'accounts' | 'changelog';
export type SiteRef = { uid: string; name: string; code: string; isDefault?: boolean };
export type Band = { fromMonths: number; toMonths: number; pct: string };
export type ElectionData = { components?: string[]; bands?: Band[] } & Record<string, unknown>;

export type Resolved = {
  key: ElectionKey;
  answered: boolean;
  value: string | null;
  data: ElectionData | null;
  standardMonthHours: number | null;
  citation: string;
  scope: 'SITE' | 'COMPANY' | null;
  uid: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  decidedBy: string | null;
  approvedBy: string | null;
  source: 'SEEDED' | 'ELECTED' | null;
  decidedAt: string | null;
};

export type ElectionRow = {
  uid: string;
  key: ElectionKey;
  value: string | null;
  data: ElectionData | null;
  standardMonthHours: number | null;
  citation: string;
  ruleSet: string | null;
  site: SiteRef | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'REJECTED';
  source: 'SEEDED' | 'ELECTED';
  reason: string | null;
  decidedBy: string | null;
  decidedByUid: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  impact: Preview | null;
  createdAt: string;
};

export type Election = {
  key: ElectionKey;
  label: string;
  bn: string;
  question: string;
  governs: string;
  options: { value: string; label: string }[];
  flags: { key: string; label: string }[];
  preset: unknown;
  noDefault: boolean;
  resolved: Resolved;
  pending: ElectionRow | null;
};

export type Org = {
  on: string;
  headcount: number;
  withStructure: number;
  workers: number;
  otEmployees: number;
  avgBasic: string;
  avgDa: string;
  avgGross: string;
  otHours: string | null;
  otMonth: string | null;
  subOneYear: number;
  gratuityEligible: number;
  missingStructure: number;
};

/** A preview's option row; which figure it carries depends on the election. */
export type PreviewOption = {
  value?: string;
  label: string;
  monthlyCost?: string;
  affected?: number;
  amount?: string | null;
  factor?: string;
  exposure?: string;
  averageBase?: string;
  at?: { years: number; days: number; amount: string }[];
  annualCost?: string | null;
  companyMonthly?: string;
  worstLine?: string;
  bases?: string[];
  flag?: string;
  numeratorDays?: number;
  companyLeaveDays?: number;
  error?: string;
};

export type Side = {
  value: string | null;
  data?: ElectionData | null;
  answered?: boolean;
  monthlyCost?: string;
  amount?: string | null;
  exposure?: string;
  annualCost?: string | null;
  numerator?: number;
  leaveDaysPerWorker?: number;
  companyLeaveDays?: number;
};

export type Preview = {
  electionKey: ElectionKey;
  label: string;
  citation: string;
  org: Org;
  current: Side;
  proposed: Side;
  options: PreviewOption[];
  deltaMonthly?: string | null;
  deltaAnnual?: string | null;
  deltaExposure?: string | null;
  deltaLeaveDays?: number;
  affectedEmployees?: number;
  notes: string[];
  example?: { month: string; daysInMonth: number; joined: string; gross: string; payableCalendarDays: number; workingDaysInMonth: number | null; payableWorkingDays: number | null; spread: string | null };
  calendar?: { workingDays: number; weeklyHolidays: number; festivalHolidays: number; paidLeave: number; present: number };
  standardMonthHours?: number;
  multiplier?: number;
  error?: string;
};

export type Gl = { uid: string; code: string; title: string; label: string; kind?: string };

export type SchemeCode = 'PF' | 'GRATUITY' | 'GROUP_INSURANCE' | 'WPPF';
export type Scheme = {
  uid: string;
  code: SchemeCode;
  label: string;
  bn: string;
  applies: boolean;
  citation: string;
  config: Record<string, any>;
  expense: Gl | null;
  liability: Gl | null;
  hasLiability: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  decidedBy: string | null;
  reason: string | null;
  suggested: { expense: string; liability: string | null };
  status?: string;
};

export type Schedule = {
  uid: string;
  frequency: 'MONTHLY' | 'FORTNIGHTLY' | 'WEEKLY' | 'DAILY';
  cutoffDay: number | null;
  paymentDay: number | null;
  paymentWeekday: number | null;
  paymentDayRule: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  site: SiteRef | null;
  decidedBy: string | null;
  reason: string | null;
};

export type Deadline = { month: string; wagePeriodEnd: string; deadline: string; paymentDate: string; late: boolean };

export type Blocker = { kind: string; key?: ElectionKey; scheme?: SchemeCode; citation?: string; message: string; deadline?: string };
export type Readiness = { runnable: boolean; period: string; blockers: Blocker[] };

export type Can = { preview: boolean; elect: boolean; approve: boolean; scheme: boolean; schedule: boolean; gl: boolean; figures: boolean; me: string };

export type Summary = {
  asOf: string;
  site: SiteRef | null;
  sites: SiteRef[];
  elections: Election[];
  answered: number;
  total: number;
  pendingAll: ElectionRow[];
  schedule: Schedule | null;
  schemes: Scheme[];
  readiness: Readiness;
  org: Org;
  can: Can;
};

export type AuditRow = {
  uid: string;
  action: string;
  label: string;
  key: ElectionKey | null;
  scheme: SchemeCode | null;
  site: SiteRef | null;
  from: any;
  to: any;
  reason: string | null;
  impact: Preview | null;
  effectiveFrom: string | null;
  decidedBy: string | null;
  approvedBy: string | null;
  at: string;
};

export type Participant = {
  code: string;
  nameEn: string;
  workerCategory: string | null;
  classification: string | null;
  member: boolean;
  participation: { uid: string; enrolledOn: string; optedOutOn: string | null; optOutReason: string | null; employeeRatePct: string | null; employerRatePct: string | null } | null;
  eligibleFrom: string | null;
};
