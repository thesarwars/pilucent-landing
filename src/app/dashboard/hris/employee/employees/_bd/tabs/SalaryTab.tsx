'use client';

/**
 * The salary tab: a READ-ONLY mirror of the salary profile (employee profile
 * §11.3, salary profile §1.1). Write access lives in one place — two screens
 * that both edit a structure will disagree — so this tab shows the structure
 * in force and links out, plainly, to where it is changed.
 */

import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2, Lock, Wallet } from 'lucide-react';
import { useSalary, useTaxProjection } from '../hooks';
import { useLang } from '../i18n';
import { formatMonthYear } from '../format';
import { enumLabel } from '../enums';
import { isMasked } from '../types';
import type { Derived, FloorCheck, Profile, SalaryRead } from '../types';
import { Chip, ConfidenceTag, ErrorBlock, LoadingBlock, Note, Section } from '../ui';
import { DerivationPanel } from '../salary/shared';

const isDerived = (d: SalaryRead['derived']): d is Derived => !!d && !('available' in d);
const isFloors = (f: SalaryRead['floors']): f is FloorCheck[] => Array.isArray(f);

const salaryProfile = (code: string, setup = false) =>
  `/dashboard/hris/salary/${encodeURIComponent(code)}${setup ? '?setup=1' : ''}`;

function OpenProfile({ code, label = 'Open the salary profile' }: { code: string; label?: string }) {
  return (
    <Link href={salaryProfile(code)} className="bd-btn no-underline">
      {label}
      <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7" />
        <path d="M8 7h9v9" />
      </svg>
    </Link>
  );
}

export function SalaryTab({ profile }: { profile: Profile }) {
  const { t, money, date, lang, n } = useLang();
  const code = profile.code;
  const salary = useSalary(code);
  const tax = useTaxProjection(code, !!profile.salary && !isMasked(profile.salary));

  if (salary.isPending) return <LoadingBlock />;
  if (salary.isError) return <ErrorBlock error={salary.error} onRetry={() => void salary.refetch()} />;
  const data = salary.data;
  const s = data.structure;

  if (!s) {
    return (
      <div className="bd-section flex flex-col items-center !px-6 !py-14 text-center">
        <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(124,77,255,0.12)] text-[#6B3FE8]">
          <Wallet className="h-5 w-5" />
        </span>
        <h2 className="bd-section-title mt-4">No salary structure assigned</h2>
        <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-[#6F6A85]">
          Payroll cannot run for this employee until a salary structure is assigned. Structures are set up in the salary profile.
        </p>
        <Link href={salaryProfile(code, true)} className="bd-btn-primary mt-5 no-underline">
          {t('Assign salary structure', 'assignCta')}
        </Link>
      </div>
    );
  }

  if (isMasked(s)) {
    return (
      <Section title={t('Salary structure', 'structure')} right={<OpenProfile code={code} />}>
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[rgba(22,23,42,0.2)] bg-[rgba(22,23,42,0.04)] px-5 py-5">
          <Lock aria-hidden="true" className="h-5 w-5 shrink-0 text-[#6E6883]" />
          <div className="min-w-0">
            <div className="bd-masked" aria-label="Amounts masked">
              ৳ ••••••
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#6F6A85]">
              You do not have permission to view salary figures. A {s.templateName.toLowerCase()} structure is in force from{' '}
              <span className="bd-mono">{date(s.effectiveFrom)}</span>
              {s.clearsFloor === false ? ', and it is below the gazetted floor.' : '.'} The amounts are never sent to you, not merely hidden.
            </p>
          </div>
        </div>
      </Section>
    );
  }

  const derived = isDerived(data.derived) ? data.derived : null;
  const floors = isFloors(data.floors) ? data.floors : [];
  const basic = s.components.find((c) => c.code === 'BASIC');
  const taxMonthly = tax.data?.available ? tax.data.periodDeduction : null;

  return (
    <div className="space-y-4">
      <Section
        title={t('Salary structure', 'structure')}
        desc="Read-only here. Assigning, revising and overriding a salary happen in the salary profile, the one place a salary is written."
        right={<OpenProfile code={code} />}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: t('Gross monthly', 'grossMonthly'), value: money(s.gross), note: 'The figure on the offer letter.' },
            {
              label: t('Basic', 'basic'),
              value: money(basic?.amount),
              note: `${basic?.percentOfGross ? n(basic.percentOfGross) + '% of gross. ' : ''}Drives overtime, provident fund, gratuity and festival bonus.`,
            },
            {
              label: t('Effective from', 'effectiveFrom'),
              value: date(s.effectiveFrom),
              note: `${s.templateName}${profile.employment.grade ? ' · ' + enumLabel('grade', profile.employment.grade) : ''}`,
            },
          ].map((h) => (
            <div key={h.label} className="bd-readout">
              <div className="bd-colhead">{h.label}</div>
              <div className="bd-mono mt-1 text-[20px] font-bold tracking-[-0.02em] text-[#16172A]">{h.value}</div>
              <div className="mt-0.5 text-[11.5px] text-[#6F6A85]">{h.note}</div>
            </div>
          ))}
        </div>

        <div className="bd-table-wrap mt-4">
          <table className="bd-table">
            <caption className="sr-only">Components of the structure in force</caption>
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Basis</th>
                <th scope="col" className="num">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {s.components.map((c) => (
                <tr key={c.code}>
                  <th scope="row" className="font-semibold">
                    {c.name}
                  </th>
                  <td>
                    <span className="bd-mono text-[11.5px] text-[#6F6A85]">{c.basis ? n(c.basis) : '—'}</span>
                    {c.isOverridden && (
                      <span className="bd-tag-override ml-2" title={c.templateBasis ?? undefined}>
                        OVERRIDE
                      </span>
                    )}
                  </td>
                  <td className="num font-semibold">{money(c.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">{t('Gross monthly', 'grossMonthly')}</th>
                <td>
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-[#157A5B]">
                    <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                    {t('Reconciled', 'reconciled')}
                  </span>
                </td>
                <td className="num bd-cost-total">{money(s.gross)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="bd-readout mt-3 !py-2.5">
          <div className="bd-colhead">{t('In words', 'inWords')}</div>
          <div lang={lang} className="mt-0.5 text-[13px] font-semibold text-[#16172A]">
            {s.grossInWords[lang]}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {floors.map((f) => (
            <Chip key={f.kind} tone={f.passed ? 'ok' : 'blocked'} title={f.message ?? f.citation ?? undefined}>
              {f.passed ? '✓' : '!'} {f.kind === 'basic' ? 'Basic' : 'Total wage'} {f.passed ? 'above' : 'below'} the gazetted floor ({money(f.floor)})
              <ConfidenceTag value={f.confidence} />
            </Chip>
          ))}
        </div>
        {s.reopenedPeriods.length > 0 && Number(s.arrears) !== 0 && (
          <Note tone="violet" className="mt-3">
            This structure reopened {s.reopenedPeriods.map((p) => formatMonthYear(p, lang)).join(', ')}: {money(s.arrears, 2)} of arrears queued for the{' '}
            {enumLabel('arrearsRun', s.arrearsRun ?? 'NEXT_RUN').toLowerCase()}.
          </Note>
        )}
      </Section>

      <Section title="What this salary means" desc="Basic drives four statutory entitlements. Gross drives almost nothing except tax.">
        <DerivationPanel
          derived={derived}
          unavailable={!derived && data.derived && 'available' in data.derived ? data.derived.reason : null}
          classification={profile.employment.classification}
          taxMonthly={taxMonthly}
          className="md:grid md:grid-cols-2 md:gap-3 md:space-y-0 xl:grid-cols-3"
        />
      </Section>
    </div>
  );
}
