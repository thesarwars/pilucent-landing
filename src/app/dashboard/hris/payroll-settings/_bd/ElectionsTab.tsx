'use client';

/**
 * The seven elections (§7). Each shows its options, what each costs on this
 * company's own payroll (from the roster, §6.1 of the backend spec), the
 * section it rests on, and that it is the company's choice.
 *
 * Four have no default (§1.2): unanswered until somebody chooses, and an
 * unanswered election blocks the run. A first election is in force at once;
 * changing one is a proposal a second person approves, carrying the
 * preview they saw.
 */

import * as React from 'react';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { Chip, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { Drawer, Field, MIN_REASON, todayISO, useWrite } from '@/app/dashboard/hris/pay-library/_bd/parts';
import * as api from './api';
import { dateBD, delta, lakh, valueLabel } from './fmt';
import { useHistory, usePreview } from './hooks';
import type { Band, Can, Election, ElectionData, ElectionKey, ElectionRow, Org, Preview, PreviewOption, Summary } from './types';

const COMPONENTS: [string, string][] = [['BASIC', 'Basic'], ['DA', 'Dearness allowance'], ['HRA', 'House rent'], ['MED', 'Medical'], ['CONV', 'Conveyance'], ['FOOD', 'Food'], ['OTHER', 'Other']];
const DEFAULT_BANDS: Band[] = [
  { fromMonths: 0, toMonths: 2, pct: '0' }, { fromMonths: 3, toMonths: 5, pct: '25' },
  { fromMonths: 6, toMonths: 8, pct: '50' }, { fromMonths: 9, toMonths: 11, pct: '75' },
];

export function ElectionsTab({ s, site }: { s: Summary; site: string | null }) {
  const others = s.pendingAll.filter((p) => (p.site?.uid ?? null) !== site);
  return (
    <div className="ps-stack">
      <OrgPanel org={s.org} />
      {others.length > 0 && (
        <div className="bd-note bd-tone-violet">
          {others.length} proposal{others.length === 1 ? '' : 's'} awaiting approval in another scope: {others.map((p) => `${p.key.replace(/_/g, ' ')} (${p.site?.name ?? 'company-wide'})`).join(', ')}.
        </div>
      )}
      {s.elections.map((e) => <ElectionCard key={`${e.key}-${site}`} e={e} site={site} can={s.can} />)}
    </div>
  );
}

/** Every consequence is computed against this, not an abstract employee (§6). */
function OrgPanel({ org }: { org: Org }) {
  const { money, n } = useLang();
  const facts: [string, string][] = [
    ['Headcount', n(org.headcount)], ['Workers', n(org.workers)], ['On overtime', n(org.otEmployees)],
    ['Average basic', money(org.avgBasic)], ['Average gross', money(org.avgGross)],
    ['Under a year', n(org.subOneYear)], ['Gratuity-eligible', n(org.gratuityEligible)],
  ];
  return (
    <section className="bd-card ps-card" aria-labelledby="ps-org">
      <div className="pl-row-between">
        <h2 id="ps-org" className="ps-section-title">This payroll, today <span lang="bn" className="ps-gloss">আজকের বেতন তালিকা</span></h2>
        <span className="ps-hint">From the roster on {dateBD(org.on)}{org.otMonth ? `; overtime hours from ${org.otMonth}` : ''}. Nothing here is stored.</span>
      </div>
      <dl className="ps-facts">
        {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className="bd-mono">{v}</dd></div>)}
      </dl>
      {org.missingStructure > 0 && <div className="ps-hint">{n(org.missingStructure)} {org.missingStructure === 1 ? 'employee has' : 'employees have'} no salary structure in force and {org.missingStructure === 1 ? 'is' : 'are'} left out of every figure.</div>}
    </section>
  );
}

const nextMonthISO = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 1)).toISOString().slice(0, 10);
};

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function initialData(e: Election): ElectionData | null {
  if (e.key === 'days_worked_basis') return (e.resolved.data as ElectionData) ?? { present: true };
  return e.resolved.data ?? null;
}

function ElectionCard({ e, site, can }: { e: Election; site: string | null; can: Can }) {
  const r = e.resolved;
  const [value, setValue] = React.useState<string | null>(r.value);
  const [data, setData] = React.useState<ElectionData | null>(initialData(e));
  const [hours, setHours] = React.useState<number | null>(r.standardMonthHours);
  // A change starts after the election in force; the first of next month is the usual date.
  const [from, setFrom] = React.useState(r.answered && r.source !== 'SEEDED' ? nextMonthISO() : todayISO());
  const [reason, setReason] = React.useState('');
  const [history, setHistory] = React.useState(false);
  const write = useWrite();
  const flags = e.key === 'days_worked_basis';
  const changed = flags ? !same(data, initialData(e)) : value !== r.value || !same(data ?? null, r.data ?? null) || (hours ?? null) !== (r.standardMonthHours ?? null);
  const preview = usePreview(e.key, value, data, hours, site, can.preview);
  const p = preview.data;
  const immediate = !r.answered || r.source === 'SEEDED';
  const needsReason = !immediate;
  const reasonOk = !needsReason || reason.trim().length >= MIN_REASON;
  const valid = (flags || !!value) && (value !== 'CUSTOM' || !!data?.components?.length);
  const titleId = `ps-q-${e.key}`;
  const pickValue = (v: string) => {
    setValue(v);
    if (v === 'BANDED' && !data?.bands) setData({ bands: DEFAULT_BANDS });
    else if (v === 'CUSTOM' && !data?.components) setData({ components: ['BASIC', 'DA'] });
    else if (v !== 'BANDED' && v !== 'CUSTOM') setData(null);
  };
  const submit = () => write.run(
    () => api.elect(e.key, { value, data, standardMonthHours: e.key === 'overtime_base' ? hours : null, effectiveFrom: from, reason, site }),
    (row) => (row.status === 'DRAFT' ? 'Proposed — a second person approves it' : `${e.label} elected`),
  );
  return (
    <section className={`bd-card ps-card ps-election${r.answered ? '' : ' is-unanswered'}`} aria-labelledby={titleId}>
      <div className="ps-el-head">
        <div className="min-w-0">
          <div className="ps-eyebrow">{e.label} <span lang="bn" className="ps-gloss">{e.bn}</span></div>
          <h2 id={titleId} className="ps-question">{e.question}</h2>
          <div className="ps-cite">{r.citation}</div>
        </div>
        <div className="ps-el-status">
          {r.answered ? (
            <Chip tone={r.source === 'SEEDED' ? 'neutral' : 'ok'} dot>{r.source === 'SEEDED' ? 'Preset — not yet chosen' : 'Elected'}</Chip>
          ) : (
            <Chip tone="blocked" dot>Unanswered — blocks the run</Chip>
          )}
          {r.scope === 'SITE' && <Chip tone="violet">Site override</Chip>}
        </div>
      </div>

      {r.answered && (
        <div className="ps-current">
          In force: <strong>{flags ? flagText(e, r.data) : valueLabel(e.options, r.value)}</strong>
          {r.standardMonthHours ? ` · ${r.standardMonthHours} hours a month` : ''} from {dateBD(r.effectiveFrom)}
          {r.decidedBy ? ` · ${r.decidedBy}` : ''}{r.approvedBy ? `, approved by ${r.approvedBy}` : ''}
          <button type="button" className="pl-link ps-link-inline" onClick={() => setHistory(true)}>History</button>
        </div>
      )}

      {flags ? (
        <FlagList e={e} data={data} setData={setData} p={p} disabled={!can.elect} labelledBy={titleId} />
      ) : (
        <div role="radiogroup" aria-labelledby={titleId} aria-required={e.noDefault || undefined} className="ps-options">
          {e.options.map((o) => {
            const opt = p?.options.find((x) => x.value === o.value);
            const id = `ps-${e.key}-${o.value}`;
            return (
              <label key={o.value} htmlFor={id} className={`ps-option${value === o.value ? ' on' : ''}`}>
                <input id={id} type="radio" name={`ps-${e.key}`} value={o.value} checked={value === o.value} disabled={!can.elect} onChange={() => pickValue(o.value)} />
                <span className="ps-option-label">{o.label}{r.value === o.value && <span className="ps-now">in force</span>}</span>
                <span className="bd-mono ps-fig">{opt ? optionFigure(e.key, opt) : preview.isFetching ? '…' : ''}</span>
              </label>
            );
          })}
        </div>
      )}

      {e.key === 'overtime_base' && (
        <div className="pl-row">
          <Field label="Standard month hours" htmlFor="ps-hours" hint="Empty: the rule book's 208 (8 × 26). 208 is conventional, not statute.">
            <input id="ps-hours" className="bd-input bd-mono" inputMode="numeric" style={{ width: 120 }} disabled={!can.elect} value={hours ?? ''}
              onChange={(ev) => setHours(ev.target.value ? Number(ev.target.value.replace(/\D/g, '')) || null : null)} />
          </Field>
        </div>
      )}
      {value === 'CUSTOM' && (
        <ComponentPicker data={data} setData={setData} disabled={!can.elect} />
      )}
      {e.key === 'festival_bonus_policy' && value === 'BANDED' && (
        <BandsEditor bands={data?.bands ?? DEFAULT_BANDS} onChange={(bands) => setData({ bands })} disabled={!can.elect} />
      )}

      {e.key === 'gratuity_basis' && p && <GratuityAt p={p} value={value} />}
      {e.key === 'proration_method' && p?.example && (
        <div className="ps-hint">
          One joiner on {dateBD(p.example.joined)} in a {p.example.daysInMonth}-day month, {lakh(p.example.gross)} gross: {p.example.payableCalendarDays} payable calendar days
          {p.example.payableWorkingDays != null ? `, ${p.example.payableWorkingDays} of ${p.example.workingDaysInMonth} working days on the published calendar` : ', no published calendar for the working-day methods'}.
          {p.example.spread ? ` The four methods differ by ${lakh(p.example.spread)}.` : ''}
        </div>
      )}

      <Consequence e={e} p={p} changed={changed} fetching={preview.isFetching} error={preview.error} />

      {e.pending ? (
        <PendingBox e={e} row={e.pending} can={can} />
      ) : can.elect && changed && (
        <div className="ps-commit">
          <Field label="Effective from" htmlFor={`ps-from-${e.key}`}>
            <input id={`ps-from-${e.key}`} type="date" className="bd-input" value={from} onChange={(ev) => setFrom(ev.target.value)} />
          </Field>
          {needsReason && (
            <Field label="Reason" htmlFor={`ps-why-${e.key}`} hint={`At least ${MIN_REASON} characters. Stored with the preview the approver sees.`}>
              <input id={`ps-why-${e.key}`} className="bd-input" style={{ minWidth: 300 }} value={reason} onChange={(ev) => setReason(ev.target.value)} />
            </Field>
          )}
          <div className="ps-commit-act">
            <button type="button" className="bd-btn-primary" disabled={write.busy || !valid || !reasonOk} onClick={submit}>
              {immediate ? (r.answered ? 'Elect' : 'Elect — in force at once') : 'Propose change'}
            </button>
            {!immediate && <div className="ps-hint">Seven figures move; one person should not move them alone. Someone else approves.</div>}
          </div>
        </div>
      )}
      {write.error && <div className="bd-note bd-tone-blocked" role="alert">{write.error}</div>}
      {history && <HistoryDrawer e={e} site={site} onClose={() => setHistory(false)} />}
    </section>
  );
}

function flagText(e: Election, data: ElectionData | null) {
  const on = e.flags.filter((f) => (data as Record<string, unknown> | null)?.[f.key]).map((f) => f.label.toLowerCase());
  return on.length ? on.join(', ') : 'days present';
}

function optionFigure(key: ElectionKey, o: PreviewOption) {
  if (o.error) return 'calendar needed';
  switch (key) {
    case 'overtime_base': return `${lakh(o.monthlyCost)} / month`;
    case 'proration_method': return o.amount ? lakh(o.amount) : '—';
    case 'gratuity_basis': return `${lakh(o.exposure)} exposure`;
    case 'festival_bonus_policy': return o.annualCost ? `${lakh(o.annualCost)} / year` : '—';
    case 'rounding_mode': return `${lakh(o.companyMonthly)} / month above exact`;
    case 'balancing_component': return o.bases?.length ? `moves ${o.bases.join(', ').toLowerCase()}` : 'moves no base';
    default: return '';
  }
}

function FlagList({ e, data, setData, p, disabled, labelledBy }: { e: Election; data: ElectionData | null; setData: (d: ElectionData) => void; p?: Preview; disabled: boolean; labelledBy: string }) {
  const { n } = useLang();
  const d = (data ?? {}) as Record<string, boolean>;
  return (
    <div role="group" aria-labelledby={labelledBy} className="ps-options">
      {e.flags.map((f) => {
        const row = p?.options.find((x) => x.flag === f.key);
        const always = f.key === 'present';
        const id = `ps-dw-${f.key}`;
        return (
          <label key={f.key} htmlFor={id} className={`ps-option${always || d[f.key] ? ' on' : ''}`}>
            <input id={id} type="checkbox" checked={always || !!d[f.key]} disabled={disabled || always} onChange={(ev) => setData({ ...d, present: true, [f.key]: ev.target.checked })} />
            <span className="ps-option-label">{f.label}{always && <span className="ps-now">always counts (s.117)</span>}</span>
            <span className="bd-mono ps-fig">{row ? `+${n(row.numeratorDays ?? 0)} days → ${n(row.companyLeaveDays ?? 0)} leave ${row.companyLeaveDays === 1 ? 'day' : 'days'} / year` : ''}</span>
          </label>
        );
      })}
    </div>
  );
}

function ComponentPicker({ data, setData, disabled }: { data: ElectionData | null; setData: (d: ElectionData) => void; disabled: boolean }) {
  const comps = data?.components ?? [];
  const toggle = (c: string) => setData({ components: comps.includes(c) ? comps.filter((x) => x !== c) : [...comps, c] });
  return (
    <fieldset className="ps-picker" disabled={disabled}>
      <legend className="bd-label">Components in the base</legend>
      {COMPONENTS.map(([c, label]) => (
        <label key={c} className="ps-pick"><input type="checkbox" checked={comps.includes(c)} onChange={() => toggle(c)} /> {label}</label>
      ))}
      {!comps.length && <div className="bd-error" role="alert">A custom base names at least one component.</div>}
    </fieldset>
  );
}

/** §7.5: contiguous, covering months 0 to 11. A gap at month 6 pays no bonus and raises no error. */
export function bandProblem(bands: Band[]): string | null {
  let prev = -1;
  for (const b of [...bands].sort((a, z) => a.fromMonths - z.fromMonths)) {
    if (b.fromMonths !== prev + 1) return `A gap or overlap at month ${b.fromMonths}.`;
    if (b.toMonths < b.fromMonths) return `A band cannot end before it starts (month ${b.fromMonths}).`;
    const pct = Number(b.pct);
    if (!(pct >= 0 && pct <= 100)) return `A percentage is 0 to 100, got ${b.pct}.`;
    prev = b.toMonths;
  }
  return prev === 11 ? null : `The bands must reach month 11; the last ends at ${prev}.`;
}

function BandsEditor({ bands, onChange, disabled }: { bands: Band[]; onChange: (b: Band[]) => void; disabled: boolean }) {
  const problem = bandProblem(bands);
  const set = (i: number, patch: Partial<Band>) => onChange(bands.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  return (
    <fieldset className="ps-bands" disabled={disabled}>
      <legend className="bd-label">Bands by completed months</legend>
      <table className="bd-table">
        <thead><tr><th scope="col">From month</th><th scope="col">To month</th><th scope="col">% of the bonus</th><th scope="col"><span className="sr-only">Remove</span></th></tr></thead>
        <tbody>
          {bands.map((b, i) => (
            <tr key={i}>
              <td><input aria-label={`Band ${i + 1} from`} className="bd-input bd-mono ps-narrow" value={b.fromMonths} onChange={(ev) => set(i, { fromMonths: Number(ev.target.value) || 0 })} /></td>
              <td><input aria-label={`Band ${i + 1} to`} className="bd-input bd-mono ps-narrow" value={b.toMonths} onChange={(ev) => set(i, { toMonths: Number(ev.target.value) || 0 })} /></td>
              <td><input aria-label={`Band ${i + 1} percent`} className="bd-input bd-mono ps-narrow" value={b.pct} onChange={(ev) => set(i, { pct: ev.target.value.replace(/[^\d.]/g, '') })} /></td>
              <td><button type="button" className="pl-link" onClick={() => onChange(bands.filter((_, j) => j !== i))}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="bd-btn-dashed" onClick={() => { const last = bands[bands.length - 1]; onChange([...bands, { fromMonths: last ? last.toMonths + 1 : 0, toMonths: 11, pct: '100' }]); }}>Add band</button>
      {problem && <div className="bd-error" role="alert">{problem}</div>}
    </fieldset>
  );
}

function GratuityAt({ p, value }: { p: Preview; value: string | null }) {
  const { money } = useLang();
  const rows = p.options.filter((o) => o.at);
  return (
    <div className="pl-scrollx">
      <table className="bd-table ps-at">
        <caption className="ps-hint">One employee at this payroll's average base, at 5, 10 and 15 years — the 10-year breakpoint changes the days per year, which a one-row comparison hides.</caption>
        <thead><tr><th scope="col">Basis</th>{rows[0]?.at?.map((a) => <th key={a.years} scope="col" className="pl-num">{a.years} years ({a.days} days)</th>)}</tr></thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.value} className={o.value === value ? 'ps-row-on' : ''}>
              <th scope="row">{o.label}</th>
              {o.at?.map((a) => <td key={a.years} className="bd-mono pl-num">{money(a.amount)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const people = (n: number | undefined, kind = '') => `${n ?? 0} ${kind}${n === 1 ? 'employee' : 'employees'}`;

/** The consequence of the choice, announced (§14 open item 1). */
function Consequence({ e, p, changed, fetching, error }: { e: Election; p?: Preview; changed: boolean; fetching: boolean; error: unknown }) {
  let line: string | null = null;
  if (p && changed && p.proposed.value !== undefined) {
    const was = e.resolved.answered ? valueLabel(e.options, p.current.value) : 'unanswered';
    const to = valueLabel(e.options, p.proposed.value);
    switch (e.key) {
      case 'overtime_base':
        line = p.deltaMonthly != null ? `From ${was} to ${to}: ${delta(p.deltaMonthly)} a month, ${delta(p.deltaAnnual)} a year, across ${people(p.affectedEmployees)} on overtime.` : `${to}: ${lakh(p.proposed.monthlyCost)} a month in overtime.`;
        break;
      case 'gratuity_basis':
        line = p.deltaExposure != null ? `From ${was} to ${to}: exposure moves ${delta(p.deltaExposure)} across ${people(p.affectedEmployees, 'gratuity-eligible ')}.` : `${to}: ${lakh(p.proposed.exposure)} of gratuity exposure today.`;
        break;
      case 'festival_bonus_policy':
        line = p.deltaAnnual != null ? `From ${was} to ${to}: ${delta(p.deltaAnnual)} a year, all of it on ${people(p.affectedEmployees)} under a year's service.` : `${to}: ${lakh(p.proposed.annualCost)} a year.`;
        break;
      case 'days_worked_basis':
        line = p.deltaLeaveDays != null ? `${p.deltaLeaveDays >= 0 ? '+' : '−'}${Math.abs(p.deltaLeaveDays)} earned-leave days a year across ${p.affectedEmployees ?? 0} ${p.affectedEmployees === 1 ? 'worker' : 'workers'}.` : null;
        break;
      case 'proration_method':
        line = p.proposed.amount ? `The example joiner is paid ${lakh(p.proposed.amount)}${p.current.amount ? ` (${was}: ${lakh(p.current.amount)})` : ''}.` : null;
        break;
      default:
        line = null;
    }
  }
  return (
    <div className="ps-consequence" aria-live="polite" aria-busy={fetching || undefined}>
      {line && <div className="ps-delta">{line}</div>}
      {p?.error && <div className="bd-note bd-tone-warn">{p.error}</div>}
      {error ? <div className="ps-hint">The preview could not be computed.</div> : null}
      {p?.notes?.length ? <ul className="ps-notes">{p.notes.map((n) => <li key={n}>{n}</li>)}</ul> : null}
    </div>
  );
}

function PendingBox({ e, row, can }: { e: Election; row: ElectionRow; can: Can }) {
  const write = useWrite();
  const [why, setWhy] = React.useState('');
  const [rejecting, setRejecting] = React.useState(false);
  const mine = row.decidedByUid === can.me;
  const imp = row.impact;
  const what = e.key === 'days_worked_basis' ? flagText(e, row.data) : valueLabel(e.options, row.value);
  return (
    <div className="ps-pending" role="region" aria-label="Proposal awaiting approval">
      <div className="ps-pending-title">Awaiting approval: {what}{row.standardMonthHours ? ` · ${row.standardMonthHours} hours` : ''} from {dateBD(row.effectiveFrom)}</div>
      <div className="ps-hint">Proposed by {row.decidedBy ?? 'someone'} on {dateBD(row.createdAt)}: “{row.reason}”</div>
      {imp && (
        <div className="ps-hint">
          The preview stored with it:{' '}
          {imp.deltaMonthly != null ? `${delta(imp.deltaMonthly)} a month, ${delta(imp.deltaAnnual)} a year` : imp.deltaExposure != null ? `exposure ${delta(imp.deltaExposure)}` : imp.deltaAnnual != null ? `${delta(imp.deltaAnnual)} a year` : imp.deltaLeaveDays != null ? `${imp.deltaLeaveDays} leave days a year` : 'no money figure'}
          {imp.affectedEmployees != null ? `, ${people(imp.affectedEmployees)}` : ''}.
        </div>
      )}
      <div className="ps-commit">
        {can.approve && (
          <button type="button" className="bd-btn-primary" disabled={write.busy || mine} title={mine ? 'You proposed this; someone else approves it' : undefined}
            onClick={() => write.run(() => api.approve(row.uid), `${e.label} approved`)}>
            Approve
          </button>
        )}
        {(can.approve || mine) && !rejecting && <button type="button" className="bd-btn" onClick={() => setRejecting(true)}>{mine ? 'Withdraw' : 'Reject'}</button>}
        {rejecting && (
          <>
            <input aria-label="Reason" className="bd-input" placeholder={`Reason, at least ${MIN_REASON} characters`} style={{ minWidth: 280 }} value={why} onChange={(ev) => setWhy(ev.target.value)} />
            <button type="button" className="bd-btn" disabled={write.busy || why.trim().length < MIN_REASON} onClick={() => write.run(() => api.reject(row.uid, why), 'Proposal closed')}>Confirm</button>
          </>
        )}
        {mine && <span className="ps-hint">You proposed this, so someone else approves it.</span>}
      </div>
      {write.error && <div className="bd-note bd-tone-blocked" role="alert">{write.error}</div>}
    </div>
  );
}

function HistoryDrawer({ e, site, onClose }: { e: Election; site: string | null; onClose: () => void }) {
  const q = useHistory(e.key, site);
  return (
    <Drawer id="ps-history" title={`${e.label} — history`} sub="Every period, with the section it was made under. A superseded row still governs its own dates." onClose={onClose} width={560}>
      {q.isLoading ? <LoadingBlock /> : (
        <ol className="ps-history">
          {(q.data?.history ?? []).map((h) => (
            <li key={h.uid} className={`ps-h ps-h-${h.status.toLowerCase()}`}>
              <div className="ps-h-top">
                <strong>{e.key === 'days_worked_basis' ? flagText(e, h.data) : valueLabel(e.options, h.value)}</strong>
                <Chip tone={h.status === 'ACTIVE' ? 'ok' : h.status === 'DRAFT' ? 'violet' : h.status === 'REJECTED' ? 'blocked' : 'neutral'}>{h.status.toLowerCase()}</Chip>
              </div>
              <div className="ps-hint">{dateBD(h.effectiveFrom)} – {h.effectiveTo ? dateBD(h.effectiveTo) : 'open'} · {h.citation}{h.ruleSet ? ` · rule set ${h.ruleSet}` : ''}</div>
              <div className="ps-hint">{h.source === 'SEEDED' ? 'Preset' : `${h.decidedBy ?? '—'}${h.approvedBy ? `, approved by ${h.approvedBy}` : ''}`}{h.reason ? ` — “${h.reason}”` : ''}{h.rejectedReason ? ` — rejected: “${h.rejectedReason}”` : ''}</div>
            </li>
          ))}
        </ol>
      )}
    </Drawer>
  );
}
