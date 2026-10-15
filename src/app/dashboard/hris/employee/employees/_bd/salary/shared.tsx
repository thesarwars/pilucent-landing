'use client';

/**
 * Pieces shared by the salary profile's drawers and the employee profile's
 * read-only salary tab. They compute nothing themselves: every figure comes
 * from the backend (a saved structure, or a `preview: true` answer), so the
 * screen and the saved record cannot disagree.
 */

import * as React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError } from '../api';
import { useLang } from '../i18n';
import { formatMonthYear } from '../format';
import { ENUMS } from '../enums';
import type { Consequence, Derived, Figure, FloorCheck, SalaryComponent, SalaryOutcome, Warning, Words } from '../types';
import { ConfidenceTag } from '../ui';

export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return v;
}

export interface PreviewState {
  outcome: SalaryOutcome | null;
  error: ApiError | null;
  loading: boolean;
  /** What a refusal says the change would do (reopened periods, arrears, floors, warnings). */
  consequence: Consequence | null;
}

/**
 * Re-run the backend preview whenever `input` changes (debounced). `input` of
 * null means "not ready to preview".
 */
export function usePreview<I>(input: I | null, run: (input: I) => Promise<SalaryOutcome>): PreviewState {
  const debounced = useDebounced(input);
  const key = JSON.stringify(debounced);
  const [state, setState] = React.useState<PreviewState>({ outcome: null, error: null, loading: false, consequence: null });
  React.useEffect(() => {
    if (debounced === null) {
      setState({ outcome: null, error: null, loading: false, consequence: null });
      return;
    }
    let live = true;
    setState((s) => ({ ...s, loading: true }));
    run(debounced)
      .then((outcome) => live && setState({ outcome, error: null, loading: false, consequence: outcome.consequence }))
      .catch((err) => {
        if (!live) return;
        const error = err instanceof ApiError ? err : new ApiError(0, 'Preview failed.');
        setState({ outcome: null, error, loading: false, consequence: (error.consequence as Consequence | null) ?? null });
      });
    return () => {
      live = false;
    };
     
  }, [key]);
  return state;
}

export function Pills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T | '';
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-[10px] border-[1.5px] px-3 py-1.5 text-[12px] transition-colors',
              active
                ? 'border-[rgba(124,77,255,0.36)] bg-[rgba(124,77,255,0.1)] font-bold text-v-primary-deep'
                : 'border-[rgba(22,23,42,0.12)] bg-white font-medium text-v-ink700 hover:border-[rgba(124,77,255,0.3)]'
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ComponentsTable({
  components,
  gross,
  words,
  loading,
}: {
  components: SalaryComponent[];
  gross: string | null;
  words?: Words | null;
  loading?: boolean;
}) {
  const { money, n, lang } = useLang();
  return (
    <div className={cn('transition-opacity', loading && 'opacity-50')}>
      {components.map((c) => (
        <div key={c.code} className="grid grid-cols-[1.3fr_1fr_1fr] border-b border-[rgba(22,23,42,0.05)] py-2 text-[12.5px]">
          <span className="font-semibold text-v-ink900">{c.name}</span>
          <span className="text-v-ink500">{c.basis ? n(c.basis) : '—'}</span>
          <span className="text-right font-semibold bd-mono text-v-ink900">{money(c.amount)}</span>
        </div>
      ))}
      <div className="grid grid-cols-[1.3fr_1fr_1fr] pt-2.5 text-[13.5px] font-bold text-v-ink900">
        <span>Gross monthly</span>
        <span />
        <span className="text-right bd-mono">{gross ? money(gross) : '—'}</span>
      </div>
      {words && (
        <div lang={lang} className="mt-2.5 rounded-xl bg-v-wash px-3 py-2 text-[12px] font-semibold text-v-ink700">
          {words[lang]}
        </div>
      )}
    </div>
  );
}

export function FloorList({ floors }: { floors: FloorCheck[] }) {
  const { money } = useLang();
  if (!floors.length) return null;
  return (
    <div className="space-y-1.5">
      {floors.map((f) => (
        <div
          key={f.kind}
          className={cn(
            'flex items-start gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold',
            f.passed
              ? 'border-[rgba(31,169,122,0.28)] bg-[rgba(31,169,122,0.08)] text-[#157A5B]'
              : 'border-[rgba(244,63,94,0.26)] bg-[rgba(244,63,94,0.07)] text-[#E11D48]'
          )}
        >
          {f.passed ? <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" /> : <XCircle className="mt-px h-3.5 w-3.5 shrink-0" />}
          <span className="min-w-0 flex-1">
            {f.passed
              ? `${f.kind === 'basic' ? 'Basic' : 'Total wage'} ${money(f.amount)} clears the gazetted ${f.kind} floor of ${money(f.floor)}${f.grade ? ` for ${f.grade}` : ''}.`
              : f.message}
            {f.citation && <span className="block text-[10.5px] font-medium opacity-75">{f.citation}</span>}
          </span>
          <ConfidenceTag value={f.confidence} />
        </div>
      ))}
    </div>
  );
}

export function WarningList({ warnings }: { warnings: Warning[] }) {
  if (!warnings.length) return null;
  return (
    <div className="space-y-1.5">
      {warnings.map((w) => (
        <div
          key={w.key + w.message}
          className={cn(
            'flex items-start gap-2 rounded-xl border px-3 py-2 text-[12px] font-semibold',
            w.key === 'salary.backdated'
              ? 'border-[rgba(124,77,255,0.24)] bg-[rgba(124,77,255,0.06)] text-[#5A2BE0]'
              : 'border-[rgba(245,178,46,0.3)] bg-[rgba(245,178,46,0.1)] text-[#8A5A06]'
          )}
        >
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
          {w.message}
        </div>
      ))}
    </div>
  );
}

/** The processed periods a change reaches back into, and the arrears. */
export function ArrearsTable({
  consequence,
  arrearsRun,
  onArrearsRun,
}: {
  consequence: Consequence | null;
  arrearsRun: string;
  onArrearsRun: (v: string) => void;
}) {
  const { money, lang, n } = useLang();
  if (!consequence || consequence.reopenedCount === 0) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(244,63,94,0.22)]">
      <div className="bg-[rgba(244,63,94,0.06)] px-4 py-2.5 text-[12.5px] font-bold text-[#E11D48]">
        {n(consequence.reopenedCount)} processed period{consequence.reopenedCount === 1 ? '' : 's'} fall after this date
      </div>
      <div className="px-4 py-2">
        <div className="grid grid-cols-4 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#6E6883]">
          <span>Period</span>
          <span className="text-right">Paid</span>
          <span className="text-right">Should be</span>
          <span className="text-right">Difference</span>
        </div>
        {consequence.periods.map((p) => (
          <div key={p.period} className="grid grid-cols-4 py-1 text-[12px] bd-mono">
            <span className="font-semibold text-v-ink900">{formatMonthYear(p.period, lang)}</span>
            <span className="text-right text-v-ink500">{money(p.paid, 2)}</span>
            <span className="text-right text-v-ink700">{money(p.due, 2)}</span>
            <span className="text-right font-semibold text-[#E11D48]">{money(p.arrears, 2)}</span>
          </div>
        ))}
        <div className="mt-1 grid grid-cols-4 border-t border-[rgba(22,23,42,0.08)] pt-1.5 text-[12.5px] font-bold bd-mono">
          <span className="text-v-ink900">Total arrears</span>
          <span />
          <span />
          <span className="text-right text-[#E11D48]">{money(consequence.arrears, 2)}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11.5px] font-semibold text-v-ink500">Pay in</span>
          <Pills options={ENUMS.arrearsRun} value={arrearsRun} onChange={onArrearsRun} ariaLabel="Arrears run" />
        </div>
        <div className="mt-2 text-[11px] leading-relaxed text-[#6E6883]">
          Arrears are taxed as income of the month they are paid and re-project this employee&apos;s annual tax. Issued payslips are never modified.
          {consequence.prorationDivisor ? ` Part periods prorate by ${consequence.prorationDivisor.toLowerCase().replace(/_/g, ' ')}.` : ''}
        </div>
      </div>
    </div>
  );
}

/** Errors in a refusal other than the ones a form already shows inline. */
export function RefusalNote({ error, except = [] }: { error: ApiError | null; except?: string[] }) {
  if (!error) return null;
  const messages = error.errors.filter((e) => !except.includes(e.path)).flatMap((e) => e.messages);
  if (!messages.length && error.errors.length) return null;
  return (
    <div role="alert" className="rounded-xl border border-[rgba(244,63,94,0.26)] bg-[rgba(244,63,94,0.07)] px-3 py-2 text-[12px] font-semibold text-[#E11D48]">
      {messages.length ? messages.join(' ') : error.message}
    </div>
  );
}

/* ── what a salary means ──────────────────────────────────────────── */

type Card = {
  title: string;
  figures: [string, string][];
  basis?: string;
  citation?: string | null;
  confidence?: Figure['confidence'];
  alert?: string;
};

/**
 * What the structure drives (salary profile §10, employee profile §7): basic
 * drives four statutory entitlements, gross almost nothing but tax. Every
 * figure comes from the server with its basis, citation and confidence.
 */
export function DerivationPanel({
  derived,
  unavailable,
  classification,
  taxMonthly,
  className,
}: {
  derived: Derived | null;
  unavailable?: string | null;
  classification: string | null;
  taxMonthly?: Figure | null;
  className?: string;
}) {
  const { t, money, date, n } = useLang();
  const isWorker = classification === 'WORKER';
  const crossing = derived?.gratuityBreakpoint;
  const cards: Card[] = [];
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
      basis: 'Estimate — the final figure is calculated when payroll runs.',
      citation: taxMonthly.citation,
      confidence: taxMonthly.confidence,
    });
  }
  return (
    <div className={cn('space-y-2.5', className)}>
      {!isWorker && (
        <div className="bd-note bd-tone-neutral !text-[12px] !font-medium">
          These entitlements apply to workers under the Labour Act. This employee is classified as{' '}
          {classification ? 'non-worker' : 'unclassified'}, so the amounts follow company policy rather than statute.
        </div>
      )}
      {!derived && unavailable && <div className="bd-note bd-tone-warn !text-[12px]">The statutory figures are unavailable: {unavailable}</div>}
      {cards.map((c) => (
        <div key={c.title} className="rounded-2xl border border-[rgba(22,23,42,0.08)] bg-white/70 p-3.5">
          <div className="flex items-center gap-2">
            <div className="text-[12.5px] font-bold text-[#16172A]">{c.title}</div>
            <ConfidenceTag value={c.confidence} />
          </div>
          <div className="mt-2 space-y-1">
            {c.figures.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3 text-[12px]">
                <span className="text-[#6F6A85]">{label}</span>
                <span className="bd-mono text-[13px] font-bold text-[#16172A]">{value}</span>
              </div>
            ))}
          </div>
          {c.basis && <div className="mt-2 text-[11.5px] leading-snug text-[#6F6A85]">{c.basis}</div>}
          {c.citation && <div className="mt-1 text-[10.5px] text-[#6E6883]">{c.citation}</div>}
          {c.alert && (
            <div className="mt-2.5 flex items-start gap-1.5 rounded-xl bg-[rgba(245,178,46,0.12)] px-2.5 py-2 text-[11.5px] font-semibold text-[#8A5A06]">
              <AlertTriangle aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
              {c.alert}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
