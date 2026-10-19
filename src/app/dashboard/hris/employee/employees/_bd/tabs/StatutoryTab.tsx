'use client';

import * as React from 'react';
import * as api from '../api';
import { useEmployeeMutation, useSalary } from '../hooks';
import { useLang } from '../i18n';
import { enumLabel } from '../enums';
import type { Derived, Profile, Statutory, TabId } from '../types';
import { Assessment } from './EmploymentTab';
import {
  Chip,
  Citation,
  ConfidenceTag,
  DateInput,
  Field,
  FieldGrid,
  Note,
  SaveBar,
  Section,
  SwitchRow,
  TextInput,
  errs,
  useSectionForm,
} from '../ui';

type Form = Omit<Statutory, 'pfConstituted' | 'gratuityBasis' | 'gratuityMethod' | 'gratuityFund' | 'participation'>;

const BASIS: Record<string, string> = { BASIC: 'Basic (the library’s gratuity base)', GROSS: 'Gross', CUSTOM: 'Custom components' };
const METHOD: Record<string, string> = { MONTHLY_PROVISION: 'Monthly provision', FUNDED_SCHEME: 'Funded scheme' };

export function StatutoryTab({ profile, goTo }: { profile: Profile; goTo: (tab: TabId, field?: string | null) => void }) {
  const { money, date, n } = useLang();
  const code = profile.code;
  const { pfConstituted, gratuityBasis, gratuityMethod, gratuityFund, participation, ...server } = profile.statutory;
  const salary = useSalary(code);
  const derived = salary.data?.derived && !('available' in salary.data.derived) ? (salary.data.derived as Derived) : null;
  const mutation = useEmployeeMutation(code, (changes: Partial<Form>) => api.patchSection(code, 'statutory', changes));
  const form = useSectionForm<Form>(server, (changes) => mutation.mutateAsync(changes));
  const v = form.values;
  const set = form.set;
  const e = form.errors;
  const isWorker = profile.employment.classification === 'WORKER';
  const bonus = derived?.festivalBonus;
  const pf = derived?.providentFund;
  const grat = derived?.gratuity;

  const classification = profile.employment.classification;
  // Switching a membership off is an opt-out, and an opt-out carries its reason (payroll settings §3.7).
  const leaving = (['pfMember', 'gratuityEligible', 'insuranceCovered'] as const).filter((k) => server[k] && !v[k]);
  const since = (scheme: string) => participation?.find((p) => p.scheme === scheme && !p.optedOutOn)?.enrolledOn ?? null;

  return (
    <div className="space-y-4">
      <Section
        title="Worker classification"
        desc="An assessment of the work performed, with the assessor recorded — never derived from the job title. It is the field a labour inspector tests."
        right={
          <button type="button" className="bd-btn" onClick={() => goTo('employment', 'f-classification')}>
            Change on Employment
          </button>
        }
      >
        <Chip tone={!classification ? 'warn' : isWorker ? 'violet' : 'neutral'}>{enumLabel('classification', classification, 'Unclassified')}</Chip>
        {classification && <Assessment code={code} />}
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section
          title="Provident fund"
          desc="Employee and employer contributions, on basic."
          right={
            <SwitchRow
              id="f-pfmember"
              checked={v.pfMember}
              onChange={(x) => set('pfMember', x)}
              disabled={!pfConstituted && !v.pfMember}
              title={pfConstituted ? 'Provident fund membership' : 'Company provident fund not constituted.'}
            />
          }
        >
          {!pfConstituted && (
            <Note tone="warn" className="mb-3">
              Company provident fund not constituted, so membership cannot be switched on. Set it up in Payroll settings.
            </Note>
          )}
          {v.pfMember && (
            <FieldGrid>
              <Field htmlFor="f-pfnum" label="Membership number" span={3} errors={errs(e, 'pfNumber')}>
                <TextInput id="f-pfnum" value={v.pfNumber} onChange={(x) => set('pfNumber', x)} />
              </Field>
              <Field htmlFor="f-pfdate" label="Enrolment date" span={3} errors={errs(e, 'pfEnrolled')} help={server.pfMember ? 'A membership runs from its date; opt out and enrol again to change it.' : 'Empty: from today.'}>
                <DateInput id="f-pfdate" value={v.pfEnrolled} onChange={(x) => set('pfEnrolled', x)} disabled={server.pfMember} />
              </Field>
              <Field htmlFor="f-pfemp" label="Employee contribution %" span={3} errors={errs(e, 'pfEmployee', 'f-pfemp')}>
                <TextInput id="f-pfemp" inputMode="decimal" value={v.pfEmployee} onChange={(x) => set('pfEmployee', x || null)} invalid={!!errs(e, 'pfEmployee').length} className="bd-mono" />
              </Field>
              <Field
                htmlFor="f-pfer"
                label="Employer contribution %"
                span={3}
                help="Empty or the fund's rate: the fund's rate applies, and follows it when it changes."
                errors={errs(e, 'pfEmployer')}
              >
                <TextInput id="f-pfer" inputMode="decimal" value={v.pfEmployer} onChange={(x) => set('pfEmployer', x || null)} className="bd-mono" />
              </Field>
            </FieldGrid>
          )}
          {pf?.employee && (
            <Note tone="violet" icon={false} className="mt-3">
              {pf.employee.basis}: {money(pf.employee.value, 2)} a month from the employee
              {pf.employer ? `, ${money(pf.employer.value, 2)} from the employer` : ''}.
            </Note>
          )}
          <Citation>{pf?.employee?.citation}</Citation>
        </Section>

        <Section
          title="Gratuity"
          desc="Provisioning basis and method for gratuity on separation."
          right={<SwitchRow id="f-gratuity" checked={v.gratuityEligible} onChange={(x) => set('gratuityEligible', x)} title="Gratuity eligibility" />}
        >
          {v.gratuityEligible ? (
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[12.5px]">
              <dt className="text-v-ink500">Wage basis</dt>
              <dd className="m-0 font-semibold">{gratuityBasis ? BASIS[gratuityBasis] ?? gratuityBasis : 'Not elected — gratuity cannot be computed'}</dd>
              <dt className="text-v-ink500">Accrual</dt>
              <dd className="m-0 font-semibold">{gratuityMethod ? METHOD[gratuityMethod] ?? gratuityMethod : '—'}{gratuityFund ? ` · ${gratuityFund}` : ''}</dd>
              {since('GRATUITY') && (<><dt className="text-v-ink500">Eligible since</dt><dd className="m-0 font-semibold">{date(since('GRATUITY'))}</dd></>)}
              <dd className="col-span-2 m-0 text-[11.5px] text-v-ink500">The basis and the accrual are the company&apos;s — elected in <a className="font-bold text-[#6B3FE8]" href="/dashboard/hris/payroll-settings">Payroll settings</a>, not per employee.</dd>
            </dl>
          ) : (
            <p className="text-[12.5px] text-v-ink500">
              Off: a separation compares compensation with nil gratuity (&ldquo;gratuity, if any&rdquo;).
            </p>
          )}
          {grat && (
            <Note tone="violet" icon={false} className="mt-3">
              <span className="flex items-center gap-2">
                At {n(grat.years)} years of service gratuity would be {money(grat.amount.value)}
                <ConfidenceTag value={grat.amount.confidence} />
              </span>
              <span className="mt-0.5 block text-[11.5px] font-medium opacity-80">{grat.amount.basis}</span>
            </Note>
          )}
          <Citation>{grat?.amount.citation}</Citation>
        </Section>

        <Section
          title="Group insurance"
          desc="Policy covering this employee under the company group scheme."
          right={<SwitchRow id="f-insurance" checked={v.insuranceCovered} onChange={(x) => set('insuranceCovered', x)} title="Group insurance cover" />}
        >
          {v.insuranceCovered ? (
            <FieldGrid>
              <Field htmlFor="f-inspolicy" label="Policy number" span={3} errors={errs(e, 'insurancePolicy')}>
                <TextInput id="f-inspolicy" value={v.insurancePolicy} onChange={(x) => set('insurancePolicy', x)} />
              </Field>
              <Field htmlFor="f-inssum" label="Sum assured" span={3} errors={errs(e, 'insuranceSum')}>
                <TextInput id="f-inssum" inputMode="decimal" value={v.insuranceSum} onChange={(x) => set('insuranceSum', x.replace(/[^0-9.]/g, '') || null)} className="bd-mono" />
              </Field>
              <Field htmlFor="f-insurer" label="Insurer" span={6} errors={errs(e, 'insurer')}>
                <TextInput id="f-insurer" value={v.insurer} onChange={(x) => set('insurer', x)} />
              </Field>
            </FieldGrid>
          ) : (
            <p className="text-[12.5px] text-v-ink500">Not covered.</p>
          )}
        </Section>

        <Section title="Festival bonus" desc="Eligibility is derived from continuous service — it is not an input.">
          {!isWorker ? (
            <Note tone="neutral">Non-worker — festival bonus follows the employment contract.</Note>
          ) : bonus ? (
            <Note tone={bonus.eligible ? 'success' : 'warn'}>
              {bonus.eligible
                ? `Eligible — ${n(bonus.serviceMonths)} months of continuous service completed on ${date(bonus.eligibleFrom)}.`
                : `Not yet eligible — completes ${n(bonus.serviceMonths)} months on ${date(bonus.eligibleFrom)}.`}
            </Note>
          ) : (
            <Note tone="neutral">Eligibility appears once a date of joining and a salary structure are on file.</Note>
          )}
          <div className="mt-3">
            <SwitchRow
              id="f-festgranted"
              checked={v.festivalGranted}
              onChange={(x) => set('festivalGranted', x)}
              label="Granted before eligibility"
            />
          </div>
          {v.festivalGranted && (
            <FieldGrid className="mt-2">
              <Field htmlFor="f-festreason" label="Reason for granting early" required span={6} errors={errs(e, 'festivalReason', 'f-festreason')}>
                <TextInput id="f-festreason" value={v.festivalReason} onChange={(x) => set('festivalReason', x)} placeholder="Company policy pays pro-rata before one year" />
              </Field>
            </FieldGrid>
          )}
          {bonus && (
            <div className="mt-3 text-[12px] text-v-ink500">
              {bonus.annual.basis}: {money(bonus.annual.value)} a year. {bonus.taxable?.basis}
            </div>
          )}
          <Citation>{bonus?.perBonus.citation}</Citation>
        </Section>
      </div>
      {leaving.length > 0 && (
        <Section title="Opting out" desc="Leaving a scheme ends the membership from today; the record keeps why.">
          <FieldGrid>
            <Field htmlFor="f-optout" label="Reason" required span={6} errors={errs(e, 'optOutReason', 'f-optout')}>
              <TextInput id="f-optout" value={v.optOutReason ?? ''} onChange={(x) => set('optOutReason', x)} placeholder="Contract worker, outside the fund's rules" />
            </Field>
          </FieldGrid>
        </Section>
      )}
      <SaveBar dirty={form.dirty} saving={form.saving} onSave={() => void form.submit()} onDiscard={form.reset} />
    </div>
  );
}
