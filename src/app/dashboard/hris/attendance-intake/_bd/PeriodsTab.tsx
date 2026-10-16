'use client';

/**
 * Period lock (§8): OPEN -> PROCESSING -> REVIEW -> LOCKED, a one-way
 * ratchet. Advancing is ink, not violet -- consequential. Unresolved
 * exceptions block the lock unless acknowledged with a reason, stored on
 * the period. Unlocking is a separate permission with three gates: a
 * reason, then -- when payroll consumed the month -- a confirmation naming
 * the run it invalidates.
 */

import * as React from 'react';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { usePeriods } from './hooks';
import { Drawer, Field, Tag, useNum, useWrite } from './parts';
import { MIN_REASON, NEXT_STATE, PERIOD_STATE, reasonShort, shortDate, when } from './defs';
import * as api from './api';
import type { Period, Summary } from './types';

const ADVANCE_LABEL: Record<string, string> = { OPEN: 'Start processing', PROCESSING: 'Move to review', REVIEW: 'Lock' };

export function PeriodsTab({ summary }: { summary: Summary }) {
  const { sites, can } = summary;
  const [siteUid, setSiteUid] = React.useState(sites.find((s) => s.isDefault)?.uid || sites[0]?.uid || '');
  const q = usePeriods(siteUid);
  const num = useNum();
  const [ack, setAck] = React.useState<{ p: Period; count: number } | null>(null);
  const [unlock, setUnlock] = React.useState<Period | null>(null);
  const write = useWrite();

  const advance = (p: Period) =>
    write.run(() => api.advancePeriod(siteUid, p.month), (o) => `${o.label}: ${PERIOD_STATE[o.state].label.toLowerCase()}`, (err) => {
      // Only unresolved exceptions stand: ask for the acknowledgement, for this period.
      const c = err.consequence as { needsAcknowledgement?: boolean; count?: number } | null;
      if (!c?.needsAcknowledgement) return false;
      setAck({ p, count: c.count || 0 });
      return true;
    });

  if (q.isLoading) return <LoadingBlock />;
  if (q.error || !q.data) return <ErrorBlock error={q.error} onRetry={() => q.refetch()} />;
  return (
    <div className="ai-stack">
      <div className="ai-row-between">
        <p className="ai-caption" style={{ margin: 0, maxWidth: 680 }}>
          A period belongs to one establishment: a factory and a head office close on different days. A locked month takes no new punches, from any import.
        </p>
        {sites.length > 1 && (
          <Field label="Establishment" htmlFor="ai-p-site">
            <select id="ai-p-site" className="ai-select" value={siteUid} onChange={(e) => setSiteUid(e.target.value)}>{sites.map((s) => <option key={s.uid} value={s.uid}>{s.name}</option>)}</select>
          </Field>
        )}
      </div>
      {write.error && !ack && <div className="ai-note ai-tone-neg" role="alert">{write.error}</div>}
      <div className="ai-card ai-scrollx">
        <table className="ai-table">
          <thead><tr><th scope="col">Period</th><th scope="col">State</th><th scope="col" className="num">Exceptions</th><th scope="col">Payroll</th><th scope="col">Still open</th><th scope="col" style={{ textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>
            {q.data.periods.map((p) => {
              const next = NEXT_STATE[p.state];
              const mayAdvance = next === 'LOCKED' ? can.lock : can.advance;
              const otherGates = (p.gates || []).filter((g) => g.blocks && g.key !== 'high');
              return (
                <tr key={p.month}>
                  <th scope="row">{p.label}<div className="ai-caption ai-mono">{num(p.imports)} imports</div></th>
                  <td>
                    <Tag tone={PERIOD_STATE[p.state].tone}>{PERIOD_STATE[p.state].label}</Tag>
                    {p.lockedOn && <div className="ai-caption">locked {shortDate(p.lockedOn)}{p.lockedBy ? ` by ${p.lockedBy}` : ''}</div>}
                    {p.acknowledgeReason && <div className="ai-caption">over {num(p.exceptionsAcknowledged)} exceptions: “{p.acknowledgeReason}”</div>}
                  </td>
                  <td className="num ai-mono" style={{ color: p.exceptions ? '#A5372C' : undefined }}>{p.exceptions === null ? '—' : num(p.exceptions)}</td>
                  <td className="ai-small">
                    {p.payrollRun ? <>Run <span className="ai-mono">{p.payrollRun}</span>{p.payrollProcessedOn ? `, ${shortDate(p.payrollProcessedOn)}` : ''}</> : <span className="ai-caption">Not run</span>}
                    {p.payrollInvalidated && <div><Tag tone="neg">invalid: {p.payrollInvalidated}</Tag></div>}
                  </td>
                  <td className="ai-small">{otherGates.length ? otherGates.map((g) => <div key={g.key}>{g.label}</div>) : <span className="ai-caption">—</span>}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {next && (
                      <button type="button" className="ai-btn-ink ai-btn-row" disabled={!mayAdvance || write.busy} onClick={() => advance(p)}
                        title={!mayAdvance ? (next === 'LOCKED' ? 'Locking needs the lock attendance permission' : 'Needs the advance attendance period permission') : undefined}>
                        {ADVANCE_LABEL[p.state]}
                      </button>
                    )}
                    {p.state === 'LOCKED' && (
                      <button type="button" className="ai-btn-danger ai-btn-row" disabled={!can.unlock} onClick={() => setUnlock(p)}
                        title={!can.unlock ? 'Unlocking needs the reopen attendance permission — separate from locking' : undefined}>Unlock</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {q.data.audit.length > 0 && (
        <section>
          <h2 className="ai-section-title">What happened</h2>
          <ol className="ai-audit">
            {q.data.audit.map((a, i) => (
              <li key={i}><span className="ai-mono ai-caption">{when(a.at)}</span> <b>{a.label}</b> {a.month && <span className="ai-mono">{a.month}</span>}{a.by ? ` · ${a.by}` : ''}{a.reason && <div className="ai-caption">“{a.reason}”</div>}</li>
            ))}
          </ol>
        </section>
      )}
      {ack && <AcknowledgeLock siteUid={siteUid} p={ack.p} count={ack.count} onClose={() => { setAck(null); write.clear(); }} />}
      {unlock && <Unlock siteUid={siteUid} p={unlock} onClose={() => setUnlock(null)} />}
    </div>
  );
}

function AcknowledgeLock({ siteUid, p, count, onClose }: { siteUid: string; p: Period; count: number; onClose: () => void }) {
  const [reason, setReason] = React.useState('');
  const write = useWrite();
  const num = useNum();
  return (
    <Drawer id="ai-ack" title={`Lock ${p.label} over open exceptions?`} sub={`${num(count)} high-severity exceptions are unresolved.`} onClose={onClose}>
      <p className="ai-small" style={{ margin: 0 }}>
        They block payroll until someone decides them. Locking anyway records your reason on the period, so “why was {p.label} locked with {num(count)} open exceptions” has an answer.
      </p>
      <Field label="Reason" htmlFor="ai-ack-r" hint={`At least ${MIN_REASON} characters.`} error={write.error}>
        <textarea id="ai-ack-r" className="ai-input" style={{ minHeight: 80, padding: 10 }} value={reason} onChange={(e) => setReason(e.target.value)} />
      </Field>
      <div className="ai-actions">
        <button type="button" className="ai-btn" onClick={onClose}>Go back and resolve them</button>
        <button type="button" className="ai-btn-ink" disabled={reasonShort(reason) || write.busy} onClick={async () => { if (await write.run(() => api.advancePeriod(siteUid, p.month, reason.trim()), `${p.label} locked`)) onClose(); }}>Lock with this reason</button>
      </div>
    </Drawer>
  );
}

function Unlock({ siteUid, p, onClose }: { siteUid: string; p: Period; onClose: () => void }) {
  const [reason, setReason] = React.useState('');
  const [confirmed, setConfirmed] = React.useState(false);
  const write = useWrite();
  const impact = (write.consequence as { needsConfirmation?: boolean; impact?: { runRef: string; processedOn: string; label: string } } | null)?.impact
    || (p.payrollRun ? { runRef: p.payrollRun, processedOn: p.payrollProcessedOn || '', label: p.label } : null);
  const go = async () => {
    if (await write.run(() => api.unlockPeriod(siteUid, p.month, reason.trim(), confirmed), `${p.label} unlocked`)) onClose();
  };
  return (
    <Drawer id="ai-unlock" title={`Unlock ${p.label}`} sub="Logged, with your reason." onClose={onClose}>
      <p className="ai-small" style={{ margin: 0 }}>The month takes punches again and the register&apos;s saved figures for it go stale until it is locked again.</p>
      <Field label="Reason" htmlFor="ai-unlock-r" hint={`At least ${MIN_REASON} characters.`}>
        <textarea id="ai-unlock-r" className="ai-input" style={{ minHeight: 80, padding: 10 }} value={reason} onChange={(e) => setReason(e.target.value)} />
      </Field>
      {impact && (
        <div className="ai-note ai-tone-neg">
          Payroll for {impact.label} was processed on {impact.processedOn}. Unlocking marks that run (<span className="ai-mono">{impact.runRef}</span>) invalid and it must be re-run.
          <label className="ai-check" style={{ marginTop: 8 }}><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /><span>I understand: run {impact.runRef} becomes invalid.</span></label>
        </div>
      )}
      {write.error && <div className="ai-note ai-tone-neg" role="alert">{write.error}</div>}
      <div className="ai-actions">
        <button type="button" className="ai-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="ai-btn-danger" disabled={reasonShort(reason) || (!!impact && !confirmed) || write.busy} onClick={go}>Unlock {p.label}</button>
      </div>
    </Drawer>
  );
}
