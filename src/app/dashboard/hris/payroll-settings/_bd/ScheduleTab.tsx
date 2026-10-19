'use client';

/**
 * The pay schedule (§9). The s.123 deadline -- the seventh working day after
 * the wage period -- is counted on the establishment's published calendar,
 * never on a hardcoded Friday-Saturday weekend (§15 defect 2): a factory on
 * a single weekly holiday works Saturdays, and its deadline is earlier.
 * A payment day past the deadline is refused when it is saved.
 */

import * as React from 'react';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { Field, MIN_REASON, todayISO, useWrite } from '@/app/dashboard/hris/pay-library/_bd/parts';
import * as api from './api';
import { dateBD } from './fmt';
import { useSchedule } from './hooks';
import type { Deadline, Schedule, Summary } from './types';

const FREQ: [Schedule['frequency'], string][] = [['MONTHLY', 'Monthly'], ['FORTNIGHTLY', 'Fortnightly'], ['WEEKLY', 'Weekly'], ['DAILY', 'Daily']];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function ScheduleTab({ s, site }: { s: Summary; site: string | null }) {
  const q = useSchedule(site);
  if (q.isLoading) return <LoadingBlock />;
  if (q.error || !q.data) return <ErrorBlock error={q.error} onRetry={() => q.refetch()} />;
  return <ScheduleForm key={q.data.schedule?.uid ?? 'none'} current={q.data.schedule} deadlines={q.data.deadlines} canWrite={s.can.schedule} site={site} />;
}

function ScheduleForm({ current, deadlines, canWrite, site }: { current: Schedule | null; deadlines?: Deadline[]; canWrite: boolean; site: string | null }) {
  const [freq, setFreq] = React.useState<Schedule['frequency']>(current?.frequency ?? 'MONTHLY');
  const [cutoff, setCutoff] = React.useState(String(current?.cutoffDay ?? 25));
  const [pay, setPay] = React.useState(String(current?.paymentDay ?? 7));
  const [weekday, setWeekday] = React.useState(String(current?.paymentWeekday ?? 4));
  const [from, setFrom] = React.useState(todayISO());
  const [reason, setReason] = React.useState('');
  const [check, setCheck] = React.useState<{ deadlines: Deadline[]; unchecked: string[]; late: Deadline[] } | null>(null);
  const write = useWrite();
  const day = Number(pay);
  React.useEffect(() => {
    if (freq !== 'MONTHLY' || !(day >= 1 && day <= 31)) { setCheck(null); return; }
    let live = true;
    const t = setTimeout(() => {
      api.checkSchedule(day, from, site).then((r) => live && setCheck(r)).catch(() => live && setCheck(null));
    }, 250);
    return () => { live = false; clearTimeout(t); };
  }, [freq, day, from, site]);
  const rows = check?.deadlines ?? deadlines ?? [];
  const late = check?.late ?? rows.filter((r) => r.late);
  const needsReason = !!current;
  const save = () => write.run(() => api.saveSchedule({
    frequency: freq, cutoffDay: freq === 'MONTHLY' ? Number(cutoff) : null, paymentDay: freq === 'MONTHLY' ? day : null,
    paymentWeekday: freq === 'WEEKLY' || freq === 'FORTNIGHTLY' ? Number(weekday) : null, effectiveFrom: from, reason, site,
  }), 'Pay schedule saved');
  return (
    <div className="ps-stack">
      <section className="bd-card ps-card" aria-labelledby="ps-sched">
        <h2 id="ps-sched" className="ps-section-title">Pay schedule <span lang="bn" className="ps-gloss">বেতনের সময়সূচি</span></h2>
        <p className="ps-desc">All four frequencies exist because the Labour Act permits daily and weekly wages; an RMG subcontractor paying weekly is common. The wage period is the calendar month; the cut-off is when attendance and inputs close inside it.</p>
        <div className="ps-cite">Bangladesh Labour Act 2006, s.123 — wages paid before the end of the seventh working day after the wage period.</div>
        {current && <div className="ps-current">In force from {dateBD(current.effectiveFrom)}: {FREQ.find((f) => f[0] === current.frequency)?.[1]}{current.frequency === 'MONTHLY' ? `, cut-off day ${current.cutoffDay}, paid on day ${current.paymentDay}` : ''}{current.decidedBy ? ` · ${current.decidedBy}` : ''}</div>}
        <fieldset disabled={!canWrite} className="ps-fieldset">
          <div role="radiogroup" aria-label="Pay frequency" className="ps-seg">
            {FREQ.map(([v, label]) => (
              <label key={v} className={`ps-seg-opt${freq === v ? ' on' : ''}`}><input type="radio" name="ps-freq" checked={freq === v} onChange={() => setFreq(v)} />{label}</label>
            ))}
          </div>
          <div className="pl-row">
            {freq === 'MONTHLY' ? (
              <>
                <Field label="Cut-off day" htmlFor="ps-cut"><input id="ps-cut" className="bd-input bd-mono ps-narrow" inputMode="numeric" value={cutoff} onChange={(e) => setCutoff(e.target.value.replace(/\D/g, ''))} /></Field>
                <Field label="Payment day (of the next month)" htmlFor="ps-pay" error={late.length ? `Late in ${late.length} of the next ${rows.length} months` : null}>
                  <input id="ps-pay" className="bd-input bd-mono ps-narrow" inputMode="numeric" value={pay} onChange={(e) => setPay(e.target.value.replace(/\D/g, ''))} aria-invalid={late.length > 0 || undefined} />
                </Field>
              </>
            ) : freq !== 'DAILY' ? (
              <Field label="Payment weekday" htmlFor="ps-wd">
                <select id="ps-wd" className="bd-input" value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                  {WEEKDAYS.map((w, i) => <option key={w} value={i + 1}>{w}</option>)}
                </select>
              </Field>
            ) : null}
            <Field label="Effective from" htmlFor="ps-sfrom"><input id="ps-sfrom" type="date" className="bd-input" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            {needsReason && <Field label="Reason" htmlFor="ps-swhy" hint={`At least ${MIN_REASON} characters.`}><input id="ps-swhy" className="bd-input" style={{ minWidth: 260 }} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>}
          </div>
          <div className="pl-actions">
            <button type="button" className="bd-btn-primary" disabled={write.busy || late.length > 0 || (needsReason && reason.trim().length < MIN_REASON)} onClick={save}>Save schedule</button>
          </div>
        </fieldset>
        {write.error && <div className="bd-note bd-tone-blocked" role="alert">{write.error}</div>}
      </section>

      {freq === 'MONTHLY' && (
        <section className="bd-card ps-card" aria-labelledby="ps-dl">
          <h2 id="ps-dl" className="ps-section-title">The s.123 deadline, month by month <span lang="bn" className="ps-gloss">শেষ তারিখ</span></h2>
          <p className="ps-desc">Counted on this establishment&apos;s published holiday calendar: its weekly pattern and its festival holidays.</p>
          {rows.length ? (
            <div className="pl-scrollx" aria-live="polite">
              <table className="bd-table">
                <thead><tr><th scope="col">Wage month</th><th scope="col">Period ends</th><th scope="col">Deadline</th><th scope="col">Payment on day {day || '—'}</th><th scope="col">Status</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.month}>
                      <th scope="row" className="bd-mono">{r.month}</th>
                      <td className="bd-mono">{dateBD(r.wagePeriodEnd)}</td>
                      <td className="bd-mono">{dateBD(r.deadline)}</td>
                      <td className="bd-mono">{dateBD(r.paymentDate)}</td>
                      <td>{r.late ? <span className="pl-bad">Late — a breach</span> : <span className="ps-ok">In time</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="bd-note bd-tone-warn">No published holiday calendar covers these months, so the deadline cannot be computed. Publish the calendar in Attendance first.</div>}
          {check?.unchecked?.length ? <div className="ps-hint">Not checked — no published calendar yet: {check.unchecked.join(', ')}.</div> : null}
        </section>
      )}
    </div>
  );
}
