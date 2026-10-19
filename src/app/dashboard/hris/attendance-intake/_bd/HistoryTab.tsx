'use client';

/**
 * Import history (§9): every batch, what it brought in and what it skipped.
 * A reversed batch stays in the list, dimmed -- the history is the
 * evidence that a correction happened. Reversing names what it touches
 * first: the days that recompute, and the adjustments on them, which stay.
 */

import * as React from 'react';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useBatch, useBatches } from './hooks';
import { Drawer, Empty, Field, FindingCard, Tag, useNum, useWrite } from './parts';
import { BATCH_STATUS, MIN_REASON, bytes, range, reasonShort, when } from './defs';
import * as api from './api';
import type { Summary } from './types';

export function HistoryTab({ summary, onContinue }: { summary: Summary; onContinue: (uid: string) => void }) {
  const q = useBatches();
  const num = useNum();
  const [open, setOpen] = React.useState<string | null>(null);
  if (q.isLoading) return <LoadingBlock />;
  if (q.error || !q.data) return <ErrorBlock error={q.error} onRetry={() => q.refetch()} />;
  const rows = q.data.batches;
  if (!rows.length) return <Empty title="No imports yet">Each upload appears here with what it imported and what it skipped. Nothing is ever deleted from this list.</Empty>;
  return (
    <div className="ai-card ai-scrollx">
      <table className="ai-table">
        <thead>
          <tr><th scope="col">File</th><th scope="col">Uploaded</th><th scope="col">Dates</th><th scope="col" className="num">Imported</th><th scope="col" className="num">Held</th><th scope="col" className="num">Skipped</th><th scope="col">State</th></tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.uid} className="ai-click" style={{ opacity: b.status === 'REVERSED' ? 0.55 : 1 }} onClick={() => setOpen(b.uid)}>
              <th scope="row"><div className="ai-ellipsis" style={{ maxWidth: 260 }}>{b.fileName}</div><div className="ai-mono ai-caption">{b.reference} · {b.profile ? `${b.profile.code} v${b.profile.version}` : 'no profile yet'}</div></th>
              <td className="ai-small">{b.uploadedBy || '—'}<div className="ai-mono ai-caption">{when(b.uploadedAt)}</div></td>
              <td className="ai-mono ai-small">{range(b.parsedRange)}</td>
              <td className="num ai-mono">{num(b.punches.imported)}</td>
              <td className="num ai-mono" style={{ color: b.punches.orphaned ? '#8A6215' : undefined }}>{num(b.punches.orphaned)}</td>
              <td className="num ai-mono">{num(b.punches.skipped)}</td>
              <td><Tag tone={BATCH_STATUS[b.status].tone}>{BATCH_STATUS[b.status].label}</Tag></td>
            </tr>
          ))}
        </tbody>
      </table>
      {open && <BatchDrawer uid={open} summary={summary} onClose={() => setOpen(null)} onContinue={() => { onContinue(open); setOpen(null); }} />}
    </div>
  );
}

function BatchDrawer({ uid, summary, onClose, onContinue }: { uid: string; summary: Summary; onClose: () => void; onContinue: () => void }) {
  const q = useBatch(uid);
  const num = useNum();
  const [reversing, setReversing] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const write = useWrite();
  const dl = useWrite();
  const b = q.data;
  return (
    <Drawer id="ai-batch" width={620} title={b ? b.fileName : 'Import'} sub={b ? <><span className="ai-mono">{b.reference}</span> · {bytes(b.bytes)} · {b.site.name}</> : undefined} onClose={onClose}>
      {q.isLoading || !b ? <LoadingBlock /> : (
        <div className="ai-stack">
          <div className="ai-row" style={{ gap: 8 }}>
            <Tag tone={BATCH_STATUS[b.status].tone}>{BATCH_STATUS[b.status].label}</Tag>
            <span className="ai-spacer" />
            <button type="button" className="ai-btn" disabled={!summary.can.import || dl.busy} onClick={() => dl.run(() => api.downloadRaw(b))}>Download the original file</button>
            {['UPLOADED', 'PARSED', 'VALIDATED'].includes(b.status) && <button type="button" className="ai-btn-primary" onClick={onContinue}>Continue this import</button>}
            {b.status === 'PROCESSED' && <button type="button" className="ai-btn-danger" disabled={!summary.can.reverse} onClick={() => setReversing(true)}>Reverse</button>}
          </div>
          {dl.error && <div className="ai-note ai-tone-neg">{dl.error}</div>}
          <dl className="ai-kv">
            <dt>Profile</dt><dd>{b.profile ? `${b.profile.name} · v${b.profile.version}` : '—'}</dd>
            <dt>Dates</dt><dd className="ai-mono">{range(b.parsedRange)}{b.statedRange ? ` (stated ${range(b.statedRange)})` : ''}</dd>
            <dt>Rows</dt><dd>{num(b.rows.total)} read, {num(b.rows.failed)} could not be</dd>
            <dt>When processed</dt><dd>{num(b.punches.imported)} into the register · {num(b.punches.orphaned)} held · {num(b.punches.skipped)} skipped</dd>
            {b.now && b.status === 'PROCESSED' && (
              <><dt>Now</dt><dd>{num(b.now.active)} in the register · {num(b.now.held)} held · {num(b.now.skipped)} skipped{b.now.relinked ? <span className="ai-caption"> ({num(b.now.relinked)} attached later by a mapping)</span> : null}</dd></>
            )}
            <dt>Uploaded</dt><dd>{when(b.uploadedAt)}{b.uploadedBy ? ` · ${b.uploadedBy}` : ''}</dd>
            <dt>Processed</dt><dd>{when(b.processedAt)}{b.processedBy ? ` · ${b.processedBy}` : ''}</dd>
            {b.processedOver && <><dt>Over warnings</dt><dd>{b.processedOver.warnings.join(', ')} · {b.processedOver.by}</dd></>}
            {b.reversedAt && <><dt>Reversed</dt><dd>{when(b.reversedAt)}{b.reversedBy ? ` · ${b.reversedBy}` : ''}<div className="ai-caption">“{b.reverseReason}”</div></dd></>}
            <dt>SHA-256</dt><dd className="ai-mono ai-caption" style={{ overflowWrap: 'anywhere' }}>{b.sha256}</dd>
          </dl>

          {reversing && b.reverseImpact && (
            <div className="ai-card ai-pad ai-reverse">
              <h3 className="ai-sub" style={{ marginTop: 0 }}>Reverse {b.reference}</h3>
              {b.reverseImpact.lockedPeriods.length ? (
                <div className="ai-note ai-tone-neg">{b.reverseImpact.lockedPeriods.join(', ')} is locked. Unlock it first — reversing a locked month would silently change a payroll input.</div>
              ) : (
                <>
                  <p className="ai-small" style={{ margin: 0 }}>
                    {num(b.reverseImpact.punches)} punches stop counting, and {num(b.reverseImpact.days)} days for {num(b.reverseImpact.employees)} employees recompute. Nothing is deleted: the punches stay, marked reversed, and the file can be uploaded again after a correction.
                  </p>
                  {b.reverseImpact.adjustments.length > 0 && (
                    <div className="ai-note ai-tone-warn">
                      {num(b.reverseImpact.adjustments.length)} of those days carry a manual adjustment. They stay:
                      <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{b.reverseImpact.adjustments.map((a, i) => <li key={i}><span className="ai-mono">{a.date}</span> {a.nameEn} — {a.reason}</li>)}</ul>
                    </div>
                  )}
                  <Field label="Reason" htmlFor="ai-rev-r" hint={`At least ${MIN_REASON} characters, recorded with the batch.`}>
                    <textarea id="ai-rev-r" className="ai-input" style={{ minHeight: 70, padding: 10 }} value={reason} onChange={(e) => setReason(e.target.value)} />
                  </Field>
                  {write.error && <div className="ai-note ai-tone-neg" role="alert">{write.error}</div>}
                  <div className="ai-actions">
                    <button type="button" className="ai-btn" onClick={() => setReversing(false)}>Cancel</button>
                    <button type="button" className="ai-btn-danger" disabled={reasonShort(reason) || write.busy} onClick={async () => { if (await write.run(() => api.reverseBatch(b.uid, reason.trim()), `${b.reference} reversed`)) setReversing(false); }}>Reverse the import</button>
                  </div>
                </>
              )}
            </div>
          )}

          {b.findings && b.findings.groups.length > 0 && (
            <section className="ai-stack">
              <h3 className="ai-sub">Findings, as presented</h3>
              {b.findings.groups.map((g) => <FindingCard key={g.id} g={g} />)}
            </section>
          )}
          {b.sample.length > 0 && (
            <section>
              <h3 className="ai-sub">Punches</h3>
              <table className="ai-table">
                <thead><tr><th scope="col">Row</th><th scope="col">Device ID</th><th scope="col">Date · time</th><th scope="col">Dir.</th><th scope="col">Employee</th><th scope="col">State</th></tr></thead>
                <tbody>{b.sample.map((x, i) => (
                  <tr key={i}>
                    <th scope="row" className="num ai-mono">{num(x.row)}</th><td className="ai-mono">{x.deviceUserId}</td><td className="ai-mono">{x.date} {x.time.slice(0, 5)}</td><td>{x.direction || '—'}</td>
                    <td className="ai-small">{x.employee ? x.employee.nameEn : <span className="ai-caption">—</span>}</td>
                    <td><Tag tone={x.state === 'ACTIVE' ? 'pos' : x.state === 'ORPHAN' ? 'warn' : 'neutral'}>{x.state === 'ORPHAN' ? 'Held' : x.state.toLowerCase()}</Tag>{x.skipReason && <div className="ai-caption">{x.skipReason}</div>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </section>
          )}
          {b.audit.length > 0 && (
            <section>
              <h3 className="ai-sub">History</h3>
              <ol className="ai-audit">{b.audit.map((a, i) => <li key={i}><span className="ai-mono ai-caption">{when(a.at)}</span> <b>{a.label}</b>{a.by ? ` · ${a.by}` : ''}{a.reason && <div className="ai-caption">“{a.reason}”</div>}</li>)}</ol>
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
}
