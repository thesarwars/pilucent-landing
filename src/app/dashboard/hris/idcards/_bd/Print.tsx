'use client';

/**
 * Print wizard (§10) and print jobs (§10.1). The check runs on the server
 * with real font metrics; cards with errors never reach the file, and cards
 * with warnings only with the override permission. The job keeps the
 * preflight as it stood at submission, so a job that printed wrong is
 * examined against what was checked -- not the template as it stands today.
 */

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGallery, useJob, useJobs } from './hooks';
import { useShared } from './IdCards';
import { Check, Empty, Findings, JOB_STATUS, Loading, StatusPill, fmtWhen, plural, useWrite } from './parts';
import * as api from './api';
import type { Check as CardCheck, Job, Profile } from './types';

const LIVE = ['ISSUED', 'ACTIVE', 'EXPIRING'];
const STEPS = ['Scope', 'Check', 'Output', 'Confirm'] as const;

export function PrintWizard() {
  const { nav, picked, setPicked, setup } = useShared();
  const g = useGallery('', 'ALL');
  const live = (g.data?.rows || []).filter((r) => r.card && LIVE.includes(r.card.effectiveStatus));
  const [step, setStep] = React.useState(0);
  const [chosen, setChosen] = React.useState<string[] | null>(null);
  const [mode, setMode] = React.useState<'ready' | 'warnings'>('ready');
  const [profileUid, setProfileUid] = React.useState(setup.profiles.find((p) => p.isDefault)?.uid || setup.profiles[0]?.uid || '');
  const [name, setName] = React.useState('');
  const write = useWrite();

  React.useEffect(() => {
    if (chosen === null && g.data) {
      const fromGallery = live.filter((r) => picked.includes(r.code)).map((r) => r.card!.uid);
      setChosen(fromGallery.length ? fromGallery : live.filter((r) => !r.card!.printCount).map((r) => r.card!.uid));
    }
  }, [g.data, chosen, live, picked]);

  const ids = chosen || [];
  const check = useQuery({
    queryKey: ['bd-idcards', 'print-check', [...ids].sort().join(',')],
    queryFn: () => api.printCheck(ids), enabled: step >= 1 && ids.length > 0,
  });
  const c = check.data;
  const profile = setup.profiles.find((p) => p.uid === profileUid);
  const count = mode === 'ready' ? c?.ready ?? 0 : (c?.ready ?? 0) + (c?.warnings ?? 0);
  const submit = async () => {
    const job = await write.run(() => api.submitJob({ cardUids: ids, profileUid, includeWarnings: mode === 'warnings', name }),
      (j) => `${j.reference} queued: ${plural(j.cards, 'card')}`);
    if (job) {
      setPicked([]);
      nav.go('jobs', { job: job.uid });
    }
  };

  if (g.isLoading || chosen === null) return <Loading what="Loading the issued cards" />;
  const can = (i: number) => i === 0 || (ids.length > 0 && (i < 2 || (!!c && count > 0)) && (i < 3 || !!profile));

  return (
    <>
      <div className="idc-steps" role="list">
        {STEPS.map((s, i) => (
          <div key={s} role="listitem" className={`idc-step${step === i ? ' on' : ''}${step > i ? ' done' : ''}`}>
            <span className="k">{step > i ? '✓' : i + 1}</span>{s}
          </div>
        ))}
      </div>
      <div className="idc-scroll">
        <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {step === 0 && (
            <div className="idc-panel">
              <div className="idc-panel-h">
                <h2 className="idc-h2">Which cards</h2>
                <span className="idc-spacer" />
                <button type="button" className="idc-btn sm" onClick={() => setChosen(live.filter((r) => !r.card!.printCount).map((r) => r.card!.uid))}>Not yet printed</button>
                <button type="button" className="idc-btn sm" onClick={() => setChosen(live.map((r) => r.card!.uid))}>All {live.length} live cards</button>
                <button type="button" className="idc-btn sm ghost" onClick={() => setChosen([])}>None</button>
              </div>
              {!live.length ? (
                <Empty title="No issued cards">Issue cards from the gallery first: only an issued or active card prints. A draft is issued first, so its number and token exist.</Empty>
              ) : (
                <div style={{ maxHeight: 420, overflow: 'auto' }}>
                  <table className="idc-table">
                    <thead><tr><th style={{ width: 36 }} /><th>Employee</th><th>Card</th><th>Template</th><th>Printed</th><th>Status</th></tr></thead>
                    <tbody>
                      {live.map((r) => {
                        const on = ids.includes(r.card!.uid);
                        const flip = () => setChosen(on ? ids.filter((x) => x !== r.card!.uid) : [...ids, r.card!.uid]);
                        return (
                          <tr key={r.code} className={`click${on ? ' sel' : ''}`} onClick={flip}>
                            <td><Check on={on} label={`Include ${r.nameEn}`} onClick={flip} /></td>
                            <td>{r.nameEn} <span className="idc-mono idc-tiny idc-muted">{r.code}</span></td>
                            <td className="idc-mono">{r.card!.number}</td>
                            <td>{r.card!.template.name} <span className="idc-muted">v{r.card!.template.version}</span></td>
                            <td>{r.card!.printCount ? `${r.card!.printCount}×` : <span className="idc-muted">Not yet</span>}</td>
                            <td><StatusPill status={r.card!.effectiveStatus} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {step === 1 && (check.isLoading ? <Loading what={`Checking ${plural(ids.length, 'card')} with real font metrics`} /> : check.error ? (
            <div className="idc-banner err">{(check.error as Error).message}</div>
          ) : c && (
            <>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div className="idc-stat"><span className="idc-small idc-muted">Ready</span><b style={{ color: '#1F7A4C' }}>{c.ready}</b></div>
                <div className="idc-stat"><span className="idc-small idc-muted">Have warnings</span><b style={{ color: '#8A5A00' }}>{c.warnings}</b></div>
                <div className="idc-stat"><span className="idc-small idc-muted">Cannot be printed</span><b style={{ color: '#9C1F1F' }}>{c.blocked}</b></div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <label className={`idc-option${mode === 'ready' ? ' on' : ''}`}>
                  <input type="radio" name="mode" checked={mode === 'ready'} onChange={() => setMode('ready')} />
                  <span><b>Print only the {c.ready} ready cards</b><div className="idc-hint">Cards with warnings wait until they are fixed.</div></span>
                </label>
                <label className={`idc-option${mode === 'warnings' ? ' on' : ''}`}>
                  <input type="radio" name="mode" checked={mode === 'warnings'} disabled={!setup.can.override || !c.warnings} onChange={() => setMode('warnings')} />
                  <span><b>Print {c.ready + c.warnings} cards including warnings</b>
                    <div className="idc-hint">{setup.can.override ? 'A warning prints but is worth seeing first: outside the safe area, a soft photo, a sparse field.' : 'Needs the override card print permission, which is separate from printing.'}</div>
                  </span>
                </label>
              </div>
              {c.blocked > 0 && <div className="idc-banner err">{plural(c.blocked, 'card')} with errors cannot be printed and will be skipped: an error is a card that comes out wrong.</div>}
              <CheckList checks={c.checks} />
            </>
          ))}

          {step === 2 && (
            <div className="idc-panel">
              <div className="idc-panel-h"><h2 className="idc-h2">Output profile</h2><span className="idc-spacer" />
                <button type="button" className="idc-btn sm" onClick={() => nav.go('profiles')}>Manage profiles</button></div>
              <div className="idc-panel-b" style={{ display: 'grid', gap: 8 }}>
                {setup.profiles.map((p) => (
                  <label key={p.uid} className={`idc-option${profileUid === p.uid ? ' on' : ''}`}>
                    <input type="radio" name="profile" checked={profileUid === p.uid} onChange={() => setProfileUid(p.uid)} />
                    <span><b>{p.name}</b>{p.isDefault && <span className="idc-badge" style={{ marginLeft: 6 }}>default</span>}<div className="idc-hint">{describeProfile(p)}</div></span>
                  </label>
                ))}
                <label className="idc-field" style={{ marginTop: 6 }}>
                  <span className="idc-label">Job name (optional)</span>
                  <input className="idc-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. October joiners" maxLength={120} />
                </label>
              </div>
            </div>
          )}

          {step === 3 && c && profile && (
            <div className="idc-panel">
              <div className="idc-panel-h"><h2 className="idc-h2">Confirm</h2></div>
              <div className="idc-panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <dl className="idc-kv">
                  <dt>Cards</dt><dd><b>{count}</b> printed{ids.length - count > 0 ? <span className="idc-muted">, {ids.length - count} skipped</span> : null}</dd>
                  <dt>Profile</dt><dd>{profile.name}<div className="idc-hint">{describeProfile(profile)}</div></dd>
                  <dt>Includes warnings</dt><dd>{mode === 'warnings' ? 'Yes, by override' : 'No'}</dd>
                </dl>
                <div className="idc-hint">The server renders the file from each card&apos;s snapshot and records its SHA-256. The first print locks each template version used: an edit afterwards makes a new version, so this file can be reproduced.</div>
                {write.error && <div className="idc-banner err">{write.error}</div>}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && <button type="button" className="idc-btn" onClick={() => setStep(step - 1)}>Back</button>}
            <span className="idc-spacer" />
            <span className="idc-small idc-muted" style={{ alignSelf: 'center' }}>{plural(ids.length, 'card')} chosen</span>
            {step < 3 ? (
              <button type="button" className="idc-btn primary" disabled={!can(step + 1)} onClick={() => setStep(step + 1)}>Next: {STEPS[step + 1]}</button>
            ) : (
              <button type="button" className="idc-btn primary" disabled={!setup.can.print || write.busy || !count} onClick={submit}
                title={!setup.can.print ? 'Printing needs the print cards permission' : undefined}>
                {write.busy ? 'Submitting…' : `Print ${plural(count, 'card')}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function describeProfile(p: Profile) {
  const sheet = p.sheet === 'CARD_DIRECT' ? 'Card printer, one card per page' : p.sheet === 'PNG' ? `PNG images at ${p.dpi} DPI` : `${p.sheet} sheet, ${p.cols} × ${p.rows} up`;
  const bits = [sheet];
  if (p.sheet === 'A4' || p.sheet === 'LETTER') bits.push(`margin ${p.marginMm} mm, gutter ${p.gutterMm} mm`);
  if (p.includeBleed) bits.push('with bleed');
  if (p.cropMarks) bits.push('crop marks');
  bits.push(p.duplex === 'NONE' ? 'single-sided' : p.duplex === 'LONG_EDGE' ? 'duplex, long edge' : 'duplex, short edge');
  if (p.mirror) bits.push('mirrored');
  bits.push(p.colourProfile);
  return bits.join(' · ');
}

function CheckList({ checks }: { checks: CardCheck[] }) {
  const [open, setOpen] = React.useState<string | null>(null);
  const shown = [...checks].sort((a, b) => b.errors - a.errors || b.warnings - a.warnings);
  return (
    <div className="idc-panel" style={{ overflow: 'hidden' }}>
      <table className="idc-table">
        <thead><tr><th>Card</th><th>Employee</th><th className="num">Errors</th><th className="num">Warnings</th><th /></tr></thead>
        <tbody>
          {shown.map((k) => (
            <React.Fragment key={k.card}>
              <tr className={k.findings.length ? 'click' : ''} onClick={() => k.findings.length && setOpen(open === k.card ? null : k.card)}>
                <td className="idc-mono">{k.number}</td>
                <td>{k.nameEn} <span className="idc-mono idc-tiny idc-muted">{k.code}</span></td>
                <td className="num" style={{ color: k.errors ? '#9C1F1F' : undefined }}>{k.errors}</td>
                <td className="num" style={{ color: k.warnings ? '#8A5A00' : undefined }}>{k.warnings}</td>
                <td style={{ width: 120, textAlign: 'right' }}>{k.errors ? <span className="idc-badge err">skipped</span> : k.warnings ? <span className="idc-badge warn">warnings</span> : <span className="idc-badge">ready</span>}</td>
              </tr>
              {open === k.card && <tr><td colSpan={5} style={{ background: 'var(--idc-raised)' }}><Findings findings={k.findings} /></td></tr>}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------- jobs

export function PrintJobs() {
  const { nav } = useShared();
  const q = useJobs();
  const jobs = q.data?.jobs || [];
  const sel = nav.job || jobs[0]?.uid || null;
  if (q.isLoading) return <Loading what="Loading print jobs" />;
  if (!jobs.length) {
    return (
      <div className="idc-scroll">
        <Empty title="No print jobs yet">A job appears here when the print wizard submits it: queued, rendered on the server, then ready to download.</Empty>
        <div style={{ textAlign: 'center' }}><button type="button" className="idc-btn primary" onClick={() => nav.go('print')}>Open the print wizard</button></div>
      </div>
    );
  }
  return (
    <div className="idc-split" style={{ gridTemplateColumns: 'minmax(0,1fr) 400px' }}>
      <div className="idc-scroll">
        <div className="idc-panel" style={{ overflow: 'auto' }}>
          <table className="idc-table" style={{ minWidth: 720 }}>
            <thead><tr><th>Job</th><th>Profile</th><th className="num">Cards</th><th className="num">Skipped</th><th>Status</th><th>Submitted</th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.uid} className={`click${sel === j.uid ? ' sel' : ''}`} onClick={() => nav.go('jobs', { job: j.uid })}>
                  <td><span className="idc-mono">{j.reference}</span>{j.name && <div className="idc-tiny idc-muted">{j.name}</div>}</td>
                  <td>{j.profile}</td>
                  <td className="num">{j.cards}</td>
                  <td className="num" style={{ color: j.skipped.length ? '#8A5A00' : 'var(--idc-faint)' }}>{j.skipped.length}</td>
                  <td><StatusPill status={j.status} palette={JOB_STATUS} /></td>
                  <td>{fmtWhen(j.submittedAt)}{j.submittedBy && <div className="idc-tiny idc-muted">{j.submittedBy}</div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <aside className="idc-side-panel">{sel && <JobPanel uid={sel} />}</aside>
    </div>
  );
}

function JobPanel({ uid }: { uid: string }) {
  const { setup } = useShared();
  const q = useJob(uid);
  const list = useJobs();
  const write = useWrite();
  const status = list.data?.jobs.find((j) => j.uid === uid)?.status;
  React.useEffect(() => { if (status) void q.refetch(); }, [status]);  
  if (q.isLoading || !q.data) return <Loading />;
  const j: Job = q.data;
  const download = () => write.run(() => api.downloadJob(j));
  return (
    <>
      <div className="idc-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 className="idc-h1 idc-mono">{j.reference}</h2>
          <StatusPill status={j.status} palette={JOB_STATUS} />
        </div>
        {j.name && <div className="idc-small idc-muted">{j.name}</div>}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          <button type="button" className="idc-btn primary" disabled={!j.hasArtifact || !setup.can.print || write.busy} onClick={download}>Download</button>
          {j.status === 'READY' && <button type="button" className="idc-btn" disabled={write.busy} onClick={() => write.run(() => api.jobAction(j.uid, 'printed'), 'Marked printed: the cards are active')}>Mark printed</button>}
          {j.status === 'FAILED' && <button type="button" className="idc-btn" disabled={write.busy} onClick={() => write.run(() => api.jobAction(j.uid, 'retry'), 'Rendered again')}>Retry</button>}
          {['QUEUED', 'READY', 'FAILED'].includes(j.status) && <button type="button" className="idc-btn ghost" disabled={write.busy} onClick={() => write.run(() => api.jobAction(j.uid, 'cancel'), 'Job cancelled')}>Cancel</button>}
        </div>
        {write.error && <div className="idc-banner err" style={{ marginTop: 8 }}>{write.error}</div>}
        {j.failure && <div className="idc-banner err" style={{ marginTop: 8 }}><b>Render failed.</b> {j.failure}</div>}
      </div>
      <div className="idc-section">
        <dl className="idc-kv">
          <dt>Profile</dt><dd>{j.profile}</dd>
          <dt>Cards</dt><dd>{j.cards}{j.pages ? <span className="idc-muted"> · {plural(j.pages, 'page')}</span> : null}</dd>
          <dt>Submitted</dt><dd>{fmtWhen(j.submittedAt)}{j.submittedBy ? ` · ${j.submittedBy}` : ''}</dd>
          <dt>Rendered</dt><dd>{fmtWhen(j.completedAt)}</dd>
          <dt>Printed</dt><dd>{fmtWhen(j.printedAt)}</dd>
          <dt>SHA-256</dt><dd className="idc-mono idc-tiny" style={{ overflowWrap: 'anywhere' }}>{j.sha256 || '—'}</dd>
          <dt>File kept until</dt><dd>{fmtWhen(j.purgeAfter)}</dd>
        </dl>
      </div>
      {j.skipped.length > 0 && (
        <div className="idc-section">
          <div className="idc-sub" style={{ marginBottom: 8 }}>Skipped</div>
          {j.skipped.map((s) => <div key={s.card} className="idc-small"><span className="idc-mono">{s.card}</span> <span className="idc-muted">{s.code} · {s.why}</span></div>)}
        </div>
      )}
      <div className="idc-section">
        <div className="idc-sub" style={{ marginBottom: 4 }}>Preflight at submission</div>
        <div className="idc-hint" style={{ marginBottom: 8 }}>As checked {fmtWhen(j.preflight?.at)}, not as the template stands today.</div>
        {j.preflight && <CheckList checks={j.preflight.checks} />}
      </div>
      <div className="idc-section">
        <div className="idc-sub" style={{ marginBottom: 8 }}>In this job</div>
        {(j.cardList || []).map((c) => <div key={c.uid} className="idc-small"><span className="idc-mono">{c.number}</span> {c.nameEn}</div>)}
      </div>
    </>
  );
}
