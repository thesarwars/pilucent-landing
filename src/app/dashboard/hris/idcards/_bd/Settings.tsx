'use client';

/**
 * Settings: custom fields, output profiles and card settings, and the
 * verification page preview.
 *
 * `manage card fields` is a privacy permission, not a configuration one:
 * turning on "show on the verification page" publishes a field to an
 * unauthenticated page, so the switch says so before it flips.
 */

import * as React from 'react';
import { populationBand } from './engine';
import { useFields, useGallery, useTemplates } from './hooks';
import { useShared } from './IdCards';
import { Check, Dim, Empty, Field, Loading, Modal, plural, useWrite } from './parts';
import { describeProfile } from './Print';
import { VerifyView } from './VerifyView';
import * as api from './api';
import type { Field as CardField, Profile, Settings, Verification } from './types';

// ------------------------------------------------------------ custom fields

const KINDS: [CardField['kind'], string][] = [['TEXT', 'Text'], ['DATE', 'Date'], ['NUMBER', 'Number'], ['ENUM', 'Select'], ['MULTI', 'Multi-select'], ['BOOLEAN', 'Yes / no']];

export function CustomFields() {
  const { setup } = useShared();
  const q = useFields();
  const [editing, setEditing] = React.useState<CardField | 'new' | null>(null);
  if (q.isLoading || !q.data) return <Loading what="Loading custom fields" />;
  const { fields, employees } = q.data;
  return (
    <div className="idc-scroll">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1180 }}>
        <div className="idc-panel">
          <div className="idc-panel-h">
            <h2 className="idc-h2">Custom fields</h2>
            <span className="idc-small idc-muted">Values the employee record does not hold, for a card to print.</span>
            <span className="idc-spacer" />
            <button type="button" className="idc-btn primary" disabled={!setup.can.fields} onClick={() => setEditing('new')}>Add field</button>
          </div>
          {!fields.length ? <Empty title="No custom fields">Add one to bind it on a card, e.g. a shift group or gate access.</Empty> : (
            <table className="idc-table">
              <thead><tr><th>Field</th><th>Kind</th><th>Options</th><th className="num">Filled</th><th>Prints</th><th>Verification page</th><th /></tr></thead>
              <tbody>
                {fields.map((f) => {
                  const band = populationBand(f.population);
                  return (
                    <tr key={f.uid}>
                      <td><div style={{ fontWeight: 500 }}>{f.label}{f.labelBn && <span lang="bn" className="idc-muted"> · {f.labelBn}</span>}</div><div className="idc-mono idc-tiny idc-muted">{f.path}</div></td>
                      <td>{KINDS.find(([k]) => k === f.kind)?.[1]}</td>
                      <td className="idc-small">{f.options.length ? f.options.join(', ') : <span className="idc-muted">—</span>}</td>
                      <td className="num"><span className="idc-pop" style={{ color: band.fg, background: band.bg }}>{f.population ?? 0}%</span></td>
                      <td>{f.isPii ? <span className="idc-badge err">personal data · never</span> : f.printable ? 'Yes' : 'No'}</td>
                      <td>{f.verifyVisible ? <span className="idc-badge warn">shown publicly</span> : <span className="idc-muted">Hidden</span>}</td>
                      <td style={{ textAlign: 'right' }}><button type="button" className="idc-btn sm" disabled={!setup.can.fields} onClick={() => setEditing(f)}>Edit</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {fields.length > 0 && <Values fields={fields} employees={employees} />}
      </div>
      {editing && <FieldModal field={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function FieldModal({ field, onClose }: { field: CardField | null; onClose: () => void }) {
  const [d, setD] = React.useState<Partial<CardField>>(field || { key: '', label: '', kind: 'TEXT', options: [], printable: true, verifyVisible: false, isPii: false, group: 'Custom fields' });
  const [options, setOptions] = React.useState((field?.options || []).join(', '));
  const [confirmPublic, setConfirmPublic] = React.useState(false);
  const write = useWrite();
  const set = (p: Partial<CardField>) => setD({ ...d, ...p });
  const save = async () => {
    const body = { ...d, options: options.split(',').map((o) => o.trim()).filter(Boolean) };
    if (await write.run(() => (field ? api.patchField(field.uid, body) : api.createField(body)), 'Field saved')) onClose();
  };
  return (
    <Modal title={field ? `Edit ${field.label}` : 'Add a custom field'} onClose={onClose} footer={<>
      <button type="button" className="idc-btn" onClick={onClose}>Cancel</button>
      <button type="button" className="idc-btn primary" disabled={!d.label || (!field && !d.key) || write.busy} onClick={save}>Save field</button>
    </>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Label" htmlFor="cf-label"><input id="cf-label" className="idc-input" value={d.label || ''} onChange={(e) => set({ label: e.target.value })} autoFocus /></Field>
        <Field label="Label in Bangla" htmlFor="cf-bn"><input id="cf-bn" lang="bn" className="idc-input" value={d.labelBn || ''} onChange={(e) => set({ labelBn: e.target.value })} /></Field>
        <Field label="Key" htmlFor="cf-key" hint={field ? 'Fixed once made: templates bind to it.' : `Binds as custom.${d.key || 'key'}`}><input id="cf-key" className="idc-input mono" value={d.key || ''} disabled={!!field} onChange={(e) => set({ key: e.target.value.replace(/[^A-Za-z0-9_]/g, '') })} placeholder="shiftGroup" /></Field>
        <Field label="Kind" htmlFor="cf-kind">
          <select id="cf-kind" className="idc-select" value={d.kind} onChange={(e) => set({ kind: e.target.value as CardField['kind'] })}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </Field>
      </div>
      {(d.kind === 'ENUM' || d.kind === 'MULTI') && <Field label="Options" htmlFor="cf-opt" hint="Separated by commas."><input id="cf-opt" className="idc-input" value={options} onChange={(e) => setOptions(e.target.value)} placeholder="Day A, Day B, Night" /></Field>}
      <Field label="Help" htmlFor="cf-help"><input id="cf-help" className="idc-input" value={d.help || ''} onChange={(e) => set({ help: e.target.value })} /></Field>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label className="idc-check"><input type="checkbox" checked={!!d.isPii} onChange={(e) => set({ isPii: e.target.checked, ...(e.target.checked ? { printable: false, verifyVisible: false } : {}) })} />Personal data (an NID, a phone number): never printed, never shown publicly</label>
        <label className="idc-check"><input type="checkbox" checked={!!d.printable} disabled={!!d.isPii} onChange={(e) => set({ printable: e.target.checked })} />Can be printed on a card</label>
        <label className="idc-check"><input type="checkbox" checked={!!d.verifyVisible} disabled={!!d.isPii} onChange={(e) => (e.target.checked ? setConfirmPublic(true) : set({ verifyVisible: false }))} />Show on the public verification page</label>
      </div>
      {confirmPublic && (
        <div className="idc-banner warn">
          Anyone who scans a card — no sign-in — will see this field&apos;s value for that employee. Turn it on only for something a guard needs, like an access zone.
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <button type="button" className="idc-btn sm" onClick={() => { set({ verifyVisible: true }); setConfirmPublic(false); }}>Show it publicly</button>
            <button type="button" className="idc-btn sm ghost" onClick={() => setConfirmPublic(false)}>Keep it hidden</button>
          </div>
        </div>
      )}
      {write.error && <div className="idc-banner err">{write.error}</div>}
    </Modal>
  );
}

function Values({ fields, employees }: { fields: CardField[]; employees: { code: string; nameEn: string; values: Record<string, unknown> }[] }) {
  const { setup, q } = useShared();
  const write = useWrite();
  const shown = employees.filter((e) => !q || e.nameEn.toLowerCase().includes(q.toLowerCase()) || e.code.toLowerCase().includes(q.toLowerCase()));
  const put = (code: string, key: string, value: unknown) => write.run(() => api.putFieldValues(code, { [key]: value }));
  return (
    <div className="idc-panel" style={{ overflow: 'auto' }}>
      <div className="idc-panel-h"><h2 className="idc-h2">Values</h2><span className="idc-small idc-muted">{plural(shown.length, 'employee')}</span><span className="idc-spacer" />{write.error && <span className="idc-error-text">{write.error}</span>}{write.busy && <span className="idc-tiny idc-muted">Saving…</span>}</div>
      <table className="idc-table" style={{ minWidth: 300 + fields.length * 170 }}>
        <thead><tr><th>Employee</th>{fields.map((f) => <th key={f.uid}>{f.label}</th>)}</tr></thead>
        <tbody>
          {shown.map((e) => (
            <tr key={e.code}>
              <td>{e.nameEn} <span className="idc-mono idc-tiny idc-muted">{e.code}</span></td>
              {fields.map((f) => <td key={f.uid}><ValueCell field={f} value={e.values[f.key]} disabled={!setup.can.fields} onChange={(v) => put(e.code, f.key, v)} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ValueCell({ field, value, disabled, onChange }: { field: CardField; value: unknown; disabled: boolean; onChange: (v: unknown) => void }) {
  const [text, setText] = React.useState(value == null ? '' : String(value));
  React.useEffect(() => setText(value == null ? '' : String(value)), [value]);
  if (field.kind === 'ENUM') {
    return <select className="idc-select" disabled={disabled} value={String(value ?? '')} onChange={(e) => onChange(e.target.value || null)} aria-label={field.label}><option value="">—</option>{field.options.map((o) => <option key={o}>{o}</option>)}</select>;
  }
  if (field.kind === 'MULTI') {
    const list = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {field.options.map((o) => {
          const on = list.includes(o);
          return <button key={o} type="button" disabled={disabled} className={`idc-chip${on ? ' on' : ''}`} style={{ height: 22, fontSize: 11, padding: '0 6px' }} onClick={() => onChange(on ? list.filter((x) => x !== o) : [...list, o])}>{o}</button>;
        })}
      </div>
    );
  }
  if (field.kind === 'BOOLEAN') return <Check on={value === true} label={field.label} onClick={() => !disabled && onChange(value === true ? null : true)} />;
  return <input className="idc-input" disabled={disabled} type={field.kind === 'DATE' ? 'date' : field.kind === 'NUMBER' ? 'number' : 'text'} value={text} aria-label={field.label}
    onChange={(e) => setText(e.target.value)} onBlur={() => text !== (value == null ? '' : String(value)) && onChange(text === '' ? null : field.kind === 'NUMBER' ? Number(text) : text)} />;
}

// ---------------------------------------------------------- output profiles

const SHEETS: Record<string, [number, number]> = { A4: [210, 297], LETTER: [215.9, 279.4] };

export function OutputProfiles() {
  const { setup } = useShared();
  const [sel, setSel] = React.useState<string | 'new'>(setup.profiles[0]?.uid || 'new');
  const profile = sel === 'new' ? null : setup.profiles.find((p) => p.uid === sel) || null;
  return (
    <div className="idc-split" style={{ gridTemplateColumns: '300px minmax(0,1fr)' }}>
      <aside className="idc-side-panel" style={{ borderLeft: 0, borderRight: '1px solid var(--idc-bd)', order: -1 }}>
        <div className="idc-panel-h"><span className="idc-sub">Output profiles</span><span className="idc-spacer" /><button type="button" className="idc-btn sm" disabled={!setup.can.print} onClick={() => setSel('new')}>New</button></div>
        {setup.profiles.map((p) => (
          <button key={p.uid} type="button" className={`idc-layer${sel === p.uid ? ' on' : ''}`} style={{ height: 'auto', padding: '8px 10px', alignItems: 'flex-start' }} onClick={() => setSel(p.uid)}>
            <span style={{ minWidth: 0 }}><span style={{ display: 'block', fontWeight: 500 }}>{p.name}{p.isDefault && <span className="idc-badge" style={{ marginLeft: 6 }}>default</span>}</span><span className="idc-hint">{describeProfile(p)}</span></span>
          </button>
        ))}
        <CardSettings />
      </aside>
      <div className="idc-scroll"><ProfileForm key={sel} profile={profile} onSaved={(p) => setSel(p.uid)} /></div>
    </div>
  );
}

function ProfileForm({ profile, onSaved }: { profile: Profile | null; onSaved: (p: Profile) => void }) {
  const { setup } = useShared();
  const templates = useTemplates();
  const def = templates.data?.templates.find((t) => t.isDefault);
  const card = { w: def?.widthMm || 54, h: def?.heightMm || 85.6, bleed: def?.bleedMm ?? 2 };
  const [d, setD] = React.useState<Partial<Profile>>(profile || { name: '', sheet: 'A4', cols: 3, rows: 3, gutterMm: 4, marginMm: 10, includeBleed: true, cropMarks: true, duplex: 'LONG_EDGE', colourProfile: 'sRGB', dpi: 300, mirror: false });
  const write = useWrite();
  const set = (p: Partial<Profile>) => setD({ ...d, ...p });
  const sheet = d.sheet || 'A4';
  const imposed = sheet === 'A4' || sheet === 'LETTER';
  const save = async () => {
    const out = await write.run(() => (profile ? api.patchProfile(profile.uid, d) : api.createProfile(d)), 'Profile saved');
    if (out) onSaved(out);
  };
  // Does the grid fit the sheet?
  const b = d.includeBleed ? card.bleed : 0;
  const cw = card.w + 2 * b, ch = card.h + 2 * b;
  const [pw, ph] = SHEETS[sheet] || [cw, ch];
  const needW = 2 * (d.marginMm || 0) + (d.cols || 1) * cw + ((d.cols || 1) - 1) * (d.gutterMm || 0);
  const needH = 2 * (d.marginMm || 0) + (d.rows || 1) * ch + ((d.rows || 1) - 1) * (d.gutterMm || 0);
  const overflow = imposed && (needW > pw + 0.01 || needH > ph + 0.01);
  const k = 1.3;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 420px) minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
      <fieldset disabled={!setup.can.print} className="idc-panel" style={{ margin: 0 }}>
        <div className="idc-panel-h"><h2 className="idc-h2">{profile ? profile.name : 'New profile'}</h2></div>
        <div className="idc-panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Name" htmlFor="op-name"><input id="op-name" className="idc-input" value={d.name || ''} onChange={(e) => set({ name: e.target.value })} /></Field>
          <Field label="Output" htmlFor="op-sheet">
            <select id="op-sheet" className="idc-select" value={sheet} onChange={(e) => set({ sheet: e.target.value as Profile['sheet'] })}>
              <option value="CARD_DIRECT">Card printer: one card per page</option><option value="A4">A4 sheet</option><option value="LETTER">Letter sheet</option><option value="PNG">PNG images (zip)</option>
            </select>
          </Field>
          {imposed && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Dim label="Cols" unit="" step={1} value={d.cols || 1} onChange={(v) => set({ cols: Math.max(1, Math.min(6, Math.round(v))) })} />
              <Dim label="Rows" unit="" step={1} value={d.rows || 1} onChange={(v) => set({ rows: Math.max(1, Math.min(8, Math.round(v))) })} />
              <Dim label="Margin" value={d.marginMm || 0} onChange={(v) => set({ marginMm: Math.max(0, v) })} />
              <Dim label="Gutter" value={d.gutterMm || 0} onChange={(v) => set({ gutterMm: Math.max(0, v) })} />
            </div>
          )}
          <Field label="Sides" htmlFor="op-duplex">
            <select id="op-duplex" className="idc-select" value={d.duplex} onChange={(e) => set({ duplex: e.target.value as Profile['duplex'] })}>
              <option value="NONE">Front only</option><option value="LONG_EDGE">Both, duplex on the long edge</option><option value="SHORT_EDGE">Both, duplex on the short edge</option>
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Dim label="DPI" unit="" step={50} value={d.dpi || 300} onChange={(v) => set({ dpi: Math.max(150, Math.min(1200, Math.round(v))) })} />
            <select className="idc-select" value={d.colourProfile} onChange={(e) => set({ colourProfile: e.target.value })} aria-label="Colour profile"><option>sRGB</option><option>Fogra39</option><option>Printer default</option></select>
          </div>
          <label className="idc-check"><input type="checkbox" checked={!!d.includeBleed} onChange={(e) => set({ includeBleed: e.target.checked })} />Include the bleed (for trimming a sheet)</label>
          <label className="idc-check"><input type="checkbox" checked={!!d.cropMarks} disabled={!imposed} onChange={(e) => set({ cropMarks: e.target.checked })} />Crop marks</label>
          <label className="idc-check"><input type="checkbox" checked={!!d.mirror} onChange={(e) => set({ mirror: e.target.checked })} />Mirror (retransfer film printers)</label>
          {profile && !profile.isDefault && <label className="idc-check"><input type="checkbox" checked={!!d.isDefault} onChange={(e) => set({ isDefault: e.target.checked })} />Make this the default</label>}
          {overflow && <div className="idc-banner err">The grid needs {needW.toFixed(1)} × {needH.toFixed(1)} mm; the sheet is {pw} × {ph} mm. Fewer columns or rows, or a smaller margin.</div>}
          {write.error && <div className="idc-banner err">{write.error}</div>}
          <div><button type="button" className="idc-btn primary" disabled={!d.name || overflow || write.busy} onClick={save}>Save profile</button></div>
        </div>
      </fieldset>
      <div className="idc-panel">
        <div className="idc-panel-h"><span className="idc-sub">Layout</span><span className="idc-spacer" /><span className="idc-hint">{def ? `${def.name}, ${card.w} × ${card.h} mm` : `${card.w} × ${card.h} mm`}</span></div>
        <div className="idc-panel-b" style={{ display: 'flex', justifyContent: 'center', background: '#ECECEC' }}>
          {imposed ? (
            <div style={{ position: 'relative', width: pw * k, height: ph * k, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} aria-label={`${d.cols} by ${d.rows} cards on ${sheet}`}>
              {Array.from({ length: (d.cols || 1) * (d.rows || 1) }, (_, i) => {
                const col = i % (d.cols || 1), row = Math.floor(i / (d.cols || 1));
                const x = (d.marginMm || 0) + col * (cw + (d.gutterMm || 0)), y = (d.marginMm || 0) + row * (ch + (d.gutterMm || 0));
                return (
                  <div key={i} style={{ position: 'absolute', left: x * k, top: y * k, width: cw * k, height: ch * k, background: d.includeBleed ? '#F4E3E3' : undefined, outline: overflow ? '1px solid #9C1F1F' : undefined }}>
                    <div style={{ position: 'absolute', left: b * k, top: b * k, width: card.w * k, height: card.h * k, background: '#DCDCDC', borderRadius: 3.18 * k, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--idc-mono)', fontSize: 10, color: '#666' }}>{i + 1}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: cw * 2.4, height: ch * 2.4, background: d.includeBleed ? '#F4E3E3' : '#fff', position: 'relative', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }}>
                <div style={{ position: 'absolute', left: b * 2.4, top: b * 2.4, width: card.w * 2.4, height: card.h * 2.4, background: '#DCDCDC', borderRadius: 3.18 * 2.4 }} />
              </div>
              <div className="idc-hint" style={{ maxWidth: 220 }}>{sheet === 'PNG' ? `One image per side at ${d.dpi} DPI: ${Math.round((cw / 25.4) * (d.dpi || 300))} × ${Math.round((ch / 25.4) * (d.dpi || 300))} px, in a zip.` : 'One card per page, front then back, sized to the card for a card printer driver.'}</div>
            </div>
          )}
        </div>
        {imposed && d.duplex !== 'NONE' && <div className="idc-panel-b idc-hint">Backs are mirrored by column on their page, so the back of column 1 lands behind column 1 after a long-edge flip.</div>}
      </div>
    </div>
  );
}

function CardSettings() {
  const { setup } = useShared();
  const [d, setD] = React.useState<Settings>(setup.settings);
  const write = useWrite();
  const set = (p: Partial<Settings>) => setD({ ...d, ...p });
  return (
    <fieldset disabled={!setup.can.edit} style={{ border: 0, margin: 0, padding: 12, borderTop: '1px solid var(--idc-bd-light)', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <span className="idc-sub">Card settings</span>
      <Field label="Company name in Bangla" htmlFor="cs-bn"><input id="cs-bn" lang="bn" className="idc-input" value={d.nameBn || ''} onChange={(e) => set({ nameBn: e.target.value })} /></Field>
      <Field label="Return address" htmlFor="cs-addr"><textarea id="cs-addr" className="idc-textarea" value={d.address || ''} onChange={(e) => set({ address: e.target.value })} /></Field>
      <Field label="Signatory title" htmlFor="cs-sig"><input id="cs-sig" className="idc-input" value={d.signatoryTitle || ''} onChange={(e) => set({ signatoryTitle: e.target.value })} placeholder="Head of HR" /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field label="Number prefix" htmlFor="cs-pre" hint={`${d.numberPrefix || 'ID'}-2026-00001`}><input id="cs-pre" className="idc-input mono" value={d.numberPrefix} onChange={(e) => set({ numberPrefix: e.target.value.toUpperCase() })} /></Field>
        <Field label="Valid for" htmlFor="cs-val" hint="years from issue"><input id="cs-val" type="number" min={1} max={10} className="idc-input" value={d.validityYears} onChange={(e) => set({ validityYears: +e.target.value })} /></Field>
      </div>
      <Field label="Keep photos after separation" htmlFor="cs-ret" hint="days, then the file is purged"><input id="cs-ret" type="number" min={0} className="idc-input" value={d.photoRetentionDays} onChange={(e) => set({ photoRetentionDays: +e.target.value })} /></Field>
      {write.error && <div className="idc-error-text">{write.error}</div>}
      <div><button type="button" className="idc-btn" disabled={write.busy} onClick={() => write.run(() => api.patchSettings(d), 'Card settings saved')}>Save settings</button></div>
    </fieldset>
  );
}

// ------------------------------------------------------ verification preview

export function VerificationPreview() {
  const { setup } = useShared();
  const g = useGallery('', 'ALL');
  const fields = useFields();
  const withCards = (g.data?.rows || []).filter((r) => r.card);
  const [code, setCode] = React.useState('');
  const [state, setState] = React.useState<'valid' | 'expired' | 'revoked'>('valid');
  const row = withCards.find((r) => r.code === code) || withCards[0];
  const card = row?.card;
  const visible = (fields.data?.fields || []).filter((f) => f.verifyVisible && !f.isPii);
  const photo = row?.photo?.url || null;
  const base: Verification = card ? {
    status: card.effectiveStatus === 'EXPIRING' ? 'EXPIRING' : 'ACTIVE', employer: setup.company.name || undefined,
    employeeName: String(card.snapshot['employee.fullName'] || row!.nameEn), employeeNameBn: (card.snapshot['employee.fullNameBn'] as string) || null,
    employeeCode: card.employee.code, designation: (card.snapshot['employee.job.designation'] as string) || null, cardNumber: card.number,
    photoUrl: photo, issuedOn: card.issuedOn, expiresOn: card.expiresOn,
    custom: visible.map((f) => ({ label: f.label, value: card.snapshot[`custom.${f.key}`] })).filter((c) => c.value !== undefined && c.value !== null && c.value !== ''),
  } : {
    status: 'ACTIVE', employer: setup.company.name || 'Your company', employeeName: 'Md. Karim Uddin', employeeNameBn: 'মোঃ করিম উদ্দিন', employeeCode: 'EMP-0000',
    designation: 'Sewing Operator', cardNumber: 'ID-2026-00000', photoUrl: null, issuedOn: '2026-10-15', expiresOn: '2029-10-15', custom: [],
  };
  const shown: Verification = state === 'valid' ? base : state === 'expired' ? { ...base, status: 'EXPIRED', expiresOn: '2026-09-30' } : { status: 'REVOKED', employer: base.employer, employeeName: base.employeeName, revokedOn: '2026-10-14' };
  return (
    <div className="idc-split" style={{ gridTemplateColumns: 'minmax(0,1fr) 380px' }}>
      <div className="idc-showcase" style={{ justifyContent: 'flex-start' }}>
        <div className="idc-seg" role="group" aria-label="State">
          {(['valid', 'expired', 'revoked'] as const).map((s) => <button key={s} type="button" className={state === s ? 'on' : ''} onClick={() => setState(s)}>{s[0].toUpperCase() + s.slice(1)}</button>)}
        </div>
        <div style={{ width: 380 }}><VerifyView v={shown} preview /></div>
      </div>
      <aside className="idc-side-panel">
        <div className="idc-section">
          <div className="idc-sub" style={{ marginBottom: 8 }}>Preview for</div>
          {withCards.length ? (
            <select className="idc-select" value={row?.code} onChange={(e) => setCode(e.target.value)} aria-label="Card">
              {withCards.map((r) => <option key={r.code} value={r.code}>{r.nameEn} · {r.card!.number}</option>)}
            </select>
          ) : <div className="idc-hint">No card issued yet: showing sample data.</div>}
          {card && <div style={{ marginTop: 8 }}><a href={card.verifyUrl.replace(/^https?:\/\/[^/]+/, '')} target="_blank" rel="noreferrer">Open the live page for {card.number}</a></div>}
        </div>
        <div className="idc-section">
          <div className="idc-sub" style={{ marginBottom: 8 }}>What the page shows</div>
          <ul className="idc-small" style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
            <li>Photo, through a link signed for five minutes</li><li>Name in English and Bangla, designation</li><li>Employee code and card number</li><li>Issue and expiry dates, and the employer</li>
            {visible.map((f) => <li key={f.uid}><b>{f.label}</b> — a custom field set to show publicly</li>)}
          </ul>
          <div className="idc-sub" style={{ margin: '12px 0 8px' }}>Never</div>
          <div className="idc-small idc-muted" style={{ lineHeight: 1.6 }}>NID, address, phone, email, salary, date of birth, or any field not opted in. The QR carries a random 128-bit token — never the employee id — and each address is limited to 50 checks an hour. Every scan is recorded.</div>
        </div>
        <div className="idc-section">
          <div className="idc-sub" style={{ marginBottom: 8 }}>A revoked card</div>
          <div className="idc-small idc-muted" style={{ lineHeight: 1.6 }}>Answers “revoked on 14 October”, not “unknown card”: a guard is told what to do. The card stays on record; it is never deleted.</div>
        </div>
      </aside>
    </div>
  );
}
