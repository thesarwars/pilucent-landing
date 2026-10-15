'use client';

/**
 * Salary revision (docs/frontend/salary-profile.md §11.1). Nothing commits
 * without a preview: every figure below is the server's `preview: true`
 * answer, so the drawer and the saved structure cannot disagree.
 */

import * as React from 'react';
import { toast } from '@/lib/ToastService';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { subtractMoney, percentChange } from '@/app/dashboard/hris/employee/employees/_bd/format';
import type { SalaryOutcome, SalaryStructure } from '@/app/dashboard/hris/employee/employees/_bd/types';
import { DateInput, DrawerHead, Field, SideDrawer, Spinner, TextArea, TextInput } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { ArrearsTable, Pills, RefusalNote, WarningList, usePreview } from '@/app/dashboard/hris/employee/employees/_bd/salary/shared';
import * as api from './api';
import { useSalaryInvalidate } from './hooks';
import type { SalaryProfileRead, WriteInput } from './types';

const TYPES = [
  { value: 'INCREMENT', label: 'Increment' },
  { value: 'PROMOTION', label: 'Promotion' },
  { value: 'STRUCTURE_CHANGE', label: 'Structure change' },
  { value: 'CORRECTION', label: 'Correction' },
  { value: 'GRADE_REVISION', label: 'Grade revision' },
  { value: 'MINIMUM_WAGE_ADJUSTMENT', label: 'Minimum wage adjustment' },
];

const ROUNDING = [
  { value: '0', label: 'None' },
  { value: '100', label: '৳100' },
  { value: '500', label: '৳500' },
  { value: '1000', label: '৳1,000' },
];

type DateChoice = 'next' | 'month' | 'custom';

export function ReviseDrawer({ profile: p, structure, onClose }: { profile: SalaryProfileRead; structure: SalaryStructure; onClose: () => void }) {
  const { money, date, n } = useLang();
  const code = p.employee.code;
  const titleId = React.useId();
  const invalidate = useSalaryInvalidate(code);
  // The structure a revision follows: the latest -- a scheduled change if there is one.
  const base = (p.scheduled && !p.scheduled.masked ? (p.scheduled as SalaryStructure) : structure) ?? structure;
  const rmg = base.template === 'rmg';
  const methods = [
    { value: 'PERCENTAGE_INCREASE', label: 'Percentage increase' },
    { value: 'FIXED_INCREASE', label: 'Fixed increase' },
    rmg ? { value: 'NEW_BASIC', label: 'New basic' } : { value: 'NEW_GROSS', label: 'New gross' },
    { value: 'CHANGE_TEMPLATE', label: 'Change template' },
  ];

  const [type, setType] = React.useState('INCREMENT');
  const [method, setMethod] = React.useState('PERCENTAGE_INCREASE');
  const [value, setValue] = React.useState('8');
  const [template, setTemplate] = React.useState(() => p.templates.find((t) => t.id !== base.template)?.id ?? '');
  const [rounding, setRounding] = React.useState('0');
  const [dateChoice, setDateChoice] = React.useState<DateChoice>('next');
  const [customDate, setCustomDate] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');
  const [arrearsRun, setArrearsRun] = React.useState('NEXT_RUN');
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<ApiError | null>(null);
  const key = React.useRef(api.newIdempotencyKey());

  // Two computed dates, never literals (§11.1): the next unprocessed period
  // (clean) and the start of this month (backdated, with arrears).
  const next = p.defaults.revision ?? p.defaults.nextPeriodStart;
  const month = p.defaults.currentPeriodStart;
  const offerMonth = month < next && month > base.effectiveFrom;
  const effectiveFrom = dateChoice === 'custom' ? customDate : dateChoice === 'month' ? month : next;

  const valueLabel =
    method === 'PERCENTAGE_INCREASE' ? 'Increase %' : method === 'FIXED_INCREASE' ? 'Increase ৳' : method === 'NEW_BASIC' ? 'New basic ৳' : method === 'NEW_GROSS' ? 'New gross ৳' : 'Gross ৳ (optional)';

  const input: WriteInput | null =
    !effectiveFrom || (method !== 'CHANGE_TEMPLATE' && !value.trim()) || (method === 'CHANGE_TEMPLATE' && !template)
      ? null
      : {
          method,
          value: method === 'CHANGE_TEMPLATE' ? value.trim() || null : value.trim(),
          templateCode: method === 'CHANGE_TEMPLATE' ? template : null,
          rounding: Number(rounding),
          effectiveFrom,
          revisionType: type,
          reason,
          arrearsRun,
          expectedStructure: p.latest,
        };
  const preview = usePreview(input, (i) => api.writeStructure(code, { ...i, preview: true }));
  const outcome = preview.outcome;
  const backdated = !!outcome?.backdated || (preview.consequence?.reopenedCount ?? 0) > 0;

  const commit = async () => {
    if (!input || !outcome) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await api.writeStructure(code, { ...input, preview: false }, key.current);
      await invalidate();
      toast.success(
        saved.status === 'SCHEDULED'
          ? `Revision scheduled from ${date(saved.effectiveFrom)}`
          : `Revision saved from ${date(saved.effectiveFrom)} — the previous structure is closed, not overwritten`
      );
      onClose();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err : new ApiError(0, 'The revision could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SideDrawer onClose={onClose} labelledBy={titleId} width={620}>
      <DrawerHead id={titleId} title="Salary revision" sub={`${p.employee.nameEn} · ${code} · nothing commits without a preview`} onClose={onClose} />
      <div className="flex-1 space-y-3.5 overflow-y-auto bg-[#F8F7FC] px-5 py-4">
        {base !== structure && (
          <div className="bd-note bd-tone-warn !text-[12px]">
            A scheduled change from {date(base.effectiveFrom)} is the latest structure; this revision follows it.
          </div>
        )}
        <div className="bd-panel space-y-4">
          <div>
            <div className="bd-eyebrow mb-2">Revision type</div>
            <Pills options={TYPES} value={type} onChange={setType} ariaLabel="Revision type" />
          </div>
          <div>
            <div className="bd-eyebrow mb-2">Method</div>
            <Pills options={methods} value={method} onChange={(m) => (setMethod(m), m === 'CHANGE_TEMPLATE' ? setValue('') : !value && setValue('8'))} ariaLabel="Method" />
          </div>
          {method === 'CHANGE_TEMPLATE' && (
            <div>
              <div className="bd-eyebrow mb-2">New template</div>
              <Pills
                options={p.templates.filter((t) => t.id !== base.template).map((t) => ({ value: t.id, label: t.split ? `${t.name} · ${t.split}` : t.name }))}
                value={template}
                onChange={setTemplate}
                ariaLabel="New template"
              />
              <p className="bd-help">Overrides on the current structure do not carry to a new template; it is built on the template&apos;s own split.</p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <Field htmlFor="rev-value" label={valueLabel} span={6}>
              <TextInput id="rev-value" inputMode="decimal" className="bd-mono !text-[14px] !font-bold" value={value} onChange={setValue} />
            </Field>
            <div>
              <div className="bd-label mb-1.5 block">Rounding</div>
              <Pills options={ROUNDING} value={rounding} onChange={setRounding} ariaLabel="Rounding" />
            </div>
            <div>
              <div className="bd-label mb-1.5 block">Effective from</div>
              <Pills
                options={[
                  { value: 'next', label: `Next period · ${date(next)}` },
                  ...(offerMonth ? [{ value: 'month', label: `This month · ${date(month)}` }] : []),
                  { value: 'custom', label: 'Another date' },
                ]}
                value={dateChoice}
                onChange={(v) => setDateChoice(v as DateChoice)}
                ariaLabel="Effective from"
              />
              {dateChoice === 'custom' && <DateInput aria-label="Effective date" className="mt-2" value={customDate} onChange={setCustomDate} />}
            </div>
          </div>
        </div>

        {preview.loading && !outcome && (
          <div className="flex items-center gap-2 text-[12.5px] text-[#6F6A85]">
            <Spinner /> Previewing…
          </div>
        )}
        <RefusalNote error={preview.error} except={['reason']} />
        {preview.error?.consequence && 'requiredGross' in preview.error.consequence && preview.error.consequence.requiredGross ? (
          <div className="bd-help">A gross of {money(String(preview.error.consequence.requiredGross))} on this template clears both floors.</div>
        ) : null}

        {outcome && <CompareTable base={base} outcome={outcome} />}

        {outcome && (
          <div className="bd-panel">
            <div className="text-[13px] font-bold">What changes</div>
            <dl className="mt-3 space-y-2">
              {[
                ['Gross monthly', money(base.gross), money(outcome.gross)],
                ['Basic', money(base.basic), money(outcome.basic)],
                ['Total employer cost', p.employerCost ? money(p.employerCost.total) : '—', money(outcome.employerCost.total)],
                ['Annual cost', p.employerCost ? money(p.employerCost.annual) : '—', money(outcome.employerCost.annual)],
              ].map(([label, from, to]) => (
                <div key={label} className="flex flex-wrap items-baseline gap-2.5">
                  <dt className="min-w-[150px] flex-1 text-[12.5px] text-[#44405C]">{label}</dt>
                  <dd className="bd-mono m-0 text-[12px] text-[#6E6883]">{from}</dd>
                  <span aria-hidden="true" className="text-[#B8B2CB]">
                    →
                  </span>
                  <dd className="bd-mono m-0 min-w-[92px] text-right text-[12.5px] font-bold text-[#5A2BE0]">{to}</dd>
                </div>
              ))}
            </dl>
            {outcome.gratuity && <div className="bd-note bd-tone-warn mt-3 !text-[12px] !font-medium">{outcome.gratuity.note}</div>}
            <div className="mt-3">
              <WarningList warnings={outcome.warnings.filter((w) => w.key !== 'salary.backdated')} />
            </div>
          </div>
        )}

        <ArrearsTable consequence={outcome?.consequence ?? preview.consequence} arrearsRun={arrearsRun} onArrearsRun={setArrearsRun} />

        <div className="bd-panel">
          <Field
            htmlFor="rev-reason"
            label="Reason"
            required={backdated}
            span={6}
            help={
              backdated
                ? `Backdated into ${n(outcome?.consequence.reopenedCount ?? preview.consequence?.reopenedCount ?? 0)} processed period(s): a reason of at least 10 characters is required.`
                : 'Written to the salary history and the audit.'
            }
            errors={preview.error?.messagesFor('reason').length ? preview.error.messagesFor('reason') : saveError?.messagesFor('reason')}
          >
            <TextArea id="rev-reason" rows={2} value={reason} onChange={setReason} placeholder="Why is this salary changing?" />
          </Field>
        </div>
        <RefusalNote error={saveError} except={['reason']} />

        <div className="flex flex-wrap items-center gap-3 pb-2">
          <button type="button" className="bd-btn-primary" disabled={!outcome || saving || preview.loading} onClick={() => void commit()}>
            {saving ? 'Saving…' : outcome?.status === 'SCHEDULED' ? 'Schedule revision' : 'Save revision'}
          </button>
          <span className="min-w-[240px] flex-1 text-[11.5px] leading-relaxed text-[#6F6A85]">
            Saving closes the current structure the day before {effectiveFrom ? date(effectiveFrom) : 'the effective date'} — it is never overwritten,
            so any period already paid on it still reproduces.
          </span>
        </div>
      </div>
    </SideDrawer>
  );
}

/** Component by component: current, new, the change and the percentage. */
function CompareTable({ base, outcome }: { base: SalaryStructure; outcome: SalaryOutcome }) {
  const { money, n } = useLang();
  const codes = [...new Set([...base.components.map((c) => c.code), ...outcome.components.map((c) => c.code)])];
  const rows = codes.map((code) => {
    const a = base.components.find((c) => c.code === code);
    const b = outcome.components.find((c) => c.code === code);
    return { code, name: (b ?? a)!.name, current: a?.amount ?? '0', next: b?.amount ?? '0' };
  });
  const tone = (d: string) => (Number(d) > 0 ? 'text-[#157A5B]' : Number(d) < 0 ? 'text-[#E11D48]' : 'text-[#6E6883]');
  const line = (name: string, current: string, next: string, strong = false) => {
    const delta = subtractMoney(next, current);
    const pct = percentChange(current, next);
    return (
      <tr key={name} className={strong ? 'font-bold' : undefined}>
        <th scope="row" className={strong ? 'font-bold' : 'font-medium'}>
          {name}
        </th>
        <td className="num text-[#6F6A85]">{money(current)}</td>
        <td className="num">{money(next)}</td>
        <td className={`num font-bold ${tone(delta)}`}>
          {Number(delta) > 0 ? '+' : ''}
          {money(delta)}
        </td>
        <td className={`num text-[11.5px] ${tone(delta)}`}>{pct === null ? '—' : n(pct)}</td>
      </tr>
    );
  };
  return (
    <div className="bd-table-wrap !bg-white">
      <table className="bd-table">
        <caption className="px-[15px] pt-3 text-left text-[13px] font-bold">Change</caption>
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col" className="num">
              Current
            </th>
            <th scope="col" className="num">
              New
            </th>
            <th scope="col" className="num">
              Change
            </th>
            <th scope="col" className="num">
              %
            </th>
          </tr>
        </thead>
        <tbody>{rows.map((r) => line(r.name, r.current, r.next))}</tbody>
        <tfoot>{line('Gross', base.gross, outcome.gross, true)}</tfoot>
      </table>
    </div>
  );
}
