'use client';

/**
 * Payroll settings data, under `['bd-payset']`. An election moves figures
 * across attendance, salary and leave, so a write refreshes everything.
 */

import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import * as api from './api';
import type { ElectionData, ElectionKey, SchemeCode } from './types';

const k = (...parts: unknown[]) => ['bd-payset', ...parts];
const opts = { retry: (n: number, err: unknown) => n < 2 && !(err instanceof ApiError && err.status >= 400 && err.status < 500) };

export const useSummary = (site: string | null) => useQuery({ queryKey: k('summary', site), queryFn: () => api.getSummary(site), placeholderData: (p) => p, ...opts });

/** The consequence of `value` from the live roster; refetched as the choice changes. */
export const usePreview = (key: ElectionKey, value: string | null, data: ElectionData | null, hours: number | null, site: string | null, enabled: boolean) =>
  useQuery({
    queryKey: k('preview', key, value, JSON.stringify(data), hours, site),
    queryFn: () => api.previewElection(key, { value, data, standardMonthHours: hours, site }),
    enabled,
    placeholderData: (p) => p,
    staleTime: 30_000,
    ...opts,
  });

export const useHistory = (key: ElectionKey | null, site: string | null) =>
  useQuery({ queryKey: k('history', key, site), queryFn: () => api.getHistory(key!, site), enabled: !!key, ...opts });
export const useSchedule = (site: string | null) => useQuery({ queryKey: k('schedule', site), queryFn: () => api.getSchedule(site), ...opts });
export const useAccounts = (enabled: boolean) => useQuery({ queryKey: k('accounts'), queryFn: api.getAccounts, enabled, ...opts });
export const useParticipants = (code: SchemeCode | null) =>
  useQuery({ queryKey: k('participants', code), queryFn: () => api.getParticipants(code!), enabled: !!code, ...opts });
export const useChangelog = (key: string | null) => useQuery({ queryKey: k('changelog', key), queryFn: () => api.getChangelog(key), ...opts });
