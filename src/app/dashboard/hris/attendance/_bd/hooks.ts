'use client';

/**
 * Attendance data. Everything for one month sits under
 * `['bd-attendance', site, month]`, so a write refreshes the grid, the
 * exceptions, the close summary and compliance in one invalidation: they are
 * four readings of the same computation.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import * as api from './api';

export const attendanceKeys = {
  all: ['bd-attendance'] as const,
  month: (site: string, month: string) => ['bd-attendance', site, month] as const,
  day: (code: string, date: string) => ['bd-attendance', 'day', code, date] as const,
  shifts: (site: string) => ['bd-attendance', 'shifts', site] as const,
  calendar: (site: string, year: number) => ['bd-attendance', 'calendar', site, year] as const,
  elections: ['bd-attendance', 'elections'] as const,
  sites: ['bd-attendance', 'sites'] as const,
};

const opts = { retry: (n: number, err: unknown) => n < 2 && !(err instanceof ApiError && err.status >= 400 && err.status < 500) };

export interface MonthQuery {
  site: string;
  month: string;
}

export function useSites() {
  return useQuery({ queryKey: attendanceKeys.sites, queryFn: api.getSites, staleTime: 5 * 60_000, ...opts });
}

export function useGrid(m: MonthQuery, filters: { dept: string; q: string; exceptionsOnly: boolean; page: number }) {
  return useQuery({
    queryKey: [...attendanceKeys.month(m.site, m.month), 'grid', filters],
    queryFn: () => api.getGrid({ month: m.month, site: m.site || undefined, ...filters, dept: filters.dept || undefined }),
    placeholderData: (prev) => prev,
    ...opts,
  });
}

export function useExceptions(m: MonthQuery, enabled = true) {
  return useQuery({
    queryKey: [...attendanceKeys.month(m.site, m.month), 'exceptions'],
    queryFn: () => api.getExceptions({ month: m.month, site: m.site || undefined, all: true }),
    enabled,
    ...opts,
  });
}

export function useClose(m: MonthQuery, enabled = true) {
  return useQuery({
    queryKey: [...attendanceKeys.month(m.site, m.month), 'close'],
    queryFn: () => api.getClose({ month: m.month, site: m.site || undefined }),
    enabled,
    ...opts,
  });
}

export function useCompliance(m: MonthQuery, enabled = true) {
  return useQuery({
    queryKey: [...attendanceKeys.month(m.site, m.month), 'compliance'],
    queryFn: () => api.getCompliance({ month: m.month, site: m.site || undefined }),
    enabled,
    ...opts,
  });
}

export function useDay(code: string | null, date: string | null) {
  return useQuery({
    queryKey: attendanceKeys.day(code ?? '', date ?? ''),
    queryFn: () => api.getDay(code!, date!),
    enabled: !!code && !!date,
    ...opts,
  });
}

export function useShifts(site: string, enabled = true) {
  return useQuery({ queryKey: attendanceKeys.shifts(site), queryFn: () => api.getShifts(site || undefined), enabled, ...opts });
}

export function useCalendar(site: string, year: number, enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.calendar(site, year),
    queryFn: () => api.getCalendar(year, site || undefined),
    enabled,
    ...opts,
  });
}

export function useElections(enabled = true) {
  return useQuery({ queryKey: attendanceKeys.elections, queryFn: api.getElections, enabled, ...opts });
}

/** After any attendance write: every reading of every month, and the open day. */
export function useAttendanceInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: attendanceKeys.all });
}
