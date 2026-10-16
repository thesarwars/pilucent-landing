'use client';

/**
 * Import (§6): upload -> parse -> validate -> process, each a step the
 * server records. The profile is chosen before parsing, never inferred:
 * 03/04/2027 is 3 April or 4 March depending only on it. Processing stays
 * disabled while a finding blocks, and over a warning it is a deliberate,
 * recorded choice.
 */

import * as React from 'react';
import { useBatch } from './hooks';
import { FindingCard, Field, Stat, Tag, useNum, useWrite } from './parts';
import { BATCH_STATUS, bytes, errorLine, plural, range, stepOf } from './defs';
import * as api from './api';
import type { Batch, Summary } from './types';

const STEPS = ['Upload', 'Parse', 'Validate', 'Process'];

export function ImportTab({ summary, resume, onResumed, onMap, onHistory }: {
  summary: Summary; resume: string | null; onResumed: () => void; onMap: () => void; onHistory: () => void;
}) {
  const { can, profiles, sites } = summary;
  const num = useNum();
  const [siteUid, setSiteUid] = React.useState(sites.find((s) => s.isDefault)?.uid || sites[0]?.uid || '');
  const siteProfiles = profiles.filter((p) => p.site.uid === siteUid);
  const [profileUid, setProfileUid] = React.useState('');
  const [statedFrom, setStatedFrom] = React.useState('');
  const [statedTo, setStatedTo] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [batchUid, setBatchUid] = React.useState<string | null>(null);
  const [override, setOverride] = React.useState(false);
  const [drag, setDrag] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [twin, setTwin] = React.useState<{ uid: string; batch: string } | null>(null);
  const write = useWrite();
  const detail = useBatch(batchUid);
  const b: Batch | undefined = detail.data;
  const step = stepOf(b?.status);

  React.useEffect(() => {
    if (!profileUid || !siteProfiles.some((p) => p.uid === profileUid)) setProfileUid(siteProfiles[0]?.uid || '');
  }, [siteUid]);  
  React.useEffect(() => {
    if (resume) {
      setBatchUid(resume);
      onResumed();
    }
  }, [resume, onResumed]);
  React.useEffect(() => {
    if (b?.profile && !profileUid) setProfileUid(b.profile.uid);
  }, [b?.profile, profileUid]);

  const start = async (f: File) => {
    setTwin(null);
    const up = await write.run(() => api.uploadBatch(f, siteUid), undefined, (err) => {
      // The same file, never processed: offer to carry on with it.
      const c = err.consequence as { uid?: string; batch?: string; status?: string } | null;
      if (err.status === 409 && c?.uid && c.status !== 'PROCESSED') setTwin({ uid: c.uid, batch: c.batch || '' });
      return false;
    });
    if (!up) return;
    setBatchUid(up.uid);
    if (profileUid) await write.run(() => api.parseBatch(up.uid, { profileUid, statedFrom: statedFrom || null, statedTo: statedTo || null }), 'File read');
  };
  const useSample = async () => {
    const s = await write.run(() => api.getSample());
    if (!s) return;
    const sample = new File([s.text], `${s.fileName.replace('.csv', '')}-${Date.now()}.csv`, { type: 'text/csv' });
    const gate = siteProfiles.find((p) => p.format === 'CSV' && p.rowStructure === 'EVENT_LOG');
    if (gate) setProfileUid(gate.uid);
    setFile(sample);
  };
  const reparse = () => batchUid && write.run(() => api.parseBatch(batchUid, { profileUid, statedFrom: statedFrom || null, statedTo: statedTo || null }), 'Parsed again');
  const reset = () => { setBatchUid(null); setFile(null); setOverride(false); write.clear(); };

  const blocks = b?.findings?.groups.filter((g) => g.severity === 'BLOCKS') || [];
  const warns = b?.findings?.groups.filter((g) => g.severity === 'WARNS') || [];
  const unmapped = b?.findings?.groups.find((g) => g.id === 'unmapped');

  return (
    <div className="ai-stack">
      <ol className="ai-stepper" aria-label="Import steps">
        {STEPS.map((label, i) => (
          <li key={label} className={`ai-step${step === i ? ' current' : ''}${step > i ? ' done' : ''}`} aria-current={step === i ? 'step' : undefined}>
            <span className="ai-step-n">{step > i ? '✓' : num(i + 1)}</span>{label}
          </li>
        ))}
        {b && <li className="ai-step-batch"><span className="ai-mono">{b.reference}</span> <Tag tone={BATCH_STATUS[b.status].tone}>{BATCH_STATUS[b.status].label}</Tag>
          <button type="button" className="ai-link" onClick={reset}>Start another</button></li>}
      </ol>

      {!b && (
        <section className="ai-card ai-pad ai-fade" aria-labelledby="ai-upload-h">
          <h2 id="ai-upload-h" className="ai-section-title">Upload a device export</h2>
          <div className="ai-row" style={{ marginTop: 12 }}>
            {sites.length > 1 && (
              <Field label="Establishment" htmlFor="ai-site">
                <select id="ai-site" className="ai-select" value={siteUid} onChange={(e) => setSiteUid(e.target.value)}>
                  {sites.map((s) => <option key={s.uid} value={s.uid}>{s.name}</option>)}
                </select>
              </Field>
            )}
          </div>
          <div className={`ai-drop${drag ? ' over' : ''}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}>
            <button type="button" className="ai-btn-drop" disabled={!can.import} onClick={() => fileRef.current?.click()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 15.5V4M8 8l4-4 4 4M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15" /></svg>
              Drop a device export here, or choose a file
            </button>
            <div className="ai-caption">CSV, TSV, fixed-width or Excel, up to 25 MB. The original file is kept: a wrong parse can be redone against it.</div>
            <input ref={fileRef} type="file" hidden accept=".csv,.tsv,.txt,.dat,.xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {file && <div className="ai-file"><span className="ai-mono">{file.name}</span> <span className="ai-caption">{bytes(file.size)}</span></div>}
            <button type="button" className="ai-link" disabled={!can.import} onClick={useSample}>Use the sample file</button>
          </div>
          <div className="ai-row" style={{ marginTop: 14 }}>
            <div style={{ flex: '1 1 320px', maxWidth: 480 }}>
              <Field label="Device profile" htmlFor="ai-profile" hint="The date format and direction handling come from the profile, never from a guess.">
                <select id="ai-profile" className="ai-select ai-select-lg" value={profileUid} onChange={(e) => setProfileUid(e.target.value)}>
                  {!siteProfiles.length && <option value="">No profile for this establishment</option>}
                  {siteProfiles.map((p) => <option key={p.uid} value={p.uid}>{p.name} · {p.dateFormat} · v{p.version}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Stated range, from" htmlFor="ai-from" hint="Optional: punches outside it are flagged.">
              <input id="ai-from" type="date" className="ai-input" value={statedFrom} onChange={(e) => setStatedFrom(e.target.value)} />
            </Field>
            <Field label="to" htmlFor="ai-to">
              <input id="ai-to" type="date" className="ai-input" value={statedTo} onChange={(e) => setStatedTo(e.target.value)} />
            </Field>
          </div>
          {write.error && (
            <div className="ai-note ai-tone-neg" role="alert">
              {write.error}
              {twin && <> <button type="button" className="ai-link" onClick={() => { setBatchUid(twin.uid); setTwin(null); write.clear(); }}>Continue {twin.batch}</button></>}
            </div>
          )}
          <div className="ai-actions">
            <button type="button" className="ai-btn-primary ai-btn-lg" disabled={!file || !profileUid || !can.import || write.busy} onClick={() => file && start(file)}>
              {write.busy ? 'Uploading…' : 'Upload and read'}
            </button>
            {!can.import && <span className="ai-caption">Uploading needs the import attendance permission.</span>}
          </div>
        </section>
      )}

      {b && (
        <div className="ai-stack ai-fade" aria-live="polite">
          <section className="ai-card ai-pad">
            <div className="ai-row-between">
              <h2 className="ai-section-title">{b.fileName}</h2>
              <span className="ai-caption">{bytes(b.bytes)} · SHA-256 <span className="ai-mono">{b.sha256.slice(0, 12)}…</span> · {b.site.name}</span>
            </div>
            {b.parse ? (
              <div className="ai-stats">
                <Stat label="Rows read" value={num(b.parse.rowsTotal)} accent="#6B3FE8" sub={b.parse.rowsFailed ? `${num(b.parse.rowsFailed)} could not be read` : 'all read'} />
                <Stat label="Punches found" value={num(b.parse.punches)} accent="#2FBE8F" sub={b.parse.discarded ? `${num(b.parse.discarded)} middle punches set aside` : undefined} />
                <Stat label="Date range" value={<span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{range(b.parse.dateRange)}</span>} accent="#16172A" sub={b.statedRange ? `stated ${range(b.statedRange)}` : undefined} />
                <Stat label="Unrecognised IDs" value={unmapped ? num(unmapped.count) : step >= 3 ? num(0) : '…'} accent="#D69E2E"
                  sub={`${num(b.parse.deviceIds.length)} device IDs in the file`} />
              </div>
            ) : <div className="ai-caption" style={{ marginTop: 10 }}>Not read yet: choose the profile and read it.</div>}
            {!!b.errors?.length && (
              <div className="ai-errors" role="region" aria-label="Rows that could not be read">
                <div className="ai-label">Rows that could not be read</div>
                <ul>{b.errors.map((e, i) => <li key={i} className="ai-mono">{errorLine(e)}</li>)}</ul>
                {(b.parse?.errorsTotal || 0) > b.errors.length && <div className="ai-caption">and {num((b.parse?.errorsTotal || 0) - b.errors.length)} more</div>}
              </div>
            )}
            {(b.status === 'UPLOADED' || b.status === 'PARSED' || b.status === 'VALIDATED') && (
              <div className="ai-row" style={{ marginTop: 14, alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 320px', maxWidth: 480 }}>
                  <Field label="Device profile" htmlFor="ai-profile-2">
                    <select id="ai-profile-2" className="ai-select" value={profileUid} onChange={(e) => setProfileUid(e.target.value)}>
                      {profiles.filter((p) => p.site.uid === b.site.uid).map((p) => <option key={p.uid} value={p.uid}>{p.name} · {p.dateFormat} · v{p.version}</option>)}
                    </select>
                  </Field>
                </div>
                <button type="button" className="ai-btn" disabled={!profileUid || write.busy || !can.import} onClick={reparse}>{b.parse ? 'Read again with this profile' : 'Read it'}</button>
                {b.status === 'PARSED' && (
                  <button type="button" className="ai-btn-primary" disabled={write.busy || !can.import} onClick={() => write.run(() => api.validateBatch(b.uid), 'Checked')}>Check it</button>
                )}
              </div>
            )}
          </section>

          {b.findings && (
            <section className="ai-stack" aria-labelledby="ai-findings-h">
              <h2 id="ai-findings-h" className="ai-section-title">{b.findings.groups.length ? 'What the check found' : 'Nothing to report'}</h2>
              {!b.findings.groups.length && <div className="ai-note ai-tone-pos">Every punch can be placed. Process it.</div>}
              {b.findings.groups.map((g) => (
                <FindingCard key={g.id} g={g} action={g.id === 'unmapped' && b.status === 'PROCESSED' ? <button type="button" className="ai-btn-warn" onClick={onMap}>Map them</button> : undefined} />
              ))}
            </section>
          )}

          {b.status === 'VALIDATED' && (
            <section className="ai-card ai-pad">
              {blocks.length > 0 ? (
                <div className="ai-note ai-tone-neg">
                  <b>{blocks.map((g) => g.title).join('; ')}.</b> {blocks[0].behaviour}
                </div>
              ) : warns.length > 0 ? (
                <label className="ai-check">
                  <input type="checkbox" checked={override} disabled={!can.override} onChange={(e) => setOverride(e.target.checked)} />
                  <span>Process over {plural(warns.length, 'warning')} — recorded on the batch with my name.{!can.override && ' Needs the override permission, which is separate from processing.'}</span>
                </label>
              ) : null}
              {write.error && <div className="ai-note ai-tone-neg" role="alert" style={{ marginTop: 10 }}>{write.error}</div>}
              <div className="ai-actions">
                <button type="button" className="ai-btn-primary ai-btn-xl" disabled={!!blocks.length || (warns.length > 0 && !override) || !can.process || write.busy}
                  onClick={() => write.run(() => api.processBatch(b.uid, override), (o) => `${o.reference}: ${o.punches.imported} punches into the register`)}>
                  {write.busy ? 'Processing…' : `Process ${b.parse ? num(b.parse.punches) : ''} punches`}
                </button>
                {!can.process && <span className="ai-caption">Needs the process attendance import permission.</span>}
              </div>
            </section>
          )}

          {b.status === 'PROCESSED' && (
            <section className="ai-card ai-pad ai-fade">
              <h2 className="ai-section-title">Processed</h2>
              <div className="ai-stats">
                <Stat label="Into the register" value={num(b.punches.imported)} accent="#2FBE8F" />
                <Stat label="Held for a mapping" value={num(b.punches.orphaned)} accent="#D69E2E" />
                <Stat label="Skipped" value={num(b.punches.skipped)} accent="#9A93B0" sub="duplicates and middle punches, kept" />
              </div>
              {b.punches.orphaned > 0 && (
                <div className="ai-note ai-tone-warn" style={{ marginTop: 12 }}>
                  Nothing was discarded. {num(b.punches.orphaned)} punches are held against their device ID and attach themselves the moment you map it.{' '}
                  <button type="button" className="ai-link" onClick={onMap}>Map device IDs</button>
                </div>
              )}
              <div className="ai-actions">
                <button type="button" className="ai-btn" onClick={onHistory}>See it in the history</button>
                <button type="button" className="ai-btn-primary" onClick={reset}>Import another file</button>
              </div>
            </section>
          )}
          {b.status === 'REVERSED' && <div className="ai-note ai-tone-neutral">{b.reference} was reversed: {b.reverseReason}</div>}
          {b.status !== 'VALIDATED' && b.status !== 'PROCESSED' && write.error && <div className="ai-note ai-tone-neg" role="alert">{write.error}</div>}
        </div>
      )}
    </div>
  );
}
