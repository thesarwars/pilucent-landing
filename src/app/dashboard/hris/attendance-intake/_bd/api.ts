/** The attendance intake API. Refusals throw the employee kit's `ApiError`. */

import { axiosApi } from '@/app/helpers/api';
import { JSON_HEADERS, call } from '@/app/dashboard/hris/employee/employees/_bd/api';
import type { Batch, BatchDetail, Can, Mapping, Period, Profile, ProfileTest, Summary, Unmapped, AuditRow, Site } from './types';

const BASE = '/we/attendance-intake';
const post = <T>(url: string, body: unknown = {}) => call<T>(() => axiosApi.post(`${BASE}${url}`, body, JSON_HEADERS));

export const getSummary = () => call<Summary>(() => axiosApi.get(`${BASE}/summary`));
export const getSample = () => call<{ fileName: string; text: string }>(() => axiosApi.get(`${BASE}/sample`));

export const getProfiles = (all = false) => call<{ profiles: Profile[]; can: Can }>(() => axiosApi.get(`${BASE}/profiles`, { params: all ? { all: 1 } : {} }));
export const getProfile = (uid: string) => call<Profile & { versions: Profile[] }>(() => axiosApi.get(`${BASE}/profiles/${uid}`));
export const createProfile = (data: Partial<Profile> & { siteUid: string }) => post<Profile>('/profiles', data);
export const saveProfile = (uid: string, data: Partial<Profile>) =>
  call<Profile>(() => axiosApi.patch(`${BASE}/profiles/${uid}`, data, JSON_HEADERS));
export const testProfile = (data: Partial<Profile> & { text: string }) => post<ProfileTest>('/profiles/test', data);

/** The shared instance may carry a JSON default; multipart lets axios add the boundary. */
export const uploadBatch = (file: File, siteUid: string) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('siteUid', siteUid);
  return call<Batch>(() => axiosApi.post(`${BASE}/batches`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }));
};
export const getBatches = () => call<{ batches: Batch[]; can: Can }>(() => axiosApi.get(`${BASE}/batches`));
export const getBatch = (uid: string) => call<BatchDetail>(() => axiosApi.get(`${BASE}/batches/${uid}`));
export const parseBatch = (uid: string, body: { profileUid: string; statedFrom?: string | null; statedTo?: string | null }) =>
  post<Batch>(`/batches/${uid}/parse`, body);
export const validateBatch = (uid: string) => post<Batch>(`/batches/${uid}/validate`);
export const processBatch = (uid: string, overrideWarnings: boolean) => post<Batch>(`/batches/${uid}/process`, { overrideWarnings });
export const reverseBatch = (uid: string, reason: string) => post<Batch>(`/batches/${uid}/reverse`, { reason });

/** The retained file, saved under its own name. */
export async function downloadRaw(b: Batch) {
  const res = await axiosApi.get(`${BASE}/batches/${b.uid}/raw`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data as Blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: b.fileName });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const getDeviceIds = () => call<{ unmapped: Unmapped[]; mappings: Mapping[]; can: Can }>(() => axiosApi.get(`${BASE}/device-ids`));
export const createMapping = (body: { deviceLabel: string; deviceUserId: string; employeeCode: string; effectiveFrom: string }) =>
  post<{ mapping: Mapping; relinked: number; held: number; message: string }>('/device-maps', body);
export const closeMapping = (uid: string, effectiveTo: string) => post<Mapping>(`/device-maps/${uid}/close`, { effectiveTo });

export const getPeriods = (siteUid: string) =>
  call<{ site: Site; periods: Period[]; audit: AuditRow[]; can: Can }>(() => axiosApi.get(`${BASE}/periods`, { params: { site: siteUid } }));
export const advancePeriod = (siteUid: string, month: string, acknowledgeReason?: string) =>
  post<Period>(`/periods/${month}/advance`, { siteUid, acknowledgeReason });
export const unlockPeriod = (siteUid: string, month: string, reason: string, confirmedInvalidatesPayroll: boolean) =>
  post<Period>(`/periods/${month}/unlock`, { siteUid, reason, confirmedInvalidatesPayroll });
