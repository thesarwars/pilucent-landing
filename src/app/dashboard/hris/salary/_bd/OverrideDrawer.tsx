'use client';

/**
 * Component overrides (docs/frontend/salary-profile.md §11.2): deviate from
 * the template without abandoning it. Each line is set against the
 * template's own value, shown beside it; the server measures which lines are
 * actually overridden and reconciles the structure. Saving creates a new
 * structure from the next unprocessed period — the current one is closed,
 * never edited.
 *
 * The grid is this drawer's own state, created when it opens and dropped when
 * it closes, so the next employee never inherits these rows (§13.1).
 */

import * as React from 'react';
import { toast } from '@/lib/ToastService';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import type { SalaryStructure, SalaryTemplate } from '@/app/dashboard/hris/employee/employees/_bd/types';
import { DrawerHead, Field, SideDrawer, Spinner, TextArea } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { ArrearsTable, RefusalNote, WarningList, usePreview } from '@/app/dashboard/hris/employee/employees/_bd/salary/shared';
import * as api from './api';
import { useSalaryInvalidate } from './hooks';
import type { OverrideBasis, OverrideInput, OverrideRowInput, SalaryProfileRead } from './types';

type Code = OverrideRowInput['code'];
type Row = { code: Code; name: string; basis: OverrideBasis; value: string; tBasis: OverrideBasis; tValue: string };

const NAMES: Record<Code, string> = {
  BASIC: 'Basic salary',
  HRA: 'House rent allowance',
  MED: 'Medical allowance',
  CONV: 'Conveyance allowance',
  OTHER: 'Other allowance (balancing)',
};
const BASES: { value: OverrideBasis; label: string }[] = [
  { value: 'PCT_GROSS', label: '% gross' },
  { value: 'PCT_BASIC', label: '% basic' },
  { value: 'FIXED', label: 'Fixed' },
];

/** The grid's starting rows: what is on file (any override carried), else the template. */
function initialRows(structure: SalaryStructure, template: SalaryTemplate | undefined): Row[] {
  const t: Record<Code, [OverrideBasis, string]> = {
    BASIC: ['PCT_GROSS', template?.basicPct ?? '0'],
    HRA: ['PCT_BASIC', template?.hrPctOfBasic ?? '0'],
    MED: ['PCT_GROSS', template?.medPct ?? '0'],
    CONV: ['PCT_GROSS', template?.convPct ?? '0'],
    OTHER: ['FIXED', '0'],
  };
  return (Object.keys(NAMES) as Code[]).map((code) => {
    const o = structure.overrides?.find((x) => x.code === code);
    const [tBasis, tValue] = t[code];
    return { code, name: NAMES[code], basis: o?.basis ?? tBasis, value: o ? String(Number(o.value)) : tValue, tBasis, tValue };
  });
}

export function OverrideDrawer({ profile: p, structure, onClose }: { profile: SalaryProfileRead; structure: SalaryStructure; onClose: () => void }) {
  const { money, date, n } = useLang();
  const code = p.employee.code;
  const titleId = React.useId();
  const invalidate = useSalaryInvalidate(code);
  const template = p.templates.find((t) => t.id === structure.template);
  const [rows, setRows] = React.useState<Row[]>(() => initialRows(structure, template));
  const [mode, setMode] = React.useState<OverrideInput['mode']>('REBALANCE');
  const [reason, setReason] = React.useState('');
  const [arrearsRun, setArrearsRun] = React.useState('NEXT_RUN');
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<ApiError | null>(null);
  const key = React.useRef(api.newIdempotencyKey());
  const base = p.latest ?? structure.uid;

  const patch = (c: Code, change: Partial<Row>) => setRows((list) => list.map((r) => (r.code === c ? { ...r, ...change } : r)));
  const sendable = rows.every((r) => r.value.trim() !== '' && Number.isFinite(Number(r.value)));
  const changed = rows.filter((r) => r.basis !== r.tBasis || Number(r.value) !== Number(r.tValue)).length;
  // Nothing to preview until a line differs from what is in force.
  const input: OverrideInput | null = sendable && (changed > 0 || mode === 'CHANGE')
    ? { rows: rows.map(({ code: c, basis, value }) => ({ code: c, basis, value: value.trim() })), mode, reason, arrearsRun }
    : null;
  const preview = usePreview(input, (i) => api.overrideStructure(base, { ...i, preview: true }));
  const outcome = preview.outcome;
  const amounts = Object.fromEntries((outcome?.components ?? []).map((c) => [c.code, c]));
  const reasonShort = reason.trim().length < 10;

  const commit = async () => {
    if (!input || !outcome) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await api.overrideStructure(base, { ...input, preview: false }, key.current);
      await invalidate();
      toast.success(
        `${n(saved.structure?.overrideCount ?? changed)} component(s) overridden — a new structure from ${date(saved.effectiveFrom)}. The current one is closed, never edited.`
      );
      onClose();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err : new ApiError(0, 'The overrides could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SideDrawer onClose={onClose} labelledBy={titleId} width={620}>
      <DrawerHead id={titleId} title="Component overrides" sub="Deviate from the template without abandoning it" onClose={onClose} />
      <div className="flex-1 space-y-3.5 overflow-y-auto bg-[#F8F7FC] px-5 py-4">
        <div className="bd-panel">
          <div className="bd-eyebrow">Adjustment mode</div>
          <div role="radiogroup" aria-label="Adjustment mode" className="mt-2 space-y-2">
            {(
              [
                ['REBALANCE', 'Keep gross, rebalance', 'Gross is fixed. Other allowance absorbs the difference. Default.'],
                ['CHANGE', 'Let gross change', 'Gross becomes the sum of the components.'],
              ] as const
            ).map(([id, label, note]) => (
              <button key={id} type="button" role="radio" aria-checked={mode === id} className="bd-choice !py-3" onClick={() => setMode(id)}>
                <span className="bd-radio" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-bold">{label}</span>
                  <span className="mt-0.5 block text-[11.5px] text-[#6F6A85]">{note}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bd-table-wrap !bg-white">
          <table className="bd-table">
            <caption className="sr-only">Components, their basis and value, against the template</caption>
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Basis</th>
                <th scope="col" className="num">
                  Value
                </th>
                <th scope="col" className="num">
                  Amount
                </th>
                <th scope="col">Template</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const balancing = r.code === 'OTHER' && mode === 'REBALANCE';
                const line = amounts[r.code];
                const differs = r.basis !== r.tBasis || Number(r.value) !== Number(r.tValue);
                return (
                  <tr key={r.code}>
                    <th scope="row" className="font-semibold">
                      {r.name}
                    </th>
                    <td>
                      <div role="radiogroup" aria-label={`${r.name} basis`} className="flex flex-wrap gap-1">
                        {BASES.filter((b) => !(r.code === 'BASIC' && b.value === 'PCT_BASIC')).map((b) => (
                          <button
                            key={b.value}
                            type="button"
                            role="radio"
                            aria-checked={r.basis === b.value}
                            disabled={balancing}
                            onClick={() => patch(r.code, { basis: b.value })}
                            className="bd-filter !h-6 !rounded-[7px] !px-1.5 !text-[10px]"
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="num">
                      <input
                        aria-label={`${r.name} value`}
                        inputMode="decimal"
                        disabled={balancing}
                        value={balancing ? '' : r.value}
                        placeholder={balancing ? 'balance' : undefined}
                        onChange={(e) => patch(r.code, { value: e.target.value.replace(/[^0-9.]/g, '') })}
                        className="bd-input bd-mono !h-8 !w-[84px] !px-2 text-right"
                      />
                    </td>
                    <td className="num font-bold">{line ? money(line.amount) : r.code === 'OTHER' ? money('0') : '—'}</td>
                    <td>
                      {differs && !balancing ? (
                        <span className="flex flex-wrap items-center gap-1">
                          <span className="bd-tag-override">OVERRIDE</span>
                          <button
                            type="button"
                            className="text-[10.5px] font-bold text-[#6B3FE8] underline"
                            onClick={() => patch(r.code, { basis: r.tBasis, value: r.tValue })}
                            title={`Back to the template: ${r.tValue}${r.tBasis === 'FIXED' ? '' : r.tBasis === 'PCT_BASIC' ? '% of basic' : '% of gross'}`}
                          >
                            Revert
                          </button>
                        </span>
                      ) : (
                        <span className="text-[10.5px] text-[#6E6883]">
                          {r.tBasis === 'FIXED' ? 'Template' : `${n(r.tValue)}% ${r.tBasis === 'PCT_BASIC' ? 'basic' : 'gross'}`}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Gross</th>
                <td colSpan={2}>
                  <span className={preview.error ? 'text-[11.5px] text-[#E11D48]' : 'text-[11.5px] text-[#157A5B]'}>
                    {preview.loading ? 'Checking…' : preview.error ? 'Blocked' : outcome ? 'Reconciled' : '—'}
                  </span>
                </td>
                <td className="num bd-cost-total text-[14px]">{outcome ? money(outcome.gross) : money(structure.gross)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {preview.loading && !outcome && (
          <div className="flex items-center gap-2 text-[12.5px] text-[#6F6A85]">
            <Spinner /> Previewing…
          </div>
        )}
        <RefusalNote error={preview.error} except={['reason']} />
        {outcome && <WarningList warnings={outcome.warnings.filter((w) => w.key !== 'salary.backdated')} />}
        <ArrearsTable consequence={outcome?.consequence ?? preview.consequence} arrearsRun={arrearsRun} onArrearsRun={setArrearsRun} />

        <div className="bd-panel">
          <Field
            htmlFor="ov-reason"
            label="Reason"
            required
            span={6}
            help="An override is a deliberate deviation: say why. At least 10 characters; written to the structure, the history and the audit."
            errors={saveError?.messagesFor('reason')}
          >
            <TextArea id="ov-reason" rows={2} value={reason} onChange={setReason} placeholder="e.g. Lives on the factory compound — no conveyance" />
          </Field>
        </div>
        <RefusalNote error={saveError} except={['reason']} />

        <div className="flex flex-wrap items-center gap-3 pb-2">
          <button type="button" className="bd-btn-primary" disabled={!outcome || saving || preview.loading || reasonShort || !changed} onClick={() => void commit()}>
            {saving ? 'Saving…' : 'Save overrides'}
          </button>
          <span className="min-w-[220px] flex-1 text-[11.5px] leading-relaxed text-[#6F6A85]">
            Saving creates a new effective-dated structure from {outcome ? date(outcome.effectiveFrom) : 'the next period'}. The current record is closed,
            never updated in place, and the overrides carry through later revisions.
          </span>
        </div>
      </div>
    </SideDrawer>
  );
}
