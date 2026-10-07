'use client';

import React from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import type { Severity } from '@/lib/types';
import { Panel } from './primitives';
import { useFetch } from '@/app/helpers/hooks';
import { fetchInsightsData } from '@/app/helpers/backend';

const severityDot: Record<Severity, string> = {
  critical: 'bg-[#E03137]',
  high: 'bg-[#F0A541]',
  medium: 'bg-[#6B5CE7]',
  low: 'bg-[#3462FA]',
  info: 'bg-[#0BAC24]',
};

function InsightsSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5">
          <span className="mt-0.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent_text_black/15" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div
              className="h-3 animate-pulse rounded bg-accent_text_black/15"
              style={{ width: `${60 + ((i * 13) % 30)}%` }}
            />
            <div
              className="h-2.5 animate-pulse rounded bg-accent_text_black/10"
              style={{ width: `${75 + ((i * 7) % 20)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsError() {
  return (
    <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/60">
      <AlertCircle size={22} className="text-[#E03137]" />
      <p className="text-sm font-normal text-accent_text_black/60">Something went wrong</p>
    </div>
  );
}

function InsightsEmpty() {
  return (
    <div className="flex h-40 w-full items-center justify-center rounded-xl bg-white/60">
      <p className="text-sm font-normal text-accent_text_black/50">No insights found</p>
    </div>
  );
}

export default function AiInsights({ className }: { className?: string }) {
  const { data, isPending, isError } = useFetch(['insights'], fetchInsightsData);

  const insights = data?.insights ?? [];
  const isEmpty = !isPending && !isError && insights.length === 0;

  return (
    <Panel
      title="AI Business Insights"
      eyebrow="Beta"
      // action="View all"
      tone="rose"
      className={`${className} flex flex-col`}
    >
      {isPending ? (
        <InsightsSkeleton />
      ) : isError ? (
        <InsightsError />
      ) : isEmpty ? (
        <InsightsEmpty />
      ) : (
        <div className="flex-1 space-y-1">
          {insights.map((item: any) => (
            <button
              key={item.title}
              className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/60"
            >
              <span
                className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${severityDot[item.severity as Severity]}`}
              />
              <div className="min-w-0 flex-1">
                <strong className="block text-sm font-normal text-accent_text_black">
                  {item.title}
                </strong>
                <span className="block truncate text-xs font-normal text-accent_text_black/60">
                  {item.message}
                </span>
              </div>
              <em className="shrink-0 text-[11px] font-normal not-italic text-accent_text_black/70 opacity-0 transition-opacity group-hover:opacity-100">
                {item.action} →
              </em>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex absolute bottom-4 left-4 right-4 items-start gap-2 rounded-xl bg-white/60 p-3 text-xs font-normal text-accent_text_black/60">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-[#6B5CE7]" />
        <span>
          Your business is performing well. Focus on collecting overdue invoices and managing
          low-stock items.
        </span>
      </div>
    </Panel>
  );
}
