'use client';

/**
 * Component library (§2-§8): every pay component and the bases it counts
 * toward. The flags are the primary interface -- one row per component, one
 * column per base -- because one wrong flag makes every payslip wrong in the
 * same direction, quietly, for years.
 *
 * A flag change is a new version of the component from a date, with a
 * reason; structures built before it keep resolving their own version. A
 * statutory flag may be set, never unset -- the rule lives in the rule book.
 * The effects panel shows the taka consequence, and what it would be with
 * basic alone.
 */

import * as React from 'react';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { useAccounts } from './hooks';
import { Drawer, Field, MIN_REASON, SectionTitle, todayISO, useWrite } from './parts';
import * as api from './api';
import type { BaseMeta, Component, Summary } from './types';

const CHECK = 'M5 12.5l4.5 4.5L19 7.5';
const DASH = 'M6 12h12';

export function ComponentsTab({ summary, gross, setGross, template, setTemplate }: {
  summary: Summary; gross: string; setGross: (v: string) => void; template: string; setTemplate: (v: string) => void;
}) {
  const { components, bases, effects, readiness, can } = summary;
  const [ask, setAsk] = React.useState<{ c: Component; base: BaseMeta; to: boolean } | null>(null);
  const [gl, setGl] = React.useState<Component | null>(null);
  const [refused, setRefused] = React.useState<string | null>(null);
  const write = useWrite();

  const toggle = (c: Component, base: BaseMeta) => {
    const on = c.flags[base.index];
    if (c.flagsFrozen || (on && c.lockedFlags.includes(base.field))) {
      setRefused(`${c.name} is statutory — its bases cannot be unset. Rules module, not company data.`);
      return;
    }
    if (c.isDeduction && base.field !== 'prorate_part_month') {
      setRefused(`${c.name} is a deduction: a deduction enters no earnings base.`);
      return;
    }
    setRefused(null);
    setAsk({ c, base, to: !on });
  };

  return (
    <div className="pl-stack">
      <section className="bd-card pl-card">
        <SectionTitle en="Component library" bn="বেতনের উপাদান">
          Each component declares what it counts toward. These flags are the whole statutory chain: house rent is taxable and prorates, but it is not in
          the provident fund, overtime or gratuity base.
        </SectionTitle>
        {!readiness.ready && (
          <div className="bd-note bd-tone-blocked pl-row-between" role="alert">
            <span>{readiness.message} ({readiness.blocked.map((b) => b.code).join(', ')})</span>
            {can.gl && <button type="button" className="bd-btn" onClick={() => write.run(() => api.createPayrollAccounts(), (o) => `${o.mapped.length} components mapped${o.created.length ? `, ${o.created.length} accounts created` : ''}`)}>Create the payroll accounts</button>}
          </div>
        )}
        {refused && <div className="bd-note bd-tone-warn" role="status">{refused}</div>}
        {write.error && <div className="bd-note bd-tone-blocked" role="alert">{write.error}</div>}
        <div className="pl-scrollx">
          <table className="pl-flags">
            <caption className="sr-only">Components and the bases each counts toward</caption>
            <thead>
              <tr>
                <th scope="col" className="pl-left">Component</th>
                <th scope="col" className="pl-left">Calculation</th>
                {bases.map((b) => <th key={b.field} scope="col" title={`${b.label}: ${b.governs}`}><span className="pl-vert">{b.label}</span></th>)}
                <th scope="col" className="pl-left">GL account</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.code} className={c.isDeduction ? 'pl-deduction' : undefined}>
                  <th scope="row" className="pl-left">
                    <div className="pl-cname">{c.name} {c.isStatutory && <span className="pl-lock" title={c.statutoryBasis || 'Statutory'}>statutory</span>}</div>
                    <div className="pl-code"><span className="bd-mono">{c.code}</span> · v{c.version}{c.nameBn && <> · <span lang="bn">{c.nameBn}</span></>}</div>
                  </th>
                  <td className="pl-calc">{calcText(c)}{c.usage ? <div className="pl-code">{c.usage} live lines</div> : null}</td>
                  {bases.map((b) => {
                    const on = c.flags[b.index];
                    const locked = c.flagsFrozen || (on && c.lockedFlags.includes(b.field));
                    return (
                      <td key={b.field} className="pl-cell">
                        <button type="button" className={`pl-toggle${on ? ' on' : ''}${locked ? ' locked' : ''}`} aria-pressed={on}
                          aria-label={`${c.name} · ${b.label}`} disabled={!can.flags} onClick={() => toggle(c, b)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d={on ? CHECK : DASH} />
                          </svg>
                        </button>
                      </td>
                    );
                  })}
                  <td className="pl-gl">
                    {c.gl ? <span><span className="bd-mono">{c.gl.code}</span> · {c.gl.title}</span> : <span className="pl-unmapped">Not mapped</span>}
                    {can.gl && <button type="button" className="pl-link" onClick={() => setGl(c)}>{c.gl ? 'Change' : 'Map'}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!can.flags && <div className="pl-hint">Changing a base needs the change component flags permission — separate, and consequential.</div>}
      </section>

      <section className="bd-card pl-card" aria-live="polite">
        <SectionTitle en="What the flags do" bn="ফ্ল্যাগের প্রভাব">
          On a gross of ৳{Number(effects.gross).toLocaleString('en-IN')} on the {template} template: each figure, and what it would be with basic alone.
        </SectionTitle>
        <div className="pl-row">
          <Field label="Gross" htmlFor="pl-gross"><input id="pl-gross" className="bd-input bd-mono" inputMode="numeric" value={gross} onChange={(e) => setGross(e.target.value.replace(/[^\d]/g, ''))} style={{ width: 140 }} /></Field>
          <Field label="Template" htmlFor="pl-eff-t">
            <select id="pl-eff-t" className="bd-input" value={template} onChange={(e) => setTemplate(e.target.value)} style={{ width: 200 }}>
              {['officer', 'worker', 'staff'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <Effects summary={summary} />
      </section>

      {ask && <FlagDialog ask={ask} onClose={() => setAsk(null)} />}
      {gl && <GlDrawer c={gl} onClose={() => setGl(null)} />}
    </div>
  );
}

function calcText(c: Component) {
  if (c.calcBasis === 'DERIVED') return `Derived — ${c.calcExpression}`;
  const label: Record<string, string> = { PCT_OF_GROSS: '% of gross', PCT_OF_BASIC: '% of basic', FIXED: 'Fixed amount', PER_SHIFT: 'Per shift' };
  return `${c.isDeduction ? 'Deduction · ' : ''}${label[c.calcBasis] || c.calcBasis}`;
}

function Effects({ summary }: { summary: Summary }) {
  const { money } = useLang();
  const { now, basicOnly } = summary.effects;
  const k = now.constants;
  const cards = [
    { label: 'Overtime hourly rate', v: now.overtimeHourly, alt: basicOnly.overtimeHourly, how: `Overtime base ÷ ${k.otDivisor} × ${k.otMultiplier} (s.108)`, src: now.sources.otDivisor },
    { label: 'Provident fund, each side', v: now.pfEmployee, alt: basicOnly.pfEmployee, how: `${Number(k.pfRateEmployee) * 100}% of the PF base (company election)`, src: now.sources.pfRate },
    { label: 'Gratuity accrual, monthly', v: now.gratuityMonthly, alt: basicOnly.gratuityMonthly, how: `Gratuity base ÷ 30 × ${k.gratuityDays} days ÷ 12`, src: now.sources.gratuityDays },
    { label: 'Festival bonus, monthly', v: now.festivalMonthly, alt: basicOnly.festivalMonthly, how: `Festival base × ${k.festivalCount} ÷ 12`, src: now.sources.festivalCount },
  ];
  return (
    <div className="pl-effects">
      {cards.map((c) => (
        <div key={c.label} className="pl-effect">
          <div className="bd-stat-caption">{c.label}</div>
          <div className="pl-effect-fig bd-mono">{money(c.v, 2)}</div>
          <div className="pl-hint">{c.v === c.alt ? `Only basic is in this base: ${money(c.alt, 2)}.` : `With basic alone it would be ${money(c.alt, 2)}.`}</div>
          <div className="pl-hint">{c.how}{c.src?.citation ? ` · ${c.src.citation}` : ''}{c.src?.confidence && c.src.confidence !== 'POLICY' ? ` · ${c.src.confidence.toLowerCase()}` : ''}</div>
        </div>
      ))}
    </div>
  );
}

function FlagDialog({ ask, onClose }: { ask: { c: Component; base: BaseMeta; to: boolean }; onClose: () => void }) {
  const [reason, setReason] = React.useState('');
  const [from, setFrom] = React.useState(todayISO());
  const write = useWrite();
  const { c, base, to } = ask;
  const go = async () => {
    const out = await write.run(() => api.changeFlags(c.uid, { [base.field]: to }, from, reason.trim()),
      (o) => `${c.name} is now version ${o.version}: ${to ? 'in' : 'out of'} the ${base.label.toLowerCase()} from ${from}`);
    if (out) onClose();
  };
  return (
    <Drawer id="pl-flag" title={`${to ? 'Add' : 'Remove'} ${c.name} ${to ? 'to' : 'from'} the ${base.label.toLowerCase()}`}
      sub={`${base.label}: ${base.governs}.`} onClose={onClose}>
      <p className="pl-p">
        {to ? 'Adding' : 'Removing'} it changes every structure built from that date: {c.usage ? `${c.usage} live lines carry ${c.code}.` : `no live structure carries ${c.code} yet.`}{' '}
        It becomes version {c.version + 1}; structures built before keep version {c.version}, so no past payslip is restated.
      </p>
      {!to && c.isStatutory && <div className="bd-note bd-tone-warn">A statutory base cannot be removed here.</div>}
      <Field label="From" htmlFor="pl-flag-from" hint="Structures effective on or after this date use the new version.">
        <input id="pl-flag-from" type="date" className="bd-input" value={from} onChange={(e) => setFrom(e.target.value)} />
      </Field>
      <Field label="Reason" htmlFor="pl-flag-r" hint={`Recorded with the before and after of this flag. At least ${MIN_REASON} characters.`} error={write.error}>
        <textarea id="pl-flag-r" className="bd-input" style={{ height: 80, padding: 10 }} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Board decision BR-2027-03" />
      </Field>
      <div className="pl-actions">
        <button type="button" className="bd-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="bd-btn-primary" disabled={reason.trim().length < MIN_REASON || !from || write.busy} onClick={go}>{to ? 'Add to the base' : 'Remove from the base'}</button>
      </div>
    </Drawer>
  );
}

function GlDrawer({ c, onClose }: { c: Component; onClose: () => void }) {
  const accounts = useAccounts(true);
  const [pick, setPick] = React.useState(c.gl?.uid || '');
  const write = useWrite();
  const list = accounts.data?.accounts || [];
  const suggested = c.suggestedGl ? list.find((a) => a.title.toLowerCase() === c.suggestedGl!.title.toLowerCase()) : undefined;
  return (
    <Drawer id="pl-gl" title={`GL account for ${c.name}`} sub="An unmapped component blocks the payroll journal: the journal would not balance." onClose={onClose}>
      {c.suggestedGl && <p className="pl-p">Expected: <span className="bd-mono">{c.suggestedGl.code}</span> · {c.suggestedGl.title}{suggested ? ' — found in your chart of accounts.' : ' — not in your chart of accounts yet.'}</p>}
      <Field label="Account" htmlFor="pl-gl-a">
        <select id="pl-gl-a" className="bd-input" value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">Not mapped</option>
          {list.map((a) => <option key={a.uid} value={a.uid}>{a.code ? `${a.code} · ` : ''}{a.title} ({a.kind.toLowerCase()})</option>)}
        </select>
      </Field>
      {write.error && <div className="bd-error" role="alert">{write.error}</div>}
      <div className="pl-actions">
        <button type="button" className="bd-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="bd-btn-primary" disabled={write.busy || pick === (c.gl?.uid || '')}
          onClick={async () => { if (await write.run(() => api.mapGl(c.uid, pick || null), pick ? 'Mapped' : 'Unmapped')) onClose(); }}>Save</button>
      </div>
    </Drawer>
  );
}
