'use client';

import * as React from 'react';
import * as api from '../api';
import { ENUMS } from '../enums';
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
  SelectInput,
  SwitchRow,
  TextInput,
  errs,
  useSectionForm,
} from '../ui';

type Form = Omit<Statutory, 'pfConstituted'>;

export function StatutoryTab({ profile, goTo }: { profile: Profile; goTo: (tab: TabId, field?: string | null) => void }) {
  const { money, date, n } = useLang();
  const code = profile.code;
  const { pfConstituted, ...server } = profile.statutory;
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
              <Field htmlFor="f-pfdate" label="Enrolment date" span={3} errors={errs(e, 'pfEnrolled')}>
                <DateInput id="f-pfdate" value={v.pfEnrolled} onChange={(x) => set('pfEnrolled', x)} />
              </Field>
              <Field htmlFor="f-pfemp" label="Employee contribution %" span={3} errors={errs(e, 'pfEmployee', 'f-pfemp')}>
                <TextInput id="f-pfemp" inputMode="decimal" value={v.pfEmployee} onChange={(x) => set('pfEmployee', x || null)} invalid={!!errs(e, 'pfEmployee').length} className="bd-mono" />
              </Field>
              <Field
                htmlFor="f-pfer"
                label="Employer contribution %"
                span={3}
                help="Matches the employee contribution."
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
            <FieldGrid>
              <Field htmlFor="f-gratbasis" label="Wage basis" span={3} help="Basic is the common default. Confirm against your service rules." errors={errs(e, 'gratuityBasis')}>
                <SelectInput id="f-gratbasis" value={v.gratuityBasis} onChange={(x) => set('gratuityBasis', x)} options={ENUMS.gratuityBasis} />
              </Field>
              <Field htmlFor="f-gratmethod" label="Accrual method" span={3} errors={errs(e, 'gratuityMethod')}>
                <SelectInput id="f-gratmethod" value={v.gratuityMethod} onChange={(x) => set('gratuityMethod', x)} options={ENUMS.gratuityMethod} />
              </Field>
              {v.gratuityMethod === 'FUNDED' && (
                <Field htmlFor="f-gratfund" label="Fund name" span={6} errors={errs(e, 'gratuityFund')}>
                  <TextInput id="f-gratfund" value={v.gratuityFund} onChange={(x) => set('gratuityFund', x)} />
                </Field>
              )}
            </FieldGrid>
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
      <SaveBar dirty={form.dirty} saving={form.saving} onSave={() => void form.submit()} onDiscard={form.reset} />
    </div>
  );
}
