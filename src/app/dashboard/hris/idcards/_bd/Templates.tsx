'use client';

/**
 * Template list, with the rules that decide which template an employee's
 * card is issued on. A template is versioned: a published or printed
 * version is never edited -- an edit becomes the next draft -- so a reprint
 * reproduces the card that was printed.
 */

import * as React from 'react';
import { CardThumb } from './CardSide';
import { type Cond, type Ctx, PRESETS, artboardOf, describeCondition, operatorNeedsValue, operatorsFor } from './engine';
import { useRules, useTemplate, useTemplates } from './hooks';
import { useShared } from './IdCards';
import { Empty, Field, Loading, Modal, fmtWhen, plural, useWrite } from './parts';
import * as api from './api';
import type { Rule, TemplateRow } from './types';

export function sampleContext(company: Record<string, string | null>): Ctx {
  return {
    employee: { fullName: 'Md. Karim Uddin', fullNameBn: 'মোঃ করিম উদ্দিন', employeeCode: 'EMP-0000', bloodGroup: 'B+',
      job: { designation: 'Sewing Operator', grade: '5' }, department: { name: 'Production' }, location: { name: 'Head office' } },
    company, card: { number: 'ID-2026-00000', issueDate: '2026-10-15', expiryDate: '2029-10-15', verifyUrl: 'https://app.pilucent.com/verify/sample', token: 'sample', status: 'ISSUED' },
    custom: {},
  };
}

function Thumb({ uid }: { uid: string }) {
  const { setup } = useShared();
  const t = useTemplate(uid);
  const ctx = React.useMemo(() => sampleContext(setup.company), [setup.company]);
  if (!t.data?.front) return <div style={{ width: 70, height: 70 }} />;
  return <CardThumb side={t.data.front} ab={artboardOf(t.data)} ctx={ctx} maxW={70} maxH={70} style={{ boxShadow: '0 1px 2px rgba(0,0,0,.18)' }} />;
}

export function TemplateList() {
  const { nav, setup } = useShared();
  const q = useTemplates();
  const write = useWrite();
  const [creating, setCreating] = React.useState(false);
  const rows = q.data?.templates || [];
  const openUid = (t: TemplateRow) => t.draftUid || t.currentUid || t.uid;
  return (
    <div className="idc-scroll">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1180 }}>
        <div className="idc-panel">
          <div className="idc-panel-h">
            <h2 className="idc-h2">Templates</h2>
            <span className="idc-small idc-muted">{plural(rows.length, 'template')}</span>
            <span className="idc-spacer" />
            {write.error && <span className="idc-error-text">{write.error}</span>}
            <button type="button" className="idc-btn primary" disabled={!setup.can.edit} onClick={() => setCreating(true)}>New template</button>
          </div>
          {q.isLoading ? <Loading /> : !rows.length ? <Empty title="No templates" /> : (
            <div style={{ overflow: 'auto' }}>
              <table className="idc-table" style={{ minWidth: 860 }}>
                <thead><tr><th style={{ width: 90 }} /><th>Template</th><th>Size</th><th>Published</th><th>Draft</th><th className="num">Live cards</th><th /></tr></thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.code} className="click" onClick={() => nav.go('designer', { t: openUid(t) })}>
                      <td><Thumb uid={t.currentUid || t.uid} /></td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name} {t.isDefault && <span className="idc-badge" style={{ marginLeft: 4 }}>default</span>}</div>
                        <div className="idc-mono idc-tiny idc-muted">{t.code}</div>
                      </td>
                      <td>{PRESETS[t.preset]?.label || t.preset}<div className="idc-mono idc-tiny idc-muted">{t.widthMm} × {t.heightMm} mm{t.hasBack ? ' · two sides' : ''}</div></td>
                      <td>{t.currentVersion ? <>v{t.currentVersion}<div className="idc-tiny idc-muted">{fmtWhen(t.publishedAt)}{t.publishedBy ? ` · ${t.publishedBy}` : ''}</div></> : <span className="idc-muted">Never</span>}
                        {t.versions.some((v) => v.locked && v.status === 'PUBLISHED') && <div className="idc-tiny idc-muted">locked by a print</div>}</td>
                      <td>{t.draftUid ? <span className="idc-badge warn">v{t.versions.find((v) => v.uid === t.draftUid)?.version} draft</span> : <span className="idc-muted">—</span>}</td>
                      <td className="num">{t.liveCards}</td>
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="idc-btn sm" onClick={() => nav.go('designer', { t: openUid(t) })}>Open</button>{' '}
                        {!t.isDefault && t.currentUid && <button type="button" className="idc-btn sm ghost" disabled={!setup.can.publish} onClick={() => write.run(() => api.templateAction(t.currentUid!, 'default'), `${t.name} is the default`)}>Make default</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Rules templates={rows} />
      </div>
      {creating && <NewTemplate rows={rows} onClose={() => setCreating(false)} />}
    </div>
  );
}

function NewTemplate({ rows, onClose }: { rows: TemplateRow[]; onClose: () => void }) {
  const { nav } = useShared();
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [preset, setPreset] = React.useState('CR80');
  const [copyOf, setCopyOf] = React.useState('');
  const write = useWrite();
  const slug = (code || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const create = async () => {
    const t = await write.run(() => api.createTemplate({ name: name.trim(), code: slug, preset, copyOf: copyOf || undefined }), (o) => `${o.name} created`);
    if (t) nav.go('designer', { t: t.uid });
  };
  return (
    <Modal title="New template" onClose={onClose} footer={<>
      <button type="button" className="idc-btn" onClick={onClose}>Cancel</button>
      <button type="button" className="idc-btn primary" disabled={!name.trim() || !slug || write.busy} onClick={create}>Create and open</button>
    </>}>
      <Field label="Name" htmlFor="nt-name"><input id="nt-name" className="idc-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Visitor pass" /></Field>
      <Field label="Code" htmlFor="nt-code" hint={`Used by rules. ${slug ? `Will be ${slug}.` : ''}`}><input id="nt-code" className="idc-input mono" value={code} onChange={(e) => setCode(e.target.value)} placeholder={slug || 'visitor'} /></Field>
      <Field label="Start from" htmlFor="nt-copy">
        <select id="nt-copy" className="idc-select" value={copyOf} onChange={(e) => setCopyOf(e.target.value)}>
          <option value="">A blank card</option>
          {rows.filter((r) => r.currentUid).map((r) => <option key={r.code} value={r.currentUid!}>A copy of {r.name} v{r.currentVersion}</option>)}
        </select>
      </Field>
      {!copyOf && (
        <Field label="Card size" htmlFor="nt-size">
          <select id="nt-size" className="idc-select" value={preset} onChange={(e) => setPreset(e.target.value)}>
            {Object.entries(PRESETS).map(([k, p]) => <option key={k} value={k}>{p.label} · {p.w} × {p.h} mm</option>)}
          </select>
        </Field>
      )}
      {write.error && <div className="idc-banner err">{write.error}</div>}
    </Modal>
  );
}

function Rules({ templates }: { templates: TemplateRow[] }) {
  const { setup } = useShared();
  const q = useRules();
  const write = useWrite();
  const [editing, setEditing] = React.useState<Rule | 'new' | null>(null);
  const rules = q.data?.rules || [];
  const fieldLabel = (p: string) => setup.catalogue.flatMap((g) => g.fields).find((f) => f.path === p)?.label || p;
  const nameOf = (code: string) => templates.find((t) => t.code === code)?.name || code;
  const def = templates.find((t) => t.isDefault);
  const move = async (r: Rule, dir: -1 | 1) => {
    const other = rules[rules.indexOf(r) + dir];
    if (!other) return;
    await write.run(async () => {
      await api.patchRule(r.uid, { priority: other.priority });
      await api.patchRule(other.uid, { priority: r.priority });
    });
  };
  return (
    <div className="idc-panel">
      <div className="idc-panel-h">
        <h2 className="idc-h2">Rules</h2>
        <span className="idc-small idc-muted">Which template a card is issued on. The first rule that matches wins; otherwise the default{def ? ` (${def.name})` : ''}.</span>
        <span className="idc-spacer" />
        <button type="button" className="idc-btn" disabled={!setup.can.publish} onClick={() => setEditing('new')}>Add rule</button>
      </div>
      {write.error && <div className="idc-panel-b"><div className="idc-banner err">{write.error}</div></div>}
      {!rules.length ? (
        <div className="idc-panel-b idc-small idc-muted">No rules: every card is issued on the default template.</div>
      ) : (
        <table className="idc-table">
          <thead><tr><th style={{ width: 50 }}>Order</th><th>Rule</th><th>When</th><th>Template</th><th>On</th><th /></tr></thead>
          <tbody>
            {rules.map((r, i) => (
              <tr key={r.uid} style={{ opacity: r.enabled ? 1 : 0.55 }}>
                <td className="idc-mono">{i + 1}</td>
                <td>{r.label}</td>
                <td>{describeCondition(r.condition, fieldLabel)}</td>
                <td>{nameOf(r.templateCode)}</td>
                <td><input type="checkbox" className="idc-check" checked={r.enabled} disabled={!setup.can.publish} aria-label={`Rule ${r.label} on`}
                  onChange={(e) => write.run(() => api.patchRule(r.uid, { enabled: e.target.checked }))} /></td>
                <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                  <button type="button" className="idc-btn sm ghost" aria-label="Move up" disabled={!i || !setup.can.publish} onClick={() => move(r, -1)}>↑</button>
                  <button type="button" className="idc-btn sm ghost" aria-label="Move down" disabled={i === rules.length - 1 || !setup.can.publish} onClick={() => move(r, 1)}>↓</button>
                  <button type="button" className="idc-btn sm" disabled={!setup.can.publish} onClick={() => setEditing(r)}>Edit</button>{' '}
                  <button type="button" className="idc-btn sm ghost danger" disabled={!setup.can.publish} onClick={() => write.run(() => api.deleteRule(r.uid), 'Rule removed')}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing && <RuleModal rule={editing === 'new' ? null : editing} templates={templates} onClose={() => setEditing(null)} />}
    </div>
  );
}

export function ConditionEditor({ value, onChange }: { value: Cond | null; onChange: (c: Cond | null) => void }) {
  const { setup } = useShared();
  const fields = setup.catalogue.flatMap((g) => g.fields.filter((f) => f.type !== 'image' || f.path === 'employee.photo').map((f) => ({ ...f, group: g.label })));
  const field = fields.find((f) => f.path === value?.path);
  const ops = operatorsFor(field?.type);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr)', gap: 6 }}>
      <select className="idc-select" aria-label="Field" value={value?.path || ''} onChange={(e) => {
        const f = fields.find((x) => x.path === e.target.value);
        onChange(e.target.value ? { op: operatorsFor(f?.type)[0][0], path: e.target.value, value: '' } : null);
      }}>
        <option value="">Always</option>
        {setup.catalogue.map((g) => (
          <optgroup key={g.id} label={g.label}>{g.fields.map((f) => <option key={f.path} value={f.path}>{f.label}</option>)}</optgroup>
        ))}
      </select>
      <select className="idc-select" aria-label="Operator" value={value?.op || ''} disabled={!value} onChange={(e) => value && onChange({ ...value, op: e.target.value })}>
        {ops.map(([op, l]) => <option key={op} value={op}>{l}</option>)}
      </select>
      {value && operatorNeedsValue(value.op) ? (
        field?.options?.length ? (
          <select className="idc-select" aria-label="Value" value={String(value.value ?? '')} onChange={(e) => onChange({ ...value, value: e.target.value })}>
            <option value="">Choose…</option>{field.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : <input className="idc-input" aria-label="Value" value={String(value.value ?? '')} onChange={(e) => onChange({ ...value, value: e.target.value })} placeholder="Value" />
      ) : <span />}
    </div>
  );
}

function RuleModal({ rule, templates, onClose }: { rule: Rule | null; templates: TemplateRow[]; onClose: () => void }) {
  const [label, setLabel] = React.useState(rule?.label || '');
  const [code, setCode] = React.useState(rule?.templateCode || templates.find((t) => !t.isDefault)?.code || templates[0]?.code || '');
  const [cond, setCond] = React.useState<Cond | null>(rule?.condition || null);
  const write = useWrite();
  const save = async () => {
    const body = { label: label.trim(), templateCode: code, condition: cond || { op: 'isNotEmpty', path: 'employee.employeeCode' } };
    if (await write.run(() => (rule ? api.patchRule(rule.uid, body) : api.createRule(body)), 'Rule saved')) onClose();
  };
  return (
    <Modal title={rule ? 'Edit rule' : 'Add rule'} onClose={onClose} wide footer={<>
      <button type="button" className="idc-btn" onClick={onClose}>Cancel</button>
      <button type="button" className="idc-btn primary" disabled={!label.trim() || !code || write.busy} onClick={save}>Save rule</button>
    </>}>
      <Field label="Name" htmlFor="r-label"><input id="r-label" className="idc-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Contractors get the contractor card" autoFocus /></Field>
      <Field label="When"><ConditionEditor value={cond} onChange={setCond} /></Field>
      <Field label="Issue on" htmlFor="r-t">
        <select id="r-t" className="idc-select" value={code} onChange={(e) => setCode(e.target.value)}>
          {templates.map((t) => <option key={t.code} value={t.code}>{t.name}{t.currentVersion ? '' : ' (not published)'}</option>)}
        </select>
      </Field>
      {write.error && <div className="idc-banner err">{write.error}</div>}
    </Modal>
  );
}
