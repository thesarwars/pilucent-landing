'use client';

import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { AlertCircle, CalendarHeart, Gift, UserPlus } from 'lucide-react';
import { dashboardData } from '@/lib/dashboard-data';
import type { StatItem } from '@/lib/types';
import { chartColor, gradientDefs, LegendList, Panel, toneByIndex, type Tone } from './primitives';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchAttendanceSummary,
  fetchEmployeeOverview,
  fetchLeaveRequestsOverview,
  fetchUpcomingEvents,
  fetchWorkforceOverview,
} from '@/app/helpers/backend';
import moment from 'moment';

function StatGrid({
  title,
  isPending,
  isError,
  eyebrow,
  action,
  actionHref,
  stats,
  tone,
}: {
  title: string;
  isPending?: boolean;
  isError?: boolean;
  eyebrow: string;
  action?: string;
  actionHref?: string;
  stats: StatItem[];
  tone: Tone;
}) {
  const isEmpty = !isPending && !isError && (!stats || stats.length === 0);

  return (
    <Panel title={title} eyebrow={eyebrow} action={action} tone={tone} actionHref={actionHref}>
      {isPending ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-xl bg-white/60 p-3">
              <div
                className="h-2.5 animate-pulse rounded bg-accent_text_black/15"
                style={{ width: `${55 + ((i * 11) % 30)}%` }}
              />
              <div className="h-4 w-2/3 animate-pulse rounded bg-accent_text_black/20" />
              <div className="h-2 w-1/3 animate-pulse rounded bg-accent_text_black/10" />
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
        <div className="grid grid-cols-2 gap-3">
          {stats?.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/60 p-3">
              <span className="block text-xs font-normal text-accent_text_black/60">
                {stat.label}
              </span>
              <strong className="mt-1 block text-base font-normal text-accent_text_black">
                {stat.value}
              </strong>
              {stat.helper && (
                <small
                  className={`mt-0.5 block text-[11px] font-normal text-accent_text_black/45 ${stat?.helper?.startsWith('+') ? 'text-green-500' : stat?.helper?.startsWith('-') ? 'text-red-500' : 'text-blue-500'}`}
                >
                  {stat.helper}
                </small>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function HrAttendance() {
  const { data, isPending, isError } = useFetch(['attendanceSummary'], fetchAttendanceSummary);
  return (
    <StatGrid
      title="Attendance Summary"
      eyebrow={'Today, ' + moment(new Date()).format('MMMM DD')}
      // action="View report"
      // actionHref="/dashboard/reports"
      stats={data?.attendance}
      isPending={isPending}
      isError={isError}
      tone="green"
    />
  );
}

export function HrEmployees() {
  const { data, isPending, isError } = useFetch(['employeeOverview'], fetchEmployeeOverview);
  return (
    <StatGrid
      title="Employee Overview"
      eyebrow="This month"
      // action="View all"
      // actionHref="/dashboard/reports"
      stats={data?.employees}
      isPending={isPending}
      isError={isError}
      tone="blue"
    />
  );
}

export function LeaveRequests() {
  const { data, isPending, isError } = useFetch(
    ['leaveRequestsOverview'],
    fetchLeaveRequestsOverview
  );

  const requests = data?.leaveRequests ?? [];
  const isEmpty = !isPending && !isError && requests.length === 0;

  return (
    <Panel
      title="Leave Requests"
      actionHref="/dashboard/hris/employee/leave-approval"
      eyebrow="Pending approvals"
      action="Leave center"
      tone="orange"
    >
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-accent_text_black/15" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div
                  className="h-3 animate-pulse rounded bg-accent_text_black/15"
                  style={{ width: `${55 + ((i * 13) % 30)}%` }}
                />
                <div
                  className="h-2.5 animate-pulse rounded bg-accent_text_black/10"
                  style={{ width: `${35 + ((i * 7) % 25)}%` }}
                />
              </div>
              <div className="space-y-1.5 text-right">
                <div className="ml-auto h-2.5 w-14 animate-pulse rounded bg-accent_text_black/10" />
                <div className="ml-auto h-2.5 w-8 animate-pulse rounded bg-accent_text_black/15" />
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
          <p className="text-sm font-normal text-accent_text_black/50">No leave requests</p>
        </div>
      ) : (
        <div className="max-h-full space-y-3 overflow-y-auto pr-1">
          {requests.map((item: any, index: number) => (
            <div key={item.name} className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-normal ${toneByIndex(index)}`}
              >
                {item.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-normal text-accent_text_black">
                  {item.name}
                </strong>
                <span className="block text-xs font-normal text-accent_text_black/60">
                  {item.type}
                </span>
              </div>
              <div className="text-right">
                <em className="block text-[11px] font-normal not-italic text-accent_text_black/45">
                  {item.dates}
                </em>
                <b className="text-xs font-normal text-accent_text_black">{item.days}</b>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function Workforce() {
  const { data, isPending, isError } = useFetch(['workforceOverview'], fetchWorkforceOverview);
  const workforce = data?.workforce ?? [];
  const total = workforce.reduce((sum: number, item: any) => sum + item.value, 0);
  const isEmpty = !isPending && !isError && workforce.length === 0;

  return (
    <Panel
      title="Today's Workforce"
      eyebrow={'Today, ' + moment(new Date()).format('MMMM DD')}
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
          <p className="text-sm font-normal text-accent_text_black/50">No workforce data</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative h-[120px] w-[120px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {gradientDefs('wf')}
                <Pie
                  data={workforce}
                  innerRadius={40}
                  outerRadius={56}
                  dataKey="value"
                  paddingAngle={2}
                  stroke="none"
                >
                  {workforce.map((entry: any, index: number) => (
                    <Cell key={entry.name} fill={`url(#wf-${index % 6})`} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <strong className="text-base font-normal text-accent_text_black">{total}</strong>
              <span className="text-[10px] font-normal text-accent_text_black/45">Employees</span>
            </div>
          </div>
          <LegendList
            items={workforce.map((i: any, index: number) => ({
              name: i.name,
              value: i.value,
              color: chartColor(index),
            }))}
          />
        </div>
      )}
    </Panel>
  );
}

const eventIcons: Record<string, React.ReactNode> = {
  party: <CalendarHeart size={16} />,
  user: <UserPlus size={16} />,
  calendar: <Gift size={16} />,
};

export function UpcomingEvents() {
  const { data, isPending, isError } = useFetch(['upcomingEvents'], fetchUpcomingEvents);

  const events = data?.upcomingEvents ?? [];
  const isEmpty = !isPending && !isError && events.length === 0;

  return (
    <Panel title="Upcoming Events" eyebrow="HR calendar" tone="cyan">
      {isPending ? (
        <div className="space-y-3.5">
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
              <div className="h-2.5 w-12 shrink-0 animate-pulse rounded bg-accent_text_black/15" />
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
          <p className="text-sm font-normal text-accent_text_black/50">No upcoming events</p>
        </div>
      ) : (
        <div className="max-h-full space-y-3.5 overflow-y-auto pr-1">
          {events.map((event: any, index: number) => (
            <div key={event.title} className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneByIndex(index + 3)}`}
              >
                {eventIcons[event.icon] ?? <Gift size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-normal text-accent_text_black">
                  {event.title}
                </strong>
                <span className="block text-xs font-normal text-accent_text_black/60">
                  {event.subtitle}
                </span>
              </div>
              <time className="text-xs font-normal text-accent_text_black/70">{event.date}</time>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export default function HrOverview() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
      <StatGrid
        title="Attendance Summary"
        eyebrow="Today, May 24"
        action="View report"
        stats={dashboardData.attendanceStats}
        tone="green"
      />
      <StatGrid
        title="Employee Overview"
        eyebrow="This month"
        action="View all"
        stats={dashboardData.employeeStats}
        tone="blue"
      />
      <LeaveRequests />
      <Workforce />
      <UpcomingEvents />
    </div>
  );
}
