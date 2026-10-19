/** The pay library API. Refusals throw the employee kit's `ApiError`. */

import { axiosApi } from '@/app/helpers/api';
import { JSON_HEADERS, call } from '@/app/dashboard/hris/employee/employees/_bd/api';
import type { Bulk, Can, Component, Effects, Floors, Gl, Preview, Readiness, Summary, Template, TemplateRow } from './types';

const BASE = '/we/pay-library';
const post = <T>(url: string, body: unknown = {}) => call<T>(() => axiosApi.post(`${BASE}${url}`, body, JSON_HEADERS));
const patch = <T>(url: string, body: unknown) => call<T>(() => axiosApi.patch(`${BASE}${url}`, body, JSON_HEADERS));

export const getSummary = (gross?: string, template?: string) =>
  call<Summary>(() => axiosApi.get(`${BASE}/summary`, { params: { gross: gross || undefined, template: template || undefined } }));
export const getEffects = (gross: string, template: string) => call<Effects>(() => axiosApi.get(`${BASE}/effects`, { params: { gross, template } }));
export const changeFlags = (uid: string, changes: Record<string, boolean>, effectiveFrom: string, reason: string) =>
  post<Component>(`/components/${uid}/flags`, { changes, effectiveFrom, reason });
export const editComponent = (uid: string, data: Partial<Component>) => patch<Component>(`/components/${uid}`, data);
export const createComponent = (data: Partial<Component>) => post<Component>('/components', data);
export const mapGl = (uid: string, accountUid: string | null) => post<Component & { readiness: Readiness }>(`/components/${uid}/gl`, { accountUid });
export const getAccounts = () => call<{ accounts: Gl[] }>(() => axiosApi.get(`${BASE}/gl-accounts`));
export const createPayrollAccounts = () => post<{ created: string[]; mapped: string[]; readiness: Readiness }>('/gl-accounts');

export const getTemplates = () => call<{ templates: TemplateRow[]; can: Can }>(() => axiosApi.get(`${BASE}/templates`));
export const createTemplate = (data: Partial<Template>) => post<Template>('/templates', data);
export const saveTemplate = (uid: string, data: Partial<Template>) => patch<Template>(`/templates/${uid}`, data);
export const templateAction = (uid: string, action: 'publish' | 'archive') => post<Template>(`/templates/${uid}/${action}`);
export const previewTemplate = (uid: string, amount: string, grade?: string) =>
  call<Preview>(() => axiosApi.get(`${BASE}/templates/${uid}/preview`, { params: { amount: amount || undefined, grade: grade || undefined } }));

export const getFloors = () => call<Floors>(() => axiosApi.get(`${BASE}/floors`));
export const setPolicy = (data: Record<string, string | null>) => patch<Floors>('/floors', data);

export const getBulk = () => call<{ revisions: Bulk[]; can: Can }>(() => axiosApi.get(`${BASE}/bulk-revisions`));
export const getBulkOne = (uid: string) => call<Bulk>(() => axiosApi.get(`${BASE}/bulk-revisions/${uid}`));
export const createBulk = (data: Record<string, unknown>) => post<Bulk>('/bulk-revisions', data);
export const bulkAction = (uid: string, action: 'preview' | 'apply') => post<Bulk>(`/bulk-revisions/${uid}/${action}`);
