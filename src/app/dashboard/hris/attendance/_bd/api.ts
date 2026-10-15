/** The attendance API. Refusals throw the employee kit's `ApiError`. */

import { axiosApi } from '@/app/helpers/api';
import { JSON_HEADERS, call } from '@/app/dashboard/hris/employee/employees/_bd/api';
import type {
  CalendarDayRow,
  CalendarRead,
  CloseSummary,
  Compliance,
  DayDetail,
  Elections,
  ExceptionsList,
  Grid,
  ImportResult,
  Period,
  Recomputed,
  Shift,
  ShiftsRead,
  Site,
} from './types';

const BASE = '/we/attendance';

export interface MonthParams {
  month: string; // YYYY-MM
  site?: string;
}

export const getSites = () => call<{ rows: Site[] }>(() => axiosApi.get(`${BASE}/sites`));

export const getGrid = (params: MonthParams & { dept?: string; q?: string; exceptionsOnly?: boolean; page?: number }) =>
  call<Grid>(() =>
    axiosApi.get(`${BASE}/grid`, { params: { ...params, exceptionsOnly: params.exceptionsOnly ? 1 : undefined, limit: 100 } })
  );

export const getDay = (employeeCode: string, date: string) =>
  call<DayDetail>(() => axiosApi.get(`${BASE}/day`, { params: { employeeCode, date } }));

export const getExceptions = (params: MonthParams & { all?: boolean }) =>
  call<ExceptionsList>(() => axiosApi.get(`${BASE}/exceptions`, { params: { ...params, all: params.all ? 1 : undefined } }));

export const getClose = (params: MonthParams) => call<CloseSummary>(() => axiosApi.get(`${BASE}/close`, { params }));

export const getCompliance = (params: MonthParams) => call<Compliance>(() => axiosApi.get(`${BASE}/compliance`, { params }));

/* ── a day ────────────────────────────────────────────────────────── */

export interface AdjustInput {
  employeeCode: string;
  date: string;
  newStatus?: string;
  inTimeMin?: number | null;
  outTimeMin?: number | null;
  reason: string;
  note?: string;
}

export const adjust = (input: AdjustInput) => call<DayDetail>(() => axiosApi.post(`${BASE}/adjustments`, input, JSON_HEADERS));

export const removeAdjustment = (input: { employeeCode: string; date: string; reason: string }) =>
  call<DayDetail>(() => axiosApi.post(`${BASE}/adjustments/remove`, input, JSON_HEADERS));

export interface ResolveInput {
  employeeCode: string;
  date: string;
  kind: string;
  action: string;
  reason?: string;
  inTimeMin?: number | null;
  outTimeMin?: number | null;
}

export const resolve = (input: ResolveInput) => call<DayDetail>(() => axiosApi.post(`${BASE}/exceptions/resolve`, input, JSON_HEADERS));

export const acknowledge = (input: { employeeCode: string; date: string; kind: string; reason: string }) =>
  call<DayDetail>(() => axiosApi.post(`${BASE}/exceptions/acknowledge`, input, JSON_HEADERS));

/* ── the month ────────────────────────────────────────────────────── */

export const confirmHolidayWork = (params: MonthParams & { reason?: string }) =>
  call<{ confirmed: number }>(() => axiosApi.post(`${BASE}/holiday-work/confirm`, params, JSON_HEADERS));

export const lockPeriod = (params: MonthParams) => call<{ period: Period }>(() => axiosApi.post(`${BASE}/periods/lock`, params, JSON_HEADERS));

export const reopenPeriod = (params: MonthParams & { reason: string }) =>
  call<{ period: Period }>(() => axiosApi.post(`${BASE}/periods/reopen`, params, JSON_HEADERS));

export const recompute = (params: MonthParams) => call<Recomputed>(() => axiosApi.post(`${BASE}/recompute`, params, JSON_HEADERS));

export const importPunches = (rows: Record<string, string>[], site?: string) =>
  call<ImportResult>(() => axiosApi.post(`${BASE}/punches/import`, { rows, site }, JSON_HEADERS));

/* ── setup ────────────────────────────────────────────────────────── */

export const getShifts = (site?: string) => call<ShiftsRead>(() => axiosApi.get(`${BASE}/shifts`, { params: { site } }));

export interface ShiftInput {
  code: string;
  label: string;
  startMin: number;
  endMin: number;
  unpaidBreak: number;
  grace: number;
  otStartsAfter: number;
  requiresPreApproval: boolean;
  effectiveFrom: string;
  site?: string;
}

export const createShift = (input: ShiftInput) => call<Shift>(() => axiosApi.post(`${BASE}/shifts`, input, JSON_HEADERS));

export const assignShift = (input: { shift: string; employeeCodes: string[]; effectiveFrom: string; site?: string }) =>
  call<{ assigned: string[] }>(() => axiosApi.post(`${BASE}/shifts/assign`, input, JSON_HEADERS));

export const getCalendar = (year: number, site?: string) =>
  call<CalendarRead>(() => axiosApi.get(`${BASE}/calendars/${year}`, { params: { site } }));

export const saveCalendar = (
  year: number,
  input: { weeklyPattern: Record<string, number>; days: CalendarDayRow[]; consultedWith: string; site?: string }
) => call<CalendarRead>(() => axiosApi.put(`${BASE}/calendars/${year}`, input, JSON_HEADERS));

export const publishCalendar = (year: number, site?: string) =>
  call<CalendarRead>(() => axiosApi.post(`${BASE}/calendars/${year}/publish`, { site }, JSON_HEADERS));

export const getElections = () => call<Elections>(() => axiosApi.get(`${BASE}/elections`));

export const saveElections = (input: Partial<{ overtimeBase: Elections['overtimeBase']; daysWorked: Partial<Elections['daysWorked']> }>) =>
  call<Elections>(() => axiosApi.patch(`${BASE}/elections`, input, JSON_HEADERS));
