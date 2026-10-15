'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2, History, PenLine, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VioletButton } from '@/components/violet';
import { useSalary, useTaxProjection } from '../hooks';
import { useLang } from '../i18n';
import { addMoney, formatMonthYear } from '../format';
import { enumLabel } from '../enums';
import type { Derived, Figure, FloorCheck, Profile, SalaryRead } from '../types';
import { Chip, Citation, ConfidenceTag, ErrorBlock, LoadingBlock, Note, Section } from '../ui';
import { AssignWizard } from '../salary/AssignWizard';
import { ReviseModal } from '../salary/ReviseModal';
import { SalaryHistoryDrawer } from '../salary/SalaryHistoryDrawer';

const isDerived = (d: SalaryRead['derived']): d is Derived => !!d && !('available' in d);
const isFloors = (f: SalaryRead['floors']): f is FloorCheck[] => Array.isArray(f);

export function SalaryTab({ profile }: { profile: Profile }) {
  const { t, money, date, lang, n } = useLang();
  const code = profile.code;
  const salary = useSalary(code);
  const tax = useTaxProjection(code, !!profile.salary);
  const [wizard, setWizard] = React.useState(false);
  const [revise, setRevise] = React.useState(false);
  const [history, setHistory] = React.useState(false);

  if (salary.isPending) return <LoadingBlock />;
  if (salary.isError) return <ErrorBlock error={salary.error} onRetry={() => void salary.refetch()} />;
  const data = salary.data;
  const s = data.structure;

  if (!s) {
    return (
      <>
        <div className="bd-section flex flex-col items-center !px-6 !py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(124,77,255,0.12)] text-[#6B3FE8]">
            <Wallet aria-hidden="true" className="h-5 w-5" />
          </span>
          <h2 className="bd-section-title mt-4">No salary structure assigned</h2>
          <div className="mt-1 max-w-md text-[12.5px] leading-relaxed text-[#6F6A85]">
            Payroll cannot run for this employee until a salary structure is assigned.
          </div>
          <button type="button" className="bd-btn-primary mt-5" onClick={() => setWizard(true)}>
            <PenLine aria-hidden="true" className="h-4 w-4" />
            {t('Assign salary structure', 'assignCta')}
          </button>
        </div>
        {wizard && <AssignWizard profile={profile} salary={data} onClose={() => setWizard(false)} />}
      </>
    );
  }

  const derived = isDerived(data.derived) ? data.derived : null;
  const floors = isFloors(data.floors) ? data.floors : [];
  const basic = s.components.find((c) => c.code === 'BASIC');
  const pfEmployer = derived?.providentFund?.employer ?? null;
  const gratMonthly = derived?.gratuity?.monthlyProvision ?? null;
  const bonusMonthly = derived?.festivalBonus?.monthlyProvision ?? null;
  const employerCost = addMoney(s.gross, pfEmployer?.value, gratMonthly?.value, bonusMonthly?.value);
  const taxMonthly = tax.data?.available ? tax.data.periodDeduction : null;
  const isWorker = profile.employment.classification === 'WORKER';
  const crossing = derived?.gratuityBreakpoint;

  const cards: {
    title: string;
    figures: [string, string][];
    basis?: string;
    citation?: string | null;
    confidence?: Figure['confidence'];
    alert?: string;
  }[] = [];
  if (derived) {
    cards.push({
      title: t('Overtime', 'overtime'),
      figures: [['Hourly rate', money(derived.overtimeHourly.value, 2)]],
      basis: derived.overtimeHourly.basis,
      citation: derived.overtimeHourly.citation,
      confidence: derived.overtimeHourly.confidence,
    });
    if (derived.providentFund) {
      const pf = derived.providentFund;
      cards.push({
        title: t('Provident fund', 'pf'),
        figures: [
          ['Employee', pf.employee ? money(pf.employee.value, 2) : '—'],
          ['Employer', pf.employer ? money(pf.employer.value, 2) : '—'],
        ],
        basis: pf.employee?.basis,
        citation: pf.employee?.citation,
        confidence: pf.employee?.confidence,
      });
    }
    if (derived.gratuity) {
      const g = derived.gratuity;
      cards.push({
        title: t('Gratuity', 'gratuity'),
        figures: [
          ['Accruing monthly', money(g.monthlyProvision.value, 2)],
          ['Accrued to date', money(g.amount.value)],
        ],
        basis: g.amount.basis,
        citation: g.amount.citation,
        confidence: g.amount.confidence,
        alert:
          crossing && crossing.withinTwelveMonths
            ? `Rises from ${n(crossing.daysFrom)} to ${n(crossing.daysTo)} days per year on ${date(crossing.ratesRiseOn)}. Provision becomes ${money(crossing.monthlyProvisionAfter.value, 2)}/month.`
            : undefined,
      });
    }
    const fb = derived.festivalBonus;
    cards.push({
      title: t('Festival bonus', 'bonus'),
      figures: [
        ['Per bonus', money(fb.perBonus.value)],
        ['Provision monthly', money(fb.monthlyProvision.value)],
      ],
      basis: `${fb.annual.basis}. ${fb.eligible ? 'Eligible' : `Eligible from ${date(fb.eligibleFrom)}`}.`,
      citation: fb.perBonus.citation,
      confidence: fb.perBonus.confidence,
    });
    cards.push({
      title: t('Leave encashment', 'encash'),
      figures: [['Daily rate', money(derived.leave.encashment.dailyRate.value, 2)]],
      basis: derived.leave.encashment.dailyRate.basis,
      citation: derived.leave.encashment.dailyRate.citation,
      confidence: derived.leave.encashment.dailyRate.confidence,
    });
  }
  if (taxMonthly) {
    cards.push({
      title: t('Income tax', 'incomeTax'),
      figures: [['This period', money(taxMonthly.value)]],
      basis: 'Estimate — the final figure is calculated when payroll runs. See the Tax profile tab.',
      citation: taxMonthly.citation,
      confidence: taxMonthly.confidence,
    });
  }

  return (
    <div className="space-y-4">
      <div className="bd-section">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: t('Gross monthly', 'grossMonthly'), value: money(s.gross), note: 'The figure on the offer letter.', tone: 'ink' },
            {
              label: t('Basic', 'basic'),
              value: money(basic?.amount),
              note: `${basic?.percentOfGross ? n(basic.percentOfGross) + '% of gross. ' : ''}Drives overtime, provident fund, gratuity and festival bonus.`,
              tone: 'teal',
            },
            {
              label: t('Total employer cost', 'employerCost'),
              value: money(employerCost, 2),
              note: 'Gross plus employer contributions and provisions.',
              tone: 'violet',
            },
          ].map((h) => (
            <div key={h.label} className="bd-readout">
              <div className="bd-colhead">{h.label}</div>
              <div
                className={cn(
                  'bd-mono mt-1 text-[22px] font-bold tracking-[-0.02em]',
                  h.tone === 'teal' ? 'text-[#0E7490]' : h.tone === 'violet' ? 'text-[#6B3FE8]' : 'text-[#16172A]'
                )}
              >
                {h.value}
              </div>
              <div className="mt-0.5 text-[11.5px] text-[#6F6A85]">{h.note}</div>
            </div>
          ))}
        </div>
        <p className="bd-help !mt-3">
          Read-only here. Revise records a new effective-dated structure — the one place a salary is written — and keeps this one for the periods it
          covered.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-semibold text-[#6F6A85]">
            {s.templateName} · {t('Effective from', 'effectiveFrom')} <span className="bd-mono">{date(s.effectiveFrom)}</span>
            {profile.employment.grade ? ` · ${enumLabel('grade', profile.employment.grade)}` : ''}
          </span>
          {floors.map((f) => (
            <Chip key={f.kind} tone={f.passed ? 'ok' : 'blocked'} title={f.message ?? f.citation ?? undefined}>
              {f.passed ? '✓' : '!'} {f.kind === 'basic' ? 'Basic' : 'Total wage'} {f.passed ? 'above' : 'below'} the gazetted floor ({money(f.floor)})
              <ConfidenceTag value={f.confidence} />
            </Chip>
          ))}
          <span className="flex-1" />
          <VioletButton variant="outline" size="sm" leftIcon={<History className="h-3.5 w-3.5" />} onClick={() => setHistory(true)}>
            {t('History', 'history')}
          </VioletButton>
          <VioletButton size="sm" leftIcon={<PenLine className="h-3.5 w-3.5" />} onClick={() => setRevise(true)}>
            {t('Revise', 'revise')}
          </VioletButton>
        </div>
        {s.reopenedPeriods.length > 0 && Number(s.arrears) !== 0 && (
          <Note tone="violet" className="mt-3">
            This structure reopened {s.reopenedPeriods.map((p) => formatMonthYear(p, lang)).join(', ')}:{' '}
            {money(s.arrears, 2)} of arrears queued for the {enumLabel('arrearsRun', s.arrearsRun ?? 'NEXT_RUN').toLowerCase()}.
          </Note>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Section title={t('Salary structure', 'structure')}>
          <div className="bd-colhead grid grid-cols-[1.4fr_1fr_1fr] border-b border-[rgba(22,23,42,0.07)] pb-2">
            <span>Component</span>
            <span>Basis</span>
            <span className="text-right">Amount</span>
          </div>
          {s.components.map((c) => (
            <div key={c.code} className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-[rgba(22,23,42,0.05)] py-2.5 text-[13px]">
              <span className="font-semibold text-[#16172A]">{c.name}</span>
              <span className="text-[#6F6A85]">{c.basis ? n(c.basis) : '—'}</span>
              <span className="bd-mono text-right font-semibold text-[#16172A]">{money(c.amount)}</span>
            </div>
          ))}
          <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center pt-3 text-[14px] font-bold">
            <span className="text-v-ink900">{t('Gross monthly', 'grossMonthly')}</span>
            <span className="flex items-center gap-1 text-[11.5px] font-bold text-[#157A5B]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('Reconciled', 'reconciled')}
            </span>
            <span className="bd-mono text-right text-[#16172A]">{money(s.gross)}</span>
          </div>
          <div className="bd-readout mt-4 !py-2.5">
            <div className="bd-colhead">{t('In words', 'inWords')}</div>
            <div lang={lang} className="mt-0.5 text-[13px] font-semibold text-v-ink900">
              {s.grossInWords[lang]}
            </div>
          </div>
        </Section>

        <Section title={t('Total employer cost', 'employerCost')}>
          {[
            ['Gross', money(s.gross), 'Structure total'],
            ['Provident fund (employer)', pfEmployer ? money(pfEmployer.value, 2) : '—', pfEmployer ? pfEmployer.basis : 'Not a member'],
            ['Gratuity provision', gratMonthly ? money(gratMonthly.value, 2) : '—', gratMonthly?.basis ?? 'No date of joining'],
            ['Festival bonus provision', bonusMonthly ? money(bonusMonthly.value, 2) : '—', bonusMonthly?.basis ?? ''],
          ].map(([label, value, basis]) => (
            <div key={label} className="flex items-baseline gap-3 border-b border-[rgba(22,23,42,0.05)] py-2.5 text-[13px]">
              <span className="font-medium text-v-ink700">{label}</span>
              <span className="min-w-0 flex-1 truncate text-[11.5px] text-[#6E6883]" title={basis}>
                {basis}
              </span>
              <span className="bd-mono font-semibold text-[#16172A]">{value}</span>
            </div>
          ))}
          <div className="flex items-baseline justify-between pt-3 text-[16px] font-bold text-v-primary-deep">
            <span>Total monthly cost</span>
            <span className="bd-mono">{money(employerCost, 2)}</span>
          </div>
          <div className="mt-1 text-[11.5px] text-[#6E6883]">Company group insurance, if any, is not included.</div>
        </Section>
      </div>

      <Section title="What this salary means">
        {!isWorker && (
          <Note tone="neutral" className="mb-3">
            These entitlements apply to workers under the Labour Act. This employee is classified as{' '}
            {profile.employment.classification ? 'non-worker' : 'unclassified'}, so the amounts follow company policy rather than statute.
          </Note>
        )}
        {!derived && data.derived && 'available' in data.derived && (
          <Note tone="warn" className="mb-3">
            The statutory figures are unavailable: {data.derived.reason}
          </Note>
        )}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <div key={c.title} className="rounded-2xl border border-[rgba(22,23,42,0.08)] bg-white/70 p-4">
              <div className="flex items-center gap-2">
                <div className="text-[13px] font-bold text-v-ink900">{c.title}</div>
                <ConfidenceTag value={c.confidence} />
              </div>
              <div className="mt-2 space-y-1">
                {c.figures.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-3 text-[12.5px]">
                    <span className="text-v-ink500">{label}</span>
                    <span className="bd-mono font-bold text-[#16172A]">{value}</span>
                  </div>
                ))}
              </div>
              {c.basis && <div className="mt-2 text-[11.5px] leading-snug text-v-ink500">{c.basis}</div>}
              <Citation>{c.citation}</Citation>
              {c.alert && (
                <div className="mt-2.5 flex items-start gap-1.5 rounded-xl bg-[rgba(245,178,46,0.12)] px-2.5 py-2 text-[11.5px] font-semibold text-[#8A5A06]">
                  <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
                  {c.alert}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {revise && <ReviseModal profile={profile} salary={data} onClose={() => setRevise(false)} />}
      {history && <SalaryHistoryDrawer code={code} onClose={() => setHistory(false)} />}
    </div>
  );
}
