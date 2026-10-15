/** The salary profile API. Refusals throw the employee kit's `ApiError`. */

import { axiosApi } from '@/app/helpers/api';
import { JSON_HEADERS, call } from '@/app/dashboard/hris/employee/employees/_bd/api';
import type { SalaryOutcome } from '@/app/dashboard/hris/employee/employees/_bd/types';
import type { SalaryFilter, SalaryHistoryRead, SalaryList, SalaryProfileRead, OverrideInput, WriteInput } from './types';

const enc = encodeURIComponent;

/** A retried save with the same key returns the first result, not a second structure. */
const withKey = (key?: string) =>
  key ? { headers: { ...JSON_HEADERS.headers, 'Idempotency-Key': key } } : JSON_HEADERS;

export const newIdempotencyKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

export const listSalaryProfiles = (params: { q?: string; filter?: SalaryFilter; page?: number; limit?: number }) =>
  call<SalaryList>(() => axiosApi.get('/we/salary-profiles', { params }));

export const getSalaryProfile = (code: string) =>
  call<SalaryProfileRead>(() => axiosApi.get(`/we/employees/${enc(code)}/salary-structures`));

export const getSalaryProfileHistory = (code: string) =>
  call<SalaryHistoryRead>(() => axiosApi.get(`/we/employees/${enc(code)}/salary-history`));

export const writeStructure = (code: string, input: WriteInput, key?: string) =>
  call<SalaryOutcome>(() => axiosApi.post(`/we/employees/${enc(code)}/salary-structures`, input, withKey(key)));

export const overrideStructure = (uid: string, input: OverrideInput, key?: string) =>
  call<SalaryOutcome>(() => axiosApi.post(`/we/salary-structures/${enc(uid)}/overrides`, input, withKey(key)));

export const cancelStructure = (uid: string, reason: string) =>
  call<{ cancelled: unknown; inForce: unknown }>(() =>
    axiosApi.post(`/we/salary-structures/${enc(uid)}/cancel`, { reason }, JSON_HEADERS)
  );
