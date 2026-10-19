'use client';

/**
 * The four schemes (§10). A change is effective-dated: changing the PF rate
 * supersedes the scheme from a date and does not restate past
 * contributions. Membership is per employee, not a company boolean --
 * `autoEnrol` with eligibility on confirmation leaves the probationers out.
 */

import * as React from 'react';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { Chip, LoadingBlock, SwitchRow } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { Drawer, Field, MIN_REASON, todayISO, useWrite } from '@/app/dashboard/hris/pay-library/_bd/parts';
import * as api from './api';
import { dateBD } from './fmt';
import { useParticipants } from './hooks';
import type { Scheme, SchemeCode, Summary } from './types';

const LEADS: Record<SchemeCode, string> = {
  PF: 'A trust under s.264: the constitution date decides when contributions became payable. 8% / 8% is the convention, not the law.',
  GRATUITY: 'A provision is a liability on the balance sheet; a funded scheme is cash in a trust. The accounting and the employee’s security differ entirely.',
  GROUP_INSURANCE: 'Compulsory above a headcount threshold (s.99). Lapsed cover is a breach, not an administrative slip — the renewal date is tracked.',
  WPPF: 'Workers’ Profit Participation Fund: 5% of net profit, with six months’ service for eligibility (s.232, s.234).',
};

export function SchemesTab({ s }: { s: Summary }) {
  return (
    <div className="ps-stack">
      {s.schemes.map((x) => <SchemeCard key={`${x.uid}`} scheme={x} canWrite={s.can.scheme} />)}
    </div>
  );
}

function SchemeCard({ scheme, canWrite }: { scheme: Scheme; canWrite: boolean }) {
  const [applies, setApplies] = React.useState(scheme.applies);
  const [cfg, setCfg] = React.useState<Record<string, any>>(scheme.config);
  const [from, setFrom] = React.useState(todayISO());
  const [reason, setReason] = React.useState('');
  const [people, setPeople] = React.useState(false);
  const write = useWrite();
  const changed = applies !== scheme.applies || JSON.stringify(cfg) !== JSON.stringify(scheme.config);
  const set = (k: string, v: unknown) => setCfg({ ...cfg, [k]: v });
  const id = `ps-sch-${scheme.code}`;
  const lapsed = scheme.code === 'GROUP_INSURANCE' && scheme.applies && cfg.renewalDate && cfg.renewalDate < todayISO();
  const save = () => write.run(() => api.updateScheme(scheme.code, { applies, config: cfg, effectiveFrom: from, reason }), `${scheme.label} saved`);
  return (
    <section className="bd-card ps-card" aria-labelledby={id}>
      <div className="ps-el-head">
        <div className="min-w-0">
          <h2 id={id} className="ps-section-title">{scheme.label} <span lang="bn" className="ps-gloss">{scheme.bn}</span></h2>
          <p className="ps-desc">{LEADS[scheme.code]}</p>
          <div className="ps-cite">{scheme.citation}</div>
        </div>
        <div className="ps-el-status">
          <Chip tone={scheme.applies ? 'ok' : 'neutral'} dot>{scheme.applies ? 'Applies' : 'Does not apply'}</Chip>
          {scheme.applies && !scheme.expense && <Chip tone="blocked">No expense account</Chip>}
          {lapsed && <Chip tone="blocked">Cover lapsed {dateBD(cfg.renewalDate)}</Chip>}
        </div>
      </div>
      <div className="ps-current">In force from {dateBD(scheme.effectiveFrom)}{scheme.decidedBy ? ` · ${scheme.decidedBy}` : ''}{scheme.reason ? ` — “${scheme.reason}”` : ''}</div>
      <fieldset disabled={!canWrite} className="ps-fieldset">
        <SwitchRow checked={applies} onChange={setApplies} label={applies ? 'Applies to this company' : 'Does not apply'} />
        {scheme.code === 'PF' && <PfFields cfg={cfg} set={set} />}
        {scheme.code === 'GRATUITY' && (
          <div className="pl-row">
            <Field label="Accrual" htmlFor="ps-gm">
              <select id="ps-gm" className="bd-input" value={cfg.method} onChange={(e) => set('method', e.target.value)}>
                <option value="MONTHLY_PROVISION">Monthly provision</option><option value="FUNDED_SCHEME">Funded scheme</option>
              </select>
            </Field>
            {cfg.method === 'FUNDED_SCHEME' && <Field label="Fund (trust)" htmlFor="ps-gf"><input id="ps-gf" className="bd-input" value={cfg.fundName ?? ''} onChange={(e) => set('fundName', e.target.value)} /></Field>}
            <Field label="Minimum service, years" htmlFor="ps-gy"><input id="ps-gy" className="bd-input bd-mono ps-narrow" value={cfg.minServiceYears ?? 1} onChange={(e) => set('minServiceYears', e.target.value.replace(/\D/g, ''))} /></Field>
          </div>
        )}
        {scheme.code === 'GROUP_INSURANCE' && (
          <div className="pl-row">
            <SwitchRow checked={!!cfg.inForce} onChange={(v) => set('inForce', v)} label="Policy in force" />
            <Field label="Insurer" htmlFor="ps-ii"><input id="ps-ii" className="bd-input" value={cfg.insurer ?? ''} onChange={(e) => set('insurer', e.target.value)} /></Field>
            <Field label="Policy number" htmlFor="ps-ip"><input id="ps-ip" className="bd-input bd-mono" value={cfg.policyNo ?? ''} onChange={(e) => set('policyNo', e.target.value)} /></Field>
            <Field label="Renewal" htmlFor="ps-ir"><input id="ps-ir" type="date" className="bd-input" value={cfg.renewalDate ?? ''} onChange={(e) => set('renewalDate', e.target.value || null)} /></Field>
            <Field label="Coverage" htmlFor="ps-ic">
              <select id="ps-ic" className="bd-input" value={cfg.coverage} onChange={(e) => set('coverage', e.target.value)}>
                <option value="ALL_WORKERS">All workers</option><option value="PERMANENT_ONLY">Permanent only</option><option value="CUSTOM">Custom</option>
              </select>
            </Field>
            <Field label="Premium per covered employee, monthly" htmlFor="ps-ipm"><input id="ps-ipm" className="bd-input bd-mono ps-narrow" value={cfg.premiumMonthly ?? ''} onChange={(e) => set('premiumMonthly', e.target.value.replace(/[^\d.]/g, ''))} /></Field>
          </div>
        )}
        {scheme.code === 'WPPF' && (
          <div className="pl-row">
            <Field label="Eligibility, months of service" htmlFor="ps-we"><input id="ps-we" className="bd-input bd-mono ps-narrow" value={cfg.eligibilityMonths ?? 6} onChange={(e) => set('eligibilityMonths', e.target.value.replace(/\D/g, ''))} /></Field>
            <Field label="Share of net profit, %" htmlFor="ps-wp"><input id="ps-wp" className="bd-input bd-mono ps-narrow" value={pctText(cfg.profitSharePct)} onChange={(e) => set('profitSharePct', e.target.value.replace(/[^\d.]/g, ''))} /></Field>
            <div className="ps-hint ps-split">Distribution {cfg.distributionSplit?.workers}% participation fund · {cfg.distributionSplit?.welfareFund}% welfare fund · {cfg.distributionSplit?.govtFund}% the government foundation (s.234).</div>
          </div>
        )}
        {changed && (
          <div className="ps-commit">
            <Field label="Effective from" htmlFor={`${id}-from`}><input id={`${id}-from`} type="date" className="bd-input" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            <Field label="Reason" htmlFor={`${id}-why`} hint={`At least ${MIN_REASON} characters. Past periods keep the scheme as it was.`}><input id={`${id}-why`} className="bd-input" style={{ minWidth: 280 }} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
            <button type="button" className="bd-btn-primary" disabled={write.busy || reason.trim().length < MIN_REASON} onClick={save}>Save from {dateBD(from)}</button>
          </div>
        )}
      </fieldset>
      {write.error && <div className="bd-note bd-tone-blocked" role="alert">{write.error}</div>}
      {scheme.code !== 'WPPF' && <div><button type="button" className="pl-link" onClick={() => setPeople(true)}>Members and eligibility</button></div>}
      {people && <Participants code={scheme.code} label={scheme.label} canWrite={canWrite} onClose={() => setPeople(false)} />}
    </section>
  );
}

const pctText = (v: unknown) => (v === null || v === undefined || v === '' ? '' : String(Number(v)));

function PfFields({ cfg, set }: { cfg: Record<string, any>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <div className="pl-row">
        <SwitchRow checked={!!cfg.constituted} onChange={(v) => set('constituted', v)} label="Constituted as a trust" />
        <Field label="Constitution date" htmlFor="ps-pfd"><input id="ps-pfd" type="date" className="bd-input" value={cfg.constitutionDate ?? ''} onChange={(e) => set('constitutionDate', e.target.value || null)} /></Field>
        <Field label="Employee %" htmlFor="ps-pfe"><input id="ps-pfe" className="bd-input bd-mono ps-narrow" value={pctText(cfg.employeeRatePct)} onChange={(e) => set('employeeRatePct', e.target.value.replace(/[^\d.]/g, ''))} /></Field>
        <Field label="Employer %" htmlFor="ps-pfr"><input id="ps-pfr" className="bd-input bd-mono ps-narrow" value={pctText(cfg.employerRatePct)} onChange={(e) => set('employerRatePct', e.target.value.replace(/[^\d.]/g, ''))} /></Field>
      </div>
      <div className="pl-row">
        <Field label="Eligibility" htmlFor="ps-pfel">
          <select id="ps-pfel" className="bd-input" value={cfg.eligibility} onChange={(e) => set('eligibility', e.target.value)}>
            <option value="ON_JOINING">On joining</option><option value="ON_CONFIRMATION">On confirmation</option><option value="AFTER_MONTHS">After N months of service</option>
          </select>
        </Field>
        {cfg.eligibility === 'AFTER_MONTHS' && <Field label="Months" htmlFor="ps-pfm"><input id="ps-pfm" className="bd-input bd-mono ps-narrow" value={cfg.eligibilityMonths ?? ''} onChange={(e) => set('eligibilityMonths', e.target.value.replace(/\D/g, ''))} /></Field>}
        <SwitchRow checked={!!cfg.autoEnrol} onChange={(v) => set('autoEnrol', v)} label="Enrol automatically once eligible" />
      </div>
    </>
  );
}

function Participants({ code, label, canWrite, onClose }: { code: SchemeCode; label: string; canWrite: boolean; onClose: () => void }) {
  const q = useParticipants(code);
  const write = useWrite();
  const { n } = useLang();
  const d = q.data;
  return (
    <Drawer id="ps-people" title={`${label} — members`} sub="Per employee, from a date. Membership is switched on and off on each employee's Statutory tab; an opt-out carries its reason." onClose={onClose} width={640}>
      {q.isLoading || !d ? <LoadingBlock /> : (
        <>
          <div className="ps-hint">{n(d.members)} of {n(d.employees.length)} employees are members today.</div>
          {code === 'PF' && d.autoEnrol && d.autoEnrol.eligible.length > 0 && (
            <div className="bd-note bd-tone-violet">
              <div className="min-w-0">
                {n(d.autoEnrol.eligible.length)} eligible under the fund&apos;s rule and not yet members: {d.autoEnrol.eligible.slice(0, 6).map((e) => e.nameEn).join(', ')}{d.autoEnrol.eligible.length > 6 ? '…' : ''}.
                {canWrite && <div className="mt-2"><button type="button" className="bd-btn-primary" disabled={write.busy} onClick={() => write.run(() => api.autoEnrol(), (r) => `${r.enrolled} enrolled`)}>Enrol them from today</button></div>}
              </div>
            </div>
          )}
          {write.error && <div className="bd-note bd-tone-blocked" role="alert">{write.error}</div>}
          <div className="pl-scrollx">
            <table className="bd-table">
              <thead><tr><th scope="col">Employee</th><th scope="col">Category</th><th scope="col">Member</th><th scope="col">From</th>{code === 'PF' && <th scope="col">Eligible from</th>}</tr></thead>
              <tbody>
                {d.employees.map((e) => (
                  <tr key={e.code}>
                    <th scope="row">{e.nameEn} <span className="bd-mono pl-code">{e.code}</span></th>
                    <td>{(e.workerCategory ?? '—').toLowerCase()}</td>
                    <td>{e.member ? 'Yes' : e.participation?.optedOutOn ? `Opted out ${dateBD(e.participation.optedOutOn)}` : 'No'}</td>
                    <td className="bd-mono">{e.participation ? dateBD(e.participation.enrolledOn) : '—'}</td>
                    {code === 'PF' && <td className="bd-mono">{e.eligibleFrom ? dateBD(e.eligibleFrom) : '—'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Drawer>
  );
}
