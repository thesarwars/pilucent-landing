'use client';

/**
 * Intake data, all under `['bd-intake']`: a processed batch moves the
 * history, the orphans and the period counts together, so one invalidation
 * refreshes every reading. The register's own data (`['bd-attendance']`) is
 * refreshed too -- an import changes the days it shows.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import * as api from './api';

export const intakeKeys = { all: ['bd-intake'] as const };
const k = (...parts: unknown[]) => [...intakeKeys.all, ...parts];
const opts = { retry: (n: number, err: unknown) => n < 2 && !(err instanceof ApiError && err.status >= 400 && err.status < 500) };

export const useSummary = () => useQuery({ queryKey: k('summary'), queryFn: api.getSummary, ...opts });
export const useBatches = () => useQuery({ queryKey: k('batches'), queryFn: api.getBatches, ...opts });
export const useBatch = (uid: string | null) => useQuery({ queryKey: k('batch', uid), queryFn: () => api.getBatch(uid!), enabled: !!uid, ...opts });
export const useDeviceIds = () => useQuery({ queryKey: k('device-ids'), queryFn: api.getDeviceIds, ...opts });
export const usePeriods = (siteUid: string | null) =>
  useQuery({ queryKey: k('periods', siteUid), queryFn: () => api.getPeriods(siteUid!), enabled: !!siteUid, ...opts });
export const useProfileVersions = (uid: string | null) =>
  useQuery({ queryKey: k('profile', uid), queryFn: () => api.getProfile(uid!), enabled: !!uid, ...opts });

export function useIntakeInvalidate() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: intakeKeys.all }), qc.invalidateQueries({ queryKey: ['bd-attendance'] })]);
}
