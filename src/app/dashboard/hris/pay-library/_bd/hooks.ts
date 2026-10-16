'use client';

/**
 * Pay library data, all under `['bd-paylib']`. A flag change moves the
 * effects panel, the template previews and every salary structure built
 * after it, so the salary module's data is refreshed too.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import * as api from './api';

export const libKeys = { all: ['bd-paylib'] as const };
const k = (...parts: unknown[]) => [...libKeys.all, ...parts];
const opts = { retry: (n: number, err: unknown) => n < 2 && !(err instanceof ApiError && err.status >= 400 && err.status < 500) };

export const useSummary = (gross: string, template: string) =>
  useQuery({ queryKey: k('summary', gross, template), queryFn: () => api.getSummary(gross, template), placeholderData: (p) => p, ...opts });
export const useTemplates = () => useQuery({ queryKey: k('templates'), queryFn: api.getTemplates, ...opts });
export const usePreview = (uid: string | null, amount: string, grade: string) =>
  useQuery({ queryKey: k('preview', uid, amount, grade), queryFn: () => api.previewTemplate(uid!, amount, grade), enabled: !!uid, placeholderData: (p) => p, ...opts });
export const useFloors = () => useQuery({ queryKey: k('floors'), queryFn: api.getFloors, ...opts });
export const useBulk = () => useQuery({ queryKey: k('bulk'), queryFn: api.getBulk, ...opts });
export const useBulkOne = (uid: string | null) => useQuery({ queryKey: k('bulk', uid), queryFn: () => api.getBulkOne(uid!), enabled: !!uid, ...opts });
export const useAccounts = (enabled: boolean) => useQuery({ queryKey: k('accounts'), queryFn: api.getAccounts, enabled, ...opts });

/** Everything: a library change reaches the salary list and every open profile. */
export function useLibInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}
