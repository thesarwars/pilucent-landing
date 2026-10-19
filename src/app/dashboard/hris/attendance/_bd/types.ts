/** The attendance API's shapes (backend: weapi/django_rest/views/bd_attendance.py). */

export type DayStatus =
  | 'PRESENT'
  | 'PRESENT_OT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'ON_LEAVE'
  | 'LEAVE_WITHOUT_PAY'
  | 'HOLIDAY'
  | 'WEEKLY_HOLIDAY'
  | 'ON_DUTY'
  | 'EXCEPTION';

export type ExceptionKind =
  | 'MISSING_OUT_PUNCH'
  | 'MISSING_IN_PUNCH'
  | 'NO_PUNCH_ROSTERED'
  | 'ABSENT_NO_LEAVE'
  | 'DAILY_LIMIT_EXCEEDED'
  | 'LATE_ARRIVAL'
  | 'OT_UNAPPROVED'
  | 'WORKED_WEEKLY_HOLIDAY'
  | 'WORKED_FESTIVAL_HOLIDAY';

export type PeriodStatus = 'OPEN' | 'REVIEW' | 'LOCKED';
export type DayKind = 'WORKING' | 'WEEKLY' | 'HALF' | 'HOLIDAY';
export type View = 'grid' | 'exceptions' | 'close' | 'compliance';

export interface Can {
  write: boolean;
  acknowledge: boolean;
  lock: boolean;
  reopen: boolean;
  figures: boolean;
}

export interface Period {
  uid: string;
  month: string;
  status: PeriodStatus;
  ruleSet: string;
  lockedAt: string | null;
  lockedBy: string | null;
  reopenedAt: string | null;
  reopenReason: string | null;
}

export interface RulesInfo {
  version: string;
  confidence: string;
}

export interface ShiftBrief {
  code: string;
  label: string;
  start: string;
  end: string;
}

/** One day of one employee, compact: the grid carries 9,300 of these. */
export interface Cell {
  s: DayStatus | null; // status; null before joining, after leaving, or with no shift
  a: boolean; // adjusted
  x: ExceptionKind[]; // open exceptions
  b: boolean; // one of them blocks the month closing
  p: boolean; // pending: today unpunched, or the future
  n: boolean; // no shift
  ot: number; // overtime minutes
}

export interface GridRow {
  code: string;
  nameEn: string;
  nameBn: string;
  department: string | null;
  shift: ShiftBrief | null;
  noShift: boolean;
  otMinutes: number;
  lateMinutes: number;
  openExceptions: number;
  exceptionKinds: ExceptionKind[];
  days: Cell[];
}

export interface GridDay {
  date: string;
  num: number;
  dow: string;
  kind: DayKind;
  name: string | null;
}

export interface Grid {
  period: Period;
  site: { uid: string; name: string };
  days: GridDay[];
  rows: GridRow[];
  count: number;
  page: number;
  pages: number;
  rosterEmpty: boolean;
  counts: { exceptions: number; blocking: number };
  rules: RulesInfo;
  can: Can;
}

export interface Decision {
  state: 'RESOLVED' | 'ACKNOWLEDGED';
  outcome: string | null;
  resolution: string | null;
  by: string | null;
  at: string;
}

export interface ExceptionInfo {
  kind: ExceptionKind;
  label: string;
  severity: 'HIGH' | 'MEDIUM';
  blocksClose: boolean;
  terminal: 'RESOLVED' | 'ACKNOWLEDGED';
  remedy: string;
  action: string;
  citation: string;
  decision: Decision | null;
}

export interface AdjustmentRow {
  uid: string;
  live: boolean;
  removed: boolean;
  newStatus: DayStatus | null;
  inTime: string | null;
  outTime: string | null;
  inTimeMin: number | null;
  outTimeMin: number | null;
  reason: string;
  note: string | null;
  by: string | null;
  at: string;
}

export interface DayDetail {
  employee: { code: string; nameEn: string; nameBn: string };
  date: string;
  period: Period;
  dayKind: DayKind;
  holidayName: string | null;
  shift:
    | (ShiftBrief & {
        standardMinutes: number;
        unpaidBreak: number;
        grace: number;
        otStartsAfter: number;
        requiresPreApproval: boolean;
      })
    | null;
  punches: { at: string; direction: 'IN' | 'OUT'; source: string; device: string | null }[];
  computed: {
    status: DayStatus | null;
    worked: number;
    overtime: number;
    late: number;
    inTime: string | null;
    outTime: string | null;
    adjusted: boolean;
    pending: boolean;
    noShift: boolean;
    steps: string[];
  };
  exceptions: ExceptionInfo[];
  adjustments: AdjustmentRow[];
  otRate: { base: string; basis: string; rate: string; unanswered?: undefined } | { unanswered: true; message: string } | null;
  otCost: string | null;
  masked: boolean;
  settable: DayStatus[];
  can: Can;
}

export interface ExceptionRow extends ExceptionInfo {
  code: string;
  nameEn: string;
  nameBn: string;
  department: string | null;
  date: string;
  status: DayStatus | null;
  worked: number;
  overtime: number;
  late: number;
  inTime: string | null;
  outTime: string | null;
  actions: string[];
}

export interface ExceptionsList {
  period: Period;
  rows: ExceptionRow[];
  count: number;
  blocking: number;
  byKind: Record<ExceptionKind, number>;
}

/** Read-only here: elected, effective-dated and approved in Payroll settings. Null is unanswered. */
export interface Elections {
  overtimeBase: 'BASIC_PLUS_DA' | 'GROSS' | 'CUSTOM' | null;
  overtimeComponents: string[] | null;
  standardMonthHours: number | null;
  daysWorked: { present?: boolean; paidLeave: boolean; festival: boolean; weekly: boolean; maternity?: boolean } | null;
  answered: { overtimeBase: boolean; daysWorked: boolean };
  citations: { overtimeBase: string; daysWorked: string };
}

export interface Gate {
  key: 'calendar' | 'monthEnded' | 'high' | 'holidayWork' | 'noShift' | 'medium';
  label: string;
  count: number;
  blocks: boolean;
  rows: { code: string; nameEn?: string; date?: string; kind?: ExceptionKind; label?: string; worked?: number }[];
}

export interface CloseTotals {
  present: number;
  halfDay: number;
  absent: number;
  leave: number;
  lwp: number;
  holiday: number;
  weekly: number;
  onDuty: number;
  daysWorked: number;
  overtimeMinutes: number;
  lateMinutes: number;
  workedMinutes: number;
}

export interface CloseSummary {
  period: Period;
  elections: Elections;
  rules: RulesInfo;
  gates: Gate[];
  canLock: boolean;
  totals: CloseTotals | null;
  employees: (Omit<CloseTotals, 'holiday'> & { code: string; nameEn: string; holiday: number })[];
  holidayWork: Gate['rows'];
  accrualCitation?: string;
  can: Can;
}

export interface Compliance {
  period: Period;
  daily: { code: string; nameEn: string; date: string; worked: number; limit: number; citation: string; acknowledged: boolean; reason: string | null }[];
  weekly: { code: string; nameEn: string; weekStart: string; weekEnd: string; worked: number; limit: number; citation: string }[];
  annual: { code: string; nameEn: string; weeks: number; average: number; limit: number; citation: string }[];
  count: number;
  limits: { daily: number; weekly: number; annualAverage: number };
  rules: RulesInfo;
  note: string;
}

export interface Site {
  uid: string;
  code: string;
  name: string;
  nameBn: string | null;
  isDefault: boolean;
}

export interface Shift {
  uid: string;
  code: string;
  label: string;
  labelBn: string | null;
  start: string;
  end: string;
  startMin: number;
  endMin: number;
  standardMinutes: number;
  unpaidBreak: number;
  grace: number;
  otStartsAfter: number;
  requiresPreApproval: boolean;
  isNightShift: boolean;
  effectiveFrom: string;
  assigned: number;
}

export interface ShiftsRead {
  rows: Shift[];
  unassigned: { code: string; nameEn: string; department: string | null }[];
  site: { uid: string; name: string };
  can: Can;
}

export interface CalendarDayRow {
  date: string;
  name: string;
  nameBn: string | null;
  kind: 'FESTIVAL_HOLIDAY' | 'PUBLIC_HOLIDAY' | 'HALF_DAY';
}

export interface CalendarRead {
  year: number;
  status: 'DRAFT' | 'PUBLISHED' | null;
  weeklyPattern: Record<string, number>;
  days: CalendarDayRow[];
  consultedWith: string;
  publishedAt: string | null;
  publishedBy?: string | null;
  lockedMonths: string[];
  can?: Can;
}

export interface ImportResult {
  inserted: number;
  duplicates: number;
  quarantined: { row: Record<string, unknown>; reason: string; detail: string }[];
}

export interface Recomputed {
  days: number;
  employees: number;
  openExceptions: number;
  staleSnapshots: number;
  computedAt: string;
}
