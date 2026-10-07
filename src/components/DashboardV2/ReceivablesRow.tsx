'use client';

import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { AlertCircle, Banknote } from 'lucide-react';
import { dashboardData } from '@/lib/dashboard-data';
import { chartColor, gradientDefs, LegendList, Panel, toneByIndex } from './primitives';
import {
  fetchBankBalances,
  fetchInvoiceDashboardOverview,
  fetchRecentTransactions,
} from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import moment from 'moment';

export function InvoiceOverview() {
  const { data, isPending, isError } = useFetch(
    ['invoiceDashboardOverview'],
    fetchInvoiceDashboardOverview
  );

  const invoices = data?.invoices ?? [];
  const total = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(invoices.reduce((sum: number, item: any) => sum + Number(item.amount), 0));
  const isEmpty = !isPending && !isError && invoices.length === 0;

  return (
    <Panel
      title="Invoice Overview"
      actionHref="/dashboard/sales/all_sales"
      eyebrow="Sales & receivables"
      action="Invoices"
      tone="purple"
    >
      {isPending ? (
        <div className="flex items-center gap-4">
          <div className="relative h-[120px] w-[120px] shrink-0 animate-pulse rounded-full bg-accent_text_black/10">
            <div className="absolute inset-[20px] rounded-full bg-white/80" />
          </div>
          <div className="flex-1 space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
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
      ) : isError ? (
        <div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/60">
          <AlertCircle size={20} className="text-[#E03137]" />
          <p className="text-sm font-normal text-accent_text_black/60">Something went wrong</p>
        </div>
      ) : isEmpty ? (
        <div className="flex h-32 w-full items-center justify-center rounded-xl bg-white/60">
          <p className="text-sm font-normal text-accent_text_black/50">No invoices found</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative h-[120px] w-[120px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {gradientDefs('inv')}
                <Pie
                  data={invoices}
                  innerRadius={40}
                  outerRadius={56}
                  paddingAngle={2}
                  dataKey="amount"
                  stroke="none"
                >
                  {invoices.map((entry: any, index: number) => (
                    <Cell key={entry.name} fill={`url(#inv-${index % 6})`} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <strong className="text-xs font-normal text-accent_text_black">{total}</strong>
              <span className="text-[10px] font-normal text-accent_text_black/45">Total</span>
            </div>
          </div>
          <LegendList
            items={invoices.map((i: any, index: number) => ({
              name: i.name,
              value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                i.amount
              ),
              color: chartColor(index),
            }))}
          />
        </div>
      )}
    </Panel>
  );
}

export function RecentTransactions() {
  const { data, isPending, isError } = useFetch(['recentTransactions'], fetchRecentTransactions);

  const transactions = data?.recentTransactions ?? [];
  const isEmpty = !isPending && !isError && transactions.length === 0;

  return (
    <Panel
      title="Recent Transactions"
      eyebrow="Latest ledger movement"
      // action="View all"
      tone="green"
    >
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent_text_black/15" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div
                  className="h-3 animate-pulse rounded bg-accent_text_black/15"
                  style={{ width: `${55 + ((i * 13) % 30)}%` }}
                />
                <div
                  className="h-2.5 animate-pulse rounded bg-accent_text_black/10"
                  style={{ width: `${40 + ((i * 7) % 25)}%` }}
                />
              </div>
              <div className="space-y-1.5 text-right">
                <div className="ml-auto h-3 w-16 animate-pulse rounded bg-accent_text_black/15" />
                <div className="ml-auto h-2.5 w-12 animate-pulse rounded bg-accent_text_black/10" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/60">
          <AlertCircle size={20} className="text-[#E03137]" />
          <p className="text-sm font-normal text-accent_text_black/60">Something went wrong</p>
        </div>
      ) : isEmpty ? (
        <div className="flex h-32 w-full items-center justify-center rounded-xl bg-white/60">
          <p className="text-sm font-normal text-accent_text_black/50">No recent transactions</p>
        </div>
      ) : (
        <div className="max-h-full space-y-3 overflow-y-auto pr-1">
          {transactions.map((tx: any) => (
            <div key={tx.title + tx.meta} className="flex items-center gap-3">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  tx.direction === 'in' ? 'bg-[#0BAC24]' : 'bg-[#E03137]'
                }`}
              />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-normal text-accent_text_black">
                  {tx.title}
                </strong>
                <span className="block truncate text-xs font-normal text-accent_text_black/60">
                  {tx.meta}
                </span>
              </div>
              <div className="text-right">
                <em className="block text-sm font-normal not-italic text-accent_text_black">
                  {tx.amount}
                </em>
                <time className="text-[11px] font-normal text-accent_text_black/45">{tx.date}</time>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function BankBalances() {
  const { data, isPending, isError } = useFetch(['bankBalances'], fetchBankBalances);
  const bankAccounts = data?.bankAccounts ?? [];
  const isEmpty = !isPending && !isError && bankAccounts.length === 0;
  const total = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(
    bankAccounts.reduce(
      (sum: number, item: any) => sum + Number(item?.amount?.slice(1, -1).replace(/,/g, '')),
      0
    )
  );

  return (
    <Panel
      title="Bank Balances"
      actionHref="/dashboard/transactions/chart-of-accounts"
      eyebrow="Primary ledger balance"
      action="View all"
      tone="blue"
    >
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-accent_text_black/15" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div
                  className="h-3 animate-pulse rounded bg-accent_text_black/15"
                  style={{ width: `${55 + ((i * 13) % 30)}%` }}
                />
                <div
                  className="h-2.5 animate-pulse rounded bg-accent_text_black/10"
                  style={{ width: `${40 + ((i * 7) % 25)}%` }}
                />
              </div>
              <div className="h-3 w-16 shrink-0 animate-pulse rounded bg-accent_text_black/15" />
            </div>
          ))}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/60 px-4 py-3">
            <div className="h-3 w-24 animate-pulse rounded bg-accent_text_black/10" />
            <div className="h-3 w-20 animate-pulse rounded bg-accent_text_black/15" />
          </div>
        </div>
      ) : isError ? (
        <div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/60">
          <AlertCircle size={20} className="text-[#E03137]" />
          <p className="text-sm font-normal text-accent_text_black/60">Something went wrong</p>
        </div>
      ) : isEmpty ? (
        <div className="flex h-32 w-full items-center justify-center rounded-xl bg-white/60">
          <p className="text-sm font-normal text-accent_text_black/50">No bank accounts</p>
        </div>
      ) : (
        <div className="max-h-full space-y-3 overflow-y-auto pr-1">
          <div className="max-h-full space-y-3">
            {bankAccounts.map((bank: any, index: number) => (
              <div key={bank.name} className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneByIndex(index + 2)}`}
                >
                  <Banknote size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-normal text-accent_text_black">
                    {bank.name}
                  </strong>
                  <span className="block text-xs font-normal text-accent_text_black/60">
                    {bank.masked} • {bank.sync}
                  </span>
                </div>
                <em className="text-sm font-normal not-italic text-accent_text_black">
                  {bank.amount}
                </em>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/60 px-4 py-3">
            <span className="text-xs font-normal text-accent_text_black/60">Total Balance</span>
            <strong className="text-sm font-normal text-accent_text_black">{total}</strong>
          </div>
        </div>
      )}
    </Panel>
  );
}

export default function ReceivablesRow() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:gap-5">
      <InvoiceOverview />
      <RecentTransactions />
      <BankBalances />
    </div>
  );
}
