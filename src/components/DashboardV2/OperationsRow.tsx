'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { dashboardData } from '@/lib/dashboard-data';
import type { RankedItem } from '@/lib/types';
import { Panel, toneByIndex, type Tone } from './primitives';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchActivityFeed,
  fetchSupportTicketOverview,
  fetchTopCustomers,
  fetchTopProducts,
} from '@/app/helpers/backend';

const priorityDot: Record<string, string> = {
  high: 'bg-[#E03137]',
  medium: 'bg-[#F0A541]',
  low: 'bg-[#0BAC24]',
};

const activityDot: Record<string, string> = {
  success: 'bg-[#0BAC24]',
  danger: 'bg-[#E03137]',
  warning: 'bg-[#F0A541]',
  info: 'bg-[#3462FA]',
};

export function SupportTickets() {
  const { data, isPending, isError } = useFetch(
    ['supportTicketOverview'],
    fetchSupportTicketOverview
  );

  const tickets = data?.supportTickets ?? [];
  const isEmpty = !isPending && !isError && tickets.length === 0;

  return (
    <Panel
      title="Open Support Tickets"
      actionHref="/dashboard/support"
      eyebrow="SLA priority"
      action="View all"
      tone="rose"
    >
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-6 w-16 shrink-0 animate-pulse rounded-full bg-accent_text_black/15" />
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
          <p className="text-sm font-normal text-accent_text_black/50">No open tickets</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-full overflow-y-auto">
          {tickets.map((ticket: any) => (
            <div key={ticket.code} className="flex items-center gap-3">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-normal text-accent_text_black/70">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${priorityDot[ticket.priority.toLowerCase()]}`}
                />
                {ticket.priority}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-normal text-accent_text_black">
                  {ticket.title}
                </strong>
                <small className="block text-xs font-normal text-accent_text_black/60">
                  {ticket.code} • {ticket.age}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function ActivityFeed() {
  const { data, isPending, isError } = useFetch(['activityFeed'], fetchActivityFeed);

  const activity = data?.activityFeed ?? [];
  const isEmpty = !isPending && !isError && activity.length === 0;

  return (
    <Panel title="Activity Feed" eyebrow="Audit events" tone="cyan">
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent_text_black/15" />
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
              <div className="h-3 w-14 shrink-0 animate-pulse rounded bg-accent_text_black/15" />
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
          <p className="text-sm font-normal text-accent_text_black/50">No recent activity</p>
        </div>
      ) : (
        <div className="max-h-full space-y-3 overflow-y-auto">
          {activity.map((item: any) => (
            <div key={item?.title} className="flex items-start gap-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${activityDot[item?.type]}`} />
              <div className="min-w-0 flex-1">
                <strong className="block text-sm font-normal leading-snug text-accent_text_black">
                  {item?.title}
                </strong>
                <small className="block text-xs font-normal text-accent_text_black/60">
                  {item?.meta}
                </small>
              </div>
              {item?.amount && (
                <em className="shrink-0 text-sm font-normal not-italic text-accent_text_black">
                  {item?.amount}
                </em>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function RankedList({
  isPending,
  isError,
  title,
  action,
  actionHref,
  items,
  tone,
}: {
  isPending?: boolean;
  isError?: boolean;
  title: string;
  action: string;
  actionHref?: string;
  items: RankedItem[];
  tone: Tone;
}) {
  const isEmpty = !isPending && !isError && (!items || items.length === 0);

  return (
    <Panel title={title} eyebrow="This month" action={action} actionHref={actionHref} tone={tone}>
      {isPending ? (
        <div className="space-y-3.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-accent_text_black/15" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="h-3 animate-pulse rounded bg-accent_text_black/15"
                    style={{ width: `${45 + ((i * 13) % 30)}%` }}
                  />
                  <div className="h-3 w-14 shrink-0 animate-pulse rounded bg-accent_text_black/15" />
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent_text_black/10">
                  <div
                    className="h-full animate-pulse rounded-full bg-accent_text_black/20"
                    style={{ width: `${30 + ((i * 19) % 50)}%` }}
                  />
                </div>
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
          <p className="text-sm font-normal text-accent_text_black/50">No data found</p>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-full overflow-y-auto">
          {items.map((item, index) => (
            <div key={item.name} className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-normal ${toneByIndex(index)}`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <strong className="truncate text-sm font-normal text-accent_text_black">
                    {item.name}
                  </strong>
                  <em className="shrink-0 text-sm font-normal not-italic text-accent_text_black">
                    {item.value}
                  </em>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#F1F2F6]">
                  <span
                    className="block h-full rounded-full bg-[#6B5CE7]"
                    style={{ width: `${item.percent || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function TopCustomers() {
  const { data, isPending, isError } = useFetch(['topCustomers'], fetchTopCustomers);
  return (
    <RankedList
      isPending={isPending}
      isError={isError}
      title="Top Customers"
      actionHref="/dashboard/sales/customers"
      action="Customers"
      items={data?.topCustomers ?? []}
      tone="purple"
    />
  );
}

export function TopProducts() {
  const { data, isPending, isError } = useFetch(['topProducts'], fetchTopProducts);
  return (
    <RankedList
      title="Top Products"
      actionHref="/dashboard/sales/product_services"
      action="Products"
      isPending={isPending}
      isError={isError}
      items={data?.topProducts ?? []}
      tone="orange"
    />
  );
}

export default function OperationsRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      <SupportTickets />
      <ActivityFeed />
      <RankedList
        title="Top Customers"
        action="Customers"
        items={dashboardData.topCustomers}
        tone="purple"
      />
      <RankedList
        title="Top Products"
        action="Products"
        items={dashboardData.topProducts}
        tone="orange"
      />
    </div>
  );
}
