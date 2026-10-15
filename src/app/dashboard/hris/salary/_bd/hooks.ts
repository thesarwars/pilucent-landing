'use client';

/**
 * Salary profile data. Every query for one employee sits under the employee
 * kit's `['bd-employee', code]` prefix, so a salary write refreshes the
 * employee profile's read-only mirror, its compliance and its roster badge
 * in the same refetch.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { keys as employeeKeys } from '@/app/dashboard/hris/employee/employees/_bd/hooks';
import * as api from './api';
import type { SalaryFilter } from './types';

export const salaryKeys = {
  list: ['bd-salary-list'] as const,
  profile: (code: string) => [...employeeKeys.employee(code), 'salary-profile'] as const,
  history: (code: string) => [...employeeKeys.employee(code), 'salary-profile-history'] as const,
};

const opts = { retry: (n: number, err: unknown) => n < 2 && !(err instanceof ApiError && err.status >= 400 && err.status < 500) };

export function useSalaryList(params: { q: string; filter: SalaryFilter; page: number }) {
  return useQuery({
    queryKey: [...salaryKeys.list, params],
    queryFn: () => api.listSalaryProfiles({ ...params, limit: 25 }),
    placeholderData: (prev) => prev,
    ...opts,
  });
}

export function useSalaryProfile(code: string) {
  return useQuery({ queryKey: salaryKeys.profile(code), queryFn: () => api.getSalaryProfile(code), ...opts });
}

export function useSalaryProfileHistory(code: string, enabled = true) {
  return useQuery({ queryKey: salaryKeys.history(code), queryFn: () => api.getSalaryProfileHistory(code), enabled, ...opts });
}

/** After a write: this employee everywhere, the salary list and the roster. */
export function useSalaryInvalidate(code: string) {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: employeeKeys.employee(code) }),
      qc.invalidateQueries({ queryKey: salaryKeys.list }),
      qc.invalidateQueries({ queryKey: employeeKeys.roster }),
    ]);
}
