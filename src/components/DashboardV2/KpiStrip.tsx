'use client';

import React, { useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Gauge,
  Loader2,
  Package,
  ReceiptText,
  Sparkles,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { dashboardData } from '@/lib/dashboard-data';
import type { KpiMetric } from '@/lib/types';
import { CARD_TONE, TONE_ICON, TrendText, type Tone } from './primitives';
import { useFetch } from '@/app/helpers/hooks';
import { fetchKPIData } from '@/app/helpers/backend';

const kpiIcons: Record<string, React.ReactNode> = {
  revenue: <CalendarDays size={18} />,
  cash: <WalletCards size={18} />,
  ar: <FileText size={18} />,
  ap: <CircleDollarSign size={18} />,
  payroll: <WalletCards size={18} />,
  tax: <ReceiptText size={18} />,
  inventory: <Package size={18} />,
  profit: <TrendingUp size={18} />,
  attendance: <Gauge size={18} />,
};

function KpiCard({ item }: { item: KpiMetric }) {
  return (
    <button
      className={`group flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${CARD_TONE[item.tone as Tone] ?? CARD_TONE.purple}`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white  ${TONE_ICON[item.tone as Tone] ?? TONE_ICON.purple}`}
      >
        {kpiIcons[item.id] ?? <Activity size={18} />}
      </div>
      <div className="w-full">
        <p className="truncate text-xs font-normal text-accent_text_black/60">{item.title}</p>
        <p className="mt-1 truncate text-base font-normal tracking-tight text-accent_text_black">
          {item.value}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <TrendText trend={item.trend} trendDirection={item.trendDirection} />
          <span className="truncate text-[11px] font-normal text-accent_text_black/60 capitalize">
            {item.helper}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function KpiStrip() {
  const { data, isPending, error, isError } = useFetch(['kpis-data'], fetchKPIData);
  const syncTime = useMemo(
    () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    []
  );

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E6E1FB] bg-gradient-to-r from-[#F3F0FF] via-[#EEF4FF] to-[#EAF7FF] p-5 shadow-[0_2px_8px_rgba(16,24,40,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <strong className="text-sm font-normal text-accent_text_black">
            Getting started with Pilucent
          </strong>
          <p className="mt-0.5 text-xs font-normal text-accent_text_black/60">
            4 of 7 tasks completed
          </p>
        </div>
        <div className="flex items-center gap-4 sm:flex-1 sm:justify-end">
          <div className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[#F1F2F6]">
            <span className="block h-full rounded-full bg-[#6B5CE7]" style={{ width: '57%' }} />
          </div>
          <button className="shrink-0 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-xs font-normal text-accent_text_black shadow-sm transition-transform hover:scale-[1.03]">
            Continue setup
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
        {isPending ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-start gap-3 rounded-2xl border border-white bg-white/70 p-4"
            >
              <div className="h-10 w-10 animate-pulse rounded-xl bg-accent_text_black/10" />
              <div className="w-full space-y-2">
                <div
                  className="h-2.5 animate-pulse rounded bg-accent_text_black/15"
                  style={{ width: `${55 + ((i * 11) % 30)}%` }}
                />
                <div className="h-4 w-3/4 animate-pulse rounded bg-accent_text_black/20" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-accent_text_black/10" />
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="col-span-full flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl bg-white/70">
            <AlertCircle size={22} className="text-[#E03137]" />
            <p className="text-sm font-normal text-accent_text_black/60">Something went wrong</p>
          </div>
        ) : data?.kpis?.length === 0 ? (
          <div className="col-span-full flex h-40 w-full items-center justify-center rounded-2xl bg-white/60">
            <p className="text-sm font-normal text-accent_text_black/50">No data found</p>
          </div>
        ) : (
          data?.kpis?.map((kpi: KpiMetric) => <KpiCard item={kpi} key={kpi.id} />)
        )}
      </div>

      <div className="flex items-center gap-2 px-1 text-xs font-normal text-accent_text_black/45">
        <Sparkles size={14} className="shrink-0 text-[#6B5CE7]" />
        <span className="line-clamp-1">
          Snapshot updated at {syncTime}. Values respect company, date range, branch, currency and
          role permissions.
        </span>
      </div>
    </div>
  );
}
