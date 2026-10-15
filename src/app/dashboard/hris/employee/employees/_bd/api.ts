/**
 * The BD employee API, keyed by employee code (`EMP-0142`).
 *
 * Unlike the app-wide helpers in `@/app/helpers/api`, nothing here toasts and
 * swallows an error: a refused request throws `ApiError`, which carries the
 * field-addressed errors (`f-nid`, `f-etin`, ...) and — for a gated
 * operation — the consequence the backend says it would have had.
 */

import { AxiosError } from 'axios';
import { axiosApi } from '@/app/helpers/api';
import type {
  ClassificationResult,
  Compliance,
  DocumentKind,
  DocumentSummary,
  DocumentsRead,
  FieldError,
  HistoryRead,
  Investment,
  Lookup,
  Nominee,
  Paged,
  Profile,
  RosterFilter,
  RosterRow,
  SalaryRead,
  SeparationEntitlement,
  TaxProjection,
} from './types';

const BASE = '/we/employees';

export class ApiError extends Error {
  status: number;
  errors: FieldError[];
  consequence: Record<string, unknown> | null;

  constructor(
    status: number,
    message: string,
    errors: FieldError[] = [],
    consequence: Record<string, unknown> | null = null
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.consequence = consequence;
  }

  /** Messages for one payload key (`nid`) or UI id (`f-nid`). */
  messagesFor(key: string): string[] {
    return this.errors.filter((e) => e.path === key || e.field === key).flatMap((e) => e.messages);
  }
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const ax = err as AxiosError<any>;
  const status = ax?.response?.status ?? 0;
  const body = ax?.response?.data;
  if (!ax?.response) {
    return new ApiError(0, 'The server could not be reached. Check your connection and the API address.');
  }
  if (body && Array.isArray(body.errors)) {
    const errors = body.errors as FieldError[];
    const first = errors[0]?.messages?.[0];
    return new ApiError(status, first || 'The request was refused.', errors, body.consequence ?? null);
  }
  const message =
    (body && (body.message || body.detail)) ||
    (status === 403
      ? 'You do not have permission to do this.'
      : status === 404
        ? 'Not found.'
        : 'Something went wrong. Try again.');
  return new ApiError(status, String(message), [], body?.consequence ?? null);
}

export async function call<T>(fn: () => Promise<{ data: T }>): Promise<T> {
  try {
    return (await fn()).data;
  } catch (err) {
    throw toApiError(err);
  }
}

// The shared instance's multipart helpers blank its default Content-Type, so
// every JSON call here states its own.
export const JSON_HEADERS = { headers: { 'Content-Type': 'application/json' } };

const enc = encodeURIComponent;
const emp = (code: string, suffix = '') => `${BASE}/${enc(code)}${suffix}`;

/* ── roster and profile ───────────────────────────────────────────── */

export const listEmployees = (params: { q?: string; filter?: RosterFilter; page?: number; limit?: number }) =>
  call<Paged<RosterRow>>(() => axiosApi.get(BASE, { params }));

export const createEmployee = (data: {
  nameEn: string;
  nameBn?: string;
  mobile?: string;
  classification?: string;
}) => call<Profile>(() => axiosApi.post(BASE, data, JSON_HEADERS));

export const getProfile = (code: string) => call<Profile>(() => axiosApi.get(emp(code)));

export type Section = 'personal' | 'employment' | 'statutory' | 'tax-profile' | 'payment';

export const patchSection = <T>(code: string, section: Section, data: Record<string, unknown> | FormData) =>
  call<T>(() =>
    axiosApi.patch(
      emp(code, `/${section}`),
      data,
      data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : JSON_HEADERS
    )
  );

export const putNominees = (code: string, nominees: Nominee[]) =>
  call<{ nominees: Nominee[] }>(() =>
    axiosApi.put(emp(code, '/nominees'), {
      nominees: nominees.map(({ name, relation, nid, share }) => ({ name, relation, nid, share })),
    }, JSON_HEADERS)
  );

export const putInvestments = (code: string, investments: Investment[]) =>
  call<{ investments: Investment[] }>(() =>
    axiosApi.put(emp(code, '/investments'), {
      investments: investments.map(({ instrument, amount, proof }) => ({ instrument, amount, proof })),
    }, JSON_HEADERS)
  );

/* ── computed ─────────────────────────────────────────────────────── */

export const getCompliance = (code: string) => call<Compliance>(() => axiosApi.get(emp(code, '/compliance')));

export const getTaxProjection = (code: string) =>
  call<TaxProjection>(() => axiosApi.get(emp(code, '/tax-projection')));

/* ── salary ───────────────────────────────────────────────────────── */

export const getSalary = (code: string, on?: string) =>
  call<SalaryRead>(() => axiosApi.get(emp(code, '/salary'), { params: on ? { on } : {} }));

/* ── gated operations ─────────────────────────────────────────────── */

export const changeClassification = (code: string, data: { to: string; effective: string; reason: string }) =>
  call<ClassificationResult>(() => axiosApi.post(emp(code, '/classification'), data, JSON_HEADERS));

export const separate = (
  code: string,
  data: { type: string; date: string; reason?: string; grossMisconduct?: boolean; preview?: boolean }
) => call<SeparationEntitlement & Record<string, unknown>>(() => axiosApi.post(emp(code, '/separation'), data, JSON_HEADERS));

/* ── history and documents ────────────────────────────────────────── */

export const getHistory = (code: string, field = 'ALL') =>
  call<HistoryRead>(() => axiosApi.get(emp(code, '/history'), { params: { field } }));

export const getDocuments = (code: string) => call<DocumentsRead>(() => axiosApi.get(emp(code, '/documents')));

export const DOCUMENT_SLUGS: Record<DocumentKind['kind'], string> = {
  SERVICE_BOOK: 'service-book',
  APPOINTMENT_LETTER: 'appointment-letter',
  ID_CARD: 'id-card',
};

export const issueDocument = (code: string, kind: DocumentKind['kind']) =>
  call<DocumentSummary>(() => axiosApi.post(emp(code, `/documents/${DOCUMENT_SLUGS[kind]}`), {}, JSON_HEADERS));

/* ── company lookups ──────────────────────────────────────────────── */

export type LookupKind = 'departments' | 'sections' | 'designations' | 'shifts';

/** A company's departments / sections / designations / shifts, unpaginated. */
export const listLookup = async (kind: LookupKind): Promise<Lookup[]> => {
  const data = await call<Paged<Lookup> | Lookup[]>(() => axiosApi.get(`/we/${kind}`, { params: { limit: 100 } }));
  const rows = Array.isArray(data) ? data : data.results;
  return rows.map((r: any) => ({ uid: r.uid, title: r.title ?? r.name ?? '', code: r.code }));
};
