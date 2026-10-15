'use client';

import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chip, VioletButton } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import * as api from '../api';
import { ENUMS, enumLabel } from '../enums';
import { useEmployeeMutation, useLookup, useSalary } from '../hooks';
import { useLang } from '../i18n';
import { serviceLabel } from '../format';
import type { Derived, Lookup, Profile } from '../types';
import {
  DateInput,
  Field,
  FieldGrid,
  Note,
  SaveBar,
  Section,
  SelectInput,
  TextInput,
  errs,
  focusField,
  useSectionForm,
} from '../ui';

type Form = {
  workerCategory: string;
  establishment: string;
  employmentType: string;
  contractEnd: string | null;
  doj: string | null;
  probationEnd: string | null;
  confirmation: string | null;
  department: string;
  section: string;
  designation: string;
  shift: string;
  grade: string;
  manager: string;
};

const FK = ['department', 'section', 'designation', 'shift', 'manager'] as const;

const lookupOptions = (rows: Lookup[] | undefined, current: Lookup | null) => {
  const list = (rows ?? []).map((r) => ({ value: r.uid, label: r.code ? `${r.title} (${r.code})` : r.title }));
  if (current && !list.some((o) => o.value === current.uid)) list.unshift({ value: current.uid, label: current.title });
  return list;
};

export function EmploymentTab({
  profile,
  onClock,
  onClassify,
}: {
  profile: Profile;
  onClock: (field: string) => void;
  onClassify: (to: string) => void;
}) {
  const { t, date, n } = useLang();
  const code = profile.code;
  const emp = profile.employment;
  const salary = useSalary(code);
  const derived = salary.data?.derived && !('available' in salary.data.derived) ? (salary.data.derived as Derived) : null;
  const departments = useLookup('departments');
  const sections = useLookup('sections');
  const designations = useLookup('designations');
  const shifts = useLookup('shifts');

  const server: Form = {
    workerCategory: emp.workerCategory,
    establishment: emp.establishment,
    employmentType: emp.employmentType,
    contractEnd: emp.contractEnd,
    doj: emp.doj,
    probationEnd: emp.probationEnd,
    confirmation: emp.confirmation,
    department: emp.department?.uid ?? '',
    section: emp.section?.uid ?? '',
    designation: emp.designation?.uid ?? '',
    shift: emp.shift?.uid ?? '',
    grade: emp.grade,
    manager: emp.manager?.code ?? '',
  };
  const mutation = useEmployeeMutation(code, (changes: Partial<Form>) => {
    const payload: Record<string, unknown> = { ...changes };
    for (const key of FK) if (key in payload && payload[key] === '') payload[key] = null;
    return api.patchSection(code, 'employment', payload);
  });
  const form = useSectionForm(server, (changes) => mutation.mutateAsync(changes));
  const v = form.values;
  const set = form.set;
  const e = form.errors;
  const isWorker = emp.classification === 'WORKER';

  const leave = derived?.leave;
  const ratio = leave?.earnedLeaveRatio;
  const cap = leave?.accumulationCap;

  return (
    <div className="space-y-4">
      {emp.separatedOn && (
        <Note tone="danger">
          Separated {date(emp.separatedOn)} ({enumLabel('separationType', emp.separationType).toLowerCase()})
          {emp.finalSettlementOn ? ` — settled ${date(emp.finalSettlementOn)}.` : ' — final settlement outstanding.'}
        </Note>
      )}

      <Section
        title="Employment classification"
        desc="Decides which Labour Act entitlements apply. Everything downstream — overtime, leave, bonus, gratuity — reads this. Determined by the work performed, not the job title."
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <div role="radiogroup" aria-label="Employment classification" className="inline-flex rounded-[14px] bg-v-wash2 p-1">
              {ENUMS.classification.map((o) => {
                const selected = emp.classification === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => !selected && onClassify(o.value)}
                    className={cn(
                      'rounded-[11px] px-4 py-2 text-[13px] font-bold transition-all',
                      selected ? 'bg-white text-v-primary-deep shadow-[0_6px_16px_-8px_rgba(22,23,42,0.4)]' : 'text-v-ink500 hover:text-v-ink900'
                    )}
                  >
                    {t(o.label, o.value === 'WORKER' ? 'worker' : 'nonWorker')}
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-[11.5px] leading-relaxed text-v-ink400">
              {emp.classification
                ? `Changing it is recorded with a reason and an effective date. ${n(emp.completedPayrollRuns)} completed payroll run(s) exist for this employee.`
                : 'Not classified yet. Pick one to record it.'}
            </p>
          </div>
          <div
            aria-live="polite"
            className={cn(
              'rounded-2xl border p-4',
              isWorker ? 'border-[rgba(124,77,255,0.22)] bg-[rgba(124,77,255,0.07)]' : 'border-[rgba(22,23,42,0.11)] bg-[rgba(22,23,42,0.045)]'
            )}
          >
            <div className={cn('text-[13px] font-bold', isWorker ? 'text-v-primary-deep' : 'text-v-ink700')}>
              {isWorker ? 'Bangladesh Labour Act entitlements apply' : 'Statutory worker entitlements do not apply'}
            </div>
            {isWorker ? (
              <ul className="mt-2 space-y-1.5">
                {[
                  derived?.overtimeHourly && `Overtime: ${derived.overtimeHourly.basis.replace(/; shown to the paisa$/, '')}.`,
                  ratio && `Earned leave at 1 day per ${n(String(ratio.value))} days worked${cap ? `, accumulating up to ${n(String(cap.value))} days` : ''}.`,
                  derived?.festivalBonus &&
                    `Festival bonuses after ${n(derived.festivalBonus.serviceMonths)} months of continuous service.`,
                  derived?.gratuity && `Gratuity at ${n(derived.gratuity.daysPerYear)} days' wages per year of service.`,
                ]
                  .filter(Boolean)
                  .map((text) => (
                    <li key={String(text)} className="flex items-start gap-2 text-[12.5px] text-v-ink700">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-v-primary" />
                      {text}
                    </li>
                  ))}
                {!derived && (
                  <li className="text-[12.5px] text-v-ink500">
                    The figures appear once a salary structure is assigned.
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-2 text-[12.5px] leading-relaxed text-v-ink500">
                Benefits follow the employment contract or company service rules and are configured under Statutory.
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section title="Position" desc="Fields with a clock are effective-dated — every change is recorded, never overwritten.">
        <FieldGrid>
          <Field label="Employee code" span={2} help="Never reassigned.">
            <TextInput id="f-code" value={profile.code} onChange={() => undefined} disabled />
          </Field>
          <Field
            htmlFor="f-category"
            label="Worker category"
            required={isWorker}
            span={2}
            help={isWorker ? 'Determines notice period and probation rules.' : 'Applies to workers only.'}
            errors={errs(e, 'workerCategory')}
          >
            <SelectInput id="f-category" value={v.workerCategory} onChange={(x) => set('workerCategory', x)} options={ENUMS.workerCategory} disabled={!isWorker} />
          </Field>
          <Field
            htmlFor="f-establishment"
            label="Establishment type"
            required
            span={2}
            errors={errs(e, 'establishment')}
            help={ratio ? `Earned leave accrues at 1 day per ${n(String(ratio.value))} days worked${cap ? `; cap ${n(String(cap.value))} days` : ''}.` : undefined}
          >
            <SelectInput id="f-establishment" value={v.establishment} onChange={(x) => set('establishment', x)} options={ENUMS.establishment} />
          </Field>
          <Field htmlFor="f-doj" label="Date of joining" required span={2} errors={errs(e, 'doj')}>
            <DateInput id="f-doj" value={v.doj} onChange={(x) => set('doj', x)} />
            {(emp.service || derived?.festivalBonus?.eligibleFrom) && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {emp.service && <Chip tone="violet">{serviceLabel(emp.service)} of service</Chip>}
                {derived?.festivalBonus?.eligibleFrom && (
                  <Chip tone={derived.festivalBonus.eligible ? 'success' : 'warn'}>
                    Festival bonus {derived.festivalBonus.eligible ? 'eligible since' : 'eligible from'} {date(derived.festivalBonus.eligibleFrom)}
                  </Chip>
                )}
              </div>
            )}
          </Field>
          <Field htmlFor="f-probation" label="Probation end date" span={2} errors={errs(e, 'probationEnd')}>
            <DateInput id="f-probation" value={v.probationEnd} onChange={(x) => set('probationEnd', x)} />
          </Field>
          <Field
            htmlFor="f-confirmation"
            label="Confirmation date"
            span={2}
            errors={errs(e, 'confirmation')}
            help={v.confirmation && v.confirmation > profile.asOf ? 'A future confirmation date blocks payroll.' : undefined}
          >
            <DateInput id="f-confirmation" value={v.confirmation} onChange={(x) => set('confirmation', x)} invalid={!!v.confirmation && v.confirmation > profile.asOf} />
          </Field>
          <Field htmlFor="f-department" label="Department" required span={2} onClock={() => onClock('department')} errors={errs(e, 'department')}>
            <SelectInput id="f-department" value={v.department} onChange={(x) => set('department', x)} options={lookupOptions(departments.data, emp.department)} />
          </Field>
          <Field htmlFor="f-section" label="Section" span={2} onClock={() => onClock('section')} errors={errs(e, 'section')}>
            <SelectInput id="f-section" value={v.section} onChange={(x) => set('section', x)} options={lookupOptions(sections.data, emp.section)} placeholder="Not assigned" />
          </Field>
          <Field htmlFor="f-designation" label="Designation" required span={2} onClock={() => onClock('designation')} errors={errs(e, 'designation')}>
            <SelectInput id="f-designation" value={v.designation} onChange={(x) => set('designation', x)} options={lookupOptions(designations.data, emp.designation)} />
          </Field>
          <Field htmlFor="f-grade" label="Grade" required span={2} onClock={() => onClock('grade')} errors={errs(e, 'grade')} help="The gazetted minimum-wage floors are checked against this grade.">
            <SelectInput id="f-grade" value={v.grade} onChange={(x) => set('grade', x)} options={ENUMS.grade} />
          </Field>
          <Field htmlFor="f-shift" label="Shift" required span={2} onClock={() => onClock('shift')} errors={errs(e, 'shift')}>
            <SelectInput id="f-shift" value={v.shift} onChange={(x) => set('shift', x)} options={lookupOptions(shifts.data, emp.shift)} />
          </Field>
          <Field
            htmlFor="f-manager"
            label="Reporting manager"
            span={2}
            errors={errs(e, 'manager')}
            help={emp.manager ? emp.manager.nameEn : 'Their employee code, e.g. EMP-0101.'}
          >
            <TextInput id="f-manager" value={v.manager} onChange={(x) => set('manager', x.toUpperCase())} placeholder="EMP-0000" />
          </Field>
          <Field htmlFor="f-empType" label="Employment type" required span={2} errors={errs(e, 'employmentType')}>
            <SelectInput id="f-empType" value={v.employmentType} onChange={(x) => set('employmentType', x)} options={ENUMS.employmentType} />
          </Field>
          {v.employmentType === 'CONTRACT' && (
            <Field htmlFor="f-contractEnd" label="Contract end date" required span={2} errors={errs(e, 'contractEnd')}>
              <DateInput id="f-contractEnd" value={v.contractEnd} onChange={(x) => set('contractEnd', x)} />
            </Field>
          )}
        </FieldGrid>
        <SaveBar dirty={form.dirty} saving={form.saving} onSave={() => void form.submit()} onDiscard={form.reset} />
      </Section>

      <Paperwork profile={profile} />
    </div>
  );
}

function Paperwork({ profile }: { profile: Profile }) {
  const { date } = useLang();
  const code = profile.code;
  const emp = profile.employment;
  const issue = useEmployeeMutation(code, (kind: 'APPOINTMENT_LETTER' | 'ID_CARD') => api.issueDocument(code, kind));
  const run = async (kind: 'APPOINTMENT_LETTER' | 'ID_CARD', done: string) => {
    try {
      await issue.mutateAsync(kind);
      toast.success(done);
    } catch (err) {
      if (err instanceof api.ApiError) {
        toast.error(err.errors.flatMap((x) => x.messages).join(' ') || err.message);
        focusField(err.errors[0]?.field);
      }
    }
  };

  return (
    <Section title="Statutory paperwork" desc="The appointment letter and ID card are issued from here, and kept on the Documents tab.">
      <FieldGrid>
        <Field htmlFor="f-appointment" label="Appointment letter" required span={3} help={emp.appointmentLetter ? undefined : 'A compliance risk until it is issued.'}>
          <div id="f-appointment" tabIndex={-1} className="flex flex-wrap items-center gap-2 rounded-xl outline-none">
            <Chip tone={emp.appointmentLetter ? 'success' : 'danger'} dot>
              {emp.appointmentLetter ? 'Issued' : 'Not issued'}
            </Chip>
            <VioletButton
              variant="outline"
              size="sm"
              disabled={issue.isPending}
              onClick={() => void run('APPOINTMENT_LETTER', 'Appointment letter issued')}
            >
              {emp.appointmentLetter ? 'Reissue' : 'Issue appointment letter'}
            </VioletButton>
          </div>
        </Field>
        <Field htmlFor="f-idcard" label="ID card" required span={3}>
          <div id="f-idcard" tabIndex={-1} className="flex flex-wrap items-center gap-2 rounded-xl outline-none">
            <Chip tone={emp.idCard ? 'success' : 'neutral'} dot>
              {emp.idCard ? `Issued ${date(emp.idCardDate)}` : 'Not issued'}
            </Chip>
            <VioletButton variant="outline" size="sm" disabled={issue.isPending} onClick={() => void run('ID_CARD', 'ID card issued')}>
              {emp.idCard ? 'Reissue' : 'Issue ID card'}
            </VioletButton>
          </div>
        </Field>
      </FieldGrid>
    </Section>
  );
}
