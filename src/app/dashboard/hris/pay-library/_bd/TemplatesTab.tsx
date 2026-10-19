'use client';

/**
 * Structure templates (§9): named splits, gross-down or basic-up, with a live
 * preview. The distinction is load-bearing: RMG is basic-up because the
 * gazette sets basic, not gross -- forced gross-down, the rounding lands a
 * few taka under the floor. A published template is never edited: an edit
 * is the next draft, from a date. Usage is the number of live structures on
 * it: one with 148 is not safe to edit.
 */

import * as React from 'react';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { usePreview, useTemplates } from './hooks';
import { Drawer, Field, SectionTitle, todayISO, useWrite } from './parts';
import * as api from './api';
import type { Component, Row, Summary, Template, TemplateRow } from './types';

const BASIS: Record<Row['basis'], string> = { PCT_OF_GROSS: '% of gross', PCT_OF_BASIC: '% of basic', FIXED: 'fixed' };
const GRADES = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];

export function rowText(r: Row, name: (code: string) => string) {
  return `${name(r.code)} ${r.basis === 'FIXED' ? `৳${Number(r.value).toLocaleString('en-IN')}` : `${Number(r.value)}${BASIS[r.basis]}`}`;
}

export function TemplatesTab({ summary }: { summary: Summary }) {
  const q = useTemplates();
  const [sel, setSel] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<Template | 'new' | null>(null);
  const names = React.useMemo(() => Object.fromEntries(summary.components.map((c) => [c.code, c.name])), [summary.components]);
  if (q.isLoading) return <LoadingBlock />;
  if (q.error || !q.data) return <ErrorBlock error={q.error} onRetry={() => q.refetch()} />;
  const rows = q.data.templates;
  const current = rows.find((t) => t.code === sel) || rows[0];
  const can = q.data.can;
  return (
    <div className="pl-split">
      <section className="bd-card pl-card">
        <SectionTitle en="Structure templates" bn="বেতন কাঠামো">
          A gross-down template splits a gross; a basic-up template stacks allowances on a basic, so gross is the output.
        </SectionTitle>
        <div className="pl-row-between" style={{ marginBottom: 10 }}>
          <span className="pl-hint">Usage counts live structures. A template in use is versioned, never edited in place.</span>
          <button type="button" className="bd-btn-primary" disabled={!can.editTemplates} onClick={() => setEditing('new')}>New template</button>
        </div>
        <div className="pl-tlist">
          {rows.map((t) => (
            <button key={t.code} type="button" className={`pl-tcard${current?.code === t.code ? ' on' : ''}`} onClick={() => setSel(t.code)} aria-pressed={current?.code === t.code}>
              <div className="pl-row-between">
                <span className="pl-cname">{t.name}</span>
                <span className={`pl-badge ${t.mode === 'BASIC_UP' ? 'up' : ''}`}>{t.gazette ? 'Gazette · basic-up' : t.mode === 'BASIC_UP' ? 'Basic-up' : 'Gross-down'}</span>
              </div>
              <div className="pl-code"><span className="bd-mono">{t.code}</span> · v{t.version}{t.status !== 'PUBLISHED' ? ` · ${t.status.toLowerCase()}` : ''} · {t.usage ?? 0} on it{t.draft ? ` · draft v${t.draft.version} waiting` : ''}</div>
              <div className="pl-trows">{t.gazette ? 'Basic from the gazetted grade wage, the gazette’s allowances on top — from the rule book.' : t.rows.map((r) => rowText(r, (c) => names[c] || c)).join(' · ')}</div>
              {t.mode === 'GROSS_DOWN' && !t.gazette && <div className="pl-code">Balance of gross to {names[t.balancingCode] || t.balancingCode}</div>}
            </button>
          ))}
        </div>
      </section>
      {current && <PreviewPanel t={current} names={names} canEdit={can.editTemplates} canPublish={can.publish} onEdit={(x) => setEditing(x)} />}
      {editing && <TemplateEditor template={editing === 'new' ? null : editing} components={summary.components} onClose={() => setEditing(null)} />}
    </div>
  );
}

function PreviewPanel({ t, names, canEdit, canPublish, onEdit }: { t: TemplateRow; names: Record<string, string>; canEdit: boolean; canPublish: boolean; onEdit: (x: Template) => void }) {
  const { money } = useLang();
  const basicUp = t.mode === 'BASIC_UP';
  const [amount, setAmount] = React.useState(basicUp ? (t.gazette ? '' : t.rows.find((r) => r.code === 'BASIC')?.value || '8000') : '50000');
  const [grade, setGrade] = React.useState('G5');
  React.useEffect(() => { setAmount(basicUp ? (t.gazette ? '' : String(Number(t.rows.find((r) => r.code === 'BASIC')?.value || 8000))) : '50000'); }, [t.code]);  
  const p = usePreview(t.uid, amount, t.gazette ? grade : '');
  const write = useWrite();
  const draft = t.draft;
  return (
    <section className="bd-card pl-card" aria-live="polite">
      <SectionTitle en={t.name} bn={t.nameBn || 'নমুনা'}>{t.note}</SectionTitle>
      <div className="pl-row">
        <Field label={basicUp ? 'Basic' : 'Gross'} htmlFor="pl-pv-amt" hint={t.gazette ? 'Empty: the grade’s gazetted basic.' : undefined}>
          <input id="pl-pv-amt" className="bd-input bd-mono" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} style={{ width: 150 }} />
        </Field>
        {t.gazette && (
          <Field label="Grade" htmlFor="pl-pv-g">
            <select id="pl-pv-g" className="bd-input" value={grade} onChange={(e) => setGrade(e.target.value)} style={{ width: 110 }}>{GRADES.map((g) => <option key={g}>{g}</option>)}</select>
          </Field>
        )}
      </div>
      {p.error ? <div className="bd-note bd-tone-blocked">{(p.error as Error).message}</div> : p.data && (
        <>
          <table className="bd-table pl-preview">
            <tbody>
              {p.data.lines.map((l) => <tr key={l.code}><th scope="row">{names[l.code] || l.code}</th><td className="bd-mono pl-num">{money(l.amount)}</td></tr>)}
              <tr className="pl-total"><th scope="row">Gross{basicUp ? ' (the output)' : ''}</th><td className="bd-mono pl-num">{money(p.data.gross)}</td></tr>
            </tbody>
          </table>
          <div className="pl-hint">Basic is {p.data.basicShare}% of gross.</div>
          {p.data.basicShareWarning && <div className="bd-note bd-tone-warn">{p.data.basicShareWarning}</div>}
          <div className="pl-mini">
            <span>Overtime hourly <b className="bd-mono">{money(p.data.bases.overtimeHourly, 2)}</b></span>
            <span>PF each side <b className="bd-mono">{money(p.data.bases.pfEmployee, 2)}</b></span>
            <span>Gratuity / month <b className="bd-mono">{money(p.data.bases.gratuityMonthly, 2)}</b></span>
          </div>
        </>
      )}
      {!t.gazette && (
        <div className="pl-actions">
          {draft ? (
            <>
              <button type="button" className="bd-btn" disabled={!canEdit} onClick={() => onEdit(draft)}>Edit draft v{draft.version}</button>
              <button type="button" className="bd-btn-primary" disabled={!canPublish || write.busy} onClick={() => write.run(() => api.templateAction(draft.uid, 'publish'), `v${draft.version} published`)}>Publish v{draft.version}</button>
            </>
          ) : (
            <button type="button" className="bd-btn" disabled={!canEdit} onClick={() => onEdit(t)}>{t.usage ? `Change (makes v${t.version + 1})` : 'Edit'}</button>
          )}
        </div>
      )}
      {write.error && <div className="bd-error" role="alert">{write.error}</div>}
    </section>
  );
}

function TemplateEditor({ template, components, onClose }: { template: Template | null; components: Component[]; onClose: () => void }) {
  const earnings = components.filter((c) => c.kind === 'EARNING' && c.isActive && c.calcBasis !== 'DERIVED' && c.calcBasis !== 'PER_SHIFT');
  const [d, setD] = React.useState<Partial<Template>>(template ? { ...template, rows: template.rows.map((r) => ({ ...r })) } : {
    code: '', name: '', mode: 'GROSS_DOWN', note: '', balancingCode: 'BASIC', effectiveFrom: todayISO(),
    rows: [{ code: 'BASIC', basis: 'PCT_OF_GROSS', value: '60' }, { code: 'HRA', basis: 'PCT_OF_BASIC', value: '50' }],
  });
  const write = useWrite();
  const set = (p: Partial<Template>) => setD({ ...d, ...p });
  const rows = d.rows || [];
  const setRow = (i: number, p: Partial<Row>) => set({ rows: rows.map((r, j) => (j === i ? { ...r, ...p } : r)) });
  const basicUp = d.mode === 'BASIC_UP';
  const save = async () => {
    const body = { ...d, effectiveFrom: d.effectiveFrom };
    const out = await write.run(() => (template ? api.saveTemplate(template.uid, body) : api.createTemplate(body)),
      (o) => (o.status === 'DRAFT' ? `Draft v${o.version} saved — publish it to use it` : 'Saved'));
    if (out) onClose();
  };
  return (
    <Drawer id="pl-tedit" width={600} title={template ? `${template.name}${template.status === 'PUBLISHED' ? ` → v${template.version + 1}` : ` v${template.version}`}` : 'New template'}
      sub={template?.status === 'PUBLISHED' ? `v${template.version} stays as it is: saving makes a draft of the next version.` : 'Saved as a draft; publish it to build structures on it.'} onClose={onClose}>
      <div className="pl-grid2">
        <Field label="Name" htmlFor="pl-te-n"><input id="pl-te-n" className="bd-input" value={d.name || ''} onChange={(e) => set({ name: e.target.value })} /></Field>
        {!template && <Field label="Code" htmlFor="pl-te-c"><input id="pl-te-c" className="bd-input bd-mono" value={d.code || ''} onChange={(e) => set({ code: e.target.value.toLowerCase() })} placeholder="std" /></Field>}
        <Field label="Mode" htmlFor="pl-te-m" hint={basicUp ? 'A basic goes in; the allowances stack; gross comes out.' : 'A gross goes in and is split; the balance goes to one line.'}>
          <select id="pl-te-m" className="bd-input" value={d.mode} onChange={(e) => set({ mode: e.target.value as Template['mode'] })}><option value="GROSS_DOWN">Gross-down</option><option value="BASIC_UP">Basic-up</option></select>
        </Field>
        {!basicUp && (
          <Field label="Balance of gross goes to" htmlFor="pl-te-b">
            <select id="pl-te-b" className="bd-input" value={d.balancingCode} onChange={(e) => set({ balancingCode: e.target.value })}>
              <option value="BASIC">Basic salary</option><option value="OTHER">Other allowance</option>
            </select>
          </Field>
        )}
        <Field label="From" htmlFor="pl-te-f"><input id="pl-te-f" type="date" className="bd-input" value={d.effectiveFrom || ''} onChange={(e) => set({ effectiveFrom: e.target.value })} /></Field>
      </div>
      <Field label="Note — what choosing it does" htmlFor="pl-te-note" hint="State the consequence, not the audience: “basic absorbs the rounding”, “needs a higher gross to clear the floor”.">
        <textarea id="pl-te-note" className="bd-input" style={{ height: 70, padding: 10 }} value={d.note || ''} onChange={(e) => set({ note: e.target.value })} />
      </Field>
      <table className="bd-table">
        <thead><tr><th scope="col">Component</th><th scope="col">Basis</th><th scope="col">Value</th><th /></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <th scope="row">
                <label className="sr-only" htmlFor={`pl-r-c-${i}`}>Component</label>
                <select id={`pl-r-c-${i}`} className="bd-input" value={r.code} disabled={r.code === 'BASIC'} onChange={(e) => setRow(i, { code: e.target.value })}>
                  {earnings.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </th>
              <td>
                <label className="sr-only" htmlFor={`pl-r-b-${i}`}>Basis</label>
                <select id={`pl-r-b-${i}`} className="bd-input" value={r.basis} onChange={(e) => setRow(i, { basis: e.target.value as Row['basis'] })}>
                  {(r.code === 'BASIC' ? (basicUp ? ['FIXED'] : ['PCT_OF_GROSS', 'FIXED']) : basicUp ? ['PCT_OF_BASIC', 'FIXED'] : ['PCT_OF_GROSS', 'PCT_OF_BASIC', 'FIXED']).map((b) => <option key={b} value={b}>{BASIS[b as Row['basis']]}</option>)}
                </select>
              </td>
              <td><label className="sr-only" htmlFor={`pl-r-v-${i}`}>Value</label><input id={`pl-r-v-${i}`} className="bd-input bd-mono" value={r.value} onChange={(e) => setRow(i, { value: e.target.value })} style={{ width: 110 }} /></td>
              <td>{r.code !== 'BASIC' && <button type="button" className="pl-link" onClick={() => set({ rows: rows.filter((_, j) => j !== i) })}>Remove</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="pl-link" style={{ alignSelf: 'flex-start' }}
        onClick={() => { const next = earnings.find((c) => !rows.some((r) => r.code === c.code)); if (next) set({ rows: [...rows, { code: next.code, basis: basicUp ? 'FIXED' : 'PCT_OF_GROSS', value: basicUp ? '0' : '5' }] }); }}>+ Add a row</button>
      {write.error && <div className="bd-note bd-tone-blocked" role="alert">{write.error}</div>}
      <div className="pl-actions">
        <button type="button" className="bd-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="bd-btn-primary" disabled={write.busy || !d.name || !d.note} onClick={save}>Save draft</button>
      </div>
    </Drawer>
  );
}
