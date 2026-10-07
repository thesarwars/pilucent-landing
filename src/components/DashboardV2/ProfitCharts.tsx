'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, FileText, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import { dashboardData } from '@/lib/dashboard-data';
import { CustomTooltip, Panel } from './primitives';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchApprovalCenter,
  fetchExpenseCashHealth,
  fetchExpenseHealthSnapshot,
  fetchIncomeVsExpenseChart,
  fetchProfitLoss,
  fetchProfitLossChart,
} from '@/app/helpers/backend';

const AXIS_TICK = { fill: 'rgba(19,21,35,0.55)', fontSize: 11 };

export function ApprovalCenter() {
  const { data, isPending, isError } = useFetch(['approval-center-data'], fetchApprovalCenter);
  const approvals = data?.approval ?? [];
  const transactions = data?.transactions ?? [];
  const isEmpty = !isPending && !isError && approvals.length === 0 && transactions.length === 0;

  return (
    <Panel title="Approval Center" eyebrow="Workflow" tone="blue">
      {isPending ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-xl bg-white/60 p-4">
                <div className="h-5 w-10 animate-pulse rounded bg-accent_text_black/20" />
                <div className="h-2.5 w-16 animate-pulse rounded bg-accent_text_black/15" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-accent_text_black/10" />
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2">
                <div className="h-3.5 w-3.5 shrink-0 animate-pulse rounded bg-accent_text_black/15" />
                <div
                  className="h-2.5 flex-1 animate-pulse rounded bg-accent_text_black/10"
                  style={{ maxWidth: `${55 + ((i * 17) % 35)}%` }}
                />
                <div className="h-2.5 w-14 animate-pulse rounded bg-accent_text_black/15" />
              </div>
            ))}
          </div>
        </>
      ) : isError ? (
        <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/60">
          <AlertCircle size={22} className="text-[#E03137]" />
          <p className="text-sm font-normal text-accent_text_black/60">Something went wrong</p>
        </div>
      ) : isEmpty ? (
        <div className="flex h-40 w-full items-center justify-center rounded-xl bg-white/60">
          <p className="text-sm font-normal text-accent_text_black/50">No approvals</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {approvals.map((item: any) => (
              <div key={item.label} className="rounded-xl bg-white/60 p-4 text-center">
                <strong className="block text-xl font-normal text-accent_text_black">
                  {item.count}
                </strong>
                <span className="block text-xs font-normal text-accent_text_black/60">
                  {item.label}
                </span>
                <em className="mt-1 block text-xs font-normal not-italic text-accent_text_black/70">
                  {item.amount}
                </em>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {transactions.slice(0, 3).map((tx: any) => (
              <div
                key={tx.meta}
                className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-xs"
              >
                <FileText size={14} className="shrink-0 text-[#6B5CE7]" />
                <span className="min-w-0 flex-1 truncate font-normal text-accent_text_black/60">
                  {tx.meta}
                </span>
                <em className="font-normal not-italic text-accent_text_black">
                  {tx.amount.replace('+', '')}
                </em>
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}

function HealthStatTile({
  label,
  value,
  trend,
  trendDirection,
  helper,
  icon,
}: {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  helper: string;
  icon: React.ReactNode;
}) {
  const trendColor =
    trendDirection === 'up'
      ? 'text-[#0BAC24]'
      : trendDirection === 'down'
        ? 'text-[#E03137]'
        : 'text-accent_text_black/60';

  return (
    <div className="rounded-xl bg-white/60 p-4">
      <span className="text-xs font-normal text-accent_text_black/60">{label}</span>
      <strong className="mt-1 block text-base font-normal text-accent_text_black">{value}</strong>
      <small className="text-[11px] font-normal text-accent_text_black/60">
        <span className={`font-normal ${trendColor}`}>{trend}</span> {helper}
      </small>
      <div className="mt-2">{icon}</div>
    </div>
  );
}

export function HealthSnapshot() {
  const { data, isPending, isError } = useFetch(['expenseCashHealth-data'], fetchExpenseCashHealth);

  const isEmpty =
    !isPending &&
    !isError &&
    (!data?.totalExpense?.value || !data?.availableCash?.value);

  const score = Math.max(0, Math.min(100, data?.cashHealthScore?.score ?? 0));

  return (
    <Panel title="Expense & Cash Health" eyebrow="Fast snapshot" action="Detail" tone="green">
      {isPending ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white/60 p-4">
                <div className="h-2.5 w-20 animate-pulse rounded bg-accent_text_black/15" />
                <div className="mt-2 h-5 w-16 animate-pulse rounded bg-accent_text_black/20" />
                <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-accent_text_black/10" />
                <div className="mt-2 h-6 w-6 animate-pulse rounded bg-accent_text_black/15" />
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-white/60 p-3">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-28 animate-pulse rounded bg-accent_text_black/15" />
              <div className="h-2.5 w-8 animate-pulse rounded bg-accent_text_black/15" />
            </div>
            <div className="mt-2 h-1.5 w-full animate-pulse rounded-full bg-accent_text_black/10" />
          </div>
        </>
      ) : isError ? (
        <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/60">
          <AlertCircle size={22} className="text-[#E03137]" />
          <p className="text-sm font-normal text-accent_text_black/60">Something went wrong</p>
        </div>
      ) : isEmpty ? (
        <div className="flex h-40 w-full items-center justify-center rounded-xl bg-white/60">
          <p className="text-sm font-normal text-accent_text_black/50">No data found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <HealthStatTile
              {...data!.totalExpense}
              icon={
                data!.totalExpense.trendDirection === 'down' ? (
                  <TrendingDown size={24} className="text-[#0BAC24]" />
                ) : (
                  <TrendingUp size={24} className="text-[#E03137]" />
                )
              }
            />
            <HealthStatTile
              {...data!.availableCash}
              icon={<WalletCards size={24} className="text-[#0BAC24]" />}
            />
          </div>
          <div className="mt-3 rounded-xl bg-white/60 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-normal text-accent_text_black/60">
                {data!.cashHealthScore.label}
              </span>
              <strong className="font-normal text-accent_text_black">{score}%</strong>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white">
              <span
                className="block h-full rounded-full bg-[#6B5CE7]"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

function ChartState({
  isPending,
  isError,
  isEmpty,
  height,
  children,
}: {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  height: number;
  children: React.ReactNode;
}) {
  if (isPending) {
    return (
      <div
        className="flex w-full items-end gap-2 overflow-hidden rounded-xl bg-white/60 p-4"
        style={{ height }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-md bg-accent_text_black/10"
            style={{ height: `${30 + ((i * 37) % 60)}%` }}
          />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/60"
        style={{ height }}
      >
        <AlertCircle size={22} className="text-[#E03137]" />
        <p className="text-sm font-normal text-accent_text_black/60">Something went wrong</p>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-xl bg-white/60"
        style={{ height }}
      >
        <p className="text-sm font-normal text-accent_text_black/50">No data found</p>
      </div>
    );
  }
  return <>{children}</>;
}

export function ProfitLossGraph() {
  const { data, isPending, isError } = useFetch(['profitLoss-chart-data'], fetchProfitLossChart);
  const profitLoss = data?.profitLoss ?? [];

  const hasValues = profitLoss.some(
    (d: any) => Number(d?.revenue) !== 0 || Number(d?.expenses) !== 0 || Number(d?.profit) !== 0
  );
  const isEmpty = !isPending && !isError && (profitLoss.length === 0 || !hasValues);

  const chartHeight = 230;

  return (
    <Panel title="Profit & Loss" eyebrow="Accrual basis" tone="purple">
      <ChartState isPending={isPending} isError={isError} isEmpty={isEmpty} height={chartHeight}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart data={profitLoss} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="plRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B7CF6" />
                <stop offset="100%" stopColor="#6D5DE7" />
              </linearGradient>
              <linearGradient id="plExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F2F6" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK}
              tickFormatter={(v) => `$${Number(v) / 1000}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 11 }}
              payload={[
                { value: 'Revenue', type: 'circle', id: 'revenue', color: '#6D5DE7' },
                { value: 'Expense', type: 'circle', id: 'expenses', color: '#F59E0B' },
                { value: 'Net Profit', type: 'circle', id: 'profit', color: '#10B981' },
              ]}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="url(#plRevenue)"
              radius={[8, 8, 0, 0]}
              barSize={16}
            />
            <Bar
              dataKey="expenses"
              name="Expense"
              fill="url(#plExpense)"
              radius={[8, 8, 0, 0]}
              barSize={16}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Net Profit"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10B981' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartState>
    </Panel>
  );
}

export function IncomeExpenseGraph() {
  const { data, isPending, isError } = useFetch(
    ['incomeVsExpense-chart-data'],
    fetchIncomeVsExpenseChart
  );
  const incomeVsExpense = data?.incomeVsExpense ?? [];

  const hasValues = incomeVsExpense.some(
    (d: any) => Number(d?.income) !== 0 || Number(d?.expenses) !== 0
  );
  const isEmpty = !isPending && !isError && (incomeVsExpense.length === 0 || !hasValues);

  const chartHeight = 230;

  return (
    <Panel title="Income vs Expense" eyebrow="Monthly comparison" action="Detail" tone="orange">
      <ChartState isPending={isPending} isError={isError} isEmpty={isEmpty} height={chartHeight}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={incomeVsExpense} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="ieIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B7CF6" />
                <stop offset="100%" stopColor="#6D5DE7" />
              </linearGradient>
              <linearGradient id="ieExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#F43F5E" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F2F6" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK}
              tickFormatter={(v) => `$${Number(v) / 1000}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 11 }}
              payload={[
                { value: 'Income', type: 'circle', id: 'income', color: '#6D5DE7' },
                { value: 'Expense', type: 'circle', id: 'expenses', color: '#F43F5E' },
              ]}
            />
            <Bar dataKey="income" name="Income" fill="url(#ieIncome)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" name="Expense" fill="url(#ieExpense)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartState>
    </Panel>
  );
}

export default function ProfitCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      <ApprovalCenter />
      <HealthSnapshot />
      <ProfitLossGraph />
      <IncomeExpenseGraph />
    </div>
  );
}
