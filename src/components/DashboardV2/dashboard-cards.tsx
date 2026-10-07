import React from 'react';
import KpiStrip from './KpiStrip';
import CashFlowOverview from './CashFlowOverview';
import AiInsights from './AiInsights';
import QuickActions from './QuickActions';
import {
  HrAttendance,
  HrEmployees,
  LeaveRequests,
  Workforce,
  UpcomingEvents,
} from './HrOverview';
import { InvoiceOverview, RecentTransactions, BankBalances } from './ReceivablesRow';
import {
  SupportTickets,
  ActivityFeed,
  TopCustomers,
  TopProducts,
} from './OperationsRow';
import {
  ApprovalCenter,
  HealthSnapshot,
  ProfitLossGraph,
  IncomeExpenseGraph,
} from './ProfitCharts';
import { PayrollSnapshot, TaxCenterSnapshot } from './PayrollTax';
import { ArAging, ApAging, ExpenseBreakdown, CashRunway } from './AgingRunway';
import type {
  DashboardBreakpoint,
  DashboardLayoutItem,
  DashboardLayouts,
} from '@/lib/dashboard-layout';

export type DashboardModule =
  | 'Finance'
  | 'HR'
  | 'Payroll'
  | 'Sales'
  | 'Banking'
  | 'Tax'
  | 'AI'
  | 'Support';

export const DASHBOARD_MODULES: DashboardModule[] = [
  'Finance',
  'HR',
  'Payroll',
  'Sales',
  'Banking',
  'Tax',
  'AI',
  'Support',
];

export interface DashboardCard {
  id: string;
  title: string;
  description: string;
  module: DashboardModule;
  defaultVisible: boolean;
  render: () => React.ReactNode;
}

export const DASHBOARD_CARDS: DashboardCard[] = [
  {
    id: 'kpi',
    title: 'Key Metrics',
    description: 'Setup progress and headline KPIs for your business at a glance.',
    module: 'Finance',
    defaultVisible: true,
    render: () => <KpiStrip />,
  },
  {
    id: 'cashflow',
    title: 'Cash Flow Overview',
    description: 'Inflow vs. outflow trends with switchable finance views.',
    module: 'Finance',
    defaultVisible: true,
    render: () => <CashFlowOverview />,
  },
  {
    id: 'insights',
    title: 'AI Insights',
    description: 'AI-generated recommendations and risks across your data.',
    module: 'AI',
    defaultVisible: true,
    render: () => <AiInsights />,
  },
  {
    id: 'hr-attendance',
    title: 'Attendance Summary',
    description: "Today's attendance, late arrivals and absences.",
    module: 'HR',
    defaultVisible: true,
    render: () => <HrAttendance />,
  },
  {
    id: 'hr-employees',
    title: 'Employee Overview',
    description: 'Headcount, new joiners and active employees this month.',
    module: 'HR',
    defaultVisible: true,
    render: () => <HrEmployees />,
  },
  {
    id: 'hr-leave',
    title: 'Leave Requests',
    description: 'Pending leave approvals awaiting your action.',
    module: 'HR',
    defaultVisible: true,
    render: () => <LeaveRequests />,
  },
  {
    id: 'hr-workforce',
    title: "Today's Workforce",
    description: 'Workforce composition split by employment type.',
    module: 'HR',
    defaultVisible: true,
    render: () => <Workforce />,
  },
  {
    id: 'hr-events',
    title: 'Upcoming Events',
    description: 'Birthdays, anniversaries and HR calendar events.',
    module: 'HR',
    defaultVisible: true,
    render: () => <UpcomingEvents />,
  },
  {
    id: 'invoice',
    title: 'Invoice Overview',
    description: 'Invoice status breakdown across sales & receivables.',
    module: 'Sales',
    defaultVisible: true,
    render: () => <InvoiceOverview />,
  },
  {
    id: 'transactions',
    title: 'Recent Transactions',
    description: 'Latest movements across your ledger accounts.',
    module: 'Banking',
    defaultVisible: true,
    render: () => <RecentTransactions />,
  },
  {
    id: 'bank-balances',
    title: 'Bank Balances',
    description: 'Connected bank accounts and total available balance.',
    module: 'Banking',
    defaultVisible: true,
    render: () => <BankBalances />,
  },
  {
    id: 'support-tickets',
    title: 'Open Support Tickets',
    description: 'Open tickets ranked by SLA priority.',
    module: 'Support',
    defaultVisible: true,
    render: () => <SupportTickets />,
  },
  {
    id: 'activity-feed',
    title: 'Activity Feed',
    description: 'Recent audit events and account activity.',
    module: 'Support',
    defaultVisible: true,
    render: () => <ActivityFeed />,
  },
  {
    id: 'top-customers',
    title: 'Top Customers',
    description: 'Your highest-value customers this month.',
    module: 'Sales',
    defaultVisible: true,
    render: () => <TopCustomers />,
  },
  {
    id: 'top-products',
    title: 'Top Products',
    description: 'Best-selling products by revenue this month.',
    module: 'Sales',
    defaultVisible: true,
    render: () => <TopProducts />,
  },
  {
    id: 'approval-center',
    title: 'Approval Center',
    description: 'Items waiting in your approval workflow.',
    module: 'Finance',
    defaultVisible: true,
    render: () => <ApprovalCenter />,
  },
  {
    id: 'health-snapshot',
    title: 'Expense & Cash Health',
    description: 'Fast snapshot of expense, cash and health score.',
    module: 'Finance',
    defaultVisible: true,
    render: () => <HealthSnapshot />,
  },
  {
    id: 'profit-loss',
    title: 'Profit & Loss',
    description: 'Revenue, expense and net profit on an accrual basis.',
    module: 'Finance',
    defaultVisible: true,
    render: () => <ProfitLossGraph />,
  },
  {
    id: 'income-expense',
    title: 'Income vs Expense',
    description: 'Monthly comparison of income against expense.',
    module: 'Finance',
    defaultVisible: true,
    render: () => <IncomeExpenseGraph />,
  },
  {
    id: 'payroll-snapshot',
    title: 'Payroll Snapshot',
    description: 'Payroll run cost, headcount and salary breakdown.',
    module: 'Payroll',
    defaultVisible: true,
    render: () => <PayrollSnapshot />,
  },
  {
    id: 'tax-snapshot',
    title: 'Tax Center Snapshot',
    description: 'Tax liabilities and upcoming compliance due dates.',
    module: 'Tax',
    defaultVisible: true,
    render: () => <TaxCenterSnapshot />,
  },
  {
    id: 'ar-aging',
    title: 'A/R Aging',
    description: 'Receivables aged by due date bucket.',
    module: 'Finance',
    defaultVisible: true,
    render: () => <ArAging />,
  },
  {
    id: 'ap-aging',
    title: 'A/P Aging',
    description: 'Payables aged by due date bucket.',
    module: 'Finance',
    defaultVisible: true,
    render: () => <ApAging />,
  },
  {
    id: 'expense-breakdown',
    title: 'Expense Breakdown',
    description: 'Where your spend is going, by category.',
    module: 'Finance',
    defaultVisible: true,
    render: () => <ExpenseBreakdown />,
  },
  {
    id: 'cash-runway',
    title: 'Cash Runway',
    description: 'Forecast runway, monthly burn and trend.',
    module: 'Finance',
    defaultVisible: true,
    render: () => <CashRunway />,
  },
  {
    id: 'quick',
    title: 'Quick Actions',
    description: 'Shortcuts to the actions you use most often.',
    module: 'Sales',
    defaultVisible: true,
    render: () => <QuickActions />,
  },
];

export const DASHBOARD_CARD_IDS = DASHBOARD_CARDS.map((c) => c.id);

export const getDashboardCard = (id: string) =>
  DASHBOARD_CARDS.find((c) => c.id === id);

/** Grid configuration shared by the layout engine. */
export const GRID_COLS: Record<DashboardBreakpoint, number> = {
  lg: 12,
  md: 12,
  sm: 6,
  xs: 4,
  xxs: 2,
};

export const GRID_BREAKPOINTS: Record<DashboardBreakpoint, number> = {
  lg: 1280,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};

export const GRID_ROW_HEIGHT = 30;
export const GRID_MARGIN: [number, number] = [16, 16];

/**
 * Default desktop (lg) placement, one entry per individual card.
 * Heights are in grid rows (row height = {@link GRID_ROW_HEIGHT}px + margin).
 */
const DEFAULT_LG: DashboardLayoutItem[] = [
  { i: 'kpi', x: 0, y: 0, w: 12, h: 7, minW: 4, minH: 4 },

  { i: 'cashflow', x: 0, y: 7, w: 8, h: 11, minW: 4, minH: 6 },
  { i: 'insights', x: 8, y: 7, w: 4, h: 11, minW: 3, minH: 6 },

  { i: 'hr-attendance', x: 0, y: 18, w: 3, h: 7, minW: 2, minH: 5 },
  { i: 'hr-employees', x: 3, y: 18, w: 3, h: 7, minW: 2, minH: 5 },
  { i: 'hr-leave', x: 6, y: 18, w: 3, h: 7, minW: 2, minH: 5 },
  { i: 'hr-workforce', x: 9, y: 18, w: 3, h: 7, minW: 2, minH: 5 },

  { i: 'hr-events', x: 0, y: 25, w: 4, h: 7, minW: 3, minH: 5 },
  { i: 'invoice', x: 4, y: 25, w: 4, h: 7, minW: 3, minH: 5 },
  { i: 'transactions', x: 8, y: 25, w: 4, h: 7, minW: 3, minH: 5 },

  { i: 'bank-balances', x: 0, y: 32, w: 4, h: 7, minW: 3, minH: 5 },
  { i: 'support-tickets', x: 4, y: 32, w: 4, h: 7, minW: 3, minH: 5 },
  { i: 'activity-feed', x: 8, y: 32, w: 4, h: 7, minW: 3, minH: 5 },

  { i: 'top-customers', x: 0, y: 39, w: 4, h: 8, minW: 3, minH: 5 },
  { i: 'top-products', x: 4, y: 39, w: 4, h: 8, minW: 3, minH: 5 },
  { i: 'approval-center', x: 8, y: 39, w: 4, h: 8, minW: 3, minH: 6 },

  { i: 'health-snapshot', x: 0, y: 47, w: 4, h: 8, minW: 3, minH: 6 },
  { i: 'profit-loss', x: 4, y: 47, w: 4, h: 8, minW: 3, minH: 6 },
  { i: 'income-expense', x: 8, y: 47, w: 4, h: 8, minW: 3, minH: 6 },

  { i: 'payroll-snapshot', x: 0, y: 55, w: 6, h: 9, minW: 4, minH: 6 },
  { i: 'tax-snapshot', x: 6, y: 55, w: 6, h: 9, minW: 4, minH: 6 },

  { i: 'ar-aging', x: 0, y: 64, w: 3, h: 6, minW: 3, minH: 5 },
  { i: 'ap-aging', x: 3, y: 64, w: 3, h: 6, minW: 3, minH: 5 },
  { i: 'expense-breakdown', x: 6, y: 64, w: 3, h: 6, minW: 3, minH: 5 },
  { i: 'cash-runway', x: 9, y: 64, w: 3, h: 6, minW: 3, minH: 5 },

  { i: 'quick', x: 0, y: 72, w: 12, h: 6, minW: 4, minH: 4 },
];

const lgById = new Map(DEFAULT_LG.map((item) => [item.i, item]));

/** Build a single-column stacked layout for narrow breakpoints. */
function buildStacked(cols: number): DashboardLayoutItem[] {
  let y = 0;
  return DASHBOARD_CARD_IDS.map((id) => {
    const base = lgById.get(id)!;
    const item: DashboardLayoutItem = {
      i: id,
      x: 0,
      y,
      w: cols,
      h: base.h,
      minW: cols,
      minH: base.minH,
    };
    y += base.h;
    return item;
  });
}

/** A fresh copy of the default responsive layouts (never mutate the originals). */
export function getDefaultLayouts(): DashboardLayouts {
  return {
    lg: DEFAULT_LG.map((i) => ({ ...i })),
    md: DEFAULT_LG.map((i) => ({ ...i })),
    sm: buildStacked(GRID_COLS.sm),
    xs: buildStacked(GRID_COLS.xs),
    xxs: buildStacked(GRID_COLS.xxs),
  };
}

export function getDefaultVisibility(): Record<string, boolean> {
  return Object.fromEntries(DASHBOARD_CARDS.map((c) => [c.id, c.defaultVisible]));
}
