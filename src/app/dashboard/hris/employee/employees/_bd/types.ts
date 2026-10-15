/**
 * Wire types for the BD employee API (backend `docs/employee-profile.md` §9).
 *
 * Money is a decimal string ("22000.00"), never a number; dates are
 * "YYYY-MM-DD". Every computed statutory figure is a `Figure`.
 */

export type Money = string;
export type ISODate = string;
export type Confidence = 'DRAFTED' | 'CORROBORATED' | 'DISPUTED' | 'VERIFIED' | 'LIVE';

export interface Figure<T = Money> {
  value: T;
  basis: string;
  citation: string | null;
  confidence: Confidence;
}

export interface Lookup {
  uid: string;
  title: string;
  code?: string;
}

export interface Paged<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* ── roster ───────────────────────────────────────────────────────── */

export type RosterFilter = 'ALL' | 'WORKER' | 'NON_WORKER' | 'PROBATION' | 'BLOCKED';

export interface RosterRow {
  code: string;
  nameEn: string;
  nameBn: string;
  designation: string | null;
  department: string | null;
  workerCategory: string;
  classification: string;
  dateOfJoining: ISODate | null;
  grossMonthly: Money | null;
  blockerCount: number;
  fresh: boolean;
}

/* ── profile ──────────────────────────────────────────────────────── */

export interface Personal {
  nameEn: string;
  nameBn: string;
  fatherName: string;
  motherName: string;
  marital: string;
  spouseName: string;
  dob: ISODate | null;
  gender: string;
  blood: string;
  religion: string;
  nid: string;
  birthCert: string;
  passport: string;
  workPermit: string;
  mobile: string;
  email: string;
  presentAddress: string;
  presentDivision: string;
  permanentSame: boolean;
  permanentAddress: string;
  permanentDivision: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  photo: string | null;
}

export interface ServiceParts {
  totalMonths: number;
  years: number;
  months: number;
  days: number;
}

export interface Employment {
  classification: string;
  workerCategory: string;
  establishment: string;
  employmentType: string;
  contractEnd: ISODate | null;
  doj: ISODate | null;
  probationEnd: ISODate | null;
  confirmation: ISODate | null;
  department: Lookup | null;
  section: Lookup | null;
  designation: Lookup | null;
  grade: string;
  shift: Lookup | null;
  manager: { code: string; nameEn: string } | null;
  appointmentLetter: boolean;
  idCard: boolean;
  idCardDate: ISODate | null;
  completedPayrollRuns: number;
  separatedOn: ISODate | null;
  separationType: string;
  finalSettlementOn: ISODate | null;
  service: ServiceParts | null;
}

export interface Nominee {
  uid?: string;
  name: string;
  relation: string;
  nid: string;
  share: string;
}

export interface Statutory {
  pfMember: boolean;
  pfConstituted: boolean;
  pfNumber: string;
  pfEnrolled: ISODate | null;
  pfEmployee: string | null;
  pfEmployer: string | null;
  gratuityEligible: boolean;
  gratuityBasis: string;
  gratuityMethod: string;
  gratuityFund: string;
  insuranceCovered: boolean;
  insurancePolicy: string;
  insuranceSum: Money | null;
  insurer: string;
  festivalGranted: boolean;
  festivalReason: string;
}

export interface TaxProfile {
  category: string;
  disabledChildren: number;
  etin: string;
  psr: boolean;
  psrDate: ISODate | null;
  vehicle: string;
  accommodation: boolean;
  accommodationValue: Money | null;
  priorEmployer: boolean;
  priorName: string;
  priorIncome: Money | null;
  priorTds: Money | null;
  taxBorneByEmployer: boolean;
  categorySuggestion?: string;
}

export interface Investment {
  uid?: string;
  instrument: string;
  amount: Money;
  proof: boolean;
}

export interface Payment {
  method: string;
  cashReason: string;
  bank: string;
  branch: string;
  routing: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  mfsProvider: string;
  walletNumber: string;
  walletType: string;
  onHold: boolean;
  holdReason: string;
  holdApprover: string;
  holdSince: ISODate | null;
}

export interface HistoryEntry {
  uid: string;
  field: string;
  date: ISODate;
  from: string;
  to: string;
  by: string;
  reason: string;
}

export interface SalaryComponent {
  code: string;
  name: string;
  amount: Money;
  percentOfGross: string | null;
  basis: string | null;
}

export interface Words {
  en: string;
  bn: string;
}

export interface SalaryStructure {
  uid: string;
  effectiveFrom: ISODate;
  effectiveTo: ISODate | null;
  template: string;
  templateName: string;
  gross: Money;
  grossInWords: Words;
  basicPercentOfGross: string | null;
  components: SalaryComponent[];
  revisionType: string | null;
  method: string | null;
  reason: string;
  reopenedPeriods: string[];
  arrears: Money;
  arrearsRun: string | null;
  supersededBy: string | null;
}

export interface Profile {
  code: string;
  uid: string;
  status: string;
  access: { isAccessEnabled: boolean; isJoined: boolean; login: string | null };
  asOf: ISODate;
  personal: Personal;
  employment: Employment;
  nominees: Nominee[];
  statutory: Statutory;
  taxProfile: TaxProfile;
  investments: Investment[];
  payment: Payment;
  salary: SalaryStructure | null;
  history: HistoryEntry[];
}

/* ── compliance ───────────────────────────────────────────────────── */

export type TabId =
  | 'personal'
  | 'employment'
  | 'salary'
  | 'statutory'
  | 'tax'
  | 'payment'
  | 'documents'
  | 'history';
export type TabState = 'complete' | 'partial' | 'empty' | 'blocked';

export interface Finding {
  key: string;
  label: string;
  fix: string;
  tab: TabId;
  field: string | null;
}

export interface Compliance {
  blocks: Finding[];
  risks: Finding[];
  tabStates: Record<TabId, TabState>;
  summary: { blockCount: number; riskCount: number; blocks: string; risks: string };
}

/* ── salary ───────────────────────────────────────────────────────── */

export interface SalaryTemplate {
  id: string;
  name: string;
  mode: 'GROSS_DOWN' | 'BASIC_UP';
  amountMeans: 'gross' | 'basic';
  rule: string;
}

export interface FloorCheck {
  kind: 'basic' | 'total';
  grade: string | null;
  floor: Money;
  amount: Money;
  passed: boolean;
  message: string | null;
  rule: string;
  citation: string | null;
  confidence: Confidence;
}

export interface Warning {
  key: string;
  message: string;
}

export interface ArrearsPeriod {
  period: string;
  paid: Money;
  due: Money;
  arrears: Money;
  factor: string;
}

export interface Consequence {
  reopenedPeriods: string[];
  reopenedCount: number;
  periods: ArrearsPeriod[];
  arrears: Money;
  prorationDivisor: string;
  floors?: FloorCheck[];
  warnings?: Warning[];
}

export interface Unavailable {
  available: false;
  reason: string;
}

export interface Derived {
  overtimeHourly: Figure;
  providentFund: { employee: Figure | null; employer: Figure | null } | null;
  festivalBonus: {
    eligibleFrom: ISODate | null;
    eligible: boolean;
    perBonus: Figure;
    annual: Figure;
    monthlyProvision: Figure;
    serviceMonths: number;
    taxable: Figure<boolean> | null;
  };
  leave: {
    establishment: string | null;
    earnedLeaveRatio: Figure<number> | null;
    accumulationCap: Figure<number> | null;
    casualDays: Figure<number>;
    sickDays: Figure<number>;
    festivalHolidays: Figure<number>;
    encashment: { maxPercentOfBalance: Figure<number>; timesPerYear: Figure<number>; dailyRate: Figure };
    message: string | null;
  };
  gratuity: {
    years: number;
    roundedUp: boolean;
    daysPerYear: number;
    service: ServiceParts;
    base: Figure;
    amount: Figure;
    monthlyProvision: Figure;
  } | null;
  gratuityBreakpoint: {
    anniversary: ISODate;
    ratesRiseOn: ISODate;
    withinTwelveMonths: boolean;
    daysFrom: number;
    daysTo: number;
    monthlyProvisionAfter: Figure;
  } | null;
}

export interface SalaryRead {
  on: ISODate;
  structure: SalaryStructure | null;
  message: string | null;
  templates: SalaryTemplate[];
  revisionDefault: ISODate;
  derived: Derived | Unavailable | null;
  floors: FloorCheck[] | Unavailable | null;
}

export interface SalaryOutcome {
  preview: boolean;
  saved: boolean;
  effectiveFrom: ISODate;
  backdated: boolean;
  template: string;
  gross: Money;
  grossInWords: Words;
  components: SalaryComponent[];
  floors: FloorCheck[];
  warnings: Warning[];
  consequence: Consequence;
  structure: SalaryStructure | null;
}

export interface AssignInput {
  template: string;
  amount?: string | null;
  effectiveFrom?: ISODate | null;
  arrearsRun?: string;
  preview?: boolean;
}

export interface ReviseInput {
  method: string;
  value?: string | null;
  effectiveFrom?: ISODate | null;
  reason?: string;
  template?: string;
  rounding?: number;
  type?: string;
  arrearsRun?: string;
  preview?: boolean;
}

/* ── gated operations ─────────────────────────────────────────────── */

export interface ClassificationResult {
  classification: string;
  effective: ISODate;
  completedPayrollRuns: number;
  retroactive: boolean;
  history: HistoryEntry;
}

export interface SeparationEntitlement {
  available: boolean;
  message?: string;
  type?: string;
  on?: ISODate;
  years?: number;
  completedYears?: number;
  service?: ServiceParts;
  gratuityEligible?: boolean;
  daysPerYear?: number;
  graduated?: boolean;
  band?: { fromYears: number; toYears: number | null; daysPerYear: number } | null;
  higherOfGratuity?: boolean;
  gratuity?: Figure;
  compensation?: Figure;
  payable?: Figure;
  winner?: 'GRATUITY' | 'COMPENSATION' | 'NIL';
  rule?: { rule: string; confidence: Confidence; citation: string | null; note: string | null };
  notes?: string[];
  warnings?: Warning[];
}

/* ── tax ──────────────────────────────────────────────────────────── */

export interface TraceStep {
  n: number;
  step: string;
  key: string;
  value: string | number;
  basis: string;
  citation: string | null;
  confidence: Confidence;
}

export interface Withholding {
  available: boolean;
  reason?: string;
  period?: string;
  depositDue?: Figure<string>;
  lateDeposit?: Figure<string>;
  quarterlyReturn?: { quarterEnds: ISODate; due: ISODate; citation: string | null; confidence: Confidence };
  underDeduction?: Figure<string>;
}

export interface TaxProjection {
  available: boolean;
  asOf: ISODate;
  reason?: string;
  ruleSet?: string;
  category?: string;
  confidence?: Confidence;
  productionSafe?: boolean;
  annualSalary?: Figure;
  bonuses?: Figure;
  perquisites?: Figure;
  employmentIncome?: Figure;
  exemption?: Figure;
  taxable?: Figure;
  threshold?: Figure;
  slabTax?: Figure;
  rebate?: Figure;
  afterRebate?: Figure;
  liability?: Figure;
  ytdDeducted?: Figure;
  periodsElapsed?: Figure<number>;
  remainingPeriods?: Figure<number>;
  periodDeduction?: Figure;
  slabWalk?: { band: number; income: Money; rate: string; tax: Money }[];
  trace?: TraceStep[];
  withholding?: Withholding;
}

/* ── history and documents ────────────────────────────────────────── */

export interface HistoryRead {
  field: string;
  entries: HistoryEntry[];
  empty: boolean;
  message: string | null;
}

export interface DocumentSummary {
  uid: string;
  kind: string;
  version: number;
  issuedOn: ISODate;
  issuedBy: string;
  content?: DocumentContent;
}

export interface DocumentKind {
  kind: 'SERVICE_BOOK' | 'APPOINTMENT_LETTER' | 'ID_CARD';
  label: string;
  issued: boolean;
  latest: DocumentSummary | null;
  ready: boolean;
  missing: { field: string; path: string; message: string }[];
}

export interface DocumentsRead {
  kinds: DocumentKind[];
  documents: DocumentSummary[];
}

export interface DatedDisplay {
  iso: ISODate | null;
  display: { en: string; bn: string };
}

export interface MoneyDisplay {
  amount: Money;
  display: { en: string; bn: string };
  words: Words;
}

/** Frozen document content (backend services/documents.py). */
export interface DocumentContent {
  template: string;
  titleEn: string;
  titleBn: string;
  verified: boolean;
  citation: string | null;
  issuedOn: DatedDisplay;
  employer: { name: string; address: string };
  employee: Record<string, unknown> & { code: string; nameEn: string; nameBn: string; photo: string | null };
  employment?: Record<string, unknown>;
  wage?: {
    effectiveFrom: DatedDisplay;
    gross: MoneyDisplay;
    components: (SalaryComponent & { words: Words })[];
  } | null;
  entries?: {
    serial: number;
    particular: string;
    effectiveFrom: DatedDisplay;
    from: string;
    to: string;
    reason: string;
    authorisedBy: string;
  }[];
  noticeDays?: { value: number; citation: string | null; confidence: Confidence } | null;
  emergency?: { name: string; phone: string };
}

/* ── errors ───────────────────────────────────────────────────────── */

export interface FieldError {
  /** The UI input id when the UI has one (`f-nid`), else the camelCase path. */
  field: string;
  /** camelCase payload key (`nid`). */
  path: string;
  messages: string[];
}
