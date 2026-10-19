'use client';

/**
 * Set up salary (docs/frontend/salary-profile.md §11.4, §13.2): five steps,
 * previewing throughout. Assigning and reassigning are one wizard: a
 * reassignment starts from what is in force and defaults to the next
 * unprocessed period, never the joining date.
 *
 * Step 1 offers templates only. A deviation from a template is made after
 * setup, as an override, so it is measured and recorded with its reason.
 */

import * as React from 'react';
import { toast } from '@/lib/ToastService';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { parseAmount } from '@/app/dashboard/hris/employee/employees/_bd/format';
import type { FloorCheck, SalaryStructure } from '@/app/dashboard/hris/employee/employees/_bd/types';
import { DateInput, DrawerHead, Field, SideDrawer, Spinner, TextArea, TextInput } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { ArrearsTable, Pills, RefusalNote, WarningList, usePreview } from '@/app/dashboard/hris/employee/employees/_bd/salary/shared';
import * as api from './api';
import { useSalaryInvalidate } from './hooks';
import { StructureTable } from './parts';
import type { SalaryProfileRead, WriteInput } from './types';

const STEPS = ['Method', 'Amount', 'Review', 'Effective date', 'Confirm'] as const;
type DateChoice = 'joining' | 'next' | 'custom';

export function SetupWizard({ profile: p, current, onClose }: { profile: SalaryProfileRead; current: SalaryStructure | null; onClose: () => void }) {
  const { money, date, n } = useLang();
  const code = p.employee.code;
  const titleId = React.useId();
  const invalidate = useSalaryInvalidate(code);
  const reassigning = !!p.latest;

  const [step, setStep] = React.useState(0);
  const [template, setTemplate] = React.useState(() => current?.template && p.templates.some((t) => t.id === current.template) ? current.template : p.templates[0]?.id ?? '');
  const [gross, setGross] = React.useState(() => (current ? String(Number((p.templates.find((t) => t.id === current.template)?.amountMeans === 'basic' || current.template === 'rmg') ? current.basic : current.gross)) : ''));
  const [dateChoice, setDateChoice] = React.useState<DateChoice>(() => (reassigning ? 'next' : p.defaults.joiningDate ? 'joining' : 'custom'));
  const [customDate, setCustomDate] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');
  const [arrearsRun, setArrearsRun] = React.useState('NEXT_RUN');
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<ApiError | null>(null);
  const key = React.useRef(api.newIdempotencyKey());

  const chosen = p.templates.find((t) => t.id === template);
  const basicUp = chosen?.amountMeans === 'basic';
  const amount = parseAmount(gross);
  const effectiveFrom =
    dateChoice === 'custom' ? customDate : dateChoice === 'joining' ? p.defaults.joiningDate : (p.defaults.revision ?? p.defaults.nextPeriodStart);

  const input: WriteInput | null =
    !template || (!amount && !basicUp)
      ? null
      : {
          templateCode: template,
          gross: amount || null,
          // Steps 1-3 preview on a provisional date when none is chosen yet;
          // step 4 will not continue until one is.
          effectiveFrom: effectiveFrom ?? p.defaults.currentPeriodStart,
          revisionType: reassigning ? 'STRUCTURE_CHANGE' : 'FIRST_ASSIGNMENT',
          reason,
          arrearsRun,
          ...(reassigning ? { expectedStructure: p.latest } : {}),
        };
  const preview = usePreview(input, (i) => api.writeStructure(code, { ...i, preview: true }));
  const outcome = preview.outcome;
  const consequence = outcome?.consequence ?? preview.consequence;
  const floors: FloorCheck[] = outcome?.floors ?? (preview.consequence?.floors as FloorCheck[] | undefined) ?? [];
  const required = (preview.error?.consequence as { requiredGross?: string } | null)?.requiredGross ?? null;
  const backdated = !!outcome?.backdated && reassigning;

  const checks: { label: string; kind: 'ok' | 'warn' | 'bad' }[] = [
    { label: outcome ? 'Structure reconciles to gross' : 'Structure not built yet', kind: outcome ? 'ok' : 'warn' },
    ...floors.map((f) => ({
      label: `${f.kind === 'basic' ? 'Basic' : 'Total wage'} ${f.passed ? 'clears' : 'is below'} the gazetted ${f.kind} minimum for ${f.grade ?? 'the default grade'} (${money(f.floor)})`,
      kind: (f.passed ? 'ok' : 'bad') as 'ok' | 'bad',
    })),
    { label: p.employee.etinOnFile ? 'e-TIN on file' : 'No e-TIN on file — required once a tax liability arises', kind: p.employee.etinOnFile ? 'ok' : 'warn' },
  ];
  const canNext = [!!template, !!outcome, !!outcome, !!effectiveFrom && !!outcome, false][step];

  const commit = async () => {
    if (!input || !outcome) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await api.writeStructure(code, { ...input, preview: false }, key.current);
      await invalidate();
      toast.success(
        reassigning
          ? `Reassigned to the ${saved.templateName} from ${date(saved.effectiveFrom)} — the previous structure is closed, not overwritten`
          : `Salary set up on the ${saved.templateName} from ${date(saved.effectiveFrom)}`
      );
      onClose();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err : new ApiError(0, 'The structure could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SideDrawer onClose={onClose} labelledBy={titleId} width={620}>
      <DrawerHead id={titleId} title={reassigning ? 'Reassign template' : 'Set up salary'} sub="Five steps, previewing throughout" onClose={onClose} />
      <div className="flex-1 space-y-3.5 overflow-y-auto bg-[#F8F7FC] px-5 py-4">
        <nav aria-label="Steps" className="bd-steps">
          {STEPS.map((label, i) => (
            <button key={label} type="button" className="bd-step" aria-current={i === step ? 'step' : undefined} disabled={i > step && !canNext} onClick={() => i <= step && setStep(i)}>
              <span className="bd-step-n" aria-hidden="true">
                {n(i + 1)}
              </span>
              {label}
            </button>
          ))}
        </nav>

        {step === 0 && (
          <div role="radiogroup" aria-label="Salary template" className="space-y-2.5">
            {p.templates.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={template === t.id} className="bd-choice" onClick={() => setTemplate(t.id)}>
                <span className="bd-radio" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-2">
                    <span className="text-[13px] font-bold">{t.name}</span>
                    <span className="bd-mono rounded-full bg-[rgba(124,77,255,0.1)] px-2 py-0.5 text-[11px] font-bold text-[#6B3FE8]">
                      {t.mode === 'BASIC_UP' ? 'Basic-up · gazette' : `Gross-down · ${t.split}`}
                    </span>
                  </span>
                  <span className="mt-1 block text-[12px] leading-relaxed text-[#6F6A85]">{t.note}</span>
                </span>
              </button>
            ))}
            <p className="bd-help">A one-off arrangement is made after setup, as an override: measured against the template and recorded with its reason.</p>
          </div>
        )}

        {step === 1 && (
          <>
            <div className="bd-panel">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-[12.5px] font-bold">{chosen?.name}</span>
                <span className="bd-mono rounded-full bg-[rgba(124,77,255,0.1)] px-2 py-0.5 text-[11px] font-bold text-[#6B3FE8]">{chosen?.split ?? 'Gazette'}</span>
              </div>
              <Field
                htmlFor="wiz-gross"
                label={basicUp ? 'Basic monthly' : 'Gross monthly'}
                required={!basicUp}
                span={6}
                className="mt-3.5"
                help={
                  basicUp
                    ? "Leave blank for the grade's gazetted basic, raised to clear both floors."
                    : `Checked against the gazetted minimum for ${p.employee.gradeLabel}. Accepts 50,000 · 50000 · ৳50,000.`
                }
              >
                <TextInput id="wiz-gross" inputMode="decimal" className="bd-mono !h-[46px] max-w-[260px] !text-[18px] !font-bold" value={gross} onChange={setGross} placeholder={basicUp ? 'Gazetted' : '0'} />
              </Field>
              {required && (
                <div className="bd-note bd-tone-blocked mt-3 !items-center">
                  <span className="flex-1">Below the gazetted minimum. A gross of {money(required)} clears both floors on this template.</span>
                  <button type="button" className="bd-btn" onClick={() => setGross(String(Number(required)))}>
                    Raise to the minimum
                  </button>
                </div>
              )}
            </div>
            {preview.loading && !outcome && (
              <div className="flex items-center gap-2 text-[12.5px] text-[#6F6A85]">
                <Spinner /> Building…
              </div>
            )}
            {!required && <RefusalNote error={preview.error} except={['reason']} />}
            {outcome && <StructureTable components={outcome.components} gross={outcome.gross} words={outcome.grossInWords} caption="Components this amount builds" />}
          </>
        )}

        {step === 2 && outcome && (
          <>
            <StructureTable components={outcome.components} gross={outcome.gross} caption="The structure to be saved" />
            <ul className="m-0 list-none space-y-1.5 p-0">
              {checks.map((c) => (
                <li key={c.label} className={`bd-note !py-2 !text-[12px] ${c.kind === 'ok' ? 'bd-tone-ok' : c.kind === 'warn' ? 'bd-tone-warn' : 'bd-tone-blocked'}`}>
                  <span className="sr-only">{c.kind === 'ok' ? 'Passes:' : c.kind === 'warn' ? 'Warning:' : 'Fails:'}</span>
                  {c.label}
                </li>
              ))}
            </ul>
            <WarningList warnings={outcome.warnings.filter((w) => w.key !== 'salary.backdated')} />
            <div className="bd-panel">
              <div className="text-[13px] font-bold">Employer cost</div>
              <div className="bd-mono mt-1 text-[20px] font-bold text-[#5A2BE0]">{money(outcome.employerCost.total)}</div>
              <div className="text-[11.5px] text-[#6F6A85]">{outcome.employerCost.overheadLabel} · {money(outcome.employerCost.annual)} a year</div>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="bd-panel space-y-3">
            <div>
              <div className="bd-label mb-1.5 block">Effective from</div>
              <Pills
                options={[
                  ...(!reassigning && p.defaults.joiningDate ? [{ value: 'joining', label: `Date of joining · ${date(p.defaults.joiningDate)}` }] : []),
                  ...(reassigning ? [{ value: 'next', label: `Next period · ${date(p.defaults.revision ?? p.defaults.nextPeriodStart)}` }] : []),
                  { value: 'custom', label: 'Another date' },
                ]}
                value={dateChoice}
                onChange={(v) => setDateChoice(v as DateChoice)}
                ariaLabel="Effective from"
              />
              {dateChoice === 'custom' && <DateInput aria-label="Effective date" className="mt-2 max-w-[220px]" value={customDate} onChange={setCustomDate} />}
              {!p.defaults.joiningDate && !reassigning && <p className="bd-help">No date of joining is on file, so name the date the structure starts.</p>}
            </div>
            <RefusalNote error={preview.error} except={['reason']} />
            <ArrearsTable consequence={consequence} arrearsRun={arrearsRun} onArrearsRun={setArrearsRun} />
            {reassigning && (
              <Field
                htmlFor="wiz-reason"
                label="Reason"
                required={backdated}
                span={6}
                help={backdated ? 'A past date on an existing structure reopens processed periods: say why (at least 10 characters).' : 'Written to the salary history.'}
                errors={preview.error?.messagesFor('reason')}
              >
                <TextArea id="wiz-reason" rows={2} value={reason} onChange={setReason} />
              </Field>
            )}
          </div>
        )}

        {step === 4 && outcome && (
          <div className="bd-panel">
            <dl className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
              {[
                ['Template', outcome.templateName],
                ['Gross monthly', money(outcome.gross)],
                ['Basic', money(outcome.basic)],
                ['Effective from', date(outcome.effectiveFrom)],
                ['Employer cost', money(outcome.employerCost.total)],
                ['Status', outcome.status === 'SCHEDULED' ? 'Scheduled' : 'In force'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="bd-eyebrow !text-[10.5px]">{label}</dt>
                  <dd className="bd-mono m-0 mt-0.5 text-[13px] font-bold">{value}</dd>
                </div>
              ))}
            </dl>
            {reassigning && current && <p className="bd-help !mt-3">The structure in force closes the day before; it is never overwritten.</p>}
          </div>
        )}
        <RefusalNote error={saveError} />

        <div className="flex flex-wrap items-center gap-2.5 pb-2">
          {step > 0 && (
            <button type="button" className="bd-btn" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < 4 ? (
            <button type="button" className="bd-btn-primary" disabled={!canNext || preview.loading} onClick={() => setStep(step + 1)}>
              Continue
            </button>
          ) : (
            <button type="button" className="bd-btn-primary" disabled={!outcome || saving || preview.loading} onClick={() => void commit()}>
              {saving ? 'Saving…' : reassigning ? 'Reassign' : 'Save structure'}
            </button>
          )}
        </div>
      </div>
    </SideDrawer>
  );
}
