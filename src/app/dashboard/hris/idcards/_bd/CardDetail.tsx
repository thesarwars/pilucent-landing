'use client';

/**
 * Card detail (§9): front and back with the issuance record. An issued card
 * renders from its snapshot -- what was printed, not today's record -- and a
 * revoked card is never deleted: it stays, with its reason, so a guard at
 * the gate gets a definite answer. Before issue, the screen previews the
 * card the employee would get and runs the server's measured preflight.
 */

import * as React from 'react';
import { CardSide } from './CardSide';
import { type Ctx, type Report, type Side, artboardOf, bindingsOf, getPath } from './engine';
import { useCard, useEmployee } from './hooks';
import { useShared } from './IdCards';
import { Empty, Findings, Loading, ReasonModal, StatusPill, fmtDate, fmtWhen, useWrite } from './parts';
import * as api from './api';
import type { AuditRow, Card, Template } from './types';

const LIVE = ['ISSUED', 'ACTIVE'];

export function CardDetail() {
  const { nav } = useShared();
  if (nav.card) return <IssuedCard uid={nav.card} />;
  if (nav.emp) return <Preview code={nav.emp} />;
  return (
    <div className="idc-scroll">
      <Empty title="Choose a card">Open a card from the gallery to see its front and back, what it says, and its history.</Empty>
      <div style={{ textAlign: 'center' }}><button type="button" className="idc-btn" onClick={() => nav.go('gallery')}>Go to the gallery</button></div>
    </div>
  );
}

function Showcase({ template, ctx, dimmed }: { template: Template; ctx: Ctx; dimmed?: boolean }) {
  const [face, setFace] = React.useState<'both' | 'front' | 'back'>('both');
  const ab = artboardOf(template);
  const portrait = ab.height > ab.width;
  const ppmm = face === 'both' ? (portrait ? 4.2 : 3.6) : portrait ? 6 : 5.4;
  const sides: [string, Side][] = [['Front', template.front!]];
  if (template.back) sides.push(['Back', template.back]);
  const shown = sides.filter(([k]) => face === 'both' || k.toLowerCase() === face);
  return (
    <div className="idc-showcase">
      <div className="idc-seg" role="group" aria-label="Side">
        {(['both', 'front', 'back'] as const).map((f) => (
          <button key={f} type="button" className={face === f ? 'on' : ''} disabled={f === 'back' && !template.back} onClick={() => setFace(f)}>
            {f === 'both' ? 'Front and back' : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        {shown.map(([k, side]) => (
          <figure key={k} style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <CardSide side={side} ab={ab} ctx={ctx} ppmm={ppmm} dimmed={dimmed} className="idc-card-shadow" />
            <figcaption className="idc-tiny idc-muted">{k} · {ab.width} × {ab.height} mm</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function ResolvedValues({ values }: { values: [string, unknown][] }) {
  const { setup } = useShared();
  const label = new Map(setup.catalogue.flatMap((g) => g.fields.map((f) => [f.path, f.label] as const)));
  return (
    <table className="idc-table">
      <thead><tr><th>Field</th><th>Value</th></tr></thead>
      <tbody>
        {values.map(([path, v]) => (
          <tr key={path}>
            <td><div>{label.get(path) || path}</div><div className="idc-mono idc-tiny idc-muted">{path}</div></td>
            <td style={{ color: v === null || v === '' ? 'var(--idc-faint)' : undefined, overflowWrap: 'anywhere' }}
              lang={/[ঀ-৿]/.test(String(v ?? '')) ? 'bn' : undefined}>
              {v === null || v === '' || v === undefined ? 'Empty' : typeof v === 'object' ? (Array.isArray(v) ? v.join(', ') : 'Photo') : String(v)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Audit({ rows }: { rows: AuditRow[] }) {
  if (!rows.length) return <div className="idc-small idc-muted">Nothing recorded yet.</div>;
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((a, i) => (
        <li key={i} className="idc-small" style={{ lineHeight: 1.45 }}>
          <b style={{ fontWeight: 600 }}>{a.label}</b>
          <span className="idc-muted"> · {fmtWhen(a.at)}{a.by ? ` · ${a.by}` : a.ip ? ` · scan from ${a.ip}` : ''}</span>
          {a.reason && <div className="idc-muted">“{a.reason}”</div>}
        </li>
      ))}
    </ol>
  );
}

function Record({ card }: { card: Card }) {
  return (
    <dl className="idc-kv">
      <dt>Card number</dt><dd className="idc-mono">{card.number}</dd>
      <dt>Status</dt><dd><StatusPill status={card.effectiveStatus} /></dd>
      <dt>Template</dt><dd>{card.template.name} <span className="idc-muted">v{card.template.version}</span></dd>
      <dt>Issued</dt><dd>{fmtDate(card.issuedOn)}{card.issuedBy ? <span className="idc-muted"> by {card.issuedBy}</span> : null}</dd>
      <dt>Expires</dt><dd>{fmtDate(card.expiresOn)}</dd>
      <dt>Printed</dt><dd>{card.printCount ? `${card.printCount}× · last ${fmtWhen(card.lastPrintedAt)}` : 'Not yet'}</dd>
      {card.revokedOn && (<><dt>{card.status === 'LOST' ? 'Reported lost' : 'Revoked'}</dt><dd>{fmtDate(card.revokedOn)}{card.revokedBy ? ` by ${card.revokedBy}` : ''}<div className="idc-muted">“{card.revokeReason}”</div></dd></>)}
      {card.replacedBy && (<><dt>Replaced by</dt><dd className="idc-mono">{card.replacedBy}</dd></>)}
      <dt>Verification</dt><dd><a href={card.verifyUrl.replace(/^https?:\/\/[^/]+/, '')} target="_blank" rel="noreferrer">Open the public page</a></dd>
    </dl>
  );
}

function IssuedCard({ uid }: { uid: string }) {
  const { nav, setPicked } = useShared();
  const q = useCard(uid);
  const write = useWrite();
  const [ask, setAsk] = React.useState<null | 'revoke' | 'lost' | 'replace'>(null);
  if (q.isLoading) return <Loading what="Loading the card" />;
  if (q.error || !q.data) return <div className="idc-scroll"><div className="idc-banner err">{(q.error as Error)?.message || 'Not found.'}</div></div>;
  const { card, template, context, preflight, audit, jobs, can } = q.data;
  const live = LIVE.includes(card.status);
  const values = Object.entries(card.snapshot).sort(([a], [b]) => a.localeCompare(b));
  const act = async (reason: string) => {
    if (!ask) return;
    const out = await write.run(() => api.cardAction(card.uid, ask, reason),
      ask === 'replace' ? (o) => `${o.card.number} issued to replace ${card.number}` : ask === 'lost' ? 'Card reported lost' : 'Card revoked');
    if (out) {
      setAsk(null);
      if (ask === 'replace') nav.go('card', { card: out.card.uid });
    }
  };
  return (
    <div className="idc-split">
      <Showcase template={template} ctx={context} dimmed={!live} />
      <aside className="idc-side-panel">
        <div className="idc-section">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <h2 className="idc-h1">{card.employee.nameEn}</h2>
            <span className="idc-mono idc-small idc-muted">{card.employee.code}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {live && <button type="button" className="idc-btn primary" onClick={() => { setPicked([card.employee.code]); nav.go('print'); }} disabled={!can.print}>Print</button>}
            {live && <button type="button" className="idc-btn" onClick={() => setAsk('replace')} disabled={!can.revoke || !can.issue}>Replace</button>}
            {live && <button type="button" className="idc-btn" onClick={() => setAsk('lost')} disabled={!can.revoke}>Report lost</button>}
            {(live || card.status === 'DRAFT') && <button type="button" className="idc-btn danger" onClick={() => setAsk('revoke')} disabled={!can.revoke}>Revoke</button>}
            {!live && <button type="button" className="idc-btn" onClick={() => nav.go('card', { card: null, emp: card.employee.code })}>Current record</button>}
          </div>
          {!live && card.status !== 'DRAFT' && (
            <div className="idc-banner warn" style={{ marginTop: 10 }}>
              This card is {card.status.toLowerCase()} and kept for the record. A guard scanning it is told so, with the date.
            </div>
          )}
        </div>
        <div className="idc-section"><div className="idc-sub" style={{ marginBottom: 8 }}>Card record</div><Record card={card} /></div>
        <div className="idc-section">
          <div className="idc-sub" style={{ marginBottom: 8 }}>Preflight · from the snapshot, measured on the server</div>
          <Findings findings={preflight.findings} empty="No findings: this card prints as it is." />
        </div>
        <div className="idc-section">
          <div className="idc-sub" style={{ marginBottom: 4 }}>Resolved values</div>
          <div className="idc-hint" style={{ marginBottom: 8 }}>Taken when the card was issued. A later change to the employee record does not change this card; a replacement takes today&apos;s.</div>
          <ResolvedValues values={values} />
        </div>
        {jobs.length > 0 && (
          <div className="idc-section">
            <div className="idc-sub" style={{ marginBottom: 8 }}>Print jobs</div>
            {jobs.map((j) => (
              <button key={j.uid} type="button" className="idc-btn sm ghost" style={{ display: 'flex', width: '100%', justifyContent: 'flex-start' }} onClick={() => nav.go('jobs', { job: j.uid })}>
                <span className="idc-mono">{j.reference}</span><span className="idc-muted">{j.profile} · {fmtWhen(j.submittedAt)}</span>
              </button>
            ))}
          </div>
        )}
        <div className="idc-section"><div className="idc-sub" style={{ marginBottom: 8 }}>History</div><Audit rows={audit} /></div>
      </aside>
      {ask && (
        <ReasonModal
          title={ask === 'replace' ? `Replace ${card.number}` : ask === 'lost' ? `Report ${card.number} lost` : `Revoke ${card.number}`}
          intro={ask === 'replace'
            ? <>A new card is issued from today&apos;s record and {card.number} becomes <b>replaced</b>. Its QR keeps answering, pointing to the new card.</>
            : <>The card stops being valid at once: access control hears of it through the <span className="idc-mono">CardRevoked</span> event, and a scan of its QR says {ask === 'lost' ? 'lost' : 'revoked'}, with today&apos;s date. It is never deleted.</>}
          action={ask === 'replace' ? 'Issue the replacement' : ask === 'lost' ? 'Report lost' : 'Revoke the card'}
          danger={ask !== 'replace'} busy={write.busy} error={write.error} onClose={() => setAsk(null)} onConfirm={act} />
      )}
    </div>
  );
}

function Preview({ code }: { code: string }) {
  const { nav } = useShared();
  const q = useEmployee(code);
  const write = useWrite();
  const liveUid = q.data?.cards.find((c) => LIVE.includes(c.status))?.uid;
  React.useEffect(() => {
    // The employee has a live card: show that, not a preview of a new one.
    if (liveUid) nav.go('card', { card: liveUid, emp: code });
     
  }, [liveUid]);
  if (q.isLoading) return <Loading what="Loading the employee" />;
  if (q.error || !q.data) return <div className="idc-scroll"><div className="idc-banner err">{(q.error as Error)?.message || 'Not found.'}</div></div>;
  const { employee, template, context, preflight, cards, rule, can, photo } = q.data;
  const paths = template ? [...new Set([...bindingsOf(template.front), ...bindingsOf(template.back)])].sort() : [];
  const values: [string, unknown][] = paths.map((p) => [p, getPath(context, p)]);
  const report = preflight as Report | null;
  const issue = async () => {
    const out = await write.run(() => api.issueCard(code, template?.uid), (o) => `${o.card.number} issued`);
    if (out) nav.go('card', { card: out.card.uid, emp: code });
  };
  const blocked = !!report?.errors || (!photo && paths.includes('employee.photo'));
  return (
    <div className="idc-split">
      {template ? <Showcase template={template} ctx={context} /> : <div className="idc-showcase"><Empty title="No published template">Publish a template before issuing cards.</Empty></div>}
      <aside className="idc-side-panel">
        <div className="idc-section">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <h2 className="idc-h1">{employee.nameEn}</h2>
            <span className="idc-mono idc-small idc-muted">{employee.code}</span>
          </div>
          {employee.nameBn && <div lang="bn" className="idc-small idc-muted">{employee.nameBn}</div>}
          <div style={{ marginTop: 8 }}><StatusPill status="NOT_ISSUED" /></div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            <button type="button" className="idc-btn primary" disabled={!template || blocked || !can.issue || write.busy} onClick={issue}
              title={!can.issue ? 'Issuing needs the issue cards permission' : blocked ? 'Fix the errors below first' : undefined}>
              {write.busy ? 'Issuing…' : 'Issue card'}
            </button>
            <button type="button" className="idc-btn" onClick={() => nav.go('photos', { emp: code })}>{photo ? 'Edit photo' : 'Add photo'}</button>
          </div>
          {write.error && <div className="idc-banner err" style={{ marginTop: 10 }}>{write.error}</div>}
        </div>
        <div className="idc-section">
          <dl className="idc-kv">
            <dt>Template</dt><dd>{template ? <>{template.name} <span className="idc-muted">v{template.version}</span></> : '—'}{rule && <div className="idc-tiny idc-muted">chosen by rule: {rule}</div>}</dd>
            <dt>Photo</dt><dd>{photo ? <span className="idc-mono">{photo.placedWidth} × {photo.placedHeight} px</span> : <span style={{ color: '#9C1F1F' }}>None — required to issue</span>}</dd>
            <dt>Earlier cards</dt><dd>{cards.length ? cards.map((c) => <div key={c.uid}><a href="#" onClick={(e) => { e.preventDefault(); nav.go('card', { card: c.uid }); }} className="idc-mono">{c.number}</a> <StatusPill status={c.effectiveStatus} /></div>) : 'None'}</dd>
          </dl>
        </div>
        <div className="idc-section">
          <div className="idc-sub" style={{ marginBottom: 8 }}>Preflight · measured on the server</div>
          {report ? <Findings findings={report.findings} empty="No findings: this card is ready to issue." /> : <div className="idc-small idc-muted">No template to check against.</div>}
        </div>
        <div className="idc-section">
          <div className="idc-sub" style={{ marginBottom: 4 }}>Resolved values</div>
          <div className="idc-hint" style={{ marginBottom: 8 }}>From today&apos;s record. Issuing takes a snapshot of these: the card keeps them even if the record changes.</div>
          <ResolvedValues values={values} />
        </div>
      </aside>
    </div>
  );
}
