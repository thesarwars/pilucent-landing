'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2, History, PenLine, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chip, VioletButton } from '@/components/violet';
import { useSalary, useTaxProjection } from '../hooks';
import { useLang } from '../i18n';
import { addMoney, formatMonthYear } from '../format';
import { enumLabel } from '../enums';
import type { Derived, Figure, FloorCheck, Profile, SalaryRead } from '../types';
import { Citation, ConfidenceTag, ErrorBlock, LoadingBlock, Note, Section } from '../ui';
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
        <div className="flex flex-col items-center rounded-v-card bg-white px-6 py-14 text-center shadow-v-card">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-v-tint100 text-v-primary">
            <Wallet className="h-5 w-5" />
          </span>
          <div className="mt-4 text-[15px] font-bold text-v-ink900">No salary structure assigned</div>
          <div className="mt-1 max-w-md text-[12.5px] leading-relaxed text-v-ink500">
            Payroll cannot run for this employee until a salary structure is assigned.
          </div>
          <VioletButton className="mt-5" onClick={() => setWizard(true)} leftIcon={<PenLine className="h-4 w-4" />}>
            {t('Assign salary structure', 'assignCta')}
          </VioletButton>
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
      <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
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
            <div
              key={h.label}
              className={cn(
                'rounded-2xl border px-4 py-3.5',
                h.tone === 'teal' && 'border-[rgba(34,211,238,0.28)] bg-[rgba(34,211,238,0.09)]',
                h.tone === 'violet' && 'border-[rgba(124,77,255,0.28)] bg-[rgba(124,77,255,0.09)]',
                h.tone === 'ink' && 'border-[rgba(22,23,42,0.09)] bg-white'
              )}
            >
              <div className={cn('text-[11px] font-bold uppercase tracking-[0.06em]', h.tone === 'teal' ? 'text-[#0E7490]' : h.tone === 'violet' ? 'text-v-primary-deep' : 'text-v-ink400')}>
                {h.label}
              </div>
              <div className={cn('mt-1 text-[24px] font-extrabold tabular-nums tracking-[-0.02em]', h.tone === 'teal' ? 'text-[#0E7490]' : h.tone === 'violet' ? 'text-v-primary-deep' : 'text-v-ink900')}>
                {h.value}
              </div>
              <div className="mt-0.5 text-[11.5px] text-v-ink500">{h.note}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-semibold text-v-ink500">
            {s.templateName} · {t('Effective from', 'effectiveFrom')} {date(s.effectiveFrom)}
            {profile.employment.grade ? ` · ${enumLabel('grade', profile.employment.grade)}` : ''}
          </span>
          {floors.map((f) => (
            <Chip key={f.kind} tone={f.passed ? 'success' : 'danger'} title={f.message ?? f.citation ?? undefined}>
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
          <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-[rgba(22,23,42,0.07)] pb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-v-ink400">
            <span>Component</span>
            <span>Basis</span>
            <span className="text-right">Amount</span>
          </div>
          {s.components.map((c) => (
            <div key={c.code} className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-[rgba(22,23,42,0.05)] py-2.5 text-[13px]">
              <span className="font-semibold text-v-ink900">{c.name}</span>
              <span className="text-v-ink500">{c.basis ? n(c.basis) : '—'}</span>
              <span className="text-right font-semibold tabular-nums text-v-ink900">{money(c.amount)}</span>
            </div>
          ))}
          <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center pt-3 text-[14px] font-bold">
            <span className="text-v-ink900">{t('Gross monthly', 'grossMonthly')}</span>
            <span className="flex items-center gap-1 text-[11.5px] font-bold text-[#157A5B]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('Reconciled', 'reconciled')}
            </span>
            <span className="text-right tabular-nums text-v-ink900">{money(s.gross)}</span>
          </div>
          <div className="mt-4 rounded-xl bg-v-wash px-3.5 py-2.5">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-v-ink400">{t('In words', 'inWords')}</div>
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
              <span className="min-w-0 flex-1 truncate text-[11.5px] text-v-ink400" title={basis}>
                {basis}
              </span>
              <span className="tabular-nums font-semibold text-v-ink900">{value}</span>
            </div>
          ))}
          <div className="flex items-baseline justify-between pt-3 text-[16px] font-bold text-v-primary-deep">
            <span>Total monthly cost</span>
            <span className="tabular-nums">{money(employerCost, 2)}</span>
          </div>
          <div className="mt-1 text-[11.5px] text-v-ink400">Company group insurance, if any, is not included.</div>
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
            <div key={c.title} className="rounded-2xl border border-[rgba(22,23,42,0.08)] bg-v-card-subtle p-4">
              <div className="flex items-center gap-2">
                <div className="text-[13px] font-bold text-v-ink900">{c.title}</div>
                <ConfidenceTag value={c.confidence} />
              </div>
              <div className="mt-2 space-y-1">
                {c.figures.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-3 text-[12.5px]">
                    <span className="text-v-ink500">{label}</span>
                    <span className="font-bold tabular-nums text-v-ink900">{value}</span>
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
