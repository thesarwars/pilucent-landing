'use client';

/**
 * Minimum wage (§3.6): the gazette's grade floors -- from the rule book, with
 * their citation and confidence -- against the company's own floor, which may
 * exceed the gazette but never undercut it, and who is below either today.
 * The provident-fund rates are shown, not set: they are the PF scheme's, in
 * Payroll settings, where a change is effective-dated.
 */

import * as React from 'react';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useFloors } from './hooks';
import { Field, SectionTitle, useWrite } from './parts';
import * as api from './api';

export function FloorsTab() {
  const q = useFloors();
  const { money, n } = useLang();
  const [floor, setFloor] = React.useState<string | null>(null);
  const write = useWrite();
  if (q.isLoading) return <LoadingBlock />;
  if (q.error || !q.data) return <ErrorBlock error={q.error} onRetry={() => q.refetch()} />;
  const f = q.data;
  const pct = (v: string) => String(Math.round(Number(v) * 10000) / 100);
  const save = () => write.run(() => api.setPolicy({ companyFloor: floor ?? f.companyFloor }), 'Company floor saved');
  return (
    <div className="pl-stack">
      <section className="bd-card pl-card">
        <SectionTitle en="Grade floors" bn="ন্যূনতম মজুরি">
          The basic each gazetted grade must reach — {f.citation}, {f.confidence.toLowerCase()}. The company floor binds where it is higher.
        </SectionTitle>
        <div className="pl-scrollx">
          <table className="bd-table">
            <thead><tr><th scope="col">Grade</th><th scope="col" className="pl-num">Basic floor</th><th scope="col" className="pl-num">Total wage floor</th><th scope="col" className="pl-num">Employees</th><th scope="col">Company floor</th></tr></thead>
            <tbody>
              {f.grades.map((g) => (
                <tr key={g.grade}>
                  <th scope="row">{g.label}</th>
                  <td className="bd-mono pl-num">{money(g.floorBasic)}</td>
                  <td className="bd-mono pl-num">{g.floorTotal ? money(g.floorTotal) : '—'}</td>
                  <td className="bd-mono pl-num">{n(g.employees)}</td>
                  <td>{g.companyFloorBinds ? <span className="bd-tone-violet pl-pill">binds: {money(f.companyFloor)}</span> : <span className="pl-hint">gazette binds</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bd-card pl-card">
        <SectionTitle en="Company policy" bn="কোম্পানির নীতি">
          A company floor may only add to the gazette. The provident fund rates — {pct(f.pfRateEmployee)}% employee, {pct(f.pfRateEmployer)}% employer — are the PF scheme’s, set in{' '}
          <a className="pl-link" href="/dashboard/hris/payroll-settings">Payroll settings</a>.
        </SectionTitle>
        <fieldset disabled={!f.can.policy} className="pl-row" style={{ border: 0, padding: 0, margin: 0 }}>
          <Field label="Company floor (basic)" htmlFor="pl-floor" hint="Empty: the gazette alone.">
            <input id="pl-floor" className="bd-input bd-mono" inputMode="numeric" style={{ width: 160 }} value={floor ?? f.companyFloor ?? ''} onChange={(e) => setFloor(e.target.value.replace(/[^\d.]/g, ''))} />
          </Field>
          <div style={{ alignSelf: 'flex-end' }}><button type="button" className="bd-btn-primary" disabled={write.busy} onClick={save}>Save</button></div>
        </fieldset>
        {write.error && <div className="bd-note bd-tone-blocked" role="alert">{write.error}</div>}
      </section>

      <section className="bd-card pl-card">
        <SectionTitle en="Below a floor today" bn="ন্যূনতমের নিচে">
          Structures in force whose basic is under the higher of the grade’s gazette floor and the company floor.
        </SectionTitle>
        {f.masked ? (
          <div className="bd-note bd-tone-neutral">{n(f.breachCount)} employees are below a floor. Their figures need the salary figures permission.</div>
        ) : !f.breaches.length ? <div className="bd-note bd-tone-ok">Nobody is below a floor.</div> : (
          <table className="bd-table">
            <thead><tr><th scope="col">Employee</th><th scope="col">Grade</th><th scope="col" className="pl-num">Basic</th><th scope="col" className="pl-num">Floor</th><th scope="col" className="pl-num">Short</th><th scope="col">Which</th></tr></thead>
            <tbody>
              {f.breaches.map((b) => (
                <tr key={b.code}>
                  <th scope="row">{b.nameEn} <span className="bd-mono pl-code">{b.code}</span></th>
                  <td>{b.gradeLabel}</td>
                  <td className="bd-mono pl-num">{money(b.basic)}</td>
                  <td className="bd-mono pl-num">{money(b.floor)}</td>
                  <td className="bd-mono pl-num pl-bad">{money(b.short)}</td>
                  <td>{b.which === 'gazette' ? 'Gazette' : 'Company'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
