'use client';

/**
 * Revise the structure in force (backend §5.2, §6.2). The effective date
 * defaults to the start of the next unprocessed period. A backdated revision
 * needs a reason, and the preview says which processed periods it reopens and
 * the arrears — before anything is saved.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Modal, VioletButton } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import * as api from '../api';
import { ENUMS } from '../enums';
import { useEmployeeMutation } from '../hooks';
import { useLang } from '../i18n';
import { parseAmount, percentChange, subtractMoney, toPaisa } from '../format';
import type { Profile, ReviseInput, SalaryRead } from '../types';
import { DateInput, Field, SelectInput, Spinner, TextArea, inputClass } from '../ui';
import { MIN_REASON, reasonLength } from '../validate';
import { ArrearsTable, FloorList, Pills, RefusalNote, WarningList, usePreview } from './shared';

const ROUNDING = [
  { value: '0', label: 'None' },
  { value: '100', label: '৳100' },
  { value: '500', label: '৳500' },
  { value: '1000', label: '৳1,000' },
];

export function ReviseModal({ profile, salary, onClose }: { profile: Profile; salary: SalaryRead; onClose: () => void }) {
  const { money, n, date } = useLang();
  const code = profile.code;
  const current = salary.structure!;
  const basicUp = current.template === 'rmg';
  const methods = ENUMS.revisionMethod.filter((m) =>
    basicUp ? m.value !== 'NEW_GROSS' : m.value !== 'NEW_BASIC'
  );
  const [type, setType] = React.useState('INCREMENT');
  const [method, setMethod] = React.useState('PERCENTAGE_INCREASE');
  const [value, setValue] = React.useState('');
  const [template, setTemplate] = React.useState(salary.templates.find((x) => x.id !== current.template)?.id ?? 'std');
  const [rounding, setRounding] = React.useState('0');
  const [effectiveFrom, setEffectiveFrom] = React.useState<string | null>(salary.revisionDefault);
  const [reason, setReason] = React.useState('');
  const [arrearsRun, setArrearsRun] = React.useState('NEXT_RUN');

  const changeTemplate = method === 'CHANGE_TEMPLATE';
  const parsed = changeTemplate ? '' : parseAmount(value);
  const body: ReviseInput = {
    method,
    value: changeTemplate ? template : parsed || null,
    effectiveFrom,
    reason,
    rounding: Number(rounding),
    type,
    arrearsRun,
  };
  const ready = changeTemplate || !!parsed;
  const preview = usePreview(ready ? { ...body, preview: true } : null, (i) => api.reviseSalary(code, i));
  const commit = useEmployeeMutation(code, (i: ReviseInput) => api.reviseSalary(code, i));

  const outcome = preview.outcome;
  const consequence = preview.consequence;
  const floors = outcome?.floors ?? consequence?.floors ?? [];
  const warnings = outcome?.warnings ?? consequence?.warnings ?? [];
  const backdated = outcome?.backdated ?? warnings.some((w) => w.key === 'salary.backdated');
  const needsReason = backdated && reasonLength(reason) < MIN_REASON;
  const floorsFail = floors.some((f) => !f.passed);
  const otherError = preview.error && preview.error.errors.some((e) => e.path !== 'reason');
  const canCommit = ready && !preview.loading && !floorsFail && !needsReason && !otherError && (!!outcome || backdated);

  const save = async () => {
    try {
      await commit.mutateAsync(body);
      toast.success(`Salary revised — new record from ${date(effectiveFrom)}`);
      onClose();
    } catch (err) {
      if (err instanceof api.ApiError) toast.error(err.message);
    }
  };

  const next = outcome?.components ?? [];
  const codes = Array.from(new Set([...current.components.map((c) => c.code), ...next.map((c) => c.code)]));
  const amountOf = (list: { code: string; amount: string }[], c: string) => list.find((x) => x.code === c)?.amount ?? '0';

  return (
    <Modal
      open
      onClose={onClose}
      width={880}
      title="Revise salary"
      sub={`${profile.personal.nameEn} · ${profile.code} · nothing commits without a preview`}
      footer={
        <>
          <span className="min-w-0 flex-1 text-[11.5px] text-[#6E6883]">
            {floorsFail
              ? 'Cannot apply — below a gazetted floor.'
              : needsReason
                ? 'A backdated revision needs a reason of at least 10 characters.'
                : backdated && consequence?.reopenedCount
                  ? `Reopens ${n(consequence.reopenedCount)} processed period(s); ${money(consequence.arrears, 2)} of arrears queued.`
                  : 'The previous structure is closed, never overwritten.'}
          </span>
          <VioletButton variant="outline" size="sm" onClick={onClose}>
            Cancel
          </VioletButton>
          <VioletButton size="sm" disabled={!canCommit || commit.isPending} onClick={() => void save()}>
            {commit.isPending ? 'Applying…' : 'Apply revision'}
          </VioletButton>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 text-xs font-semibold text-v-ink700">Revision type</div>
          <Pills options={ENUMS.revisionType} value={type} onChange={setType} ariaLabel="Revision type" />
        </div>
        <div>
          <div className="mb-1.5 text-xs font-semibold text-v-ink700">Method</div>
          <Pills options={methods} value={method} onChange={setMethod} ariaLabel="Method" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {changeTemplate ? (
            <Field htmlFor="rev-template" label="New template" span={6}>
              <SelectInput
                id="rev-template"
                value={template}
                onChange={setTemplate}
                placeholder={null}
                options={salary.templates.filter((x) => x.id !== current.template).map((x) => ({ value: x.id, label: x.name }))}
              />
            </Field>
          ) : (
            <Field
              htmlFor="rev-value"
              label={
                method === 'PERCENTAGE_INCREASE'
                  ? `Increase % (of ${basicUp ? 'basic' : 'gross'})`
                  : method === 'FIXED_INCREASE'
                    ? `Increase amount (on ${basicUp ? 'basic' : 'gross'})`
                    : method === 'NEW_BASIC'
                      ? 'New basic'
                      : 'New gross'
              }
              span={6}
              errors={preview.error?.messagesFor('value')}
            >
              <input
                id="rev-value"
                inputMode="decimal"
                autoFocus
                className={cn(inputClass(!!preview.error?.messagesFor('value').length), 'text-right font-bold bd-mono')}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={method === 'PERCENTAGE_INCREASE' ? '8' : '25,000'}
              />
            </Field>
          )}
          <div>
            <div className="mb-1.5 text-xs font-semibold text-v-ink700">Rounding</div>
            <Pills options={ROUNDING} value={rounding} onChange={setRounding} ariaLabel="Rounding" />
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(22,23,42,0.08)]">
          <div className="flex items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-4 py-2.5 text-[12.5px] font-bold text-v-ink900">
            Change {preview.loading && <Spinner className="h-3 w-3" />}
          </div>
          <div className="px-4 py-2">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.7fr] pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#6E6883]">
              <span>Component</span>
              <span className="text-right">Current</span>
              <span className="text-right">New</span>
              <span className="text-right">Change</span>
              <span className="text-right">%</span>
            </div>
            {[...codes.map((c) => ({
              key: c,
              name: (next.find((x) => x.code === c) ?? current.components.find((x) => x.code === c))?.name ?? c,
              a: amountOf(current.components, c),
              b: next.length ? amountOf(next, c) : null,
              bold: false,
            })), { key: 'GROSS', name: 'Gross', a: current.gross, b: outcome?.gross ?? null, bold: true }].map((row) => {
              const delta = row.b === null ? null : subtractMoney(row.b, row.a);
              const sign = delta === null ? 0 : Number(toPaisa(delta) > BigInt(0)) - Number(toPaisa(delta) < BigInt(0));
              return (
                <div
                  key={row.key}
                  className={cn(
                    'grid grid-cols-[1.4fr_1fr_1fr_1fr_0.7fr] py-1.5 text-[12.5px] bd-mono',
                    row.bold && 'mt-1 border-t border-[rgba(22,23,42,0.12)] pt-2 font-bold'
                  )}
                >
                  <span className="text-v-ink900">{row.name}</span>
                  <span className="text-right text-v-ink500">{money(row.a)}</span>
                  <span className="text-right text-v-ink900">{row.b === null ? '—' : money(row.b)}</span>
                  <span className={cn('text-right', sign > 0 ? 'text-[#157A5B]' : sign < 0 ? 'text-[#E11D48]' : 'text-[#6E6883]')}>
                    {delta === null ? '—' : (sign > 0 ? '+' : '') + money(delta)}
                  </span>
                  <span className="text-right text-v-ink500">{row.b === null ? '—' : n(percentChange(row.a, row.b) ?? '—')}</span>
                </div>
              );
            })}
          </div>
        </div>

        <FloorList floors={floors.filter((f) => !f.passed)} />
        <WarningList warnings={warnings} />

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            htmlFor="rev-eff"
            label="Effective from"
            required
            span={6}
            help={`Defaults to ${date(salary.revisionDefault)}, the start of the next unprocessed period.`}
            errors={preview.error?.messagesFor('effectiveFrom')}
          >
            <DateInput id="rev-eff" value={effectiveFrom} onChange={setEffectiveFrom} />
          </Field>
          {backdated && (
            <Field
              htmlFor="rev-reason"
              label="Reason"
              required
              span={6}
              help={
                <span className={cn(needsReason ? 'text-[#E11D48]' : 'text-[#6E6883]')}>
                  {needsReason ? 'At least 10 characters — say why this starts in the past.' : `${n(reasonLength(reason))} characters`}
                </span>
              }
            >
              <TextArea
                id="rev-reason"
                rows={2}
                value={reason}
                onChange={setReason}
                placeholder="Why does this revision start in the past? Written to the salary history."
              />
            </Field>
          )}
        </div>

        <ArrearsTable consequence={consequence} arrearsRun={arrearsRun} onArrearsRun={setArrearsRun} />
        <RefusalNote error={preview.error} except={['reason', 'value', 'effectiveFrom']} />
      </div>
    </Modal>
  );
}
