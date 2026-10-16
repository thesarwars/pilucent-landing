'use client';

/**
 * The two tabs the Leave Operations design adds to the console: maternity
 * (the register, each case's statutory sequence and its benefit) and the
 * quarterly statements (Form-9, and the record of how each reached the
 * worker). Every date, due date and amount comes from the server.
 */

import * as React from 'react';
import { toast } from '@/lib/ToastService';
import { cn } from '@/lib/utils';
import { ConfidenceTag, DrawerHead, ErrorBlock, LoadingBlock, SideDrawer } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import type { Confidence } from '@/app/dashboard/hris/employee/employees/_bd/types';
import { formatBDT } from '@/app/dashboard/hris/employee/employees/_bd/format';
import * as api from './api';
import { fmtDays, longDate, span, todayISO } from './defs';
import { useMaternity, useStatement, useStatements } from './hooks';
import { Empty, Field, Note, Tag, errorText, useWrite } from './parts';
import type { Can, MaternityCase, MaternityEventKind, Restricted } from './types';

const MASK = '৳ ••••••';
const money = (v: string | null | undefined, masked: boolean) => (masked ? MASK : formatBDT(v, { places: 2 }));

const EVENT_CTA: Record<MaternityEventKind, string> = {
  NOTICE: 'Notice',
  PROOF_OF_PREGNANCY: 'Record proof of pregnancy',
  PAY_FIRST: 'Record the first instalment paid',
  DELIVERY: 'Record the delivery',
  PROOF_OF_BIRTH: 'Record proof of birth',
  PAY_SECOND: 'Record the second instalment paid',
  RETURN: 'Record the return to work',
  CANCEL: 'Cancel the case',
};

/* ── maternity register ───────────────────────────────────────────── */

export function MaternityTab({ onNew, onOpen }: { onNew: () => void; onOpen: (reference: string) => void }) {
  const m = useMaternity();
  if (m.isPending) return <LoadingBlock />;
  if (m.isError) return <ErrorBlock error={m.error} onRetry={() => void m.refetch()} />;
  const d = m.data;
  return (
    <>
      <div className="lc-toolbar">
        {d.can.apply && (
          <button type="button" className="lc-btn-primary" onClick={onNew}>
            Record a maternity notice
          </button>
        )}
        <span className="flex-1" />
        <Tag tone="neutral">{d.open} open</Tag>
        <Tag tone={d.overdue ? 'neg' : 'pos'}>{d.overdue} overdue</Tag>
        <Tag tone="violet">Benefit committed {d.masked ? MASK : formatBDT(d.committed, { places: 2 })}</Tag>
      </div>
      {d.rows.length === 0 ? (
        <Empty title="No maternity cases">Recording the notice grants the leave. The benefit, its two instalments and the protection follow from it.</Empty>
      ) : (
        <div className="lc-card lc-table-wrap">
          <table className="lc-table">
            <thead>
              <tr>
                <th scope="col">Case</th>
                <th scope="col">Employee</th>
                <th scope="col">Leave</th>
                <th scope="col">Next</th>
                <th scope="col">Benefit</th>
              </tr>
            </thead>
            <tbody>
              {d.rows.map((c) => (
                <tr
                  key={c.reference}
                  className="is-link"
                  tabIndex={0}
                  onClick={() => onOpen(c.reference)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen(c.reference))}
                >
                  <td className="lc-mono whitespace-nowrap text-[12.5px]">
                    {c.reference}
                    <div className="lc-sub font-sans">{c.statusLabel}</div>
                  </td>
                  <td>
                    <span className="font-semibold">{c.employee.nameEn}</span>
                    <div className="lc-sub">
                      {c.employee.code}
                      {c.employee.department ? ` · ${c.employee.department}` : ''}
                    </div>
                  </td>
                  <td>
                    {c.totalDays} days
                    <div className="lc-sub">{span(c.leaveFrom, c.leaveTo)}</div>
                  </td>
                  <td>
                    <Tag tone={c.next.overdue ? 'neg' : c.next.event ? 'warn' : 'neutral'}>{c.next.label}</Tag>
                    {c.next.due && <div className="lc-sub mt-1">{c.next.overdue ? 'was due' : 'due'} {longDate(c.next.due)}</div>}
                  </td>
                  <td>
                    {c.benefitPayable ? <span className="lc-fig">{money(c.benefit.amount, c.benefit.masked)}</span> : <Tag tone="warn">Not payable — leave only</Tag>}
                    <div className="lc-sub">{c.benefit.basisLabel}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ── one case ─────────────────────────────────────────────────────── */

export function MaternityCaseDrawer({ reference, onClose }: { reference: string; onClose: () => void }) {
  const m = useMaternity();
  const c = m.data?.rows.find((x) => x.reference === reference);
  return (
    <SideDrawer onClose={onClose} labelledBy="lc-case" width={720}>
      <DrawerHead id="lc-case" title={c ? `${c.employee.nameEn} · ${c.reference}` : reference} sub={c ? `${c.statusLabel} · maternity leave, statutory and not refusable` : undefined} onClose={onClose} />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {m.isPending ? <LoadingBlock /> : m.isError ? <ErrorBlock error={m.error} /> : c ? <CaseBody c={c} can={m.data!.can} /> : <Note tone="neg">No case {reference}.</Note>}
      </div>
    </SideDrawer>
  );
}

function CaseBody({ c, can }: { c: MaternityCase; can: Can }) {
  const [restricted, setRestricted] = React.useState<Restricted | null>(null);
  const sch = c.schedule as Record<string, string | null>;
  const notPayable = c.benefitPayable ? null : 'not payable';
  const rows: [string, string | null | undefined][] = [
    ['Leave starts', sch.leaveStart],
    // Absent before the birth: it would be the restricted expected date less a day.
    ...('preNatalEnd' in sch ? ([['Pre-natal leave ends', sch.preNatalEnd]] as [string, string | null][]) : []),
    ['Post-natal leave ends', sch.postNatalEnd],
    ['Expected return', sch.expectedReturn],
    ['First instalment due', notPayable ?? sch.firstInstalmentDue],
    ['Proof of birth due', sch.proofOfBirthDue],
    ['Second instalment due', notPayable ?? sch.secondInstalmentDue],
    ['No employment until', sch.employmentBanEnd],
    ['Protected from dismissal', `${longDate(c.protectionStart)} – ${longDate(c.protectionEnd)}`],
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Tag tone="violet">Statutory · not refusable</Tag>
        <Tag tone={c.benefitPayable ? 'pos' : 'warn'}>{c.benefitPayable ? 'Benefit payable' : 'Benefit not payable — leave only'}</Tag>
        <Tag tone="neutral">
          {c.noticeMethod.toLowerCase()} notice, {longDate(c.noticeDate)}
        </Tag>
      </div>
      <p className="lc-caption m-0">{c.eligibility}</p>

      <NextAction c={c} can={can} />

      <section className="lc-card px-4 py-3">
        <h3 className="lc-label m-0">The statutory dates</h3>
        <dl className="m-0 mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 text-[13.5px]">
          {rows.map(([label, value]) => (
            <React.Fragment key={label}>
              <dt className="text-[#58536E]">{label}</dt>
              <dd className="m-0 text-right font-semibold">{value ? (/^\d{4}-\d{2}-\d{2}$/.test(value) ? longDate(value) : value) : '—'}</dd>
            </React.Fragment>
          ))}
        </dl>
        {sch.deliveryIsEstimated && <p className="lc-sub mb-0 mt-2">Delivery not yet recorded: the post-natal dates, the ban and the protection run from the expected date until it is.</p>}
        {sch.dueNote && <Note tone="warn" className="mt-2">{sch.dueNote}</Note>}
      </section>

      <section className="lc-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="lc-label m-0">Benefit computation</h3>
          <span className="lc-sub">
            {c.benefit.basisLabel}
            {c.benefit.electedBy ? ` — elected by ${c.benefit.electedBy}` : ''}
          </span>
        </div>
        {c.benefit.masked ? (
          <p className="lc-caption mb-0 mt-2">Amounts are hidden: they need the “view salary figures” permission.</p>
        ) : (
          <>
            <table className="lc-table mt-2">
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col" className="text-right">
                    Wage
                  </th>
                  <th scope="col" className="text-right">
                    Days
                  </th>
                  <th scope="col">Days from</th>
                </tr>
              </thead>
              <tbody>
                {c.benefit.lines.map((l) => (
                  <tr key={l.month}>
                    <td>{l.label}</td>
                    <td className="lc-fig text-right">{formatBDT(l.wage, { places: 2 })}</td>
                    <td className="lc-fig text-right">{fmtDays(l.days)}</td>
                    <td className="lc-sub">{l.daysSource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mb-0 mt-2 text-[13px]">{c.benefit.text}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                ['Benefit', c.benefit.amount],
                ['First instalment', c.benefit.first],
                ['Second instalment', c.benefit.second],
              ].map(([label, v]) => (
                <div key={label} className="lc-stat">
                  <div className="lc-stat-figure">{c.benefitPayable ? formatBDT(v, { places: 2 }) : '—'}</div>
                  <div className="lc-stat-caption">{label}</div>
                </div>
              ))}
            </div>
            {c.benefit.other && (
              <p className="lc-sub mb-0 mt-2">
                The other basis ({c.benefit.other.label}) would give {formatBDT(c.benefit.other.benefit, { places: 2 })}
                {c.benefit.other.difference ? `, a difference of ${formatBDT(c.benefit.other.difference, { places: 2 })}` : ''}.
              </p>
            )}
          </>
        )}
      </section>

      <section className="lc-card px-4 py-3">
        <h3 className="lc-label m-0">Restricted to HR</h3>
        {restricted ? (
          <p className="mb-0 mt-2 text-[13.5px]">
            Expected delivery {longDate(restricted.expectedDelivery)}
            {restricted.actualDelivery ? ` · delivered ${longDate(restricted.actualDelivery)}` : ''} · {restricted.survivingChildren} surviving children{' '}
            <span className="lc-sub">(this read was logged)</span>
          </p>
        ) : (
          <button
            type="button"
            className="lc-btn mt-2"
            onClick={() =>
              api
                .readRestricted(c.reference)
                .then(setRestricted)
                .catch((err) => toast.error(errorText(err)))
            }
          >
            Show the delivery dates and children
          </button>
        )}
        <p className="lc-sub mb-0 mt-2">Every read is logged, a refused one too. A line manager sees the leave and its dates, and nothing more.</p>
      </section>

      <section>
        <h3 className="lc-label m-0 mb-2">Timeline</h3>
        <ol className="m-0 list-none space-y-2 p-0">
          {c.events.map((e, i) => (
            <li key={i} className="lc-card px-3 py-2">
              <div className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold">
                {e.label}
                <span className="lc-sub font-normal">
                  {longDate(e.on)}
                  {e.by ? ` · ${e.by}` : ''}
                </span>
              </div>
              {e.note && <div className={cn('text-[12.5px]', e.note.includes('offence') ? 'text-[#BE123C]' : 'text-[#58536E]')}>{e.note}</div>}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function NextAction({ c, can }: { c: MaternityCase; can: Can }) {
  const [on, setOn] = React.useState(todayISO());
  const [date, setDate] = React.useState('');
  const [note, setNote] = React.useState('');
  const [cancelling, setCancelling] = React.useState(false);
  const w = useWrite();
  const event = cancelling ? 'CANCEL' : c.next.event;
  const pay = event === 'PAY_FIRST' || event === 'PAY_SECOND';
  const allowed = can.apply && (!pay || can.encash);
  const record = () =>
    void w
      .run(() => api.maternityEvent(c.reference, { event: event!, on, date: event === 'DELIVERY' ? date : undefined, note }), (x) => `${c.reference}: ${x.statusLabel.toLowerCase()}`)
      .then((x) => x && (setCancelling(false), setNote(''), setDate('')));
  return (
    <section className={cn('lc-card px-4 py-3', c.next.overdue && '!border-[rgba(225,29,72,0.35)]')}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="lc-label m-0">{cancelling ? 'Cancel the case' : c.next.label}</h3>
        {c.next.due && !cancelling && <Tag tone={c.next.overdue ? 'neg' : 'warn'}>{c.next.overdue ? `Overdue since ${longDate(c.next.due)}` : `Due ${longDate(c.next.due)}`}</Tag>}
      </div>
      {event && allowed && (
        <div className="mt-3 space-y-3">
          <div className="lc-two">
            <Field label={event === 'DELIVERY' ? 'Recorded on' : pay ? 'Paid on' : 'On'} htmlFor="mt-on">
              <input id="mt-on" type="date" className="lc-input" value={on} max={todayISO()} onChange={(e) => setOn(e.target.value)} />
            </Field>
            {event === 'DELIVERY' && (
              <Field label="Date of delivery" htmlFor="mt-dd" hint="Restricted: stored, never shown on the register.">
                <input id="mt-dd" type="date" className="lc-input" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
              </Field>
            )}
          </div>
          {event === 'CANCEL' && (
            <Field label="Why" htmlFor="mt-note" hint="The leave not yet taken is released; what was taken stands.">
              <textarea id="mt-note" className="lc-input" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          )}
          {pay && c.next.overdue && <Note tone="neg">Late payment of the benefit is an offence under s.47, not an administrative slip. The date goes on the record.</Note>}
          {event === 'RETURN' && <Note tone="violet">Employing her before {longDate(c.employmentBanEnd)} is prohibited outright: the return is refused before then.</Note>}
          {w.error && <div className="lc-error">{w.error}</div>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={event === 'CANCEL' ? 'lc-btn-danger' : 'lc-btn-primary'} disabled={w.busy || (event === 'DELIVERY' && !date)} onClick={record}>
              {EVENT_CTA[event]}
            </button>
            {!cancelling && !c.dates.firstPaid && c.status !== 'COMPLETED' && c.status !== 'CANCELLED' && (
              <button type="button" className="lc-btn" onClick={() => setCancelling(true)}>
                Cancel the case…
              </button>
            )}
            {cancelling && (
              <button type="button" className="lc-btn" onClick={() => setCancelling(false)}>
                Back
              </button>
            )}
          </div>
        </div>
      )}
      {event && !allowed && <p className="lc-sub mb-0 mt-2">{pay ? 'Recording a payment needs the “approve encashment” permission.' : 'Recording needs the “apply leave” permission.'}</p>}
    </section>
  );
}

/* ── quarterly statements ─────────────────────────────────────────── */

const METHODS: [string, string, string][] = [
  ['PRINTED', 'Printed pack', 'printed date, acknowledgement scan'],
  ['EMAIL', 'Email', 'sent date, address, delivery status'],
  ['PORTAL', 'Portal', 'published date, first viewed date'],
  ['SMS', 'SMS', 'sent date, number'],
];

export function StatementsTab({ onPrint }: { onPrint: (uid: string) => void }) {
  const [quarter, setQuarter] = React.useState<string | null>(null);
  const [ack, setAck] = React.useState(false);
  const s = useStatements(quarter);
  const w = useWrite();
  if (s.isPending) return <LoadingBlock />;
  if (s.isError) return <ErrorBlock error={s.error} onRetry={() => void s.refetch()} />;
  const d = s.data;
  const b = d.batch;
  return (
    <div className="space-y-4">
      <div className="lc-card px-4 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="lc-field">
            <span className="lc-label">Quarter</span>
            <select className="lc-input !w-auto" value={d.quarter} onChange={(e) => (setQuarter(e.target.value), setAck(false))}>
              {d.quarters.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
          </label>
          {d.can.close && (
            <button
              type="button"
              className="lc-btn-primary"
              disabled={w.busy || (!d.ready && !ack)}
              onClick={() => void w.run(() => api.generateStatements(d.quarter, ack), (r) => `${r.batch?.generated ?? 0} statements generated (version ${r.batch?.version})`)}
            >
              {b ? 'Regenerate' : 'Generate'} {d.label}
            </button>
          )}
        </div>
        <p className="lc-caption mb-0 mt-2">One leave statement (Form-9) per worker: opening balance, earned, taken, refused, encashed and closing, from the same ledger the balances read.</p>
        {!d.ready && (
          <Note tone="warn" className="mt-3">
            {d.unlocked.length} attendance {d.unlocked.length === 1 ? 'month is' : 'months are'} not locked ({d.unlocked.join(', ')}), so the leave they record may still change.
            {d.can.close && (
              <label className="mt-2 flex items-center gap-2 font-semibold">
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /> State the quarter anyway — this is recorded on the statements
              </label>
            )}
          </Note>
        )}
        {w.error && <div className="lc-error mt-2">{w.error}</div>}
      </div>

      {!b ? (
        <Empty title={`No statements for ${d.label}`}>Generate them, then record how each reached the worker.</Empty>
      ) : (
        <>
          <div className="lc-stats !mt-0">
            {[
              ['Statements', b.generated],
              ['Issued', b.issued],
              ['Acknowledged', b.acknowledged],
              ['Outstanding', b.outstanding],
            ].map(([label, v]) => (
              <div key={label} className="lc-stat bg-white">
                <div className="lc-stat-figure" style={{ color: label === 'Outstanding' && v ? '#8A6215' : undefined }}>
                  {v}
                </div>
                <div className="lc-stat-caption">{label}</div>
              </div>
            ))}
          </div>
          <p className="lc-caption m-0">
            Version {b.version}, generated {longDate(b.generatedAt.slice(0, 10))}
            {b.generatedBy ? ` by ${b.generatedBy}` : ''}
            {b.unlockedAtGeneration.length ? ` with ${b.unlockedAtGeneration.length} attendance months unlocked, acknowledged.` : '.'} The statement is easy; evidencing that the
            worker received it is what an inspection tests.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
            {METHODS.map(([key, label, proof]) => (
              <div key={key} className="lc-card px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-bold">{label}</span>
                  <span className="lc-mono text-[12.5px]">{b.byMethod[key] ?? 0}</span>
                </div>
                <div className="lc-sub">Proof: {proof}</div>
                {d.can.apply && (
                  <button type="button" className="lc-btn mt-2 !min-h-[32px]" disabled={w.busy} onClick={() => void w.run(() => api.issueStatements(d.quarter, key), (r) => `${label}: issue recorded for ${r.issued}`)}>
                    Record issue to all
                  </button>
                )}
              </div>
            ))}
          </div>
          {b.chase.length > 0 && (
            <Note tone="warn">
              <div className="font-bold">Chase list — {b.chase.length}</div>
              {b.chase.map((x) => `${x.nameEn} · ${x.why}`).join('; ')}
            </Note>
          )}
          <div className="lc-card lc-table-wrap">
            <table className="lc-table">
              <thead>
                <tr>
                  <th scope="col">Worker</th>
                  <th scope="col">Earned leave</th>
                  <th scope="col">Issued</th>
                  <th scope="col">Acknowledged</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r) => {
                  const el = r.rows.find((x) => x.type === 'EARNED') ?? r.rows[0];
                  return (
                    <tr key={r.uid}>
                      <td>
                        <span className="font-semibold">{r.employee.nameEn}</span>
                        <div className="lc-sub">{r.employee.code}</div>
                      </td>
                      <td className="text-[12.5px]">
                        {el ? (
                          <>
                            {fmtDays(el.opening)} + {fmtDays(el.earned)} − {fmtDays(el.taken)} − {fmtDays(el.encashed)}
                            {Number(el.other) ? ` ${Number(el.other) < 0 ? '−' : '+'} ${fmtDays(Math.abs(Number(el.other)))}` : ''} ={' '}
                            <span className="lc-fig">{fmtDays(el.closing)}</span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="text-[12.5px]">{r.issued.length ? r.issued.map((i) => `${i.label}, ${longDate(i.on)}`).join('; ') : <Tag tone="warn">Not issued</Tag>}</td>
                      <td className="text-[12.5px]">
                        {r.acknowledgedAt ? (
                          longDate(r.acknowledgedAt)
                        ) : d.can.apply && r.issued.length ? (
                          <button type="button" className="lc-btn !min-h-[30px]" disabled={w.busy} onClick={() => void w.run(() => api.acknowledgeStatement(r.uid), 'Receipt acknowledged')}>
                            Signed for
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="text-right">
                        <button type="button" className="lc-btn !min-h-[30px]" onClick={() => onPrint(r.uid)}>
                          Print
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ── the printable statement (Form-9) ─────────────────────────────── */

const COLS: [keyof import('./types').StatementRow, string, string][] = [
  ['opening', 'Opening balance', 'প্রারম্ভিক স্থিতি'],
  ['earned', 'Earned', 'অর্জিত'],
  ['taken', 'Taken', 'ভোগকৃত'],
  ['refused', 'Refused', 'প্রত্যাখ্যাত'],
  ['encashed', 'Encashed', 'নগদায়িত'],
  ['other', 'Forfeited, lapsed or carried', 'বাজেয়াপ্ত/তামাদি'],
  ['closing', 'Closing balance', 'সমাপনী স্থিতি'],
];

export function StatementDrawer({ uid, onClose }: { uid: string; onClose: () => void }) {
  const s = useStatement(uid);
  const d = s.data;
  return (
    <SideDrawer onClose={onClose} labelledBy="lc-stmt" width={820}>
      <DrawerHead id="lc-stmt" title="Leave statement (Form-9)" sub="Printed in English and Bangla, for the worker to keep and sign for." onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {s.isPending ? (
          <LoadingBlock />
        ) : s.isError ? (
          <ErrorBlock error={s.error} />
        ) : (
          d && (
            <>
              <div className="lc-print">
                <h2 className="m-0 text-[18px] font-extrabold">{d.employer}</h2>
                <div className="text-[14px] font-semibold">
                  Leave register (Form-9) · <span lang="bn">ছুটির রেজিস্টার (ফরম-৯)</span>
                </div>
                <div className="mt-1 text-[13px]">
                  {d.employee.nameEn}
                  {d.employee.nameBn ? (
                    <>
                      {' '}
                      · <span lang="bn">{d.employee.nameBn}</span>
                    </>
                  ) : null}{' '}
                  · {d.employee.code} · {d.period} · version {d.version}
                </div>
                <table className="lc-table mt-3 border border-[rgba(22,23,42,0.15)]">
                  <thead>
                    <tr>
                      <th scope="col">Leave</th>
                      {COLS.map(([k, en, bn]) => (
                        <th key={k} scope="col" className="text-right">
                          {en}
                          <div lang="bn" className="normal-case tracking-normal">
                            {bn}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.rows.map((r) => (
                      <tr key={r.type}>
                        <th scope="row" className="!text-[13px] !normal-case !tracking-normal text-[#16172A]">
                          {r.name}
                          {r.nameBn && (
                            <div lang="bn" className="font-normal">
                              {r.nameBn}
                            </div>
                          )}
                        </th>
                        {COLS.map(([k]) => (
                          <td key={k} className="lc-fig text-right">
                            {fmtDays(r[k])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-10 grid grid-cols-2 gap-10 text-[12.5px]">
                  <div className="border-t border-[#16172A] pt-1">
                    Worker&apos;s signature or thumb · <span lang="bn">শ্রমিকের স্বাক্ষর / টিপসই</span>
                  </div>
                  <div className="border-t border-[#16172A] pt-1">
                    For the employer · <span lang="bn">মালিকের পক্ষে</span>
                  </div>
                </div>
              </div>
              <div className="lc-noprint mt-4 flex gap-2">
                <button type="button" className="lc-btn-primary" onClick={() => window.print()}>
                  Print
                </button>
              </div>
            </>
          )
        )}
      </div>
    </SideDrawer>
  );
}
