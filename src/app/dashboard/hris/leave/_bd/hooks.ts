'use client';

/**
 * Leave data. Everything sits under `['bd-leave']`: a write anywhere moves a
 * balance, and the balances, the queue, the calendar and the header are all
 * readings of the same ledger, so one invalidation refreshes them together.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import * as api from './api';
import type { BalanceFilter } from './types';

export const leaveKeys = { all: ['bd-leave'] as const };
const k = (...parts: unknown[]) => [...leaveKeys.all, ...parts];
const opts = { retry: (n: number, err: unknown) => n < 2 && !(err instanceof ApiError && err.status >= 400 && err.status < 500) };

export const useSummary = () => useQuery({ queryKey: k('summary'), queryFn: api.getSummary, ...opts });
export const useTypes = () => useQuery({ queryKey: k('types'), queryFn: api.getTypes, staleTime: 60_000, ...opts });
export const usePolicy = (enabled = true) => useQuery({ queryKey: k('policy'), queryFn: api.getPolicy, enabled, ...opts });
export const useBalances = (q: string, filter: BalanceFilter) =>
  useQuery({ queryKey: k('balances', q, filter), queryFn: () => api.getBalances({ q, filter }), placeholderData: (p) => p, ...opts });
export const useApplications = (status: string, q: string) =>
  useQuery({ queryKey: k('applications', status, q), queryFn: () => api.getApplications({ status, q }), placeholderData: (p) => p, ...opts });
export const useApprovals = () => useQuery({ queryKey: k('approvals'), queryFn: api.getApprovals, ...opts });
export const useAway = (month: string | null, dept: string) =>
  useQuery({ queryKey: k('away', month, dept), queryFn: () => api.getAway(month ?? undefined, dept || undefined), placeholderData: (p) => p, ...opts });
export const useHistory = (code: string | null, type = 'ALL') =>
  useQuery({ queryKey: k('history', code, type), queryFn: () => api.getHistory(code!, type), enabled: !!code, ...opts });
export const useEncashments = () => useQuery({ queryKey: k('encashments'), queryFn: api.getEncashments, ...opts });
export const useEncashPreview = (code: string) =>
  useQuery({ queryKey: k('encash-preview', code), queryFn: () => api.getEncashPreview(code), enabled: !!code, ...opts });
export const useMaternity = () => useQuery({ queryKey: k('maternity'), queryFn: api.getMaternity, ...opts });

export function useLeaveInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: leaveKeys.all });
}
