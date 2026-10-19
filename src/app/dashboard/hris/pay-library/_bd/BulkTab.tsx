'use client';

/**
 * Bulk revision (§10): a rise across a cohort, previewed before it commits.
 * The preview is stored and apply refuses without it -- 148 structures
 * nobody checked is the failure. An overridden structure is excluded by
 * default: the override is a decision that this person is an exception.
 * Each employee goes through the salary module's own revision, so the same
 * floors refuse, by name.
 */

import * as React from 'react';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useBulk, useBulkOne, useTemplates } from './hooks';
import { Field, SectionTitle, useWrite } from './parts';
import * as api from './api';
import type { Bulk } from './types';

const GRADES = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];
const METHODS: [Bulk['method'], string][] = [['PCT_INCREASE', 'Percentage increase'], ['FIXED_INCREASE', 'Fixed increase'], ['NEW_GROSS', 'New gross'], ['CHANGE_TEMPLATE', 'Change template']];
const ROUNDING: [string, string][] = [['NEAREST_100', 'Nearest ৳100'], ['NEAREST_500', 'Nearest ৳500'], ['NEAREST_10', 'Nearest ৳10'], ['NEAREST_1', 'Nearest ৳1'], ['NONE', 'No rounding']];

function nextMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 12).toISOString().slice(0, 10);
}

export function BulkTab() {
  const q = useBulk();
  const templates = useTemplates();
  const [open, setOpen] = React.useState<string | null>(null);
  const [grades, setGrades] = React.useState<string[]>([]);
  const [codes, setCodes] = React.useState('');
  const [method, setMethod] = React.useState<Bulk['method']>('PCT_INCREASE');
  const [value, setValue] = React.useState('8');
  const [target, setTarget] = React.useState('');
  const [rounding, setRounding] = React.useState('NEAREST_100');
  const [effective, setEffective] = React.useState(nextMonth());
  const [includeOverridden, setIncludeOverridden] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const write = useWrite();
  if (q.isLoading) return <LoadingBlock />;
  if (q.error || !q.data) return <ErrorBlock error={q.error} onRetry={() => q.refetch()} />;
  const can = q.data.can;
  const scopeText = [grades.length ? grades.join(', ') : 'every grade', codes.trim() ? `${codes.split(/[\s,]+/).filter(Boolean).length} named employees` : null].filter(Boolean).join(' · ');
  const preview = async () => {
    const b = await write.run(async () => {
      const made = await api.createBulk({
        scope: { grades, employeeCodes: codes.split(/[\s,]+/).filter(Boolean) }, method, value: method === 'CHANGE_TEMPLATE' ? null : value,
        targetTemplate: method === 'CHANGE_TEMPLATE' ? target : null, rounding, effectiveFrom: effective, includeOverridden, reason,
      });
      return api.bulkAction(made.uid, 'preview');
    }, (o) => `${o.reference}: ${o.affected} to revise, ${o.refused} refused`);
    if (b) setOpen(b.uid);
  };
  return (
    <div className="pl-stack">
      <section className="bd-card pl-card">
        <SectionTitle en="Bulk revision" bn="একযোগে বেতন সংশোধন">
          A rise across a cohort, previewed before it commits. Each employee is revised exactly as a revision made by hand — the same floors, the same arrears.
        </SectionTitle>
        {!can.figures ? <div className="bd-note bd-tone-neutral">A bulk revision shows everyone’s pay: it needs the salary figures permission.</div> : (
          <>
            <div className="pl-grid3">
              <Field label="Method" htmlFor="pl-b-m"><select id="pl-b-m" className="bd-input" value={method} onChange={(e) => setMethod(e.target.value as Bulk['method'])}>{METHODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
              {method === 'CHANGE_TEMPLATE' ? (
                <Field label="To template" htmlFor="pl-b-t">
                  <select id="pl-b-t" className="bd-input" value={target} onChange={(e) => setTarget(e.target.value)}>
                    <option value="">Choose…</option>{(templates.data?.templates || []).filter((t) => t.status === 'PUBLISHED').map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
                  </select>
                </Field>
              ) : (
                <Field label={method === 'PCT_INCREASE' ? 'Percent' : 'Amount (৳)'} htmlFor="pl-b-v"><input id="pl-b-v" className="bd-input bd-mono" value={value} onChange={(e) => setValue(e.target.value)} /></Field>
              )}
              <Field label="Rounding" htmlFor="pl-b-r" hint="Nearest ৳100 is the convention for a published increment."><select id="pl-b-r" className="bd-input" value={rounding} onChange={(e) => setRounding(e.target.value)}>{ROUNDING.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
              <Field label="Effective" htmlFor="pl-b-e"><input id="pl-b-e" type="date" className="bd-input" value={effective} onChange={(e) => setEffective(e.target.value)} /></Field>
              <Field label="Employees (optional)" htmlFor="pl-b-c" hint="Codes, comma separated. Empty: everyone in the grades."><input id="pl-b-c" className="bd-input bd-mono" value={codes} onChange={(e) => setCodes(e.target.value)} placeholder="EMP-0001, EMP-0002" /></Field>
              <Field label="Reason" htmlFor="pl-b-why"><input id="pl-b-why" className="bd-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Annual increment 2027" /></Field>
            </div>
            <div className="bd-label" style={{ marginTop: 12 }}>Grades</div>
            <div className="pl-chips" role="group" aria-label="Grades">
              {GRADES.map((g) => <button key={g} type="button" className="bd-filter" aria-pressed={grades.includes(g)} onClick={() => setGrades(grades.includes(g) ? grades.filter((x) => x !== g) : [...grades, g])}>{g}</button>)}
            </div>
            <label className="pl-check"><input type="checkbox" checked={includeOverridden} onChange={(e) => setIncludeOverridden(e.target.checked)} /><span>Include overridden structures — off by default: an override is a decision that this person is an exception.</span></label>
            {write.error && <div className="bd-note bd-tone-blocked" role="alert">{write.error}</div>}
            <div className="pl-actions">
              <span className="pl-hint">{scopeText}</span>
              <button type="button" className="bd-btn-primary" disabled={!can.preview || write.busy || (method === 'CHANGE_TEMPLATE' ? !target : !value) || !effective} onClick={preview}>Preview</button>
            </div>
          </>
        )}
      </section>
      {open && <BulkPreview uid={open} canApply={can.apply} />}
      {q.data.revisions.length > 0 && (
        <section className="bd-card pl-card">
          <SectionTitle en="Revisions" bn="সংশোধনসমূহ" />
          <table className="bd-table">
            <thead><tr><th scope="col">Reference</th><th scope="col">Method</th><th scope="col">Effective</th><th scope="col" className="pl-num">Revised</th><th scope="col" className="pl-num">Refused</th><th scope="col">Status</th></tr></thead>
            <tbody>{q.data.revisions.map((b) => (
              <tr key={b.uid} className="pl-click" onClick={() => setOpen(b.uid)}>
                <th scope="row" className="bd-mono">{b.reference}</th><td>{METHODS.find(([v]) => v === b.method)?.[1]}{b.value ? ` ${b.value}` : ''}{b.targetTemplate ? ` → ${b.targetTemplate}` : ''}</td>
                <td className="bd-mono">{b.effectiveFrom}</td><td className="bd-mono pl-num">{b.affected}</td><td className="bd-mono pl-num">{b.refused}</td><td>{b.status.toLowerCase()}</td>
              </tr>
            ))}</tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function BulkPreview({ uid, canApply }: { uid: string; canApply: boolean }) {
  const q = useBulkOne(uid);
  const { money, n } = useLang();
  const write = useWrite();
  if (q.isLoading || !q.data) return <LoadingBlock />;
  const b = q.data;
  const p = b.preview;
  return (
    <section className="bd-card pl-card" aria-live="polite">
      <SectionTitle en={`${b.reference} · ${b.status.toLowerCase()}`} bn="প্রিভিউ">
        {p ? `${n(b.affected)} to revise from ${b.effectiveFrom}, ${n(b.refused)} refused. Monthly change ${money(p.total)}.` : 'Not previewed.'}
      </SectionTitle>
      {p && p.refusals.length > 0 && (
        <div className="bd-note bd-tone-warn">
          <b>Refused, with reasons:</b>
          <ul className="pl-list">{p.refusals.map((r) => <li key={r.code}><span className="bd-mono">{r.code}</span> {r.nameEn} — {r.reason}</li>)}</ul>
        </div>
      )}
      {p && p.rows.length > 0 && (
        <div className="pl-scrollx">
          <table className="bd-table">
            <thead><tr><th scope="col">Employee</th><th scope="col">Template</th><th scope="col" className="pl-num">Gross now</th><th scope="col" className="pl-num">Proposed</th><th scope="col" className="pl-num">Change</th><th scope="col" className="pl-num">Basic</th></tr></thead>
            <tbody>{p.rows.map((r) => (
              <tr key={r.code}>
                <th scope="row">{r.nameEn} <span className="bd-mono pl-code">{r.code}</span>{r.warnings.length > 0 && <div className="pl-hint">{r.warnings.join(' ')}</div>}</th>
                <td>{r.template}{r.newTemplate !== r.template ? ` → ${r.newTemplate}` : ''}</td>
                <td className="bd-mono pl-num">{money(r.currentGross)}</td><td className="bd-mono pl-num">{money(r.proposedGross)}</td>
                <td className="bd-mono pl-num">{money(r.delta)}</td><td className="bd-mono pl-num">{money(r.basic)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {write.error && <div className="bd-note bd-tone-blocked" role="alert">{write.error}</div>}
      {b.status === 'PREVIEWED' && (
        <div className="pl-actions">
          <span className="pl-hint">Applies exactly what is shown. Anyone whose structure changed since is refused; preview again.</span>
          <button type="button" className="bd-btn-primary" disabled={!canApply || write.busy || !b.affected}
            onClick={() => write.run(() => api.bulkAction(b.uid, 'apply'), (o) => `${o.reference} applied`)} title={!canApply ? 'Applying needs the apply bulk revision permission — separate from preview' : undefined}>
            Apply to {n(b.affected)} employees
          </button>
        </div>
      )}
      {b.status === 'APPLIED' && <div className="bd-note bd-tone-ok">Applied {b.appliedAt?.slice(0, 10)}{b.appliedBy ? ` by ${b.appliedBy}` : ''}. Each employee has a new structure from {b.effectiveFrom}; their history shows it.</div>}
    </section>
  );
}
