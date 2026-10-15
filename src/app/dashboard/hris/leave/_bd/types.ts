/** The leave API's shapes (backend: weapi/django_rest/views/bd_leave.py). Days are decimal strings. */

export type TypeCode = 'EARNED' | 'CASUAL' | 'SICK' | 'MATERNITY' | 'COMPENSATORY' | 'BEREAVEMENT' | string;
export type Tab = 'balances' | 'applications' | 'approvals' | 'away' | 'encashment' | 'yearend' | 'policy';
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

export interface MaternityCase {
  reference: string;
  employee: EmployeeRef;
  status: 'NOTIFIED' | 'DELIVERED';
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
