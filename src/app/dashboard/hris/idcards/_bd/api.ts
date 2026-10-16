/** The ID cards API. Refusals throw the employee kit's `ApiError`. */

import { axiosApi, baseURL } from '@/app/helpers/api';
import { JSON_HEADERS, call } from '@/app/dashboard/hris/employee/employees/_bd/api';
import type { Report, Side } from './engine';
import type {
  Asset, Card, CardRead, CheckResult, Contexts, EmployeeRead, Field, FieldsRead, Gallery, GalleryFilter, Job,
  Profile, Rule, Settings, Setup, Template, TemplateDetail, TemplatePreflight, TemplateRow,
} from './types';

const BASE = '/we/idcards';
const enc = encodeURIComponent;
const post = <T>(url: string, body: unknown = {}) => call<T>(() => axiosApi.post(`${BASE}${url}`, body, JSON_HEADERS));
const patch = <T>(url: string, body: unknown) => call<T>(() => axiosApi.patch(`${BASE}${url}`, body, JSON_HEADERS));

/** The API's origin: signed media paths are relative to it, not to the app. */
export const apiOrigin = baseURL.replace(/\/api\/v\d+$/, '');
export const mediaUrl = (path?: string | null) => (!path ? '' : /^https?:/.test(path) ? path : `${apiOrigin}${path}`);

export const getSetup = () => call<Setup>(() => axiosApi.get(`${BASE}/setup`));
export const patchSettings = (data: Partial<Settings>) => patch<Settings>('/settings', data);
export const getGallery = (params: { q?: string; filter?: GalleryFilter }) => call<Gallery>(() => axiosApi.get(`${BASE}/gallery`, { params }));
export const getEmployee = (code: string, template?: string) =>
  call<EmployeeRead>(() => axiosApi.get(`${BASE}/employees/${enc(code)}`, { params: { template } }));

export const issueCard = (employeeCode: string, templateUid?: string) =>
  post<{ card: Card; preflight: Report }>('/cards', { employeeCode, templateUid });
export const issueBulk = (employeeCodes: string[]) =>
  post<{ issued: Card[]; refused: { code: string; messages: string[] }[] }>('/cards/bulk', { employeeCodes });
export const getCard = (uid: string) => call<CardRead>(() => axiosApi.get(`${BASE}/cards/${uid}`));
export const cardAction = (uid: string, action: 'revoke' | 'lost' | 'replace', reason: string) =>
  post<{ card: Card; replaced?: string }>(`/cards/${uid}/${action}`, { reason });

export const getTemplates = () => call<{ templates: TemplateRow[]; can: Setup['can'] }>(() => axiosApi.get(`${BASE}/templates`));
export const createTemplate = (data: { code: string; name: string; preset: string; copyOf?: string }) => post<Template>('/templates', data);
export const getTemplate = (uid: string) => call<TemplateDetail>(() => axiosApi.get(`${BASE}/templates/${uid}`));
export const saveTemplate = (uid: string, data: Partial<Template> & { front?: Side; back?: Side | null }) =>
  patch<Template & { versioned: boolean }>(`/templates/${uid}`, data);
export const preflightTemplate = (uid: string, sides?: { front?: Side; back?: Side | null }) =>
  post<TemplatePreflight>(`/templates/${uid}/preflight`, sides || {});
export const publishTemplate = (uid: string, acknowledgeErrors = false) =>
  post<Template & { preflight: TemplatePreflight }>(`/templates/${uid}/publish`, { acknowledgeErrors });
export const templateAction = (uid: string, action: 'default' | 'archive') => post<unknown>(`/templates/${uid}/${action}`);
export const getContexts = (uid: string) => call<Contexts>(() => axiosApi.get(`${BASE}/templates/${uid}/contexts`));

export const getRules = () => call<{ rules: Rule[] }>(() => axiosApi.get(`${BASE}/rules`));
export const createRule = (data: Partial<Rule>) => post<Rule>('/rules', data);
export const patchRule = (uid: string, data: Partial<Rule>) => patch<Rule>(`/rules/${uid}`, data);
export const deleteRule = (uid: string) => call<unknown>(() => axiosApi.delete(`${BASE}/rules/${uid}`));

export const printCheck = (cardUids: string[]) => post<CheckResult>('/print-check', { cardUids });
export const submitJob = (data: { cardUids: string[]; profileUid: string; includeWarnings: boolean; name?: string }) => post<Job>('/print-jobs', data);
export const getJobs = () => call<{ jobs: Job[]; can: Setup['can'] }>(() => axiosApi.get(`${BASE}/print-jobs`));
export const getJob = (uid: string) => call<Job>(() => axiosApi.get(`${BASE}/print-jobs/${uid}`));
export const jobAction = (uid: string, action: 'printed' | 'retry' | 'cancel') => post<Job>(`/print-jobs/${uid}/${action}`);

/** The artifact, through the authenticated client, saved under its reference. */
export async function downloadJob(job: Job) {
  const res = await axiosApi.get(`${BASE}/print-jobs/${job.uid}/download`, { responseType: 'blob' });
  const name = /filename="?([^";]+)"?/.exec(res.headers['content-disposition'] || '')?.[1] || `${job.reference}.pdf`;
  const url = URL.createObjectURL(res.data as Blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const uploadPhoto = (code: string, file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  // The shared instance may carry a JSON default; multipart lets axios add the boundary.
  return call<Asset>(() => axiosApi.post(`${BASE}/employees/${enc(code)}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }));
};
export const importProfilePhoto = (code: string) => post<Asset>(`/employees/${enc(code)}/photo`, { fromProfile: true });
export const adjustAsset = (uid: string, data: { crop?: Asset['crop']; adjustments?: Asset['adjustments'] }) => patch<Asset>(`/assets/${uid}`, data);

export const getFields = () => call<FieldsRead>(() => axiosApi.get(`${BASE}/fields`));
export const createField = (data: Partial<Field>) => post<Field>('/fields', data);
export const patchField = (uid: string, data: Partial<Field>) => patch<Field>(`/fields/${uid}`, data);
export const putFieldValues = (code: string, values: Record<string, unknown>) =>
  call<{ values: Record<string, unknown> }>(() => axiosApi.put(`${BASE}/employees/${enc(code)}/fields`, { values }, JSON_HEADERS));

export const createProfile = (data: Partial<Profile>) => post<Profile>('/profiles', data);
export const patchProfile = (uid: string, data: Partial<Profile>) => patch<Profile>(`/profiles/${uid}`, data);
