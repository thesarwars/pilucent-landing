/** The leave API's shapes (backend: weapi/django_rest/views/bd_leave.py). Days are decimal strings. */

export type TypeCode = 'EARNED' | 'CASUAL' | 'SICK' | 'MATERNITY' | 'COMPENSATORY' | 'BEREAVEMENT' | string;
export type Tab = 'balances' | 'applications' | 'approvals' | 'away' | 'encashment' | 'maternity' | 'statements' | 'yearend' | 'policy';
export type BalanceFilter = 'ALL' | 'CLAIMED' | 'NOTHING' | 'OVERDRAWN';

export interface Can {
  apply: boolean;
  approve: boolean;
  grant: boolean;
  encash: boolean;
  close: boolean;
  maternity: boolean;
  figures: boolean;
}

export interface EmployeeRef {
  code: string;
  nameEn: string;
  nameBn: string | null;
  department: string | null;
  designation: string | null;
  classification: string | null;
  establishment: string | null;
  gender: string | null;
  doj: string | null;
}

/** A balance is three numbers, not one: spendable = balance − held − committed. */
export interface Position {
  balance: string;
  held: string;
  committed: string;
  spendable: string;
  eligible: boolean;
  reason: string | null;
  cycle: { from: string; to: string; kind: string } | null;
}

export interface LeaveTypeInfo {
  code: TypeCode;
  name: string;
  nameBn: string | null;
  statutory: boolean;
  basis: string | null;
  cycleKind: string;
  accrualKind: string;
  halfDayAllowed: boolean;
  countsCalendarDays: boolean;
  consumesHolidays: boolean;
  advanceAllowed: boolean;
  encashable: boolean;
  onGrid: boolean;
  womenOnly: boolean;
  workersOnly: boolean;
  backdateWindowDays: number;
  requiresMedicalCert: boolean;
  entitlement?: string;
}

export interface Summary {
  roster: number;
  awaiting: number;
  held: string;
  grantedThisYear: string;
  counts: { applications: number; approvals: number; encashment: number };
  can: Can;
}

export interface BalanceRow extends EmployeeRef {
  positions: Record<string, Position>;
}

export interface Balances {
  asOf: string;
  types: LeaveTypeInfo[];
  rows: BalanceRow[];
  counts: Record<BalanceFilter, number>;
  rules: { version: string; confidence: string };
}

export interface Breakdown {
  from: string;
  to: string;
  calendarDays: number;
  holidays: { date: string; name: string; kind: 'WEEKLY' | 'FESTIVAL' }[];
  excluded: { date: string; name: string; kind: string }[];
  consumed: string;
  counting: 'CALENDAR' | 'CONSUMES' | 'EXCLUDES';
  startHalf: string;
  endHalf: string;
  sentence: string;
}

export type Phase = 'SUBMITTED' | 'APPROVED' | 'IN_PROGRESS' | 'TAKEN' | 'DECLINED' | 'CANCELLED' | 'WITHDRAWN';

export interface LeaveRequest {
  reference: string;
  employee: EmployeeRef;
  type: TypeCode;
  typeName: string;
  from: string;
  to: string;
  startHalf: string;
  endHalf: string;
  days: string;
  breakdown: Breakdown;
  status: string;
  phase: Phase;
  note: string | null;
  contact: string | null;
  cover: { code: string; nameEn: string } | null;
  evidence: string | null;
  backdated: boolean;
  advance: boolean;
  nonRefusable: boolean;
  enteredBy: string | null;
  onBehalf: boolean;
  enteredAt: string;
  decidedBy: string | null;
  decidedAt: string | null;
  declineReason: string | null;
  entry: string | null;
}

export interface ClashRow {
  reference: string;
  code: string;
  nameEn: string;
  type: TypeCode;
  typeName: string;
  from: string;
  to: string;
  state: 'WAITING' | 'APPROVED' | 'STATUTORY';
}

export interface Clash {
  scope: string;
  peers: number;
  overlapping: number;
  severe: boolean;
  title: string;
  note: string;
  rows: ClashRow[];
  statutory: string[];
}

export interface QueueCard extends LeaveRequest {
  position: Position;
  positionSentence: string;
  tight: boolean;
  warnings: string[];
  clash: Clash;
  selfApproval: boolean;
}

export interface AwayBar {
  reference: string;
  type: TypeCode;
  typeName: string;
  from: string;
  to: string;
  startsHere: boolean;
  endsHere: boolean;
  pending: boolean;
  nonRefusable: boolean;
  days: string;
}

export interface Away {
  month: string;
  days: number[];
  weekdays: number[];
  rows: (EmployeeRef & { bars: AwayBar[] })[];
  rosterCount: number;
  nearest: string | null;
}

export interface LedgerRow {
  uid: string;
  reference: string;
  type: TypeCode;
  date: string;
  days: string;
  reason: string;
  reasonLabel: string;
  basis: string;
  basisBn: string | null;
  sourceRef: string | null;
  ruleSet: string;
  by: string | null;
  at: string;
  onBehalf: boolean;
  reversedBy: string | null;
  counts: boolean;
  running: string;
  cycle: { from: string; to: string; kind: string };
}

export interface History {
  employee: EmployeeRef;
  positions: Record<string, Position & { name: string }>;
  rows: LedgerRow[];
  requests: LeaveRequest[];
  can: Can;
}

export interface Preview {
  breakdown: Breakdown;
  position: Position;
  positionSentence: string;
  asked: string;
  short: boolean;
  advanceAllowed: boolean;
}

export interface BulkRow {
  code: string;
  nameEn: string;
  days: string;
  outcome: 'OK' | 'POSTED' | 'REFUSED';
  why?: string;
  entry?: string;
}

export interface BulkResult {
  type: TypeCode;
  commit: boolean;
  rows: BulkRow[];
  ok: number;
  refused: number;
  reasonError?: string;
}

export type AccrualOutcome = 'OK' | 'CAPPED' | 'NOT_ELIGIBLE' | 'ALREADY_POSTED' | 'REFUSED' | 'NEEDS_DAYS';

export interface AccrualRow {
  code: string;
  nameEn: string;
  establishment: string | null;
  outcome: AccrualOutcome;
  why?: string;
  cycleFrom?: string;
  cycleTo?: string;
  divisor?: number;
  cap?: string;
  worked?: string;
  source?: 'attendance' | 'entered';
  raw?: string;
  rounded?: string;
  balanceBefore?: string;
  granted?: string;
  capped?: boolean;
  basis?: string;
  entry?: string;
  settled?: number;
  total?: number;
}

export interface AccrualRun {
  asOf: string;
  commit: boolean;
  rows: AccrualRow[];
  counts: Partial<Record<AccrualOutcome, number>>;
  postable: number;
}

export interface CloseRow {
  code: string;
  nameEn: string;
  cycleFrom: string;
  cycleTo: string;
  outcome: 'WILL_CLOSE' | 'CLOSED' | 'REFUSED';
  why?: string;
  closing?: string;
  cap?: string;
  alreadyInNext?: string;
  carried?: string;
  forfeited?: string;
  warning?: string;
  forfeitEntry?: string;
  openingEntry?: string;
}

export interface YearEnd {
  asOf: string;
  commit: boolean;
  rows: CloseRow[];
  forfeited: string;
  carried: string;
}

export interface Encashment {
  reference: string;
  employee: EmployeeRef;
  days: string;
  status: 'SUBMITTED' | 'APPROVED' | 'PAID' | 'DECLINED';
  divisor: number;
  rateBasis: string;
  wageBase: string | null;
  dailyRate: string | null;
  amount: string | null;
  masked: boolean;
  requestedBy: string | null;
  requestedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  declineReason: string | null;
  paymentMonth: string | null;
  payrollRef: string | null;
  payslipRef: string | null;
  entry: string | null;
  cycle: { from: string; to: string };
}

export interface EncashPreview {
  position: Position;
  ceiling: string;
  sentence: string;
  fraction: string;
  divisor: number;
}

export type MaternityStatus = 'NOTIFIED' | 'ON_LEAVE_PRE' | 'DELIVERED' | 'ON_LEAVE_POST' | 'COMPLETED' | 'CANCELLED';
export type MaternityEventKind = 'NOTICE' | 'PROOF_OF_PREGNANCY' | 'PAY_FIRST' | 'DELIVERY' | 'PROOF_OF_BIRTH' | 'PAY_SECOND' | 'RETURN' | 'CANCEL';

export interface ReferenceLine {
  month: string;
  label: string;
  wage: string | null;
  days: string;
  daysSource: string;
  wageSource: string;
}

/** No restricted field: expected and actual delivery and the surviving children are read one at a time, logged. */
export interface MaternityCase {
  reference: string;
  employee: { code: string; nameEn: string; department: string | null };
  status: MaternityStatus;
  statusLabel: string;
  noticeDate: string;
  noticeMethod: 'WRITTEN' | 'ORAL';
  noticeRecordedBy: string | null;
  leaveFrom: string;
  leaveTo: string;
  totalDays: number;
  benefitPayable: boolean;
  eligibility: string;
  serviceMonths: number;
  serviceMonthsMet: boolean;
  protectionStart: string;
  protectionEnd: string;
  employmentBanEnd: string;
  request: string;
  deliveryRecorded: boolean;
  benefit: {
    basis: string;
    basisLabel: string;
    electedBy: string | null;
    text: string | null;
    lines: ReferenceLine[];
    averageDailyWage: string | null;
    days: number;
    amount: string | null;
    first: string | null;
    second: string | null;
    other: { basis: string; label: string; benefit: string; difference: string | null } | null;
    masked: boolean;
  };
  dates: Record<'proofOfPregnancy' | 'firstPaid' | 'proofOfBirth' | 'secondPaid' | 'returned' | 'cancelled', string | null>;
  schedule: Record<string, string | number | boolean | null>;
  next: { label: string; due: string | null; overdue: boolean; event: MaternityEventKind | null };
  events: { event: MaternityEventKind; label: string; on: string; note: string; by: string | null }[];
}

export interface MaternityList {
  rows: MaternityCase[];
  open: number;
  overdue: number;
  committed: string | null;
  masked: boolean;
  can: Can;
}

export interface BenefitPreview {
  lines: ReferenceLine[];
  bases: { key: string; label: string; citation: string; isDefault: boolean; averageDailyWage: string | null; benefit: string | null; text: string | null }[];
  masked: boolean;
  benefitDays: number;
  confidence: string | null;
}

export interface StatementRow {
  type: string;
  name: string;
  nameBn: string | null;
  opening: string;
  earned: string;
  taken: string;
  refused: string;
  encashed: string;
  other: string;
  closing: string;
}

export interface StatementOut {
  uid: string;
  employee: { code: string; nameEn: string; nameBn: string | null };
  rows: StatementRow[];
  issued: { method: string; label: string; on: string; detail: string | null; by: string | null }[];
  acknowledgedAt: string | null;
}

export interface StatementsRead {
  quarter: string;
  label: string;
  from: string;
  to: string;
  unlocked: string[];
  ready: boolean;
  quarters: { id: string; label: string }[];
  batch: null | {
    uid: string;
    version: number;
    generatedAt: string;
    generatedBy: string | null;
    unlockedAtGeneration: string[];
    generated: number;
    issued: number;
    acknowledged: number;
    outstanding: number;
    byMethod: Record<string, number>;
    chase: { code: string; nameEn: string; why: string }[];
    rows: StatementOut[];
  };
  can: Can;
}

export interface StatementPrint extends StatementOut {
  quarter: string;
  period: string;
  version: number;
  employer: string;
}

export interface Restricted {
  expectedDelivery: string;
  actualDelivery: string | null;
  survivingChildren: number;
}

export interface Policy {
  asOf: string;
  ruleSet: string;
  confidence: string;
  effectiveFrom: string;
  source: string | null;
  types: LeaveTypeInfo[];
  establishments: { establishment: string; divisor: number; divisorAdolescent: number; cap: number }[];
  rows: { key: string; label: string; value: unknown; confidence: string; citation: string | null; note: string | null }[];
}
