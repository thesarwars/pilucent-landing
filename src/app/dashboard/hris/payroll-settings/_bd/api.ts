/** The payroll settings API. Refusals throw the employee kit's `ApiError`. */

import { axiosApi } from '@/app/helpers/api';
import { JSON_HEADERS, call } from '@/app/dashboard/hris/employee/employees/_bd/api';
import type { AuditRow, Deadline, ElectionData, ElectionKey, ElectionRow, Gl, Participant, Preview, Readiness, Schedule, Scheme, SchemeCode, Summary } from './types';

const BASE = '/we/payroll-settings';
const post = <T>(url: string, body: unknown = {}) => call<T>(() => axiosApi.post(`${BASE}${url}`, body, JSON_HEADERS));

export type Proposal = { value: string | null; data?: ElectionData | null; standardMonthHours?: number | null; effectiveFrom?: string; reason?: string; site?: string | null };

export const getSummary = (site?: string | null) => call<Summary>(() => axiosApi.get(`${BASE}/summary`, { params: { site: site || undefined } }));
export const previewElection = (key: ElectionKey, p: Proposal & { params?: Record<string, unknown> }) => post<Preview>(`/elections/${key}/preview`, p);
export const elect = (key: ElectionKey, p: Proposal) => post<ElectionRow>(`/elections/${key}`, p);
export const getHistory = (key: ElectionKey, site?: string | null) =>
  call<{ history: ElectionRow[] }>(() => axiosApi.get(`${BASE}/elections/${key}`, { params: { site: site || undefined } }));
export const approve = (uid: string) => post<ElectionRow>(`/proposals/${uid}/approve`);
export const reject = (uid: string, reason: string) => post<ElectionRow>(`/proposals/${uid}/reject`, { reason });

export const getSchedule = (site?: string | null) =>
  call<{ schedule: Schedule | null; deadlines?: Deadline[]; unchecked?: string[] }>(() => axiosApi.get(`${BASE}/schedule`, { params: { site: site || undefined } }));
export const checkSchedule = (paymentDay: number, effectiveFrom: string, site?: string | null) =>
  post<{ deadlines: Deadline[]; unchecked: string[]; late: Deadline[] }>('/schedule/check', { paymentDay, effectiveFrom, site: site || undefined });
export const saveSchedule = (body: Record<string, unknown>) =>
  call<{ schedule: Schedule; deadlines: Deadline[]; unchecked: string[] }>(() => axiosApi.put(`${BASE}/schedule`, body, JSON_HEADERS));

export const updateScheme = (code: SchemeCode, body: Record<string, unknown>) =>
  call<Scheme>(() => axiosApi.patch(`${BASE}/schemes/${code}`, body, JSON_HEADERS));
export const mapGl = (code: SchemeCode, body: { expenseUid?: string | null; liabilityUid?: string | null }) =>
  post<Scheme & { readiness: Readiness }>(`/schemes/${code}/gl`, body);
export const createAccounts = (codes?: SchemeCode[]) => post<{ created: string[]; mapped: string[]; readiness: Readiness }>('/schemes/accounts', { codes });
export const getAccounts = () => call<{ accounts: Gl[] }>(() => axiosApi.get(`${BASE}/gl-accounts`));
export const getParticipants = (code: SchemeCode) =>
  call<{ scheme: SchemeCode; members: number; employees: Participant[]; autoEnrol: { eligible: { code: string; nameEn: string }[] } | null }>(() =>
    axiosApi.get(`${BASE}/schemes/${code}/participants`));
export const autoEnrol = () => post<{ eligible: { code: string; nameEn: string }[]; enrolled: number }>('/schemes/PF/auto-enrol', { apply: true });

export const getChangelog = (key?: string | null) =>
  call<{ changelog: AuditRow[] }>(() => axiosApi.get(`${BASE}/changelog`, { params: { key: key || undefined } }));
