'use client';

import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
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
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchCashFlowChart,
  fetchIncomeVsExpenseChart,
  fetchProfitLossChart,
} from '@/app/helpers/backend';
import { Panel, CustomTooltip } from './primitives';

const TABS = ['Cash Flow', 'Profit & Loss', 'Income vs Expense'] as const;
type Tab = (typeof TABS)[number];

const RANGES = ['7D', '30D', '3M', '12M'] as const;
type Range = (typeof RANGES)[number];

const AXIS_TICK = { fill: 'rgba(19,21,35,0.55)', fontSize: 12 };

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Map a range chip to a `{ start_date, end_date }` window ending today. */
function rangeToDates(range: Range) {
  const end = new Date();
  const start = new Date();
  switch (range) {
    case '7D':
      start.setDate(end.getDate() - 7);
      break;
    case '30D':
      start.setDate(end.getDate() - 30);
      break;
    case '3M':
      start.setMonth(end.getMonth() - 3);
      break;
    case '12M':
      start.setMonth(end.getMonth() - 12);
      break;
  }
  return { start_date: fmt(start), end_date: fmt(end) };
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
        className="flex w-full items-end gap-3 overflow-hidden rounded-xl bg-white/60 p-4"
        style={{ height }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
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

export default function CashFlowOverview({ className }: { className?: string }) {
  const [tab, setTab] = useState<Tab>('Cash Flow');
  const [range, setRange] = useState<Range>('30D');

  const { start_date, end_date } = useMemo(() => rangeToDates(range), [range]);

  const { data, isPending, isError } = useFetch(
    ['dashboard-cashflow-chart', tab, start_date, end_date],
    () => {
      const params = { start_date, end_date };
      if (tab === 'Profit & Loss') return fetchProfitLossChart({ params });
      if (tab === 'Income vs Expense') return fetchIncomeVsExpenseChart({ params });
      return fetchCashFlowChart({ params });
    }
  );

  const cashFlow = data?.cashFlow ?? [];
  const profitLoss = data?.profitLoss ?? [];
  const incomeVsExpense = data?.incomeVsExpense ?? [];

  const activeData =
    tab === 'Profit & Loss' ? profitLoss : tab === 'Income vs Expense' ? incomeVsExpense : cashFlow;
  const isEmpty = !isPending && !isError && activeData.length === 0;

  const chartHeight = 325;

  return (
    <Panel
      title="Cash Flow Overview"
      eyebrow="Finance analytics"
      action="Open report"
      tone="purple"
      className={className}
      actionHref='/dashboard/reports'
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg bg-white/60 p-1">
          {TABS.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-normal transition-colors',
                tab === item ? 'bg-white text-accent_text_black shadow-sm' : 'text-accent_text_black/60'
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1 rounded-lg bg-white/60 p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-normal transition-colors',
                range === r ? 'bg-white text-accent_text_black shadow-sm' : 'text-accent_text_black/60'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ChartState isPending={isPending} isError={isError} isEmpty={isEmpty} height={chartHeight}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          {tab === 'Cash Flow' ? (
            <AreaChart data={cashFlow} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="v2Inflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6D5DE7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6D5DE7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="v2Outflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="v2InflowStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B7CF6" />
                  <stop offset="100%" stopColor="#6D5DE7" />
                </linearGradient>
                <linearGradient id="v2OutflowStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB7185" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEBFA" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={AXIS_TICK}
                tickFormatter={(value) => `$${Number(value) / 1000}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
                payload={[
                  { value: 'Cash Inflow', type: 'circle', id: 'inflow', color: '#6D5DE7' },
                  { value: 'Cash Outflow', type: 'circle', id: 'outflow', color: '#F43F5E' },
                ]}
              />
              <Area
                type="monotone"
                dataKey="inflow"
                name="Cash Inflow"
                stroke="url(#v2InflowStroke)"
                strokeWidth={3}
                fill="url(#v2Inflow)"
                activeDot={{ r: 6, fill: '#6D5DE7', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="outflow"
                name="Cash Outflow"
                stroke="url(#v2OutflowStroke)"
                strokeWidth={3}
                fill="url(#v2Outflow)"
                activeDot={{ r: 6, fill: '#F43F5E', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : tab === 'Profit & Loss' ? (
            <ComposedChart data={profitLoss} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                wrapperStyle={{ fontSize: 12 }}
                payload={[
                  { value: 'Revenue', type: 'circle', id: 'revenue', color: '#6D5DE7' },
                  { value: 'Expense', type: 'circle', id: 'expenses', color: '#F59E0B' },
                  { value: 'Net Profit', type: 'circle', id: 'profit', color: '#10B981' },
                ]}
              />
              <Bar dataKey="revenue" name="Revenue" fill="url(#plRevenue)" radius={[8, 8, 0, 0]} barSize={18} />
              <Bar dataKey="expenses" name="Expense" fill="url(#plExpense)" radius={[8, 8, 0, 0]} barSize={18} />
              <Line
                type="monotone"
                dataKey="profit"
                name="Net Profit"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10B981' }}
              />
            </ComposedChart>
          ) : (
            <BarChart data={incomeVsExpense} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                wrapperStyle={{ fontSize: 12 }}
                payload={[
                  { value: 'Income', type: 'circle', id: 'income', color: '#6D5DE7' },
                  { value: 'Expense', type: 'circle', id: 'expenses', color: '#F43F5E' },
                ]}
              />
              <Bar dataKey="income" name="Income" fill="url(#ieIncome)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" name="Expense" fill="url(#ieExpense)" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </ChartState>
    </Panel>
  );
}
