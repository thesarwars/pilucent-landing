'use client';

/** The profile's overlays: compliance drawer, gated operations, field timeline. */

import * as React from 'react';
import { AlertOctagon, AlertTriangle, ChevronRight, Clock3, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, VioletButton } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import * as api from './api';
import { ENUMS, enumLabel } from './enums';
import { plural, todayISO } from './format';
import { useEmployeeMutation, useHistory } from './hooks';
import { useLang } from './i18n';
import type { Compliance, Finding, Profile, SeparationEntitlement, TabId } from './types';
import { Chip, ConfidenceTag, DateInput, ErrorBlock, Field, LoadingBlock, Note, SelectInput, DrawerHead, SideDrawer, Spinner, SwitchRow, TextArea, type Tone } from './ui';
import { HistoryList } from './tabs/HistoryTab';
import { useDebounced } from './salary/shared';
import { MIN_REASON, reasonLength } from './validate';

/* ── compliance (spec §12) ────────────────────────────────────────── */

const TAB_NAME: Record<TabId, string> = {
  personal: 'Personal',
  employment: 'Employment',
  salary: 'Salary',
  statutory: 'Statutory',
  tax: 'Tax profile',
  payment: 'Payment',
  documents: 'Documents',
  history: 'History',
};

/** The API sends two severities; the spec's third, `info`, has no findings yet. */
type Severity = 'blocked' | 'warn';

const SEVERITY: Record<Severity, { tone: Tone; title: string; blocks: string }> = {
  blocked: { tone: 'blocked', title: 'Blocks payroll', blocks: 'Stops the payroll run until it is fixed.' },
  warn: { tone: 'warn', title: 'Compliance risk', blocks: 'Payroll runs, with consequences.' },
};

/**
 * Every finding with its severity, what is missing, what it blocks, and a way
 * to the field: the drawer closes, the tab switches and the field pulses.
 * Only `blocked` turns a tab dot red.
 */
export function ComplianceDrawer({
  compliance,
  onClose,
  goTo,
}: {
  compliance: Compliance;
  onClose: () => void;
  goTo: (tab: TabId, field: string | null) => void;
}) {
  const blocks = compliance.blocks.length;
  const titleId = React.useId();
  const groups: [Severity, Finding[]][] = [
    ['blocked', compliance.blocks],
    ['warn', compliance.risks],
  ];

  return (
    <SideDrawer onClose={onClose} labelledBy={titleId}>
      <DrawerHead
        id={titleId}
        title="Compliance"
        sub={blocks ? `${plural(blocks, 'item must', 'items must')} be fixed before the next payroll run.` : 'Nothing blocks payroll for this employee.'}
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {groups.map(([severity, items]) => {
          const sev = SEVERITY[severity];
          return (
            <section key={severity} className="mb-5" aria-label={sev.title}>
              <div className="mb-2 flex items-center gap-2">
                <Chip tone={sev.tone} dot>
                  {sev.title}
                </Chip>
                <span className="bd-mono text-[11.5px] font-semibold text-[#6E6883]">{items.length}</span>
              </div>
              {items.length === 0 ? (
                <div className={cn('bd-note', 'bd-tone-ok', '!py-2 !text-[12px]')}>Nothing outstanding here.</div>
              ) : (
                <ul className="m-0 list-none space-y-2 p-0">
                  {items.map((f) => (
                    <li key={f.key}>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          goTo(f.tab, f.field);
                        }}
                        className={cn('bd-finding', `bd-tone-${sev.tone}`)}
                      >
                        {severity === 'blocked' ? (
                          <AlertOctagon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#E11D48]" />
                        ) : (
                          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#B97608]" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="sr-only">{sev.title}: </span>
                          <span className="block text-[13px] font-bold text-[#16172A]">{f.label}</span>
                          <span className="mt-0.5 block text-[12px] leading-snug text-[#44405C]">{f.fix}</span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11.5px] font-semibold" style={{ color: 'var(--t-ink)' }}>
                            {sev.blocks}
                            <span className="text-[#6E6883]">· {TAB_NAME[f.tab] ?? f.tab}</span>
                          </span>
                        </span>
                        <span className="mt-0.5 shrink-0 text-[12px] font-bold text-[#6B3FE8]">
                          Fix
                          <ChevronRight aria-hidden="true" className="ml-0.5 inline h-3.5 w-3.5" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </SideDrawer>
  );
}

/* ── classification (§6.1) ────────────────────────────────────────── */

export function ClassificationModal({ profile, to, onClose }: { profile: Profile; to: string; onClose: () => void }) {
  const { n } = useLang();
  const code = profile.code;
  const [effective, setEffective] = React.useState<string | null>(todayISO());
  const [reason, setReason] = React.useState('');
  const mutation = useEmployeeMutation(code, (d: { to: string; effective: string; reason: string }) => api.changeClassification(code, d));
  const length = reasonLength(reason);
  const retro = !!effective && effective < profile.asOf;
  const from = enumLabel('classification', profile.employment.classification, 'Unclassified');
  const target = enumLabel('classification', to);
  const error = mutation.error;

  const confirm = async () => {
    if (!effective) return;
    try {
      const r = await mutation.mutateAsync({ to, effective, reason });
      toast.success(`Classification changed to ${target}${r.retroactive ? ' (retroactive)' : ''}`);
      onClose();
    } catch {
      /* shown below */
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      width={520}
      icon={<AlertTriangle />}
      iconTone="warn"
      title={`Change classification to ${target}?`}
      footer={
        <>
          <span className="flex-1" />
          <VioletButton variant="outline" size="sm" onClick={onClose}>
            Keep {from}
          </VioletButton>
          <VioletButton size="sm" disabled={length < MIN_REASON || !effective || mutation.isPending} onClick={() => void confirm()}>
            {mutation.isPending ? 'Changing…' : 'Change classification'}
          </VioletButton>
        </>
      }
    >
      <p className="text-[12.5px] leading-relaxed text-v-ink500">
        This changes which statutory entitlements apply. Completed payroll runs are not recalculated; leave accrual, festival bonus and gratuity follow the new classification from the effective date.
      </p>
      <Note tone="warn" className="mt-3">
        {n(profile.employment.completedPayrollRuns)} completed payroll run(s) exist for this employee.
      </Note>
      <div className="mt-4 grid grid-cols-2 items-end gap-3">
        <Field htmlFor="cm-eff" label="Effective from" required span={6} errors={error?.messagesFor('effective')}>
          <DateInput id="cm-eff" value={effective} max={profile.asOf} onChange={setEffective} />
        </Field>
        {retro && (
          <div className="mb-0.5 flex h-10 items-center rounded-xl border border-[rgba(244,63,94,0.28)] bg-[rgba(244,63,94,0.08)] px-3 text-[12px] font-bold text-[#E11D48]">
            Retroactive change
          </div>
        )}
      </div>
      <div className="mt-3">
        <Field
          htmlFor="cm-reason"
          label="Reason"
          required
          span={6}
          errors={error?.messagesFor('reason')}
          help={
            <span className={length < MIN_REASON ? 'text-[#E11D48]' : undefined}>
              {length < MIN_REASON ? 'At least 10 characters — say why this is changing.' : `${n(length)} characters`}
            </span>
          }
        >
          <TextArea id="cm-reason" rows={3} value={reason} onChange={setReason} placeholder="Why is this classification changing? Written to the employee history." />
        </Field>
      </div>
      {error && !error.messagesFor('reason').length && !error.messagesFor('effective').length && (
        <Note tone="danger" className="mt-3">
          {error.message}
        </Note>
      )}
    </Modal>
  );
}

/* ── separation (§6.3) ────────────────────────────────────────────── */

export function SeparationModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const { money, n } = useLang();
  const code = profile.code;
  const [type, setType] = React.useState('RESIGNATION');
  const [date, setDate] = React.useState<string | null>(todayISO());
  const [reason, setReason] = React.useState('');
  const [grossMisconduct, setGross] = React.useState(false);
  const [preview, setPreview] = React.useState<SeparationEntitlement | null>(null);
  const [previewError, setPreviewError] = React.useState<api.ApiError | null>(null);
  const [loading, setLoading] = React.useState(false);
  const input = useDebounced(JSON.stringify({ type, date, grossMisconduct: type === 'DISMISSAL' && grossMisconduct }));
  const mutation = useEmployeeMutation(code, (d: { type: string; date: string; reason: string; grossMisconduct: boolean }) => api.separate(code, d));
  const length = reasonLength(reason);

  React.useEffect(() => {
    const body = JSON.parse(input);
    if (!body.date) return;
    let live = true;
    setLoading(true);
    api
      .separate(code, { ...body, preview: true })
      .then((r) => live && (setPreview(r), setPreviewError(null)))
      .catch((err) => live && (setPreview(null), setPreviewError(err instanceof api.ApiError ? err : null)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [input, code]);

  const confirm = async () => {
    if (!date) return;
    try {
      await mutation.mutateAsync({ type, date, reason, grossMisconduct: type === 'DISMISSAL' && grossMisconduct });
      toast.success('Separation recorded — final settlement outstanding');
      onClose();
    } catch {
      /* shown below */
    }
  };
  const error = mutation.error;

  return (
    <Modal
      open
      onClose={onClose}
      width={620}
      icon={<UserMinus />}
      iconTone="danger"
      title="Record separation"
      sub={`${profile.personal.nameEn} · ${profile.code}`}
      footer={
        <>
          <span className="min-w-0 flex-1 text-[11.5px] text-[#6E6883]">Until the final settlement runs, the employee is a hard block on payroll.</span>
          <VioletButton variant="outline" size="sm" onClick={onClose}>
            Cancel
          </VioletButton>
          <VioletButton variant="danger" size="sm" disabled={length < MIN_REASON || !date || mutation.isPending} onClick={() => void confirm()}>
            {mutation.isPending ? 'Recording…' : 'Record separation'}
          </VioletButton>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field htmlFor="sep-type" label="Type" required span={6} errors={error?.messagesFor('type')}>
          <SelectInput id="sep-type" value={type} onChange={setType} options={ENUMS.separationType} placeholder={null} />
        </Field>
        <Field htmlFor="sep-date" label="Last working day" required span={6} errors={error?.messagesFor('date')}>
          <DateInput id="sep-date" value={date} min={profile.employment.doj ?? undefined} onChange={setDate} />
        </Field>
      </div>
      {type === 'DISMISSAL' && (
        <div className="mt-2">
          <SwitchRow
            checked={grossMisconduct}
            onChange={setGross}
            label="Theft, fraud, dishonesty, rioting, arson or wilful breach of discipline (nil entitlement)"
          />
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-[rgba(22,23,42,0.08)] p-4">
        <div className="mb-2 flex items-center gap-2 text-[12.5px] font-bold text-v-ink900">
          Entitlement {loading && <Spinner className="h-3 w-3" />}
          {preview?.rule && <ConfidenceTag value={preview.rule.confidence} />}
        </div>
        {previewError && <Note tone="danger">{previewError.message}</Note>}
        {preview && !preview.available && <Note tone="neutral">{preview.message}</Note>}
        {preview?.available && (
          <div className="space-y-1.5 text-[12.5px]">
            <div className="text-v-ink500">
              {n(preview.completedYears ?? 0)} completed year(s) of service — {n(preview.years ?? 0)} counted ·{' '}
              {n(preview.daysPerYear ?? 0)} days per year{preview.graduated ? ' (graduated band)' : ''}
            </div>
            {[
              ['Compensation', preview.compensation],
              ['Gratuity', preview.gratuity],
            ].map(([label, f]) =>
              f && typeof f === 'object' ? (
                <div key={label as string} className="flex items-baseline justify-between gap-3">
                  <span className="text-v-ink700">{label as string}</span>
                  <span className="bd-mono font-semibold text-v-ink900">{money((f as { value: string }).value)}</span>
                </div>
              ) : null
            )}
            <div className="flex items-baseline justify-between gap-3 border-t border-[rgba(22,23,42,0.1)] pt-2 text-[14px] font-bold">
              <span className="text-v-ink900">Payable</span>
              <span className="bd-mono text-v-primary-deep">{money(preview.payable?.value)}</span>
            </div>
            <div className="text-[11.5px] text-v-ink500">{preview.payable?.basis}</div>
            {preview.notes?.map((x) => (
              <div key={x} className="text-[11.5px] text-v-ink500">
                {x}
              </div>
            ))}
            {preview.warnings?.map((w) => (
              <Note key={w.key} tone="warn">
                {w.message}
              </Note>
            ))}
            {preview.rule?.note && <div className="text-[11px] italic text-[#6E6883]">{preview.rule.note}</div>}
            {preview.rule?.citation && <div className="text-[11px] text-[#6E6883]">{preview.rule.citation}</div>}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Field
          htmlFor="sep-reason"
          label="Reason"
          required
          span={6}
          errors={error?.messagesFor('reason')}
          help={<span className={length < MIN_REASON ? 'text-[#E11D48]' : undefined}>{length < MIN_REASON ? 'At least 10 characters.' : `${n(length)} characters`}</span>}
        >
          <TextArea id="sep-reason" rows={2} value={reason} onChange={setReason} placeholder="Written to the employee history." />
        </Field>
      </div>
      {error && !error.errors.length && (
        <Note tone="danger" className="mt-3">
          {error.message}
        </Note>
      )}
    </Modal>
  );
}

/* ── field timeline (§8) ──────────────────────────────────────────── */

export function TimelineModal({ code, field, onClose }: { code: string; field: string; onClose: () => void }) {
  const history = useHistory(code, field);
  return (
    <Modal
      open
      onClose={onClose}
      width={520}
      icon={<Clock3 />}
      title={`${enumLabel('trackedField', field, field)} history`}
      sub="Effective-dated field. Old payslips keep the value that applied on their date."
    >
      {history.isPending && <LoadingBlock />}
      {history.isError && <ErrorBlock error={history.error} />}
      {history.data?.empty && <div className="py-8 text-center text-[12.5px] text-[#6E6883]">{history.data.message}</div>}
      {history.data && !history.data.empty && <HistoryList entries={history.data.entries} showField={false} />}
    </Modal>
  );
}
