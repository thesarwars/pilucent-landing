'use client';

/** Pieces the salary list, the profile and its drawers share (docs/frontend/salary-profile.md). */

import * as React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import type { EmployerCost, FloorPosition, SalaryComponent, Words } from '@/app/dashboard/hris/employee/employees/_bd/types';
import { Chip } from '@/app/dashboard/hris/employee/employees/_bd/ui';

export const MASK = '৳ ••••••';

/**
 * Who is looking (§3.4). It reflects the session, as the spec asks of
 * production — not a toggle: the server decides what is sent.
 */
export function PermissionPill({ masked }: { masked: boolean }) {
  return (
    <div className="bd-perm" title={masked ? 'Salary figures are masked for you: the server does not send them.' : 'You may view salary figures.'}>
      <span className="text-[10.5px] font-extrabold uppercase tracking-[0.06em] text-[#6E6883]">Permission</span>
      <span className={masked ? 'text-[11.5px] font-bold text-[#8A5A06]' : 'text-[11.5px] font-bold text-[#157A5B]'}>{masked ? 'Masked' : 'Full view'}</span>
    </div>
  );
}

export function BdBadge() {
  return (
    <span className="bd-badge bd-tone-bd !h-[28px] !rounded-full" title="Bangladesh compliance mode">
      BD
    </span>
  );
}

/** Gross and basic, together: gross alone cannot answer the floor question (§9.4). */
export function MoneyPair({ gross, basic, masked }: { gross: string | null; basic: string | null; masked?: boolean }) {
  const { money } = useLang();
  if (masked) {
    return (
      <span className="bd-moneypair" title="Salary figures are masked for you.">
        <span className="!font-semibold !text-[#6E6883]">{MASK}</span>
        <span />
      </span>
    );
  }
  return (
    <span className="bd-moneypair">
      <span>{money(gross)}</span>
      <span>basic {money(basic)}</span>
    </span>
  );
}

export function MaskedBlock() {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-[rgba(22,23,42,0.2)] bg-[rgba(22,23,42,0.04)] px-5 py-5">
      <Lock aria-hidden="true" className="h-5 w-5 shrink-0 text-[#6E6883]" />
      <div className="min-w-0">
        <div className="bd-masked" aria-label="Amounts masked">
          {MASK}
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-[#6F6A85]">
          You do not have permission to view salary information. The structure stays visible so you know it exists — the amounts are never sent to
          you, not merely hidden in the interface.
        </p>
      </div>
    </div>
  );
}

/** Clears the floor, or does not — and then the penalty (§10.3). */
export function FloorPill({ floor }: { floor: FloorPosition }) {
  const { money } = useLang();
  return (
    <Chip
      tone={floor.clears ? 'ok' : 'blocked'}
      title={floor.note}
      icon={
        floor.clears ? (
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        ) : (
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 7v6" />
            <circle cx="12" cy="16.6" r="0.7" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="9.2" />
          </svg>
        )
      }
    >
      {floor.clears ? 'Clears' : 'Below'} {floor.grade ? `the ${floor.gradeLabel} minimum` : 'the default floor (no grade recorded)'}{' '}
      <span className="bd-mono">{money(floor.floor)}</span>
    </Chip>
  );
}

/** The structure as a table: component, basis, amount — with the template baseline beside an override (§10.2). */
export function StructureTable({ components, gross, words, caption }: { components: SalaryComponent[]; gross: string; words?: Words | null; caption: string }) {
  const { money, n, lang } = useLang();
  return (
    <>
      <div className="bd-table-wrap">
        <table className="bd-table">
          <caption className="sr-only">{caption}</caption>
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
            {components.map((c) => (
              <tr key={c.code}>
                <th scope="row" className="font-semibold">
                  {c.name}
                  {c.isBalancing && <span className="block text-[11px] font-medium text-[#6E6883]">balancing line</span>}
                </th>
                <td>
                  <span className="bd-mono text-[11.5px] text-[#6F6A85]">{c.basis ? n(c.basis) : '—'}</span>
                  {c.isOverridden && (
                    <>
                      <span className="bd-tag-override ml-2">OVERRIDE</span>
                      {c.templateBasis && <span className="mt-0.5 block text-[11px] text-[#6E6883]">{n(c.templateBasis)}</span>}
                    </>
                  )}
                </td>
                <td className="num font-semibold">{money(c.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Gross</th>
              <td>
                <span className="inline-flex items-center gap-1 text-[11.5px] text-[#157A5B]">
                  <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                  Reconciled to the paisa
                </span>
              </td>
              <td className="num bd-cost-total text-[14.5px]">{money(gross)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {words && (
        <div className="bd-readout mt-3 !py-2.5">
          <div className="bd-colhead">
            In words{' '}
            <span lang="bn" className="normal-case">
              কথায়
            </span>
          </div>
          <div lang="bn" className="mt-1 text-[12.5px] font-semibold text-[#16172A]">
            {words.bn}
          </div>
          <div className="text-[12px] text-[#6F6A85]">{words.en}</div>
          <span className="sr-only">{words[lang]}</span>
        </div>
      )}
    </>
  );
}

/**
 * What the employee costs, line by line with its arithmetic (§10.4). A real
 * table, so a screen reader reads rows and columns (spec defect #2). The
 * total is the only row with a rule above it, in the deepest violet.
 */
export function CostTable({ cost, gross }: { cost: EmployerCost; gross: string }) {
  const { money } = useLang();
  return (
    <>
      <table className="bd-costtable">
        <caption className="sr-only">Employer cost, monthly</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Line</th>
            <th scope="col">Basis</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {cost.rows.map((r) => (
            <tr key={r.key}>
              <th scope="row">{r.label}</th>
              <td className="basis">{r.basis}</td>
              <td className="num">{money(r.amount, Number(r.amount) % 1 ? 2 : undefined)}</td>
            </tr>
          ))}
          <tr className="total">
            <th scope="row">Total monthly cost</th>
            <td className="basis" />
            <td className="num">{money(cost.total)}</td>
          </tr>
          <tr className="annual">
            <th scope="row">Annual cost</th>
            <td className="basis">× 12</td>
            <td className="num">{money(cost.annual)}</td>
          </tr>
        </tbody>
      </table>
      {cost.overheadLabel && (
        <div className="bd-note bd-tone-violet mt-3 !items-center !font-medium">
          <span className="font-bold text-[#5A2BE0]">{cost.overheadLabel}</span>
          <span className="text-[11.5px] text-[#6F6A85]">
            The offer letter says {money(gross)}. The company spends {money(cost.total)} every month.
          </span>
        </div>
      )}
    </>
  );
}
