export type TrendDirection = "up" | "down" | "neutral";
export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type KpiMetric = {
  id: string;
  title: string;
  value: string;
  helper: string;
  trend: string;
  trendDirection: TrendDirection;
  tone: "purple" | "green" | "blue" | "orange" | "rose" | "cyan";
};

export type SeriesPoint = {
  label: string;
  inflow?: number;
  outflow?: number;
  revenue?: number;
  expenses?: number;
  profit?: number;
  income?: number;
};

export type Insight = {
  title: string;
  message: string;
  action: string;
  severity: Severity;
};

export type StatItem = {
  label: string;
  value: string;
  helper?: string;
  tone?: string;
};

export type PersonRequest = {
  name: string;
  avatar: string;
  type: string;
  dates: string;
  days: string;
  status?: string;
};

export type WorkforceSegment = {
  name: string;
  value: number;
  color: string;
};

export type EventItem = {
  title: string;
  subtitle: string;
  date: string;
  icon: string;
};

export type Transaction = {
  title: string;
  meta: string;
  amount: string;
  direction: "in" | "out";
  date: string;
};

export type BankAccount = {
  name: string;
  masked: string;
  amount: string;
  sync: string;
};

export type Ticket = {
  title: string;
  code: string;
  priority: "High" | "Medium" | "Low";
  age: string;
};

export type Activity = {
  title: string;
  meta: string;
  amount?: string;
  type: "success" | "danger" | "info" | "warning";
};

export type RankedItem = {
  name: string;
  meta?: string;
  value: string;
  secondary?: string;
  percent?: number;
};

export type ApprovalItem = {
  count: string;
  label: string;
  amount: string;
};

export type PayrollBreakdown = {
  name: string;
  value: number;
  amount: string;
  color: string;
};

export type AgingBucket = {
  name: string;
  amount: number;
  label: string;
  color: string;
};

export type QuickAction = {
  title: string;
  description: string;
  tone: string;
};

export type HealthStat = {
  label: string;
  value: string;
  trend: string;
  trendDirection: TrendDirection;
  helper: string;
};

export type HealthSnapshotData = {
  totalExpense: HealthStat;
  availableCash: HealthStat;
  cashHealthScore: {
    score: number;
    label: string;
  };
};

export type CashRunwayData = {
  months: string;
  untilDate: string;
  radialValue: number;
  monthlyBurn: string;
  burnPercent: number;
};

export type DashboardData = {
  kpis: KpiMetric[];
  cashFlow: SeriesPoint[];
  profitLoss: SeriesPoint[];
  incomeVsExpense: SeriesPoint[];
  insights: Insight[];
  attendanceStats: StatItem[];
  employeeStats: StatItem[];
  leaveRequests: PersonRequest[];
  workforce: WorkforceSegment[];
  events: EventItem[];
  invoiceStatus: AgingBucket[];
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  tickets: Ticket[];
  activity: Activity[];
  topCustomers: RankedItem[];
  topProducts: RankedItem[];
  approvals: ApprovalItem[];
  payrollBreakdown: PayrollBreakdown[];
  taxBreakdown: AgingBucket[];
  arAging: AgingBucket[];
  apAging: AgingBucket[];
  expenseBreakdown: AgingBucket[];
  quickActions: QuickAction[];
  healthSnapshot: HealthSnapshotData;
  cashRunway: CashRunwayData;
};
