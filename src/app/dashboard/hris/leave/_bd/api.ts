/** The leave API. Refusals throw the employee kit's `ApiError`. */

import { axiosApi } from '@/app/helpers/api';
import { JSON_HEADERS, call } from '@/app/dashboard/hris/employee/employees/_bd/api';
import type {
  AccrualRun,
  Away,
  BalanceFilter,
  Balances,
  BulkResult,
  Can,
  EncashPreview,
  Encashment,
  History,
  LeaveRequest,
  LeaveTypeInfo,
  BenefitPreview,
  MaternityCase,
  MaternityList,
  Policy,
  Preview,
  QueueCard,
  Restricted,
  StatementPrint,
  StatementsRead,
  Summary,
  YearEnd,
} from './types';

const BASE = '/we/leave';
const enc = encodeURIComponent;
const post = <T>(url: string, body: unknown = {}) => call<T>(() => axiosApi.post(`${BASE}${url}`, body, JSON_HEADERS));

export const getSummary = () => call<Summary>(() => axiosApi.get(`${BASE}/summary`));
export const getTypes = () => call<{ rows: LeaveTypeInfo[]; can: Can }>(() => axiosApi.get(`${BASE}/types`));
export const getPolicy = () => call<Policy>(() => axiosApi.get(`${BASE}/policy`));
export const getBalances = (params: { q?: string; filter?: BalanceFilter }) => call<Balances>(() => axiosApi.get(`${BASE}/balances`, { params }));
export const getApplications = (params: { status?: string; q?: string; type?: string }) =>
  call<{ rows: LeaveRequest[]; counts: Record<string, number> }>(() => axiosApi.get(`${BASE}/requests`, { params }));
export const getApprovals = () => call<{ rows: QueueCard[]; count: number; can: Can }>(() => axiosApi.get(`${BASE}/approvals`));
export const getAway = (month?: string, dept?: string) => call<Away>(() => axiosApi.get(`${BASE}/away`, { params: { month, dept } }));
export const getHistory = (code: string, type = 'ALL') => call<History>(() => axiosApi.get(`${BASE}/employees/${enc(code)}`, { params: { type } }));
export const getEncashments = () => call<{ rows: Encashment[]; counts: Record<string, number>; masked: boolean; can: Can }>(() => axiosApi.get(`${BASE}/encashments`));
export const getEncashPreview = (code: string) => call<EncashPreview>(() => axiosApi.get(`${BASE}/employees/${enc(code)}/encashment`));
export const getMaternity = () => call<MaternityList>(() => axiosApi.get(`${BASE}/maternity`));
export const readRestricted = (reference: string) => call<Restricted>(() => axiosApi.get(`${BASE}/maternity/${enc(reference)}/restricted`));

export interface ApplyInput {
  employeeCode: string;
  type: string;
  from: string;
  to: string;
  startHalf?: string;
  endHalf?: string;
  note?: string;
  contact?: string;
  coverCode?: string;
  evidence?: string;
  advance?: boolean;
}

export const previewRequest = (input: ApplyInput) => post<Preview>('/requests/preview', input);
export const submitRequest = (input: ApplyInput) => post<LeaveRequest>('/requests', input);
export const requestAction = (reference: string, action: 'approve' | 'decline' | 'withdraw' | 'cancel', reason?: string) =>
  post<LeaveRequest>(`/requests/${enc(reference)}/${action}`, { reason });

export const grant = (input: { employeeCode: string; type: string; days: string; reason: string; effective?: string }) => post('/grants', input);
export const bulkGrant = (input: { employeeCodes: string[] | null; type: string; days: string; reason: string; commit: boolean }) =>
  post<BulkResult>('/grants/bulk', input);
export const reverseEntry = (uid: string, reason: string, replacementDays?: string) =>
  post<{ reversal: string; replacement: string | null }>(`/ledger/${enc(uid)}/reverse`, { reason, replacementDays });

export const accrualRun = (input: { asOf: string; daysWorked: Record<string, string>; employeeCodes?: string[] | null; commit: boolean }) =>
  post<AccrualRun>('/accrual-runs', input);
export const yearEndClose = (input: { asOf: string; commit: boolean; confirm?: boolean }) => post<YearEnd>('/year-end-close', input);

export const requestEncashment = (employeeCode: string, days: string) => post<Encashment>('/encashments', { employeeCode, days });
export const encashmentAction = (reference: string, action: 'approve' | 'decline' | 'mark-paid', body: Record<string, unknown> = {}) =>
  post<Encashment>(`/encashments/${enc(reference)}/${action}`, body);

export const openMaternity = (input: {
  employeeCode: string;
  noticeDate: string;
  noticeMethod: string;
  expectedDelivery: string;
  survivingChildren: string;
  basis?: string;
  leaveFrom?: string;
}) => post<MaternityCase>('/maternity', input);
export const benefitPreview = (employeeCode: string, noticeDate: string) =>
  call<BenefitPreview>(() => axiosApi.get(`${BASE}/maternity/benefit`, { params: { employeeCode, noticeDate } }));
export const maternityEvent = (reference: string, body: { event: string; on?: string; date?: string; note?: string }) =>
  post<MaternityCase>(`/maternity/${enc(reference)}/events`, body);

export const getStatements = (quarter?: string) => call<StatementsRead>(() => axiosApi.get(`${BASE}/statements`, { params: { quarter } }));
export const generateStatements = (quarter: string, acknowledgeUnlocked: boolean) => post<StatementsRead>('/statements', { quarter, acknowledgeUnlocked });
export const issueStatements = (quarter: string, method: string, employeeCodes?: string[]) =>
  post<StatementsRead & { issued: number }>('/statements/issue', { quarter, method, employeeCodes });
export const acknowledgeStatement = (uid: string) => post(`/statements/${enc(uid)}/acknowledge`);
export const getStatement = (uid: string) => call<StatementPrint>(() => axiosApi.get(`${BASE}/statements/${enc(uid)}`));
