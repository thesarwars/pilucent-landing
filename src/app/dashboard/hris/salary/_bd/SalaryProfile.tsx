'use client';

/**
 * One employee's salary profile (docs/frontend/salary-profile.md §10): the
 * structure in force, what it costs, where it stands against the floor, and
 * any scheduled change. Write access to a salary lives here and nowhere else.
 *
 * Mounted with `key={code}`: opening another employee starts from nothing,
 * so no drawer's state (the override grid least of all) carries over (§13.1).
 */

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/lib/ToastService';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { useSalary } from '@/app/dashboard/hris/employee/employees/_bd/hooks';
import { LangProvider, useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { isMasked } from '@/app/dashboard/hris/employee/employees/_bd/types';
import type { Derived, FloorPosition, SalaryStructure } from '@/app/dashboard/hris/employee/employees/_bd/types';
import { Chip, ErrorBlock, Field, LoadingBlock, Section, TextArea } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { DerivationPanel } from '@/app/dashboard/hris/employee/employees/_bd/salary/shared';
import { Modal, VioletButton } from '@/components/violet';
import * as api from './api';
import { useSalaryInvalidate, useSalaryProfile } from './hooks';
import { BdBadge, CostTable, FloorPill, MaskedBlock, PermissionPill, StructureTable } from './parts';
import { ReviseDrawer } from './ReviseDrawer';
import { OverrideDrawer } from './OverrideDrawer';
import { HistoryDrawer } from './HistoryDrawer';
import { SetupWizard } from './SetupWizard';
import type { SalaryProfileRead } from './types';

type DrawerId = 'revise' | 'override' | 'history' | 'wizard';
const LIST = '/dashboard/hris/salary';

const isFloor = (f: SalaryProfileRead['floor']): f is FloorPosition => !!f && !('available' in f);

export function SalaryProfile({ code }: { code: string }) {
  return (
    <LangProvider>
      <React.Suspense fallback={<LoadingBlock label="Loading the salary profile…" />}>
        <ProfileScreen key={code} code={code} />
      </React.Suspense>
    </LangProvider>
  );
}

function ProfileScreen({ code }: { code: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { lang, money, date, n } = useLang();
  const profile = useSalaryProfile(code);
  const p = profile.data;
  const structure = p?.structure && !isMasked(p.structure) ? (p.structure as SalaryStructure) : null;
  const salary = useSalary(code);
  const [drawer, setDrawer] = React.useState<DrawerId | null>(null);
  const [cancelling, setCancelling] = React.useState(false);

  // "Assign template" from the list arrives with ?setup=1.
  React.useEffect(() => {
    if (p && params.get('setup') === '1' && !p.structure && p.canWrite) setDrawer('wizard');
  }, [p, params]);

  const canEdit = !!p && p.canWrite && !p.masked;
  /** Guarded here, not only in the markup: a disabled-looking button that still fires is worse (§14). */
  const open = (d: DrawerId) => {
    if (d !== 'history' && !canEdit) return;
    setDrawer(d);
  };
  const back = () => router.push(LIST);

  if (profile.isPending || profile.isError || !p) {
    return (
      <div className="bd" lang={lang}>
        <div className="bd-page !max-w-[1240px] px-5 pt-4 max-md:px-3">
          <button type="button" className="bd-btn" onClick={back}>
            ‹ All salary profiles
          </button>
          <div className="pt-4">
            {profile.isError ? <ErrorBlock error={profile.error} onRetry={() => void profile.refetch()} /> : <LoadingBlock label="Loading the salary profile…" />}
          </div>
        </div>
      </div>
    );
  }

  const e = p.employee;
  const grade = e.grade ? e.gradeLabel : 'No grade';
  const meta = [e.code, e.designation, e.department, grade].filter(Boolean).join(' · ');
  const floor = isFloor(p.floor) ? p.floor : null;
  const scheduled = p.scheduled && !isMasked(p.scheduled) ? (p.scheduled as SalaryStructure) : null;
  const derived = salary.data?.derived && !('available' in salary.data.derived) ? (salary.data.derived as Derived) : null;
  const disabledTitle = p.masked
    ? 'Salary figures are masked for you.'
    : !p.canWrite
      ? "Changing a salary needs the 'write salary' permission."
      : undefined;
  const basic = structure?.components.find((c) => c.code === 'BASIC');
  const tenure = p.employerCost?.tenure?.label;

  return (
    <div className="bd" lang={lang}>
      <div className="bd-page !max-w-[1240px]">
        <div className="space-y-3 px-5 pt-4 max-md:px-3">
          {/* ── header ─────────────────────────────────────────────── */}
          <section className="bd-section" aria-labelledby="salary-name">
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-[240px] flex-1">
                <button type="button" className="bd-btn mb-2.5 !h-7 !rounded-[9px] !px-2.5 !text-[11.5px]" onClick={back}>
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 6-6 6 6 6" />
                  </svg>
                  All salary profiles
                </button>
                <h1 id="salary-name" className="m-0 text-[16.5px] font-bold tracking-[-0.014em]">
                  {e.nameEn}{' '}
                  {e.nameBn && (
                    <span lang="bn" className="text-[13px] font-normal text-[#6F6A85]">
                      {e.nameBn}
                    </span>
                  )}
                </h1>
                <div className="mt-0.5 text-[12.5px] text-[#6F6A85]">{meta}</div>
              </div>
              <div className="flex flex-col items-end gap-2.5">
                <div className="flex items-center gap-2">
                  <PermissionPill masked={p.masked} />
                  <BdBadge />
                </div>
                <div className="flex flex-wrap justify-end gap-2" role="group" aria-label="Salary actions">
                  <button type="button" className="bd-btn" disabled={!canEdit} title={disabledTitle} onClick={() => open('wizard')}>
                    {p.structure ? 'Reassign template' : 'Assign template'}
                  </button>
                  {p.structure && (
                    <button type="button" className="bd-btn" disabled={!canEdit || !structure} title={disabledTitle} onClick={() => open('override')}>
                      Overrides
                    </button>
                  )}
                  <button type="button" className="bd-btn" onClick={() => open('history')}>
                    History
                  </button>
                  {p.structure ? (
                    <button type="button" className="bd-btn-primary !h-[34px] !rounded-[11px]" disabled={!canEdit} title={disabledTitle} onClick={() => open('revise')}>
                      Revise
                    </button>
                  ) : (
                    <button type="button" className="bd-btn-primary !h-[34px] !rounded-[11px]" disabled={!canEdit} title={disabledTitle} onClick={() => open('wizard')}>
                      Set up salary
                    </button>
                  )}
                </div>
              </div>
            </div>

            {p.masked && <MaskedBlock />}

            {!p.structure && (
              <div className="mt-4 rounded-[18px] border border-dashed border-[rgba(22,23,42,0.2)] bg-white/55 px-6 py-8 text-center">
                <div className="text-[15px] font-bold">No salary structure assigned</div>
                <p className="mx-auto mt-1.5 max-w-[420px] text-[12.5px] leading-relaxed text-[#6F6A85]">
                  Payroll cannot run for this employee until a salary structure is set. Salary is a structure here, never a single figure.
                </p>
                {canEdit && (
                  <button type="button" className="bd-btn-primary mt-4" onClick={() => open('wizard')}>
                    Set up salary
                  </button>
                )}
              </div>
            )}

            {structure && (
              <>
                <div className="mt-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
                  {[
                    { label: 'Gross monthly', bn: 'মাসিক মোট বেতন', value: money(structure.gross), note: 'The figure on the offer letter.', tone: '#16172A' },
                    {
                      label: 'Basic',
                      bn: 'মূল বেতন',
                      value: money(basic?.amount),
                      note: `${structure.basicPercentOfGross ? n(structure.basicPercentOfGross) + '% of gross' : ''} · drives overtime, provident fund, gratuity and festival bonus.`,
                      tone: '#0E7490',
                    },
                    {
                      label: 'Total employer cost',
                      bn: 'নিয়োগকর্তার মোট ব্যয়',
                      value: p.employerCost ? money(p.employerCost.total) : '—',
                      note: p.employerCost?.overheadLabel ?? '',
                      tone: '#5A2BE0',
                    },
                  ].map((h) => (
                    <div key={h.label} className="bd-readout !rounded-2xl !px-[18px] !py-4">
                      <div className="bd-eyebrow">{h.label}</div>
                      <div className="bd-mono mt-1 text-[27px] font-bold tracking-[-0.025em]" style={{ color: h.tone }}>
                        {h.value}
                      </div>
                      <div lang="bn" className="text-[11px] text-[#6E6883]">
                        {h.bn}
                      </div>
                      {h.note && <div className="mt-1.5 text-[11px] leading-snug text-[#6F6A85]">{h.note}</div>}
                    </div>
                  ))}
                </div>
                <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                  <span className="text-[12.5px] text-[#6F6A85]">
                    {structure.templateName} · Effective <span className="bd-mono">{date(structure.effectiveFrom)}</span> · {grade}
                    {tenure ? ` · ${n(tenure)} service` : ''}
                  </span>
                  {floor && <FloorPill floor={floor} />}
                  {(structure.overrideCount ?? 0) > 0 && (
                    <Chip tone="violet">
                      {n(structure.overrideCount ?? 0)} component{structure.overrideCount === 1 ? '' : 's'} overridden — carried through revisions
                    </Chip>
                  )}
                  {p.scheduled && <Chip tone="warn">Changes {date(p.scheduled.effectiveFrom)}</Chip>}
                </div>
                {floor && !floor.clears && <div className="bd-note bd-tone-blocked mt-3">{floor.note}</div>}
              </>
            )}
          </section>

          {/* ── the figures ────────────────────────────────────────── */}
          {structure && (
            <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.95fr)]">
              <div className="min-w-0 space-y-3">
                <Section
                  title={
                    <>
                      Structure{' '}
                      <span lang="bn" className="text-[12px] font-normal text-[#6E6883]">
                        বেতন কাঠামো
                      </span>
                    </>
                  }
                >
                  <StructureTable components={structure.components} gross={structure.gross} words={structure.grossInWords} caption="Components of the structure in force" />
                </Section>

                {p.employerCost && (
                  <Section
                    title={
                      <>
                        Employer cost build-up{' '}
                        <span lang="bn" className="text-[12px] font-normal text-[#6E6883]">
                          নিয়োগকর্তার মোট ব্যয়
                        </span>
                      </>
                    }
                    desc={`${p.employerCost.lead} This is the number that answers the question.`}
                  >
                    <CostTable cost={p.employerCost} gross={structure.gross} />
                  </Section>
                )}

                {scheduled && (
                  <section className="bd-section bd-scheduled" aria-labelledby="scheduled-title">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="min-w-[220px] flex-1">
                        <h2 id="scheduled-title" className="m-0 text-[13.5px] font-bold">
                          Scheduled change{' '}
                          <span lang="bn" className="text-[11.5px] font-normal">
                            নির্ধারিত পরিবর্তন
                          </span>
                        </h2>
                        <div className="mt-1 text-[12.5px]">
                          From <span className="bd-mono">{date(scheduled.effectiveFrom)}</span> · Gross <span className="bd-mono">{money(scheduled.gross)}</span> · Basic{' '}
                          <span className="bd-mono">{money(scheduled.basic)}</span>
                          {p.scheduledDelta?.pct && (
                            <>
                              {' '}
                              · <span className="bd-mono">{Number(p.scheduledDelta.pct) > 0 ? '+' : ''}{n(p.scheduledDelta.pct)}%</span>
                            </>
                          )}
                        </div>
                        <div className="mt-1 text-[11.5px]">
                          Approved in advance — it takes effect without further action and can be cancelled until then. To change it, cancel it and
                          revise again.
                        </div>
                      </div>
                      {canEdit && (
                        <button type="button" className="bd-btn !border-[rgba(225,29,72,0.3)] !text-[#BE123C]" onClick={() => setCancelling(true)}>
                          Cancel the change
                        </button>
                      )}
                    </div>
                  </section>
                )}
              </div>

              <div className="lg:sticky lg:top-4">
                <Section title="What this means" desc="Basic drives four statutory entitlements. Gross drives almost nothing except tax.">
                  <DerivationPanel
                    derived={derived}
                    unavailable={!derived && salary.data?.derived && 'available' in salary.data.derived ? salary.data.derived.reason : null}
                    classification={e.classification}
                  />
                </Section>
              </div>
            </div>
          )}
        </div>
      </div>

      {drawer === 'revise' && structure && <ReviseDrawer profile={p} structure={structure} onClose={() => setDrawer(null)} />}
      {drawer === 'override' && structure && <OverrideDrawer profile={p} structure={structure} onClose={() => setDrawer(null)} />}
      {drawer === 'history' && <HistoryDrawer profile={p} onClose={() => setDrawer(null)} />}
      {drawer === 'wizard' && <SetupWizard profile={p} current={structure} onClose={() => setDrawer(null)} />}
      {cancelling && scheduled && <CancelScheduled code={code} uid={scheduled.uid} from={scheduled.effectiveFrom} onClose={() => setCancelling(false)} />}
    </div>
  );
}

function CancelScheduled({ code, uid, from, onClose }: { code: string; uid: string; from: string; onClose: () => void }) {
  const { date } = useLang();
  const invalidate = useSalaryInvalidate(code);
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState<ApiError | null>(null);
  const [saving, setSaving] = React.useState(false);
  const confirm = async () => {
    setSaving(true);
    try {
      await api.cancelStructure(uid, reason);
      await invalidate();
      toast.success('Scheduled change cancelled — the structure in force stays in force');
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err : null);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      open
      onClose={onClose}
      width={480}
      title="Cancel the scheduled change?"
      sub={`From ${date(from)}. It is kept on file as cancelled; the structure in force stays in force.`}
      footer={
        <>
          <span className="flex-1" />
          <VioletButton variant="outline" size="sm" onClick={onClose}>
            Keep it
          </VioletButton>
          <VioletButton variant="danger" size="sm" disabled={saving || reason.trim().length < 10} onClick={() => void confirm()}>
            {saving ? 'Cancelling…' : 'Cancel the change'}
          </VioletButton>
        </>
      }
    >
      <Field htmlFor="cancel-reason" label="Reason" required span={6} help="At least 10 characters. Written to the salary history and the audit." errors={error?.messagesFor('reason')}>
        <TextArea id="cancel-reason" rows={3} value={reason} onChange={setReason} placeholder="Why is this change not going ahead?" />
      </Field>
      {error && !error.messagesFor('reason').length && <div className="bd-error">{error.message}</div>}
    </Modal>
  );
}
