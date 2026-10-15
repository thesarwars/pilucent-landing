'use client';

/**
 * Data hooks. Every query for one employee shares the key prefix
 * `['bd-employee', code]`, so a write invalidates the profile, compliance,
 * salary, tax and history together: a fixed field clears its finding, its
 * tab dot and the roster badge in one refetch (backend §1.7 — one predicate).
 *
 * Each employee is its own cache entry and is replaced, never merged, when
 * another is opened (backend §1.3).
 */

import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type { RosterFilter } from './types';

export const keys = {
  employee: (code: string) => ['bd-employee', code] as const,
  roster: ['bd-roster'] as const,
};

const opts = { retry: (n: number, err: unknown) => n < 2 && !(err instanceof api.ApiError && err.status >= 400 && err.status < 500) };

export function useRoster(params: { q: string; filter: RosterFilter; page: number }) {
  return useQuery({
    queryKey: [...keys.roster, params],
    queryFn: () => api.listEmployees({ ...params, limit: 25 }),
    placeholderData: (prev) => prev,
    ...opts,
  });
}

const FILTERS: RosterFilter[] = ['ALL', 'WORKER', 'NON_WORKER', 'PROBATION', 'BLOCKED'];

/**
 * How many employees each filter pill would show, for the current search.
 * The list endpoint has no facet counts, so each is a one-row page.
 */
export function useRosterCounts(q: string): Partial<Record<RosterFilter, number>> {
  const results = useQueries({
    queries: FILTERS.map((filter) => ({
      queryKey: [...keys.roster, 'count', q, filter],
      queryFn: () => api.listEmployees({ q, filter, page: 1, limit: 1 }),
      placeholderData: (prev: Awaited<ReturnType<typeof api.listEmployees>> | undefined) => prev,
      staleTime: 30_000,
      ...opts,
    })),
  });
  return Object.fromEntries(FILTERS.flatMap((f, i) => (results[i].data ? [[f, results[i].data!.count]] : [])));
}

export function useProfile(code: string) {
  return useQuery({ queryKey: keys.employee(code), queryFn: () => api.getProfile(code), ...opts });
}

export function useCompliance(code: string) {
  return useQuery({ queryKey: [...keys.employee(code), 'compliance'], queryFn: () => api.getCompliance(code), ...opts });
}

export function useSalary(code: string) {
  return useQuery({ queryKey: [...keys.employee(code), 'salary'], queryFn: () => api.getSalary(code), ...opts });
}

export function useTaxProjection(code: string, enabled = true) {
  return useQuery({
    queryKey: [...keys.employee(code), 'tax'],
    queryFn: () => api.getTaxProjection(code),
    enabled,
    ...opts,
  });
}

export function useHistory(code: string, field: string, enabled = true) {
  return useQuery({
    queryKey: [...keys.employee(code), 'history', field],
    queryFn: () => api.getHistory(code, field),
    enabled,
    ...opts,
  });
}

export function useSalaryHistory(code: string, enabled = true) {
  return useQuery({
    queryKey: [...keys.employee(code), 'salary-history'],
    queryFn: () => api.getSalaryHistory(code),
    enabled,
    ...opts,
  });
}

export function useDocuments(code: string) {
  return useQuery({ queryKey: [...keys.employee(code), 'documents'], queryFn: () => api.getDocuments(code), ...opts });
}

export function useLookup(kind: api.LookupKind) {
  return useQuery({ queryKey: ['bd-lookup', kind], queryFn: () => api.listLookup(kind), staleTime: 60_000, ...opts });
}

/** Refetch everything about one employee, and the roster row. */
export function useRefreshEmployee(code: string) {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: keys.employee(code) }),
      qc.invalidateQueries({ queryKey: keys.roster }),
    ]);
}

/** A write that refreshes the employee afterwards. Errors are `ApiError`. */
export function useEmployeeMutation<TInput, TResult>(code: string, fn: (input: TInput) => Promise<TResult>) {
  const refresh = useRefreshEmployee(code);
  return useMutation<TResult, api.ApiError, TInput>({
    mutationFn: fn,
    onSuccess: () => {
      void refresh();
    },
  });
}
