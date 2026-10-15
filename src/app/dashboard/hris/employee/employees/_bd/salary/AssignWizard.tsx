'use client';

/** Assign the first salary structure (backend §5.2): template → amount → review → effective date. */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Modal, VioletButton } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import * as api from '../api';
import { useEmployeeMutation } from '../hooks';
import { useLang } from '../i18n';
import { parseAmount, todayISO } from '../format';
import type { AssignInput, Profile, SalaryRead } from '../types';
import { DateInput, Field, Spinner, inputClass } from '../ui';
import { ArrearsTable, ComponentsTable, FloorList, RefusalNote, WarningList, usePreview } from './shared';

const STEPS = ['Template', 'Amount', 'Review', 'Effective date'];

export function AssignWizard({ profile, salary, onClose }: { profile: Profile; salary: SalaryRead; onClose: () => void }) {
  const { date, n, money } = useLang();
  const code = profile.code;
  const doj = profile.employment.doj;
  const [step, setStep] = React.useState(0);
  const [template, setTemplate] = React.useState(salary.templates[0]?.id ?? 'std');
  const [amount, setAmount] = React.useState('');
  // The preview needs a date; with no joining date on file, start from today.
  const [effectiveFrom, setEffectiveFrom] = React.useState<string | null>(doj ?? todayISO());
  const [arrearsRun, setArrearsRun] = React.useState('NEXT_RUN');
  const tpl = salary.templates.find((x) => x.id === template) ?? salary.templates[0];
  const basicUp = tpl?.amountMeans === 'basic';
  const parsed = parseAmount(amount);

  const input: AssignInput | null =
    parsed || basicUp ? { template, amount: parsed || null, effectiveFrom, arrearsRun, preview: true } : null;
  const preview = usePreview(input, (i) => api.assignSalary(code, i));
  const commit = useEmployeeMutation(code, (i: AssignInput) => api.assignSalary(code, i));

  const outcome = preview.outcome;
  const floors = outcome?.floors ?? preview.consequence?.floors ?? [];
  const floorsOk = !!outcome && floors.every((f) => f.passed);
  const canNext = [!!tpl, floorsOk, true, !!effectiveFrom && !!outcome][step];

  const save = async () => {
    try {
      await commit.mutateAsync({ template, amount: parsed || null, effectiveFrom, arrearsRun });
      toast.success('Salary structure assigned');
      onClose();
    } catch (err) {
      if (err instanceof api.ApiError) toast.error(err.message);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      width={960}
      title="Assign salary structure"
      sub={`${profile.personal.nameEn} · ${profile.code}${profile.employment.grade ? ' · ' + profile.employment.grade : ''}`}
      footer={
        <>
          {step > 0 && (
            <VioletButton variant="outline" size="sm" onClick={() => setStep(step - 1)}>
              Back
            </VioletButton>
          )}
          <span className="min-w-0 flex-1 truncate text-[11.5px] text-v-ink400">
            {step === 3 && preview.consequence?.reopenedCount
              ? `Assigning queues ${money(preview.consequence.arrears, 2)} of arrears.`
              : 'Nothing is saved until the last step.'}
          </span>
          {step < 3 ? (
            <VioletButton size="sm" disabled={!canNext} onClick={() => setStep(step + 1)}>
              Next
            </VioletButton>
          ) : (
            <VioletButton size="sm" disabled={!canNext || commit.isPending} onClick={() => void save()}>
              {commit.isPending ? 'Assigning…' : 'Assign structure'}
            </VioletButton>
          )}
        </>
      }
    >
      <ol className="mb-4 flex flex-wrap gap-1.5">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold',
              i === step ? 'bg-[rgba(124,77,255,0.12)] text-v-primary-deep' : 'bg-[rgba(22,23,42,0.04)] text-v-ink400'
            )}
          >
            <span
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded-full text-[9.5px]',
                i === step ? 'bg-v-primary text-white' : 'bg-[rgba(22,23,42,0.1)] text-v-ink400'
              )}
            >
              {n(i + 1)}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {step === 0 && (
            <div role="radiogroup" aria-label="Template" className="space-y-2">
              {salary.templates.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={x.id === template}
                  onClick={() => setTemplate(x.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left transition-colors',
                    x.id === template ? 'border-[rgba(124,77,255,0.34)] bg-[rgba(124,77,255,0.05)]' : 'border-[rgba(22,23,42,0.1)] bg-white hover:border-[rgba(124,77,255,0.25)]'
                  )}
                >
                  <span className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px]', x.id === template ? 'border-v-primary' : 'border-[rgba(22,23,42,0.2)]')}>
                    {x.id === template && <span className="h-2 w-2 rounded-full bg-v-primary" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-v-ink900">{x.name}</span>
                    <span className="block text-[11.5px] leading-snug text-v-ink500">{x.rule}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-v-wash2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-v-ink500">
                    {x.mode === 'GROSS_DOWN' ? 'Gross-down' : 'Basic-up'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <>
              <Field
                htmlFor="wiz-amount"
                label={basicUp ? 'Monthly basic' : 'Monthly gross'}
                required={!basicUp}
                span={6}
                help={
                  basicUp
                    ? "Leave blank to start from the grade's gazetted basic; the gazetted allowances go on top."
                    : 'Accepts 50,000 · 50000 · ৳50,000. Basic absorbs the rounding, so the parts sum to gross exactly.'
                }
                errors={preview.error?.messagesFor('amount')}
              >
                <input
                  id="wiz-amount"
                  inputMode="decimal"
                  autoFocus
                  className={cn(inputClass(!!preview.error?.messagesFor('amount').length), 'text-right text-[15px] font-bold tabular-nums')}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={basicUp ? 'Gazetted basic' : '50,000'}
                />
              </Field>
              <FloorList floors={floors} />
              <RefusalNote error={preview.error} except={['amount']} />
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-[13px] font-bold text-v-ink900">Compliance checks</div>
              <FloorList floors={floors} />
              <WarningList warnings={outcome?.warnings ?? []} />
              {outcome && !outcome.warnings.length && floorsOk && (
                <div className="text-[12px] text-v-ink500">No warnings. Warnings never block; a floor below the gazette does.</div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Field
                htmlFor="wiz-eff"
                label="Effective from"
                required
                span={6}
                help={doj ? `Defaults to the date of joining, ${date(doj)}.` : 'No date of joining on file — choose the first day this structure pays.'}
                errors={preview.error?.messagesFor('effectiveFrom')}
              >
                <DateInput id="wiz-eff" value={effectiveFrom} min={doj ?? undefined} onChange={setEffectiveFrom} />
              </Field>
              <ArrearsTable consequence={preview.consequence} arrearsRun={arrearsRun} onArrearsRun={setArrearsRun} />
              <RefusalNote error={preview.error} except={['effectiveFrom']} />
            </>
          )}
        </div>

        <div className="rounded-2xl bg-v-wash p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-v-ink400">
            Live preview {preview.loading && <Spinner className="h-3 w-3" />}
          </div>
          {outcome ? (
            <ComponentsTable components={outcome.components} gross={outcome.gross} words={outcome.grossInWords} loading={preview.loading} />
          ) : (
            <div className="py-8 text-center text-[12px] text-v-ink400">
              {basicUp || parsed ? (preview.error ? 'Fix the amount to see the structure.' : 'Working it out…') : 'Enter an amount to see the components.'}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
