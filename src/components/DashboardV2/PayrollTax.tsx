'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import { chartColor, CustomTooltip, gradientDefs, LegendList, Panel } from './primitives';
import { useFetch } from '@/app/helpers/hooks';
import { fetchPayrollSnapshot, fetchTaxCenterSnapshot } from '@/app/helpers/backend';

export function PayrollSnapshot() {
  const { data, isPending, isError } = useFetch(['payrollSnapshot-data'], fetchPayrollSnapshot);
  const payrollBreakdown = data?.payroll ?? [];
  const total = payrollBreakdown.reduce(
    (sum: number, item: { value: number }) => sum + item.value,
    0
  );
  const isEmpty = !isPending && !isError && payrollBreakdown.length === 0;

  return (
    <Panel title="Payroll Snapshot" eyebrow="May 2025" action="Run Payroll" tone="purple">
      {isPending ? (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white/60 p-3">
                <div className="h-2.5 w-16 animate-pulse rounded bg-accent_text_black/15" />
                <div className="mt-2 h-4 w-14 animate-pulse rounded bg-accent_text_black/20" />
                <div className="mt-2 h-2.5 w-10 animate-pulse rounded bg-accent_text_black/10" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-[140px] w-[140px] shrink-0 animate-pulse rounded-full bg-accent_text_black/10">
              <div className="absolute inset-[24px] rounded-full bg-white/80" />
            </div>
            <div className="flex-1 space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent_text_black/15" />
                  <div
                    className="h-2.5 flex-1 animate-pulse rounded bg-accent_text_black/10"
                    style={{ maxWidth: `${55 + ((i * 17) % 35)}%` }}
                  />
                  <div className="h-2.5 w-8 animate-pulse rounded bg-accent_text_black/15" />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : isError ? (
        <div className="flex h-52 w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/60">
          <AlertCircle size={22} className="text-[#E03137]" />
          <p className="text-sm font-normal text-accent_text_black/60">Something went wrong</p>
        </div>
      ) : isEmpty ? (
        <div className="flex h-52 w-full items-center justify-center rounded-xl bg-white/60">
          <p className="text-sm font-normal text-accent_text_black/50">No payroll data found</p>
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Total Cost', value: '$18,560', helper: '+12.4%' },
              { label: 'Employees Paid', value: '24', helper: '+4.3%' },
              { label: 'Net Salary', value: '$12,240', helper: '+8.7%' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/60 p-3">
                <span className="block text-[11px] font-normal text-accent_text_black/60">
                  {stat.label}
                </span>
                <strong className="mt-1 block text-sm font-normal text-accent_text_black">
                  {stat.value}
                </strong>
                <small className="text-[11px] font-normal text-accent_text_black/45">
                  {stat.helper}
                </small>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="h-[140px] w-[140px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {gradientDefs('pay')}
                  <Pie
                    data={payrollBreakdown}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {payrollBreakdown.map((entry: { name: string }, index: number) => (
                      <Cell key={entry.name} fill={`url(#pay-${index % 6})`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <LegendList
              items={payrollBreakdown.map((i: { name: string; value: number }, index: number) => ({
                name: i.name,
                value: `${Math.round((i.value / total) * 100)}%`,
                color: chartColor(index),
              }))}
            />
          </div>
        </>
      )}
    </Panel>
  );
}

export function TaxCenterSnapshot() {
  const { data, isPending, isError } = useFetch(['taxCenterSnapshot-data'], fetchTaxCenterSnapshot);
  const taxes = data?.taxes ?? [];
  const isEmpty = !isPending && !isError && taxes.length === 0;

  return (
    <Panel title="Tax Center Snapshot" eyebrow="Compliance risk" action="Tax center" tone="rose">
      {isPending ? (
        <>
          <div className="mb-4 flex items-end justify-between rounded-xl bg-white/60 px-4 py-3">
            <div>
              <div className="h-2.5 w-24 animate-pulse rounded bg-accent_text_black/15" />
              <div className="mt-2 h-5 w-20 animate-pulse rounded bg-accent_text_black/20" />
            </div>
            <div className="h-2.5 w-28 animate-pulse rounded bg-accent_text_black/10" />
          </div>
          <div
            className="flex w-full flex-col justify-center gap-4 rounded-xl bg-white/60 p-4"
            style={{ height: 155 }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-2.5 w-16 shrink-0 animate-pulse rounded bg-accent_text_black/15" />
                <div
                  className="h-5 flex-1 animate-pulse rounded-md bg-accent_text_black/10"
                  style={{ maxWidth: `${45 + ((i * 23) % 40)}%` }}
                />
              </div>
            ))}
          </div>
        </>
      ) : isError ? (
        <div className="flex h-52 w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/60">
          <AlertCircle size={22} className="text-[#E03137]" />
          <p className="text-sm font-normal text-accent_text_black/60">Something went wrong</p>
        </div>
      ) : isEmpty ? (
        <div className="flex h-52 w-full items-center justify-center rounded-xl bg-white/60">
          <p className="text-sm font-normal text-accent_text_black/50">No tax data found</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-end justify-between rounded-xl bg-white/60 px-4 py-3">
            <div>
              <span className="block text-xs font-normal text-accent_text_black/60">
                Total Tax Payable
              </span>
              <strong className="mt-0.5 block text-base font-normal text-accent_text_black">
                {data!.totalTaxPayable}
              </strong>
            </div>
            <small className="text-[11px] font-normal text-accent_text_black/60">
              {data!.nextDueDate}
            </small>
          </div>
          <ResponsiveContainer width="100%" height={155}>
            <BarChart
              data={taxes}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="taxViolet" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B7CF6" />
                  <stop offset="100%" stopColor="#6D5DE7" />
                </linearGradient>
                <linearGradient id="taxAmber" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <linearGradient id="taxEmerald" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(19,21,35,0.65)', fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(107,92,231,0.05)' }} />
              <Bar dataKey="amount" radius={[0, 10, 10, 0]} barSize={22}>
                {taxes.map((entry: { name: string }, index: number) => (
                  <Cell
                    key={entry.name}
                    fill={['url(#taxViolet)', 'url(#taxAmber)', 'url(#taxEmerald)'][index % 3]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </Panel>
  );
}

export default function PayrollTax() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:gap-5">
      <PayrollSnapshot />
      <TaxCenterSnapshot />
    </div>
  );
}
