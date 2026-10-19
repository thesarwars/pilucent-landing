'use client';

/**
 * Device profiles (§5): a device's export format, as data. Nothing in the
 * parser knows a brand name. Saving makes a new version: a batch keeps the
 * version it was read under, so re-reading its retained file gives the
 * same punches. The editor tests a pasted sample before anything is saved.
 */

import * as React from 'react';
import { useProfileVersions } from './hooks';
import { Drawer, Empty, Field, Tag, useNum, useWrite } from './parts';
import { DIRECTION, MATCHING, ROW_STRUCTURE, TARGET_LABEL, errorLine, shortDate } from './defs';
import * as api from './api';
import type { ColumnMap, Profile, ProfileTest, Summary } from './types';

export function ProfilesTab({ summary }: { summary: Summary }) {
  const { profiles, can, sites } = summary;
  const [open, setOpen] = React.useState<Profile | 'new' | null>(null);
  return (
    <div className="ai-stack">
      <div className="ai-row-between">
        <p className="ai-caption" style={{ margin: 0, maxWidth: 640 }}>
          One profile per device export format. The date format is declared here — <span className="ai-mono">03/04/2027</span> is 3 April or 4 March depending only on it.
        </p>
        <button type="button" className="ai-btn-primary" disabled={!can.profiles} onClick={() => setOpen('new')}>New profile</button>
      </div>
      {!profiles.length ? <Empty title="No device profiles">Create one for each device export format.</Empty> : (
        <div className="ai-grid">
          {profiles.map((p) => (
            <button key={p.uid} type="button" className="ai-card ai-profile" onClick={() => setOpen(p)}>
              <div className="ai-row-between">
                <span className="ai-profile-name">{p.name}</span>
                <Tag tone="neutral">v{p.version}</Tag>
              </div>
              <div className="ai-caption">{p.deviceModel ? `${p.deviceModel} · ` : ''}{p.deviceLabel} · {p.site.name}</div>
              <dl className="ai-kv">
                <dt>Format</dt><dd>{p.format}{p.format !== 'XLSX' ? ` · ${p.encoding}` : ''}{p.headerRows ? ` · ${p.headerRows} header row${p.headerRows > 1 ? 's' : ''}` : ''}</dd>
                <dt>Rows</dt><dd>{ROW_STRUCTURE[p.rowStructure]}</dd>
                <dt>Date · time</dt><dd className="ai-mono">{p.dateFormat} · {p.timeFormat}</dd>
                <dt>Direction</dt><dd>{DIRECTION[p.directionHandling]}</dd>
                <dt>Matching</dt><dd>{MATCHING[p.employeeMatching]}</dd>
                <dt>Time zone</dt><dd className="ai-mono">{p.timezone}</dd>
              </dl>
              <div className="ai-caption">{p.batches ? `${p.batches} imports` : 'Not used yet'} · saved {shortDate(p.createdAt.slice(0, 10))}{p.createdBy ? ` by ${p.createdBy}` : ''}</div>
            </button>
          ))}
        </div>
      )}
      {open && <ProfileEditor profile={open === 'new' ? null : open} summary={summary} sites={sites} onClose={() => setOpen(null)} />}
    </div>
  );
}

const BLANK: Partial<Profile> = {
  name: '', code: '', deviceLabel: '', deviceModel: '', location: '', format: 'CSV', encoding: 'UTF-8', delimiter: ',', headerRows: 1,
  rowStructure: 'EVENT_LOG', dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm:ss', combinedDateTime: false, directionHandling: 'EXPLICIT_COLUMN',
  employeeMatching: 'DEVICE_ID_MAP', timezone: 'Asia/Dhaka', centuryBase: 2000,
  columns: [{ source: 'UserID', target: 'deviceUserId' }, { source: 'Date', target: 'date' }, { source: 'Time', target: 'time' }, { source: 'State', target: 'direction' }],
};

function ProfileEditor({ profile, summary, sites, onClose }: { profile: Profile | null; summary: Summary; sites: Summary['sites']; onClose: () => void }) {
  const { enums, can } = summary;
  const [d, setD] = React.useState<Partial<Profile>>(profile ? { ...profile, columns: profile.columns.map((c) => ({ ...c })) } : { ...BLANK });
  const [siteUid, setSiteUid] = React.useState(profile?.site.uid || sites.find((s) => s.isDefault)?.uid || sites[0]?.uid || '');
  const [sample, setSample] = React.useState('');
  const [test, setTest] = React.useState<ProfileTest | null>(null);
  const write = useWrite();
  const tester = useWrite();
  const versions = useProfileVersions(profile?.uid || null);
  const num = useNum();
  const set = (p: Partial<Profile>) => { setD({ ...d, ...p }); setTest(null); };
  const cols = d.columns || [];
  const setCol = (i: number, p: Partial<ColumnMap>) => set({ columns: cols.map((c, j) => (j === i ? { ...c, ...p } : c)) });
  const ro = !can.profiles;

  React.useEffect(() => {
    if (!sample && d.sampleHeader) setSample(`${d.sampleHeader}\n`);
  }, [d.sampleHeader]);  

  const save = async () => {
    const out = await write.run(() => (profile ? api.saveProfile(profile.uid, d) : api.createProfile({ ...d, siteUid })),
      (o) => (profile ? `Saved as version ${o.version}` : `${o.code} created`));
    if (out) onClose();
  };
  const runTest = async () => {
    const out = await tester.run(() => api.testProfile({ ...d, text: sample }));
    setTest(out);
  };

  return (
    <Drawer id="ai-profile-drawer" title={profile ? profile.name : 'New device profile'} width={640}
      sub={profile ? <>{profile.code} · version {profile.version}. Saving makes version {(versions.data?.versions[0]?.version || profile.version) + 1}; imports keep the version they were read under.</> : 'A device export format, as data.'}
      onClose={onClose}>
      <fieldset disabled={ro} className="ai-stack" style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="ai-grid2">
          <Field label="Name" htmlFor="pf-name"><input id="pf-name" className="ai-input" value={d.name || ''} onChange={(e) => set({ name: e.target.value })} /></Field>
          {!profile && <Field label="Code" htmlFor="pf-code" hint="e.g. DP-GAZ-GATE"><input id="pf-code" className="ai-input ai-mono" value={d.code || ''} onChange={(e) => set({ code: e.target.value.toUpperCase() })} /></Field>}
          <Field label="Device" htmlFor="pf-label" hint="Device IDs are mapped per device."><input id="pf-label" className="ai-input" value={d.deviceLabel || ''} onChange={(e) => set({ deviceLabel: e.target.value })} placeholder="Gazipur main gate" /></Field>
          <Field label="Model (shown, never parsed on)" htmlFor="pf-model"><input id="pf-model" className="ai-input" value={d.deviceModel || ''} onChange={(e) => set({ deviceModel: e.target.value })} /></Field>
          {!profile && sites.length > 1 && (
            <Field label="Establishment" htmlFor="pf-site">
              <select id="pf-site" className="ai-select" value={siteUid} onChange={(e) => setSiteUid(e.target.value)}>{sites.map((s) => <option key={s.uid} value={s.uid}>{s.name}</option>)}</select>
            </Field>
          )}
        </div>
        <h3 className="ai-sub">The file</h3>
        <div className="ai-grid3">
          <Field label="Format" htmlFor="pf-format"><select id="pf-format" className="ai-select" value={d.format} onChange={(e) => set({ format: e.target.value })}>{enums.formats.map((f) => <option key={f}>{f}</option>)}</select></Field>
          <Field label="Encoding" htmlFor="pf-enc" hint={d.encoding === 'Windows-1252' ? 'Older terminals export in it.' : undefined}><select id="pf-enc" className="ai-select" value={d.encoding} disabled={d.format === 'XLSX'} onChange={(e) => set({ encoding: e.target.value })}>{enums.encodings.map((f) => <option key={f}>{f}</option>)}</select></Field>
          {d.format === 'CSV' && <Field label="Delimiter" htmlFor="pf-delim"><select id="pf-delim" className="ai-select" value={d.delimiter} onChange={(e) => set({ delimiter: e.target.value })}><option value=",">Comma</option><option value=";">Semicolon</option><option value="|">Pipe</option></select></Field>}
          <Field label="Header rows" htmlFor="pf-head"><input id="pf-head" type="number" min={0} max={10} className="ai-input" value={d.headerRows ?? 1} onChange={(e) => set({ headerRows: +e.target.value })} /></Field>
        </div>
        <div className="ai-grid3">
          <Field label="Rows" htmlFor="pf-rows"><select id="pf-rows" className="ai-select" value={d.rowStructure} onChange={(e) => set({ rowStructure: e.target.value, directionHandling: e.target.value === 'PAIRED_COLUMNS' ? 'PAIRED' : d.directionHandling === 'PAIRED' ? 'EXPLICIT_COLUMN' : d.directionHandling })}>{enums.rowStructures.map((f) => <option key={f} value={f}>{ROW_STRUCTURE[f]}</option>)}</select></Field>
          <Field label="Date format" htmlFor="pf-date"><select id="pf-date" className="ai-select ai-mono" value={d.dateFormat} onChange={(e) => set({ dateFormat: e.target.value })}>{enums.dateFormats.map((f) => <option key={f}>{f}</option>)}</select></Field>
          <Field label="Time format" htmlFor="pf-time"><select id="pf-time" className="ai-select ai-mono" value={d.timeFormat} onChange={(e) => set({ timeFormat: e.target.value })}>{enums.timeFormats.map((f) => <option key={f}>{f}</option>)}</select></Field>
          {d.dateFormat === 'DD-MM-YY' && <Field label="Two-digit years are in" htmlFor="pf-cent"><select id="pf-cent" className="ai-select" value={d.centuryBase} onChange={(e) => set({ centuryBase: +e.target.value })}><option value={2000}>2000s (27 → 2027)</option><option value={1900}>1900s</option></select></Field>}
          <Field label="Direction" htmlFor="pf-dir" hint={d.directionHandling === 'ALTERNATE' ? 'Alternates per employee per day, never across the file.' : d.directionHandling === 'FIRST_LAST' ? 'The middle punches are kept as skipped, and counted.' : undefined}>
            <select id="pf-dir" className="ai-select" value={d.directionHandling} onChange={(e) => set({ directionHandling: e.target.value })}>{enums.directions.map((f) => <option key={f} value={f}>{DIRECTION[f]}</option>)}</select>
          </Field>
          <Field label="Matching" htmlFor="pf-match"><select id="pf-match" className="ai-select" value={d.employeeMatching} onChange={(e) => set({ employeeMatching: e.target.value })}>{enums.matching.map((f) => <option key={f} value={f}>{MATCHING[f]}</option>)}</select></Field>
          <Field label="Device time zone" htmlFor="pf-tz" hint="A device set to UTC puts an evening punch on the next Dhaka day; the zone corrects it.">
            <select id="pf-tz" className="ai-select ai-mono" value={d.timezone} onChange={(e) => set({ timezone: e.target.value })}><option>Asia/Dhaka</option><option>UTC</option><option>Asia/Kolkata</option></select>
          </Field>
        </div>
        <label className="ai-check"><input type="checkbox" checked={!!d.combinedDateTime} onChange={(e) => set({ combinedDateTime: e.target.checked })} /><span>Date and time are in one column</span></label>

        <h3 className="ai-sub">Columns</h3>
        <table className="ai-table">
          <thead><tr><th scope="col">{d.format === 'FIXED' ? 'Start · width' : 'Column in the file'}</th><th scope="col">Means</th><th /></tr></thead>
          <tbody>
            {cols.map((c, i) => (
              <tr key={i}>
                <th scope="row">
                  {d.format === 'FIXED' ? (
                    <span style={{ display: 'flex', gap: 6 }}>
                      <input aria-label="Start" type="number" min={0} className="ai-input ai-mono" style={{ width: 80 }} value={c.start ?? 0} onChange={(e) => setCol(i, { start: +e.target.value })} />
                      <input aria-label="Width" type="number" min={1} className="ai-input ai-mono" style={{ width: 80 }} value={c.width ?? 0} onChange={(e) => setCol(i, { width: +e.target.value })} />
                    </span>
                  ) : <input aria-label="Column name" className="ai-input ai-mono" value={c.source} onChange={(e) => setCol(i, { source: e.target.value })} />}
                </th>
                <td><select aria-label="Means" className="ai-select" value={c.target} onChange={(e) => setCol(i, { target: e.target.value })}>{enums.targets.map((t) => <option key={t} value={t}>{TARGET_LABEL[t]}</option>)}</select></td>
                <td><button type="button" className="ai-link" onClick={() => set({ columns: cols.filter((_, j) => j !== i) })}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="ai-link" style={{ alignSelf: 'flex-start' }} onClick={() => set({ columns: [...cols, { source: '', target: 'terminal' }] })}>+ Add a column</button>

        <h3 className="ai-sub">Try it</h3>
        <Field label="Paste the first lines of an export" htmlFor="pf-sample">
          <textarea id="pf-sample" className="ai-input ai-mono" style={{ minHeight: 110, padding: 10 }} value={sample} onChange={(e) => { setSample(e.target.value); setTest(null); }} />
        </Field>
        <div><button type="button" className="ai-btn" disabled={!sample.trim() || tester.busy || d.format === 'XLSX'} onClick={runTest}>Read it with this profile</button>
          {d.format === 'XLSX' && <span className="ai-caption"> A workbook is tested by importing it.</span>}</div>
        {tester.error && <div className="ai-note ai-tone-neg" role="alert">{tester.error}</div>}
        {test && (
          <div className="ai-stack" aria-live="polite">
            <div className="ai-caption">{num(test.punches)} punches from {num(test.rowsTotal)} rows{test.discarded ? `, ${num(test.discarded)} middle punches set aside` : ''}.</div>
            {!!test.errors.length && <ul className="ai-errors-list">{test.errors.map((e, i) => <li key={i} className="ai-mono">{errorLine(e)}</li>)}</ul>}
            <table className="ai-table">
              <thead><tr><th scope="col">Row</th><th scope="col">Device ID</th><th scope="col">Date</th><th scope="col">Time</th><th scope="col">Direction</th></tr></thead>
              <tbody>{test.sample.map((x, i) => (
                <tr key={i} style={{ opacity: x.discarded ? 0.5 : 1 }}><th scope="row" className="num ai-mono">{num(x.row)}</th><td className="ai-mono">{x.deviceUserId}</td><td className="ai-mono">{x.date}</td><td className="ai-mono">{x.time}</td><td>{x.discarded ? 'set aside' : x.direction || '—'}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </fieldset>
      {write.error && <div className="ai-note ai-tone-neg" role="alert">{write.error}</div>}
      <div className="ai-actions">
        <button type="button" className="ai-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="ai-btn-primary" disabled={ro || write.busy} onClick={save}>{profile ? `Save as version ${(versions.data?.versions[0]?.version || profile.version) + 1}` : 'Create the profile'}</button>
      </div>
      {profile && !!versions.data?.versions.length && (
        <>
          <h3 className="ai-sub">Versions</h3>
          <ul className="ai-caption" style={{ margin: 0, paddingLeft: 18 }}>
            {versions.data.versions.map((v) => <li key={v.uid}>v{v.version} · {shortDate(v.createdAt.slice(0, 10))}{v.createdBy ? ` · ${v.createdBy}` : ''}{v.isActive ? ' · current' : ''}{v.batches ? ` · ${v.batches} imports` : ''}</li>)}
          </ul>
        </>
      )}
    </Drawer>
  );
}
