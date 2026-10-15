'use client';

/**
 * The seven tabs (spec §1): balances, applications, approvals, who is away,
 * encashment, year-end and policy. Every figure comes from the server's
 * spendable(); every list that shows a balance shows all three numbers.
 */

import * as React from 'react';
import { toast } from '@/lib/ToastService';
import { cn } from '@/lib/utils';
import { ConfidenceTag, ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useLookup } from '@/app/dashboard/hris/employee/employees/_bd/hooks';
import { useDebounced } from '@/app/dashboard/hris/employee/employees/_bd/salary/shared';
import type { Confidence } from '@/app/dashboard/hris/employee/employees/_bd/types';
import { formatBDT } from '@/app/dashboard/hris/employee/employees/_bd/format';
import * as api from './api';
import { ESTABLISHMENT, PHASE, TYPE_COLOUR, TYPE_SHORT, csv, download, fmtDays, kindFill, longDate, monthLabel, plural, reasonError, shiftMonth, shortDate, span, todayISO } from './defs';
import { useApplications, useApprovals, useAway, useBalances, useEncashments, useMaternity, usePolicy } from './hooks';
import { Empty, Figure, Note, Tag, errorText, useWrite } from './parts';
import type { BalanceFilter, BalanceRow, Can, MaternityCase, QueueCard, Restricted, YearEnd } from './types';

const FILTERS: { id: BalanceFilter; label: string }[] = [
  { id: 'ALL', label: 'Everyone' },
  { id: 'CLAIMED', label: 'With days claimed' },
  { id: 'NOTHING', label: 'Nothing left' },
  { id: 'OVERDRAWN', label: 'Overdrawn' },
];

function Search({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder: string }) {
  return (
    <div className="lc-search">
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.6-3.6" />
      </svg>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} placeholder={placeholder} />
    </div>
  );
}

/* ── balances (§6) ────────────────────────────────────────────────── */

export function BalancesTab({ onOpen }: { onOpen: (code: string) => void }) {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<BalanceFilter>('ALL');
  const q = useDebounced(query.trim(), 300);
  const b = useBalances(q, filter);
  if (b.isPending) return <LoadingBlock />;
  if (b.isError) return <ErrorBlock error={b.error} onRetry={() => void b.refetch()} />;
  const d = b.data;
  const exportCsv = () => {
    const cols: { label: string; get: (r: BalanceRow) => unknown }[] = [
      { label: 'Code', get: (r) => r.code },
      { label: 'Name', get: (r) => r.nameEn },
      { label: 'নাম', get: (r) => r.nameBn },
      { label: 'Department', get: (r) => r.department },
    ];
    for (const t of d.types) {
      cols.push(
        { label: `${t.name} — balance`, get: (r) => r.positions[t.code]?.balance },
        { label: `${t.name} — held`, get: (r) => r.positions[t.code]?.held },
        { label: `${t.name} — booked ahead`, get: (r) => r.positions[t.code]?.committed },
        { label: `${t.name} — spendable`, get: (r) => r.positions[t.code]?.spendable }
      );
    }
    download(`leave-balances-${d.asOf}.csv`, csv(cols, d.rows));
    toast.success('Exported four columns per leave type: one figure cannot be reconciled.');
  };
  return (
    <>
      <div className="lc-toolbar">
        <Search value={query} onChange={setQuery} label="Search balances" placeholder="Name, code or department" />
        <div role="group" aria-label="Filter balances" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className="lc-filter" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label} <span className="lc-mono">{d.counts[f.id]}</span>
            </button>
          ))}
        </div>
        <span className="min-w-[12px] flex-1" />
        <span className="lc-caption">
          {d.rows.length} shown · as at {longDate(d.asOf)}
        </span>
        <button type="button" className="lc-btn" onClick={exportCsv} disabled={!d.rows.length}>
          Export CSV
        </button>
      </div>
      {d.rows.length === 0 ? (
        <Empty title="Nobody matches">Clear the search or pick another filter.</Empty>
      ) : (
        <div className="lc-card lc-table-wrap">
          <table className="lc-table">
            <thead>
              <tr>
                <th scope="col">Employee</th>
                {d.types.map((t) => (
                  <th key={t.code} scope="col">
                    {t.name}{' '}
                    <span lang="bn" className="normal-case tracking-normal">
                      {t.nameBn}
                    </span>
                  </th>
                ))}
                <th scope="col">Compensatory</th>
              </tr>
            </thead>
            <tbody>
              {d.rows.map((r) => (
                <tr
                  key={r.code}
                  className="is-link"
                  tabIndex={0}
                  aria-label={`${r.nameEn}: open the ledger`}
                  onClick={() => onOpen(r.code)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpen(r.code);
                    }
                  }}
                >
                  <td className="min-w-[180px]">
                    <div className="font-semibold">{r.nameEn}</div>
                    <div className="lc-sub">
                      {r.code}
                      {r.department ? ` · ${r.department}` : ''}
                      {r.establishment ? ` · ${ESTABLISHMENT[r.establishment] ?? r.establishment}` : ''}
                    </div>
                  </td>
                  {d.types.map((t) => (
                    <td key={t.code}>
                      <Figure p={r.positions[t.code]} />
                    </td>
                  ))}
                  <td>
                    <Figure p={r.positions.COMPENSATORY} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="lc-caption mt-3">
        The large figure is what can be spent: the ledger less what undecided requests hold and approved future leave has booked. Rule set {d.rules.version}{' '}
        <ConfidenceTag value={d.rules.confidence as Confidence} />
      </p>
    </>
  );
}

/* ── applications (§1.2) and maternity cases ──────────────────────── */

const STATUS_FILTERS = ['ALL', 'SUBMITTED', 'APPROVED', 'IN_PROGRESS', 'TAKEN', 'DECLINED', 'CANCELLED', 'WITHDRAWN'] as const;

export function ApplicationsTab({ can, onOpen }: { can: Can | undefined; onOpen: (code: string) => void }) {
  const [status, setStatus] = React.useState<string>('ALL');
  const [query, setQuery] = React.useState('');
  const q = useDebounced(query.trim(), 300);
  const a = useApplications(status, q);
  const [acting, setActing] = React.useState<{ ref: string; action: 'withdraw' | 'cancel' } | null>(null);
  if (a.isPending) return <LoadingBlock />;
  if (a.isError) return <ErrorBlock error={a.error} onRetry={() => void a.refetch()} />;
  return (
    <div className="space-y-5">
      <div>
        <div className="lc-toolbar">
          <Search value={query} onChange={setQuery} label="Search applications" placeholder="Name, code or reference" />
          <div role="group" aria-label="Filter by state" className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button key={s} type="button" className="lc-filter" aria-pressed={status === s} onClick={() => setStatus(s)}>
                {s === 'ALL' ? 'All' : PHASE[s].label} <span className="lc-mono">{a.data.counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
        {a.data.rows.length === 0 ? (
          <Empty title="No applications">Apply for an employee from the header; it appears here and in the approvals queue.</Empty>
        ) : (
          <div className="lc-card lc-table-wrap">
            <table className="lc-table">
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">Employee</th>
                  <th scope="col">Leave</th>
                  <th scope="col">Days</th>
                  <th scope="col">State</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {a.data.rows.map((r) => (
                  <React.Fragment key={r.reference}>
                    <tr>
                      <td className="lc-mono whitespace-nowrap text-[12.5px]">{r.reference}</td>
                      <td>
                        <button type="button" className="lc-link text-left" onClick={() => onOpen(r.employee.code)}>
                          {r.employee.nameEn}
                        </button>
                        <div className="lc-sub">
                          {r.employee.code}
                          {r.onBehalf && r.enteredBy ? ` · entered by ${r.enteredBy}` : ''}
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5">
                          <i aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLOUR[r.type] ?? '#157A5B' }} />
                          {r.typeName}
                        </span>
                        <div className="lc-sub">{span(r.from, r.to)}</div>
                      </td>
                      <td className="lc-fig">{fmtDays(r.days)}</td>
                      <td>
                        <Tag tone={r.nonRefusable ? 'violet' : PHASE[r.phase].tone}>{r.nonRefusable ? 'Statutory' : PHASE[r.phase].label}</Tag>
                        {r.declineReason && <div className="lc-sub mt-1 max-w-[220px]">“{r.declineReason}”</div>}
                        {r.advance && <div className="lc-sub">advance</div>}
                      </td>
                      <td className="whitespace-nowrap text-right">
                        {can?.apply && r.status === 'SUBMITTED' && (
                          <button type="button" className="lc-btn !min-h-[32px]" onClick={() => setActing({ ref: r.reference, action: 'withdraw' })}>
                            Withdraw
                          </button>
                        )}
                        {can?.apply && r.phase === 'APPROVED' && !r.nonRefusable && (
                          <button type="button" className="lc-btn !min-h-[32px]" onClick={() => setActing({ ref: r.reference, action: 'cancel' })}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                    {acting?.ref === r.reference && (
                      <tr>
                        <td colSpan={6}>
                          <ReasonAction
                            label={acting.action === 'withdraw' ? 'Withdraw the request' : 'Cancel the approved leave — the days go back beside the original entry'}
                            required={acting.action === 'cancel'}
                            cta={acting.action === 'withdraw' ? 'Withdraw' : 'Cancel the leave'}
                            onCancel={() => setActing(null)}
                            run={(reason) => api.requestAction(r.reference, acting.action, reason)}
                            done={acting.action === 'withdraw' ? `${r.reference} withdrawn; the hold is released` : `${r.reference} cancelled; ${plural(r.days, 'day')} back`}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <MaternityCases can={can} />
    </div>
  );
}

function ReasonAction({ label, required, cta, run, done, onCancel }: { label: string; required: boolean; cta: string; run: (reason: string) => Promise<unknown>; done: string; onCancel: () => void }) {
  const [reason, setReason] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const w = useWrite();
  const err = required ? reasonError(reason) : null;
  return (
    <div className="space-y-2 py-1">
      <div className="lc-label">{label}</div>
      <textarea className="lc-input" aria-label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={required ? 'Why — at least 10 characters' : 'Why (optional)'} />
      {touched && err && <div className="lc-error">{err}</div>}
      {w.error && <div className="lc-error">{w.error}</div>}
      <div className="flex gap-2">
        <button
          type="button"
          className="lc-btn-primary"
          disabled={w.busy}
          onClick={() => {
            setTouched(true);
            if (err) return;
            void w.run(() => run(reason), done).then((o) => o && onCancel());
          }}
        >
          {cta}
        </button>
        <button type="button" className="lc-btn" onClick={onCancel}>
          Back
        </button>
      </div>
    </div>
  );
}

function MaternityCases({ can }: { can: Can | undefined }) {
  const m = useMaternity();
  const rows = m.data?.rows ?? [];
  if (!rows.length) return null;
  return (
    <div>
      <h2 className="lc-section-title mb-2">Maternity cases</h2>
      <div className="grid gap-3">
        {rows.map((c) => (
          <MaternityCard key={c.reference} c={c} can={can} />
        ))}
      </div>
    </div>
  );
}

function MaternityCard({ c, can }: { c: MaternityCase; can: Can | undefined }) {
  const [restricted, setRestricted] = React.useState<Restricted | null>(null);
  const [delivery, setDelivery] = React.useState('');
  const w = useWrite();
  const reveal = async () => {
    try {
      setRestricted(await api.readRestricted(c.reference));
    } catch (err) {
      toast.error(errorText(err));
    }
  };
  return (
    <div className="lc-card px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold">{c.employee.nameEn}</span>
        <span className="lc-sub">{c.employee.code}</span>
        <Tag tone="violet">Statutory · not refusable</Tag>
        <Tag tone={c.benefitPayable ? 'pos' : 'warn'}>{c.benefitPayable ? 'Benefit payable' : 'Benefit not payable'}</Tag>
        <span className="flex-1" />
        <span className="lc-mono text-[12.5px] text-[#6E6883]">{c.reference}</span>
      </div>
      <div className="mt-1 text-[13.5px]">
        {c.totalDays} days, {span(c.leaveFrom, c.leaveTo)} · notice {c.noticeMethod.toLowerCase()} on {longDate(c.noticeDate)}
      </div>
      <div className="lc-sub mt-1">{c.eligibility}</div>
      <div className="lc-sub">
        Protected from dismissal {longDate(c.protectionStart)} – {longDate(c.protectionEnd)} · no employment until {longDate(c.employmentBanEnd)}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {restricted ? (
          <span className="text-[13px]">
            Expected delivery {longDate(restricted.expectedDelivery)}
            {restricted.actualDelivery ? ` · delivered ${longDate(restricted.actualDelivery)}` : ''} · {restricted.survivingChildren} surviving children{' '}
            <span className="lc-sub">(this read was logged)</span>
          </span>
        ) : (
          <button type="button" className="lc-btn !min-h-[32px]" onClick={() => void reveal()} title="Restricted to HR; every read is logged, a refused one too">
            Show the restricted fields
          </button>
        )}
        {can?.apply && !c.deliveryRecorded && (
          <>
            <input type="date" className="lc-input !min-h-[32px] !w-[160px]" aria-label="Actual delivery" value={delivery} onChange={(e) => setDelivery(e.target.value)} />
            <button type="button" className="lc-btn !min-h-[32px]" disabled={!delivery || w.busy} onClick={() => void w.run(() => api.recordDelivery(c.reference, delivery), 'Delivery recorded; the leave after it is protected')}>
              Record the delivery
            </button>
          </>
        )}
      </div>
      {w.error && <div className="lc-error mt-1">{w.error}</div>}
    </div>
  );
}

/* ── approvals (§7) ───────────────────────────────────────────────── */

export function ApprovalsTab({ can }: { can: Can | undefined }) {
  const q = useApprovals();
  if (q.isPending) return <LoadingBlock />;
  if (q.isError) return <ErrorBlock error={q.error} onRetry={() => void q.refetch()} />;
  if (!q.data.rows.length) return <Empty title="Nothing waiting">Every submitted request has been decided.</Empty>;
  return (
    <div className="lc-queue">
      {q.data.rows.map((r) => (
        <QueueCardView key={r.reference} r={r} can={can ?? q.data.can} />
      ))}
    </div>
  );
}

function QueueCardView({ r, can }: { r: QueueCard; can: Can }) {
  const [declining, setDeclining] = React.useState(false);
  const w = useWrite();
  const c = r.clash;
  return (
    <article className="lc-card px-4 py-3.5" aria-label={`${r.employee.nameEn}, ${r.typeName}`}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-[15px] font-bold">{r.employee.nameEn}</span>
        <span className="lc-sub">
          {r.employee.code}
          {r.employee.department ? ` · ${r.employee.department}` : ''}
        </span>
        <span className="flex-1" />
        <span className="lc-mono text-[12.5px] text-[#6E6883]">{r.reference}</span>
      </div>
      <div className="mt-1 text-[14px]">
        <span className="font-semibold" style={{ color: TYPE_COLOUR[r.type] }}>
          {r.typeName}
        </span>
        , {span(r.from, r.to)} · <span className="lc-fig">{plural(r.days, 'day')}</span>
      </div>
      <div className="mt-1 text-[13px] leading-[20px] text-[#58536E]">{r.breakdown.sentence}</div>
      <div className={cn('mt-2 text-[13.5px] font-semibold', r.tight ? 'text-[#BE123C]' : 'text-[#157A5B]')}>
        {r.positionSentence} — the figure Approve tests against
      </div>
      {r.warnings.map((x) => (
        <Note key={x} tone="warn" className="mt-2">
          {x}
        </Note>
      ))}
      <div className={cn('lc-clash', c.severe && 'is-severe')}>
        <div className="text-[13.5px] font-bold">{c.title}</div>
        <div className="lc-sub">{c.note}</div>
        {c.rows.length > 0 && (
          <ul className="m-0 mt-1.5 list-none space-y-1 p-0 text-[13px]">
            {c.rows.map((o) => (
              <li key={o.reference} className="flex flex-wrap items-center gap-2">
                <span className={`lc-state lc-state-${o.state}`}>{o.state === 'WAITING' ? 'Waiting' : o.state === 'APPROVED' ? 'Approved' : 'Statutory'}</span>
                {o.nameEn} · {o.typeName.toLowerCase()} {span(o.from, o.to)}
              </li>
            ))}
          </ul>
        )}
        {c.statutory.length > 0 && (
          <p className="lc-sub mb-0 mt-1.5">
            {c.statutory.join(' and ')}&apos;s maternity leave is a statutory entitlement, so the cover has to come from somewhere else — it is not a leave an approver may decline to resolve this.
          </p>
        )}
      </div>
      {can.approve && !r.selfApproval && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="lc-btn-primary" disabled={w.busy || (r.tight && !r.advance)} onClick={() => void w.run(() => api.requestAction(r.reference, 'approve'), `${r.reference} approved: ${plural(r.days, 'day')} taken`)}>
            Approve
          </button>
          <button type="button" className="lc-btn-danger" onClick={() => setDeclining(!declining)} aria-expanded={declining}>
            Decline…
          </button>
        </div>
      )}
      {w.error && <div className="lc-error mt-2">{w.error}</div>}
      {declining && (
        <div className="mt-2">
          <ReasonAction label="Decline — the reason goes to the employee" required cta="Decline" onCancel={() => setDeclining(false)} run={(reason) => api.requestAction(r.reference, 'decline', reason)} done={`${r.reference} declined; the hold is released`} />
        </div>
      )}
    </article>
  );
}

/* ── who is away (§8) ─────────────────────────────────────────────── */

export function AwayTab({ onOpen }: { onOpen: (code: string) => void }) {
  const [month, setMonth] = React.useState<string | null>(null);
  const [dept, setDept] = React.useState('');
  const departments = useLookup('departments');
  const a = useAway(month, dept);
  if (a.isPending) return <LoadingBlock />;
  if (a.isError) return <ErrorBlock error={a.error} onRetry={() => void a.refetch()} />;
  const d = a.data;
  const shown = d.month;
  const go = (by: number) => setMonth(shiftMonth(shown, by));
  return (
    <>
      <div className="lc-toolbar">
        <button type="button" className="lc-btn" aria-label="Previous month" onClick={() => go(-1)}>
          ‹
        </button>
        <span className="min-w-[150px] text-center text-[15px] font-bold" aria-live="polite">
          {monthLabel(shown)}
        </span>
        <button type="button" className="lc-btn" aria-label="Next month" onClick={() => go(1)}>
          ›
        </button>
        <select className="lc-input !w-auto" aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">Everyone</option>
          {(departments.data ?? []).map((x) => (
            <option key={x.uid} value={x.uid}>
              {x.title}
            </option>
          ))}
        </select>
      </div>
      {d.rows.length === 0 ? (
        <Empty title={`Nobody away in ${monthLabel(shown)}`}>
          {d.nearest ? (
            <>
              The nearest absence is in{' '}
              <button type="button" className="lc-link" onClick={() => setMonth(d.nearest)}>
                {monthLabel(d.nearest)}
              </button>
              .
            </>
          ) : (
            'No approved or waiting leave is on file.'
          )}
        </Empty>
      ) : (
        <div className="lc-card overflow-x-auto px-4 py-2">
          <div className="lc-strip min-w-[720px]" style={{ gridTemplateColumns: `minmax(0,6fr) repeat(${d.days.length}, minmax(0,1fr))` }}>
            <span className="lc-strip-day text-left">Person</span>
            {d.days.map((n, i) => (
              <span key={n} className={cn('lc-strip-day', d.weekdays[i] === 5 && 'is-weekend')}>
                {n}
              </span>
            ))}
            {d.rows.map((p) => (
              <React.Fragment key={p.code}>
                <button type="button" className="lc-strip-name border-none bg-transparent text-left" onClick={() => onOpen(p.code)} title={p.nameEn}>
                  {p.nameEn}
                </button>
                {d.days.map((n, i) => {
                  const iso = `${shown}-${String(n).padStart(2, '0')}`;
                  const bar = p.bars.find((b) => b.from <= iso && iso <= b.to);
                  const start = bar && (bar.from === iso && bar.startsHere);
                  const end = bar && (bar.to === iso && bar.endsHere);
                  return (
                    <span key={n} className={cn('lc-strip-cell', d.weekdays[i] === 5 && 'is-weekend')} title={bar ? `${bar.typeName}${bar.pending ? ' (waiting)' : ''} · ${bar.reference}` : undefined}>
                      {bar && <span className="lc-bar" style={{ background: kindFill(bar.type, bar.pending, bar.nonRefusable), borderRadius: start && end ? '4px' : start ? '4px 0 0 4px' : end ? '0 4px 4px 0' : '0' }} />}
                    </span>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="lc-key" aria-label="Key">
          {(['EARNED', 'CASUAL', 'SICK', 'COMPENSATORY'] as const).map((t) => (
            <span key={t}>
              <i style={{ background: kindFill(t, false, false) }} />
              {TYPE_SHORT[t]}
            </span>
          ))}
          <span>
            <i style={{ background: kindFill('MATERNITY', false, true) }} />
            Statutory, not refusable
          </span>
          <span>
            <i style={{ background: kindFill('CASUAL', true, false) }} />
            Not yet decided
          </span>
        </div>
        <span className="lc-caption">
          {d.rows.length} of {d.rosterCount} shown — only people with an absence this month get a row
        </span>
      </div>
    </>
  );
}

/* ── encashment ───────────────────────────────────────────────────── */

export function EncashmentTab({ onEncash }: { onEncash: () => void }) {
  const e = useEncashments();
  const [declining, setDeclining] = React.useState<string | null>(null);
  const w = useWrite();
  if (e.isPending) return <LoadingBlock />;
  if (e.isError) return <ErrorBlock error={e.error} onRetry={() => void e.refetch()} />;
  const d = e.data;
  return (
    <>
      <div className="lc-toolbar">
        {d.can.apply && (
          <button type="button" className="lc-btn-primary" onClick={onEncash}>
            Encash earned leave
          </button>
        )}
        <span className="flex-1" />
        {d.masked && <span className="lc-caption">Amounts are hidden: they need the “view salary figures” permission.</span>}
      </div>
      {d.rows.length === 0 ? (
        <Empty title="No encashments">At most half of a worker&apos;s spendable earned leave, once a service year. The days come off at approval.</Empty>
      ) : (
        <div className="lc-card lc-table-wrap">
          <table className="lc-table">
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Employee</th>
                <th scope="col">Days</th>
                <th scope="col">Amount</th>
                <th scope="col">State</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {d.rows.map((x) => (
                <React.Fragment key={x.reference}>
                  <tr>
                    <td className="lc-mono whitespace-nowrap text-[12.5px]">{x.reference}</td>
                    <td>
                      {x.employee.nameEn}
                      <div className="lc-sub">{x.employee.code}</div>
                    </td>
                    <td className="lc-fig">{fmtDays(x.days)}</td>
                    <td>
                      <span className="lc-fig">{x.masked ? '৳ ••••••' : formatBDT(x.amount, { places: 2 })}</span>
                      <div className="lc-sub">
                        {x.masked ? x.rateBasis : `${formatBDT(x.dailyRate, { places: 2 })} a day · ${x.rateBasis}`}
                      </div>
                    </td>
                    <td>
                      <Tag tone={x.status === 'PAID' ? 'pos' : x.status === 'APPROVED' ? 'violet' : x.status === 'DECLINED' ? 'neg' : 'warn'}>{x.status.toLowerCase()}</Tag>
                      {x.payrollRef && <div className="lc-sub mt-1">{x.payrollRef} · {x.payslipRef}</div>}
                      {x.declineReason && <div className="lc-sub mt-1">“{x.declineReason}”</div>}
                    </td>
                    <td className="whitespace-nowrap text-right">
                      {d.can.encash && x.status === 'SUBMITTED' && (
                        <>
                          <button type="button" className="lc-btn-primary !min-h-[32px]" disabled={w.busy} onClick={() => void w.run(() => api.encashmentAction(x.reference, 'approve'), `${x.reference} approved: ${plural(x.days, 'day')} off the ledger`)}>
                            Approve
                          </button>{' '}
                          <button type="button" className="lc-btn !min-h-[32px]" onClick={() => setDeclining(x.reference)}>
                            Decline…
                          </button>
                        </>
                      )}
                      {d.can.encash && x.status === 'APPROVED' && (
                        <button type="button" className="lc-btn !min-h-[32px]" disabled={w.busy} onClick={() => void w.run(() => api.encashmentAction(x.reference, 'mark-paid'), (o) => `Paid in ${o.payrollRef}`)}>
                          Mark paid
                        </button>
                      )}
                    </td>
                  </tr>
                  {declining === x.reference && (
                    <tr>
                      <td colSpan={6}>
                        <ReasonAction label="Decline the encashment" required cta="Decline" onCancel={() => setDeclining(null)} run={(reason) => api.encashmentAction(x.reference, 'decline', { reason })} done={`${x.reference} declined`} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {w.error && <div className="lc-error mt-2">{w.error}</div>}
    </>
  );
}

/* ── year-end (§5.4) ──────────────────────────────────────────────── */

export function YearEndTab({ can, onAccrual }: { can: Can | undefined; onAccrual: () => void }) {
  const [asOf, setAsOf] = React.useState(todayISO());
  const [result, setResult] = React.useState<YearEnd | null>(null);
  const [confirm, setConfirm] = React.useState(false);
  const w = useWrite();
  const preview = () => void w.run(() => api.yearEndClose({ asOf, commit: false })).then((r) => r && (setResult(r), setConfirm(false)));
  return (
    <div className="space-y-4">
      <div className="lc-card px-4 py-4">
        <h2 className="lc-section-title">Accrual</h2>
        <p className="lc-caption mb-3 mt-1">Earned leave for each completed service year, from days worked. Preview first; a second run posts nothing twice.</p>
        <button type="button" className="lc-btn" onClick={onAccrual}>
          Open the accrual run
        </button>
      </div>
      <div className="lc-card px-4 py-4">
        <h2 className="lc-section-title">Close the earned-leave year</h2>
        <p className="lc-caption mb-3 mt-1">
          For each service year that has ended: carry the spendable balance up to the establishment&apos;s cap into the next year, and forfeit the rest. Nothing posts until you
          confirm, because a close is reversed only entry by entry.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="lc-field">
            <span className="lc-label">As at</span>
            <input type="date" className="lc-input" value={asOf} onChange={(e) => (setAsOf(e.target.value), setResult(null))} />
          </label>
          <button type="button" className="lc-btn" disabled={w.busy} onClick={preview}>
            Dry run
          </button>
        </div>
        {w.error && <div className="lc-error mt-2">{w.error}</div>}
        {result && (
          <div className="mt-4 space-y-3">
            {result.rows.length === 0 ? (
              <Note tone="neutral">No earned-leave year has ended unclosed before {longDate(result.asOf)}.</Note>
            ) : (
              <div className="lc-table-wrap rounded-[12px] border border-[rgba(22,23,42,0.1)]">
                <table className="lc-table">
                  <caption className="lc-caption px-4 pt-3 text-left">
                    {result.commit ? 'Closed' : 'Dry run — nothing written'}: {fmtDays(result.carried)} days carried, {fmtDays(result.forfeited)} forfeited
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Employee</th>
                      <th scope="col">Service year</th>
                      <th scope="col">Closing</th>
                      <th scope="col">Cap</th>
                      <th scope="col">Carried</th>
                      <th scope="col">Forfeited</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((r) => (
                      <tr key={`${r.code}-${r.cycleTo}`}>
                        <td>
                          {r.nameEn}
                          <div className="lc-sub">{r.code}</div>
                        </td>
                        <td className="whitespace-nowrap text-[12.5px]">
                          {shortDate(r.cycleFrom)} – {longDate(r.cycleTo)}
                        </td>
                        <td className="lc-fig">{fmtDays(r.closing)}</td>
                        <td className="lc-fig">{fmtDays(r.cap)}</td>
                        <td className="lc-fig text-[#157A5B]">{fmtDays(r.carried)}</td>
                        <td className="lc-fig" style={{ color: Number(r.forfeited) ? '#BE123C' : undefined }}>
                          {fmtDays(r.forfeited)}
                          {(r.why || r.warning) && <div className="lc-sub font-normal">{r.why ?? r.warning}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!result.commit && result.rows.some((r) => r.outcome === 'WILL_CLOSE') && can?.close && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[13.5px] font-semibold">
                  <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} /> I have checked the figures: post the forfeitures and openings
                </label>
                <button type="button" className="lc-btn-primary" disabled={!confirm || w.busy} onClick={() => void w.run(() => api.yearEndClose({ asOf, commit: true, confirm: true }), (r) => `Closed: ${fmtDays(r.carried)} carried, ${fmtDays(r.forfeited)} forfeited`).then((r) => r && setResult(r))}>
                  Close {result.rows.filter((r) => r.outcome === 'WILL_CLOSE').length} service years
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── policy ───────────────────────────────────────────────────────── */

export function PolicyTab() {
  const p = usePolicy();
  if (p.isPending) return <LoadingBlock />;
  if (p.isError) return <ErrorBlock error={p.error} onRetry={() => void p.refetch()} />;
  const d = p.data;
  const draft = d.confidence !== 'VERIFIED' && d.confidence !== 'LIVE';
  return (
    <div className="space-y-4">
      <div className="lc-card px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="lc-section-title">Rule set {d.ruleSet}</h2>
          <ConfidenceTag value={d.confidence as Confidence} />
          <span className="flex-1" />
          <span className="lc-caption">in force from {longDate(d.effectiveFrom)}</span>
        </div>
        {d.source && <p className="lc-caption mb-0 mt-1">{d.source}</p>}
        {draft && (
          <Note tone="warn" className="mt-3">
            Some figures here are {d.confidence.toLowerCase()}: shown and used, but to be verified before a register is filed on them. Read-only here; the rule book holds them.
          </Note>
        )}
      </div>
      <div className="lc-card lc-table-wrap">
        <table className="lc-table">
          <caption className="lc-label px-4 pt-3 text-left">Leave types</caption>
          <thead>
            <tr>
              <th scope="col">Type</th>
              <th scope="col">Basis</th>
              <th scope="col">Earned</th>
              <th scope="col">Holidays inside it</th>
              <th scope="col">Who</th>
            </tr>
          </thead>
          <tbody>
            {d.types.map((t) => (
              <tr key={t.code}>
                <td>
                  <span className="font-semibold">{t.name}</span>{' '}
                  <span lang="bn" className="lc-sub">
                    {t.nameBn}
                  </span>
                </td>
                <td className="text-[12.5px]">{t.basis ?? 'Company policy — no statutory basis'}</td>
                <td className="text-[12.5px]">
                  {t.entitlement ? `${fmtDays(t.entitlement)} a ${t.cycleKind === 'CALENDAR_YEAR' ? 'calendar year' : 'cycle'}` : t.accrualKind === 'PER_DAYS_WORKED' ? 'Per days worked, in arrears' : t.accrualKind === 'CREDIT' ? 'From working a holiday' : 'On the event'}
                </td>
                <td className="text-[12.5px]">{t.countsCalendarDays ? 'Every calendar day counts' : t.consumesHolidays ? 'Counted' : 'Not counted'}</td>
                <td className="text-[12.5px]">{t.womenOnly ? 'Women' : t.workersOnly ? 'Workers' : 'Everyone'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lc-card lc-table-wrap">
        <table className="lc-table">
          <caption className="lc-label px-4 pt-3 text-left">Earned leave by establishment — per establishment class, never per company</caption>
          <thead>
            <tr>
              <th scope="col">Establishment</th>
              <th scope="col">Days worked per day earned</th>
              <th scope="col">Adolescent</th>
              <th scope="col">Accumulates to at most</th>
            </tr>
          </thead>
          <tbody>
            {d.establishments.map((r) => (
              <tr key={r.establishment}>
                <td>{ESTABLISHMENT[r.establishment] ?? r.establishment}</td>
                <td className="lc-fig">{r.divisor}</td>
                <td className="lc-fig">{r.divisorAdolescent}</td>
                <td className="lc-fig">{r.cap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lc-card lc-table-wrap">
        <table className="lc-table">
          <caption className="lc-label px-4 pt-3 text-left">Every figure, with its citation</caption>
          <thead>
            <tr>
              <th scope="col">Rule</th>
              <th scope="col">Value</th>
              <th scope="col">Citation</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r) => (
              <tr key={r.key}>
                <td>
                  {r.label}
                  {r.note && <div className="lc-sub">{r.note}</div>}
                </td>
                <td className="lc-mono text-[12.5px]">{typeof r.value === 'object' ? JSON.stringify(r.value) : String(r.value)}</td>
                <td className="text-[12.5px]">
                  {r.citation ?? '—'} <ConfidenceTag value={r.confidence as Confidence} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
