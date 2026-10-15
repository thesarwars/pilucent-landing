/**
 * Contract test: the screens' own API module against a live Pilucent backend.
 *
 * Skipped unless BD_E2E_EMAIL and BD_E2E_PASSWORD are set, with
 * NEXT_PUBLIC_API_URL pointing at a backend whose company has EMP-0142 (with an
 * officer-template structure, nominees at 60%, three processed periods ending the month before
 * this one) and EMP-0150 (no structure, NON_WORKER). Run against a throwaway
 * instance, never a shared database — it writes.
 */

import axios from 'axios';
import { baseURL } from '@/app/helpers/api';
import * as api from '../api';
import * as salaryApi from '@/app/dashboard/hris/salary/_bd/api';
import { isMasked } from '../types';

const EMAIL = process.env.BD_E2E_EMAIL;
const PASSWORD = process.env.BD_E2E_PASSWORD;
const live = EMAIL && PASSWORD ? describe : describe.skip;

// The shared axios instance reads the token from localStorage at request time.
const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => (store[k] = v),
  removeItem: (k: string) => delete store[k],
};


/** The first of the month `n` months before `iso`'s month. */
function monthsBefore(iso: string, n: number): string {
  const [y, m] = iso.split('-').map(Number);
  const total = y * 12 + (m - 1) - n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}-01`;
}

async function refusal(p: Promise<unknown>) {
  try {
    await p;
  } catch (err) {
    return err as InstanceType<typeof api.ApiError>;
  }
  throw new Error('expected the request to be refused');
}

live('BD employee API contract', () => {
  beforeAll(async () => {
    const { data } = await axios.post(`${baseURL}/accounts/auth/token`, { email: EMAIL, password: PASSWORD });
    store.access_token = data.access;
  });

  test('roster and profile', async () => {
    const roster = await api.listEmployees({ filter: 'ALL', page: 1, limit: 25 });
    const row = roster.results.find((r) => r.code === 'EMP-0142');
    expect(row?.grossMonthly).toBe('22000.00');
    const blocked = await api.listEmployees({ filter: 'BLOCKED' });
    expect(blocked.results.map((r) => r.code)).toContain('EMP-0150'); // no structure

    const profile = await api.getProfile('EMP-0142');
    expect(profile.personal.nameEn).toBe('Md. Rafiqul Islam');
    expect(profile.salary && !isMasked(profile.salary) ? profile.salary.gross : null).toBe('22000.00');
  });

  test('a section edit is refused with a UI field id, then saved', async () => {
    const err = await refusal(api.patchSection('EMP-0142', 'personal', { nid: '12' }));
    expect(err.status).toBe(400);
    expect(err.errors[0].field).toBe('f-nid');
    expect(err.messagesFor('nid')[0]).toMatch(/10, 13 or 17 digits/);
    await api.patchSection('EMP-0142', 'personal', { emergencyName: 'Salma Begum' });
    expect((await api.getProfile('EMP-0142')).personal.emergencyName).toBe('Salma Begum');
  });

  test('nominees replace the list and clear the share risk', async () => {
    let compliance = await api.getCompliance('EMP-0142');
    expect(compliance.risks.map((r) => r.key)).toContain('personal.nomineeShares');
    await api.putNominees('EMP-0142', [
      { name: 'Salma Begum', relation: 'SPOUSE', nid: '', share: '60' },
      { name: 'Rafi', relation: 'SON', nid: '', share: '40' },
    ]);
    compliance = await api.getCompliance('EMP-0142');
    expect(compliance.risks.map((r) => r.key)).not.toContain('personal.nomineeShares');
  });

  test('a backdated revision is refused with its consequence, then saved with a reason', async () => {
    const salary = await salaryApi.getSalaryProfile('EMP-0142');
    expect(salary.structure?.template).toBe('officer');
    // Two months before the next unprocessed period: reopens the last two processed.
    const backTo = monthsBefore(salary.defaults.nextPeriodStart, 2);
    const revise = { method: 'PERCENTAGE_INCREASE', value: '10', effectiveFrom: backTo, expectedStructure: salary.latest };
    const err = await refusal(salaryApi.writeStructure('EMP-0142', { ...revise, preview: true }));
    expect(err.status).toBe(422);
    expect(err.messagesFor('reason').length).toBe(1);
    expect((err.consequence as any).reopenedCount).toBe(2);
    expect((err.consequence as any).arrears).toBe('4400.00');

    const saved = await salaryApi.writeStructure('EMP-0142', { ...revise, reason: 'Annual increment agreed late', revisionType: 'INCREMENT' });
    expect(saved.saved).toBe(true);
    expect(saved.structure?.gross).toBe('24200.00');
    const history = await salaryApi.getSalaryProfileHistory('EMP-0142');
    expect(history.structures.map((s) => s.gross)).toEqual(['24200.00', '22000.00']);
  });

  test('assignment preview and floors', async () => {
    // No date of joining on file, so the date is required.
    const noDate = await refusal(salaryApi.writeStructure('EMP-0150', { templateCode: 'rmg', preview: true }));
    expect(noDate.messagesFor('effectiveFrom').length).toBe(1);
    const preview = await salaryApi.writeStructure('EMP-0150', {
      templateCode: 'rmg',
      effectiveFrom: new Date().toISOString().slice(0, 10),
      preview: true,
    });
    expect(preview.saved).toBe(false);
    expect(preview.floors.every((f) => f.passed)).toBe(true);
    expect(preview.grossInWords.en).toMatch(/taka only$/);
  });

  test('gated operations', async () => {
    const short = await refusal(
      api.changeClassification('EMP-0150', { to: 'WORKER', effective: new Date().toISOString().slice(0, 10), reason: 'too short' })
    );
    expect(short.messagesFor('reason').length).toBe(1);
    expect(short.consequence).toHaveProperty('completedPayrollRuns');
    const done = await api.changeClassification('EMP-0150', {
      to: 'WORKER',
      effective: new Date().toISOString().slice(0, 10),
      reason: 'Now operates a machine',
    });
    expect(done.classification).toBe('WORKER');

    const entitlement = await api.separate('EMP-0142', { type: 'RESIGNATION', date: new Date().toISOString().slice(0, 10), preview: true });
    expect(entitlement.available).toBe(true);
    expect(entitlement.payable?.value).toMatch(/^\d+\.\d{2}$/);
  });

  test('documents, tax, history, lookups and create', async () => {
    const docs = await api.getDocuments('EMP-0142');
    expect(docs.kinds.find((k) => k.kind === 'SERVICE_BOOK')?.ready).toBe(true);
    const book = await api.issueDocument('EMP-0142', 'SERVICE_BOOK');
    expect(book.version).toBe(1);
    expect(book.content?.wage?.gross.words.bn).toMatch(/টাকা মাত্র$/);

    const tax = await api.getTaxProjection('EMP-0142');
    expect(tax.available).toBe(true);
    expect(tax.withholding?.available).toBe(true);

    const history = await api.getHistory('EMP-0142', 'salary');
    expect(history.entries.length).toBeGreaterThanOrEqual(2);

    expect((await api.listLookup('designations')).map((d) => d.title)).toContain('Line Chief');
    const created = await api.createEmployee({ nameEn: 'Contract Test' });
    expect(created.code).toMatch(/^EMP-\d{4}$/);
  });
});
