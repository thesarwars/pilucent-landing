'use client';

/**
 * Who changed which election, when, and why (§1) -- with the consequence
 * preview the approver saw, so "we did not know it would cost that" is
 * answerable from the record.
 */

import * as React from 'react';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { dateBD, delta } from './fmt';
import { useChangelog } from './hooks';
import type { AuditRow, Summary } from './types';

export function ChangelogTab({ s }: { s: Summary }) {
  const [key, setKey] = React.useState<string | null>(null);
  const q = useChangelog(key);
  return (
    <div className="ps-stack">
      <section className="bd-card ps-card" aria-labelledby="ps-log">
        <div className="pl-row-between">
          <h2 id="ps-log" className="ps-section-title">Changelog <span lang="bn" className="ps-gloss">পরিবর্তনের খতিয়ান</span></h2>
          <label className="ps-scope">
            <span className="bd-label">Election</span>
            <select className="bd-input" value={key ?? ''} onChange={(e) => setKey(e.target.value || null)}>
              <option value="">Everything</option>
              {s.elections.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
          </label>
        </div>
        {q.isLoading ? <LoadingBlock /> : q.error ? <ErrorBlock error={q.error} onRetry={() => q.refetch()} /> : !q.data?.changelog.length ? (
          <div className="bd-note bd-tone-neutral">Nothing has been changed yet.</div>
        ) : (
          <ol className="ps-log">
            {q.data.changelog.map((a) => <LogRow key={a.uid} a={a} labels={Object.fromEntries(s.elections.map((e) => [e.key, e]))} />)}
          </ol>
        )}
      </section>
    </div>
  );
}

const show = (v: any, options: { value: string; label: string }[] = []): string => {
  if (v === null || v === undefined) return 'nothing';
  if (typeof v !== 'object') return String(v);
  if ('value' in v || 'data' in v) {
    const parts = [options.find((o) => o.value === v.value)?.label ?? v.value, v.data && (v.data.components ? v.data.components.join(' + ') : v.data.bands ? `${v.data.bands.length} bands` : Object.entries(v.data).filter(([, on]) => on === true).map(([k]) => k).join(', ')), v.standardMonthHours && `${v.standardMonthHours} h`];
    return parts.filter(Boolean).join(' · ') || 'nothing';
  }
  if ('applies' in v) return `${v.applies ? 'applies' : 'does not apply'}${v.config?.employerRatePct ? ` · PF ${Number(v.config.employeeRatePct)}% / ${Number(v.config.employerRatePct)}%` : ''}`;
  if ('expense' in v) return `${v.expense?.label ?? 'no expense'} · ${v.liability?.label ?? 'no liability'}`;
  if ('frequency' in v) return `${v.frequency.toLowerCase()}${v.paymentDay ? `, paid day ${v.paymentDay}` : ''}`;
  if ('employee' in v) return `${v.employee}`;
  return JSON.stringify(v);
};

function LogRow({ a, labels }: { a: AuditRow; labels: Record<string, { label: string; options: { value: string; label: string }[] }> }) {
  const opts = a.key ? labels[a.key]?.options ?? [] : [];
  const what = a.key ? labels[a.key]?.label ?? a.key : a.scheme ? a.scheme.replace('_', ' ').toLowerCase() : 'schedule';
  const imp = a.impact;
  return (
    <li className="ps-log-row">
      <div className="ps-h-top">
        <strong>{a.label}: {what}</strong>
        <span className="bd-mono ps-hint">{dateBD(a.at)}</span>
      </div>
      <div className="ps-hint">{show(a.from, opts)} → {show(a.to, opts)}{a.effectiveFrom ? `, from ${dateBD(a.effectiveFrom)}` : ''}{a.site ? ` · ${a.site.name}` : ''}</div>
      <div className="ps-hint">{a.decidedBy ?? 'System'}{a.approvedBy ? `, approved by ${a.approvedBy}` : ''}{a.reason ? ` — “${a.reason}”` : ''}</div>
      {imp && (imp.deltaMonthly != null || imp.deltaExposure != null || imp.deltaAnnual != null) && (
        <div className="ps-hint">Preview shown: {imp.deltaMonthly != null ? `${delta(imp.deltaMonthly)} a month` : imp.deltaExposure != null ? `exposure ${delta(imp.deltaExposure)}` : `${delta(imp.deltaAnnual)} a year`}{imp.affectedEmployees != null ? `, ${imp.affectedEmployees} ${imp.affectedEmployees === 1 ? 'employee' : 'employees'}` : ''}.</div>
      )}
    </li>
  );
}
