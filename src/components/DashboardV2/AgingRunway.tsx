'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Cell, Pie, PieChart, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { dashboardData } from '@/lib/dashboard-data';
import type { AgingBucket } from '@/lib/types';
import { chartColor, gradientDefs, LegendList, Panel, type Tone } from './primitives';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchAPAging,
  fetchARAging,
  fetchCashRunway,
  fetchExpenseBreakdown,
} from '@/app/helpers/backend';

function DonutCard({
  title,
  action,
  data,
  isPending,
  isError,
  centerValue,
  centerLabel,
  tone,
  gradPrefix,
}: {
  title: string;
  action: string;
  data: AgingBucket[];
  isPending?: boolean;
  isError?: boolean;
  centerValue: string;
  centerLabel: string;
  tone: Tone;
  gradPrefix: string;
}) {
  const isEmpty = !isPending && !isError && data.length === 0;

  return (
    <Panel title={title} eyebrow="By due date" action={action} tone={tone}>
      {isPending ? (
        <div className="flex items-center gap-4">
          <div className="relative h-[124px] w-[124px] shrink-0 animate-pulse rounded-full bg-accent_text_black/10">
            <div className="absolute inset-[22px] rounded-full bg-white/80" />
          </div>
          <div className="flex-1 space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent_text_black/15" />
                <div
                  className="h-2.5 flex-1 animate-pulse rounded bg-accent_text_black/10"
                  style={{ maxWidth: `${55 + ((i * 17) % 35)}%` }}
                />
                <div className="h-2.5 w-10 animate-pulse rounded bg-accent_text_black/15" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/60">
          <AlertCircle size={20} className="text-[#E03137]" />
          <p className="text-sm font-normal text-accent_text_black/60">Something went wrong</p>
        </div>
      ) : isEmpty ? (
        <div className="flex h-32 w-full items-center justify-center rounded-xl bg-white/60">
          <p className="text-sm font-normal text-accent_text_black/50">No data found</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative h-[124px] w-[124px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {gradientDefs(gradPrefix)}
                <Pie
                  data={data}
                  dataKey="amount"
                  innerRadius={42}
                  outerRadius={60}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.name} fill={`url(#${gradPrefix}-${index % 6})`} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <strong className="text-sm font-normal text-accent_text_black">{centerValue}</strong>
              <span className="text-[10px] font-normal text-accent_text_black/45">
                {centerLabel}
              </span>
            </div>
          </div>
          <LegendList
            items={data.map((i, index) => ({
              name: i.name,
              value: i.label,
              color: chartColor(index),
            }))}
          />
        </div>
      )}
    </Panel>
  );
}

export function ArAging() {
  const { data, isPending, isError } = useFetch(['arAging-data'], fetchARAging);
  const { arAging } = data ?? {};
  return (
    <DonutCard
      title="A/R Aging"
      action="View AR"
      isPending={isPending}
      isError={isError}
      data={arAging ?? []}
      centerValue="$229K"
      centerLabel="Total"
      tone="blue"
      gradPrefix="ar"
    />
  );
}

export function ApAging() {
  const { data, isPending, isError } = useFetch(['apAging-data'], fetchAPAging);
  const { apAging } = data ?? {};
  return (
    <DonutCard
      title="A/P Aging"
      action="View AP"
      isPending={isPending}
      isError={isError}
      data={apAging ?? []}
      centerValue="$148K"
      centerLabel="Total"
      tone="orange"
      gradPrefix="ap"
    />
  );
}

export function ExpenseBreakdown() {
  const { data, isPending, isError } = useFetch(['expenseBreakdown-data'], fetchExpenseBreakdown);
  const { expenseBreakdown } = data ?? {};
  return (
    <DonutCard
      title="Expense Breakdown"
      action="Expenses"
      isPending={isPending}
      isError={isError}
      data={expenseBreakdown ?? []}
      centerValue="$32.6K"
      centerLabel="Expense"
      tone="rose"
      gradPrefix="exp"
    />
  );
}

export function CashRunway() {
  const { data, isPending, isError } = useFetch(['cashRunway-data'], fetchCashRunway);
  const { months, untilDate, radialValue, monthlyBurn, burnPercent } = data ?? {};
  const isEmpty = !isPending && !isError && !months;
  const radial = [{ name: 'Runway', value: radialValue ?? 0, fill: 'url(#runGrad)' }];

  return (
    <Panel title="Cash Runway" eyebrow="Forecast" action="Cash flow" tone="green">
      {isPending ? (
        <>
          <div className="-mt-4 flex flex-col items-center gap-2 text-center">
            <div className="h-5 w-24 animate-pulse rounded bg-accent_text_black/20" />
            <div className="h-3 w-32 animate-pulse rounded bg-accent_text_black/10" />
          </div>
          <div className="mx-auto mt-1 h-[80px] w-full max-w-[180px] animate-pulse rounded-t-full bg-accent_text_black/10" />
          <div className="rounded-xl bg-white/60 p-3">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-20 animate-pulse rounded bg-accent_text_black/15" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-accent_text_black/15" />
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
          <p className="text-sm font-normal text-accent_text_black/50">No cash runway data found</p>
        </div>
      ) : (
        <>
          <div className="-mt-4 text-center">
            <strong className="block text-lg font-normal text-accent_text_black">{months}</strong>
            <span className="text-xs font-normal text-accent_text_black/60">{untilDate}</span>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <RadialBarChart
              cx="50%"
              cy="80%"
              innerRadius="78%"
              outerRadius="100%"
              barSize={14}
              data={radial}
              startAngle={180}
              endAngle={0}
            >
              <defs>
                <linearGradient id="runGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
              </defs>
              <RadialBar dataKey="value" cornerRadius={20} background={{ fill: '#EEF1F4' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="rounded-xl bg-white/60 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-normal text-accent_text_black/60">Monthly burn</span>
              <strong className="font-normal text-accent_text_black">{monthlyBurn}</strong>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white">
              <span
                className="block h-full rounded-full bg-[#6B5CE7]"
                style={{ width: `${burnPercent ?? 0}%` }}
              />
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

export default function AgingRunway() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      <DonutCard
        title="A/R Aging"
        action="View AR"
        data={dashboardData.arAging}
        centerValue="$229K"
        centerLabel="Total"
        tone="blue"
        gradPrefix="ar"
      />
      <DonutCard
        title="A/P Aging"
        action="View AP"
        data={dashboardData.apAging}
        centerValue="$148K"
        centerLabel="Total"
        tone="orange"
        gradPrefix="ap"
      />
      <DonutCard
        title="Expense Breakdown"
        action="Expenses"
        data={dashboardData.expenseBreakdown}
        centerValue="$32.6K"
        centerLabel="Expense"
        tone="rose"
        gradPrefix="exp"
      />
      <CashRunway />
    </div>
  );
}
