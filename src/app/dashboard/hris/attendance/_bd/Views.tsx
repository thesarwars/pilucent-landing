'use client';

/**
 * The three readings beside the grid: exceptions (spec §9), month close
 * (§10) and compliance (§11). Each is the same computation as the grid,
 * read another way; none stores anything.
 */

import * as React from 'react';
import { toast } from '@/lib/ToastService';
import { cn } from '@/lib/utils';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { Chip, ConfidenceTag, ErrorBlock, LoadingBlock, Note, TextArea } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import type { Confidence } from '@/app/dashboard/hris/employee/employees/_bd/types';
import * as api from './api';
import { ACTION_LABEL, type DayFocus } from './DayDrawer';
import { MIN_REASON, STATUS, hours, hoursDecimal, monthLabel, shortDate } from './defs';
import { type MonthQuery, useAttendanceInvalidate, useClose, useCompliance, useExceptions } from './hooks';
import type { CloseSummary, ExceptionKind, ExceptionRow, Gate } from './types';

type Open = (code: string, date: string, focus?: DayFocus) => void;

function Card({ title, desc, right, children, className }: { title: React.ReactNode; desc?: React.ReactNode; right?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <section className={cn('bd-section', className)}>
      <div className="bd-section-head">
        <div className="min-w-0 flex-1">
          <h2 className="bd-section-title">{title}</h2>
          {desc && <p className="bd-section-desc">{desc}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

/* ── exceptions (§9) ──────────────────────────────────────────────── */

const SEVERITY_ORDER: ExceptionKind[] = [
  'MISSING_OUT_PUNCH',
  'MISSING_IN_PUNCH',
  'NO_PUNCH_ROSTERED',
  'ABSENT_NO_LEAVE',
  'DAILY_LIMIT_EXCEEDED',
  'WORKED_FESTIVAL_HOLIDAY',
  'WORKED_WEEKLY_HOLIDAY',
  'LATE_ARRIVAL',
  'OT_UNAPPROVED',
];

export function ExceptionsView({ m, q, canWrite, onOpen }: { m: MonthQuery; q: string; canWrite: boolean; onOpen: Open }) {
  const list = useExceptions(m);
  const [showDecided, setShowDecided] = React.useState(false);
  if (list.isPending) return <LoadingBlock />;
  if (list.isError) return <ErrorBlock error={list.error} onRetry={() => void list.refetch()} />;
  const needle = q.trim().toLowerCase();
  const rows = list.data.rows.filter((r) => !needle || r.nameEn.toLowerCase().includes(needle) || r.code.toLowerCase().includes(needle));
  const open = rows.filter((r) => !r.decision);
  const decided = rows.filter((r) => r.decision);
  const groups = SEVERITY_ORDER.map((k) => ({ kind: k, rows: open.filter((r) => r.kind === k) })).filter((g) => g.rows.length);
  const locked = list.data.period.status === 'LOCKED';

  return (
    <div className="space-y-3.5">
      {groups.length === 0 && (
        <Card title="Nothing open" desc={`Every day of ${monthLabel(m.month)} can be paid as it stands${needle ? ' (for this search)' : ''}.`} />
      )}
      {groups.map((g) => {
        const first = g.rows[0];
        return (
          <Card
            key={g.kind}
            title={
              <span className="flex flex-wrap items-center gap-2">
                {first.label}
                <Chip tone={first.severity === 'HIGH' ? 'blocked' : 'warn'} className="!py-0 !text-[10.5px]">
                  {first.severity === 'HIGH' ? 'High' : 'Medium'}
                </Chip>
                <span className="bd-mono text-[12.5px] text-[#6F6A85]">{g.rows.length}</span>
              </span>
            }
            desc={
              <>
                {first.remedy}
                <span className="mt-1 block text-[11px] text-[#6E6883]">{first.citation}</span>
              </>
            }
            className="!p-0 [&>.bd-section-head]:px-[22px] [&>.bd-section-head]:pt-[18px]"
          >
            <div className="mt-2">
              {g.rows.map((r) => (
                <ExceptionLine key={`${r.code}-${r.date}-${r.kind}`} r={r} canAct={canWrite && !locked} onOpen={onOpen} />
              ))}
            </div>
          </Card>
        );
      })}
      {decided.length > 0 && (
        <Card
          title={`Decided · ${decided.length}`}
          desc="Resolved and acknowledged days, with who decided and why. An acknowledged breach stays in the compliance report."
          right={
            <button type="button" className="bd-btn" aria-expanded={showDecided} onClick={() => setShowDecided(!showDecided)}>
              {showDecided ? 'Hide' : 'Show'}
            </button>
          }
          className={showDecided ? '!pb-2' : undefined}
        >
          {showDecided && (
            <div className="mt-2">
              {decided.map((r) => (
                <ExceptionLine key={`${r.code}-${r.date}-${r.kind}`} r={r} canAct={false} onOpen={onOpen} />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function ExceptionLine({ r, canAct, onOpen }: { r: ExceptionRow; canAct: boolean; onOpen: Open }) {
  const status = r.status ? STATUS[r.status] : null;
  return (
    <div className="bd-att-exc">
      <div className="min-w-0">
        <button type="button" className="border-none bg-transparent p-0 text-left text-[13px] font-bold text-[#16172A] hover:underline" onClick={() => onOpen(r.code, r.date)}>
          {r.nameEn}
        </button>
        <div className="bd-mono text-[10.5px] text-[#6E6883]">
          {r.code} · {shortDate(r.date)}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#44405C]">
        {status && (
          <span className="rounded-[7px] px-1.5 py-0.5 text-[11px] font-bold" style={{ background: status[2], color: status[3] }}>
            {status[1]}
          </span>
        )}
        <span className="bd-mono">
          {r.inTime ?? '—'} → {r.outTime ?? '—'}
        </span>
        {r.worked > 0 && <span>{hours(r.worked)} worked</span>}
        {r.overtime > 0 && <span>{hours(r.overtime)} overtime</span>}
        {r.late > 0 && <span>{r.late} min late</span>}
        {r.decision && (
          <span className="text-[#6F6A85]">
            {r.decision.state === 'ACKNOWLEDGED' ? 'Acknowledged' : 'Resolved'} by {r.decision.by ?? 'someone'}
            {r.decision.resolution ? ` — “${r.decision.resolution}”` : ''}
          </span>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-1.5">
        {canAct &&
          r.actions.map((a) => (
            <button key={a} type="button" className="bd-btn !h-8 !border-[rgba(22,23,42,0.12)] !bg-white !text-[12px]" onClick={() => onOpen(r.code, r.date, { kind: r.kind, action: a })}>
              {ACTION_LABEL[a] ?? a}
            </button>
          ))}
        {!canAct && (
          <button type="button" className="bd-btn !h-8 !text-[12px]" onClick={() => onOpen(r.code, r.date)}>
            Open the day
          </button>
        )}
      </div>
    </div>
  );
}

/* ── month close (§10) ────────────────────────────────────────────── */

export function CloseView({ m, onOpen, onElections }: { m: MonthQuery; onOpen: Open; onElections: () => void }) {
  const close = useClose(m);
  if (close.isPending) return <LoadingBlock />;
  if (close.isError) return <ErrorBlock error={close.error} onRetry={() => void close.refetch()} />;
  const s = close.data;
  return (
    <div className="bd-att-cols">
      <div className="space-y-3.5">
        <Completeness s={s} m={m} onOpen={onOpen} />
        <Totals s={s} m={m} />
      </div>
      <div className="space-y-3.5">
        <Accrual s={s} onElections={onElections} />
        <HolidayWork s={s} m={m} onOpen={onOpen} />
      </div>
    </div>
  );
}

function GateLine({ g, onOpen }: { g: Gate; onOpen: Open }) {
  const [open, setOpen] = React.useState(false);
  const ok = g.count === 0;
  const mark = ok ? { bg: '#1FA97A', glyph: '✓' } : g.blocks ? { bg: '#F43F5E', glyph: '!' } : { bg: '#F5B22E', glyph: '!' };
  return (
    <div className="bd-att-gate">
      <span className="bd-att-gate-mark" style={{ background: mark.bg }} aria-hidden="true">
        {mark.glyph}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold">
          {g.label}
          {!ok && g.rows.length > 0 && <span className="bd-mono text-[12px] text-[#6F6A85]">{g.rows.length}</span>}
          {!ok && !g.blocks && (
            <Chip tone="warn" className="!py-0 !text-[10px]">
              Warns, does not block
            </Chip>
          )}
          <span className="sr-only">{ok ? 'clear' : g.blocks ? 'blocks the lock' : 'a warning'}</span>
        </div>
        {!ok && g.rows.length > 0 && (
          <>
            <button type="button" className="mt-1 border-none bg-transparent p-0 text-[12px] font-bold text-[#6B3FE8]" aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? 'Hide the rows' : 'Show the rows'}
            </button>
            {open && (
              <ul className="bd-att-pop m-0 mt-1.5 max-h-[220px] list-none overflow-y-auto p-0 text-[12px]">
                {g.rows.map((r, i) => (
                  <li key={`${r.code}-${r.date ?? i}-${r.kind ?? ''}`}>
                    {r.date ? (
                      <button type="button" className="w-full border-none bg-transparent px-0 py-1 text-left hover:text-[#6B3FE8]" onClick={() => onOpen(r.code, r.date!)}>
                        <span className="font-semibold">{r.nameEn ?? r.code}</span> · {shortDate(r.date)}
                        {r.label ? <span className="text-[#6F6A85]"> · {r.label}</span> : null}
                      </button>
                    ) : (
                      <span className="block py-1">
                        <span className="font-semibold">{r.code}</span>
                        <span className="text-[#6F6A85]"> · assign a shift under Shifts</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Completeness({ s, m, onOpen }: { s: CloseSummary; m: MonthQuery; onOpen: Open }) {
  const invalidate = useAttendanceInvalidate();
  const [busy, setBusy] = React.useState(false);
  const [reopening, setReopening] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const locked = s.period.status === 'LOCKED';

  const act = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      void invalidate();
      toast.success(done);
      setReopening(false);
      setReason('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title={`${monthLabel(m.month)} · Completeness`}
      desc="Attendance feeds payroll, earned leave accrual and the DIFE registers. A gap here reduces every worker’s leave entitlement next year."
    >
      <div className="mt-2">
        {s.gates.map((g) => (
          <GateLine key={g.key} g={g} onOpen={onOpen} />
        ))}
      </div>
      {locked && (
        <Note tone="violet" className="mt-3">
          Locked{s.period.lockedBy ? ` by ${s.period.lockedBy}` : ''}
          {s.period.lockedAt ? ` on ${new Date(s.period.lockedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}. Payroll may read this month.
        </Note>
      )}
      {!locked && s.period.reopenReason && (
        <Note tone="warn" className="mt-3">
          Reopened{s.period.reopenedAt ? ` on ${new Date(s.period.reopenedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}` : ''}: “{s.period.reopenReason}”
        </Note>
      )}
      {error && (
        <div role="alert" className="bd-error mt-3">
          {error}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!locked && s.can.lock && (
          <button type="button" className="bd-btn-primary" disabled={busy || !s.canLock} onClick={() => void act(() => api.lockPeriod({ month: m.month, site: m.site || undefined }), `${monthLabel(m.month)} locked`)}>
            Lock {monthLabel(m.month)}
          </button>
        )}
        {!locked && !s.canLock && <span className="text-[12px] text-[#6F6A85]">Clear the red gates to lock.</span>}
        {!locked && !s.can.lock && <span className="text-[12px] text-[#6F6A85]">Locking needs the “lock attendance” permission.</span>}
        {locked && s.can.reopen && !reopening && (
          <button type="button" className="bd-btn !border-[rgba(22,23,42,0.14)] !bg-white" onClick={() => setReopening(true)}>
            Reopen…
          </button>
        )}
        {locked && !s.can.reopen && <span className="text-[12px] text-[#6F6A85]">Reopening needs the “reopen attendance” permission — a different one from locking.</span>}
      </div>
      {reopening && (
        <div className="bd-att-pop mt-3 space-y-2">
          <TextArea value={reason} onChange={setReason} rows={2} aria-label="Reason for reopening" placeholder="Why reopen — at least 10 characters. Payroll reassesses anything it computed." />
          <div className="flex gap-2">
            <button
              type="button"
              className="bd-btn-primary !h-9 !text-[12.5px]"
              disabled={busy || reason.trim().length < MIN_REASON}
              onClick={() => void act(() => api.reopenPeriod({ month: m.month, site: m.site || undefined, reason }), `${monthLabel(m.month)} reopened`)}
            >
              Reopen
            </button>
            <button type="button" className="bd-btn" onClick={() => setReopening(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Totals({ s, m }: { s: CloseSummary; m: MonthQuery }) {
  const invalidate = useAttendanceInvalidate();
  const [busy, setBusy] = React.useState(false);
  const recompute = async () => {
    setBusy(true);
    try {
      const out = await api.recompute({ month: m.month, site: m.site || undefined });
      void invalidate();
      toast.success(`Recomputed ${out.days} days for ${out.employees} employees: ${out.openExceptions} open exceptions${out.staleSnapshots ? `, ${out.staleSnapshots} snapshots marked stale` : ''}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Recompute failed.');
    } finally {
      setBusy(false);
    }
  };
  const t = s.totals;
  const cells: [string, string][] = t
    ? [
        ['Present', String(t.present)],
        ['Half day', String(t.halfDay)],
        ['Absent', String(t.absent)],
        ['On leave', String(t.leave)],
        ['Leave without pay', String(t.lwp)],
        ['On duty', String(t.onDuty)],
        ['Holidays', String(t.holiday)],
        ['Weekly holidays', String(t.weekly)],
        ['Hours worked', hoursDecimal(t.workedMinutes)],
        ['Overtime hours', hoursDecimal(t.overtimeMinutes)],
        ['Late minutes', String(t.lateMinutes)],
      ]
    : [];
  return (
    <Card
      title="Computed totals"
      desc="Recomputable from punches, adjustments, shifts and the holiday calendar at any time."
      right={
        <button type="button" className="bd-btn !border-[rgba(22,23,42,0.14)] !bg-white" disabled={busy} onClick={() => void recompute()}>
          {busy ? 'Recomputing…' : 'Recompute'}
        </button>
      }
    >
      {t ? (
        <div className="bd-att-totals mt-3">
          {cells.map(([label, value]) => (
            <div key={label} className="bd-att-total">
              <div>{value}</div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[12.5px] text-[#6F6A85]">Nothing to total until the calendar is published.</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#6E6883]">
        Rule set {s.rules.version}
        <ConfidenceTag value={s.rules.confidence as Confidence} />
      </div>
    </Card>
  );
}

function Accrual({ s, onElections }: { s: CloseSummary; onElections: () => void }) {
  const e = s.elections.daysWorked ?? { paidLeave: false, festival: false, weekly: false };
  const counted = ['present and on-duty days', 'half days as ½', e.paidLeave && 'paid leave', e.festival && 'festival holidays', e.weekly && 'weekly holidays'].filter(Boolean);
  const notCounted = [!e.paidLeave && 'paid leave', !e.festival && 'festival holidays', !e.weekly && 'weekly holidays'].filter(Boolean);
  return (
    <div className="bd-att-accrual" aria-live="polite">
      <div className="bd-eyebrow !text-[#5A2BE0]">Days worked for leave accrual</div>
      <div className="bd-mono mt-1.5 text-[24px] font-bold text-[#5A2BE0]">{s.totals ? s.totals.daysWorked : '—'}</div>
      <p className="mb-0 mt-1 text-[12.5px] leading-snug text-[#44405C]">
        Counts {counted.join(', ')}.{notCounted.length ? ` Not ${notCounted.join(', ')}.` : ''} Never absence or leave without pay. This is the number that sets next year’s earned
        leave.
      </p>
      {s.employees.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-[12px] font-bold text-[#6B3FE8]">By employee</summary>
          <ul className="m-0 mt-1.5 max-h-[220px] list-none overflow-y-auto p-0 text-[12px]">
            {s.employees.map((p) => (
              <li key={p.code} className="flex justify-between gap-3 py-0.5">
                <span>
                  {p.nameEn} <span className="bd-mono text-[10.5px] text-[#6E6883]">{p.code}</span>
                </span>
                <span className="bd-mono font-bold">{p.daysWorked}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-[#6E6883]">{s.accrualCitation ?? 'Bangladesh Labour Act 2006, s.117'}</span>
        <button type="button" className="border-none bg-transparent p-0 text-[12px] font-bold text-[#6B3FE8]" onClick={onElections}>
          See the elections
        </button>
      </div>
    </div>
  );
}

function HolidayWork({ s, m, onOpen }: { s: CloseSummary; m: MonthQuery; onOpen: Open }) {
  const invalidate = useAttendanceInvalidate();
  const [reviewed, setReviewed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const rows = s.holidayWork;
  const locked = s.period.status === 'LOCKED';
  if (!rows.length) return null;
  const confirm = async () => {
    setBusy(true);
    try {
      const out = await api.confirmHolidayWork({ month: m.month, site: m.site || undefined });
      void invalidate();
      toast.success(`${out.confirmed} holiday-working days confirmed; compensatory days credited`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not confirm.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="bd-att-holiday">
      <div className="bd-eyebrow !text-[#8A5A06]">Holiday working · {rows.length}</div>
      <p className="mb-0 mt-1.5 text-[12.5px] leading-snug text-[#7A5210]">
        Confirming accrues compensatory holidays and applies the holiday-working premium to payroll. A festival holiday earns 2 compensatory days plus 1 substitute holiday; a
        weekly holiday earns 1.
      </p>
      {reviewed && (
        <ul className="bd-att-pop m-0 mt-2 max-h-[200px] list-none overflow-y-auto p-0 text-[12px]">
          {rows.map((r) => (
            <li key={`${r.code}-${r.date}-${r.kind}`}>
              <button type="button" className="w-full border-none bg-transparent px-0 py-1 text-left hover:text-[#6B3FE8]" onClick={() => onOpen(r.code, r.date!)}>
                <span className="font-semibold">{r.nameEn}</span> · {shortDate(r.date!)} · {r.label}
                {r.worked ? <span className="text-[#7A5210]"> · {hours(r.worked)}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex gap-2">
        <button type="button" className="bd-btn !border-[rgba(138,90,6,0.35)] !bg-white" aria-expanded={reviewed} onClick={() => setReviewed(true)}>
          Review
        </button>
        {s.can.write && !locked && (
          <button type="button" className="bd-btn-primary !h-[34px] !text-[12.5px]" disabled={!reviewed || busy} onClick={() => void confirm()} title={reviewed ? undefined : 'Review the days first'}>
            Confirm {rows.length}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── compliance (§11) ─────────────────────────────────────────────── */

export function ComplianceView({ m, onOpen }: { m: MonthQuery; onOpen: Open }) {
  const c = useCompliance(m);
  if (c.isPending) return <LoadingBlock />;
  if (c.isError) return <ErrorBlock error={c.error} onRetry={() => void c.refetch()} />;
  const d = c.data;
  const draft = d.rules.confidence !== 'VERIFIED' && d.rules.confidence !== 'LIVE';
  return (
    <div className="space-y-3.5">
      <Card
        title="Limits"
        desc="A week may reach 60 hours, but the annual average may not exceed 56. A system checking only the weekly cap passes a year that breaches the proviso."
        right={
          <span className="flex items-center gap-2 text-[11px] text-[#6E6883]">
            Rule set {d.rules.version}
            <ConfidenceTag value={d.rules.confidence as Confidence} />
          </span>
        }
      >
        <div className="bd-att-totals mt-3">
          <div className="bd-att-total">
            <div>{hours(d.limits.daily)}</div>
            <div>A day, at most</div>
          </div>
          <div className="bd-att-total">
            <div>{hours(d.limits.weekly)}</div>
            <div>A week, at most</div>
          </div>
          <div className="bd-att-total">
            <div>{hours(d.limits.annualAverage)}</div>
            <div>Weekly average over 52 weeks</div>
          </div>
        </div>
        {draft && (
          <Note tone="warn" className="mt-3">
            These limits are from a rule set marked {d.rules.confidence.toLowerCase()}. They may be shown; they must not be the figures a register is filed on.
          </Note>
        )}
      </Card>

      <Card title={`Daily · ${d.daily.length}`} desc="Days worked above the statutory daily maximum. The hours are paid; acknowledging records a reason, it does not erase the breach.">
        {d.daily.length === 0 ? (
          <Empty />
        ) : (
          <div className="bd-table-wrap mt-3">
            <table className="bd-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Day</th>
                  <th>Worked</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {d.daily.map((r) => (
                  <tr key={`${r.code}-${r.date}`}>
                    <td>
                      <button type="button" className="border-none bg-transparent p-0 text-left font-semibold hover:underline" onClick={() => onOpen(r.code, r.date)}>
                        {r.nameEn}
                      </button>
                      <div className="bd-mono text-[10.5px] text-[#6E6883]">{r.code}</div>
                    </td>
                    <td className="bd-mono">{shortDate(r.date)}</td>
                    <td className="bd-mono">
                      {hours(r.worked)} <span className="text-[#6E6883]">/ {hours(r.limit)}</span>
                    </td>
                    <td>
                      {r.acknowledged ? (
                        <span>
                          <Chip tone="violet" className="!py-0 !text-[10.5px]">
                            Acknowledged
                          </Chip>
                          {r.reason && <span className="ml-1.5 text-[11.5px] text-[#6F6A85]">“{r.reason}”</span>}
                        </span>
                      ) : (
                        <Chip tone="blocked" className="!py-0 !text-[10.5px]">
                          Open
                        </Chip>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-2 text-[11px] font-medium text-[#6E6883]">{d.daily[0]?.citation ?? 'Bangladesh Labour Act 2006, s.100 and s.102'}</div>
      </Card>

      <Card title={`Weekly · ${d.weekly.length}`} desc="ISO weeks above the weekly maximum. A week that crosses the month end is evaluated whole — one breach, not two partials.">
        {d.weekly.length === 0 ? (
          <Empty />
        ) : (
          <div className="bd-table-wrap mt-3">
            <table className="bd-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Week</th>
                  <th>Worked</th>
                </tr>
              </thead>
              <tbody>
                {d.weekly.map((r) => (
                  <tr key={`${r.code}-${r.weekStart}`}>
                    <td>
                      <span className="font-semibold">{r.nameEn}</span>
                      <div className="bd-mono text-[10.5px] text-[#6E6883]">{r.code}</div>
                    </td>
                    <td className="bd-mono">
                      {shortDate(r.weekStart)} – {shortDate(r.weekEnd)}
                    </td>
                    <td className="bd-mono">
                      {hours(r.worked)} <span className="text-[#6E6883]">/ {hours(r.limit)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-2 text-[11px] font-medium text-[#6E6883]">{d.weekly[0]?.citation ?? 'Bangladesh Labour Act 2006, s.102'}</div>
      </Card>

      <Card title={`Annual average · ${d.annual.length}`} desc="The 52 weeks to the end of this month, averaged over the weeks with attendance on file.">
        {d.annual.length === 0 ? (
          <Empty />
        ) : (
          <div className="bd-table-wrap mt-3">
            <table className="bd-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Weeks</th>
                  <th>Average</th>
                </tr>
              </thead>
              <tbody>
                {d.annual.map((r) => (
                  <tr key={r.code}>
                    <td>
                      <span className="font-semibold">{r.nameEn}</span>
                      <div className="bd-mono text-[10.5px] text-[#6E6883]">{r.code}</div>
                    </td>
                    <td className="bd-mono">{r.weeks}</td>
                    <td className="bd-mono">
                      {hours(r.average)} <span className="text-[#6E6883]">/ {hours(r.limit)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-2 text-[11px] font-medium text-[#6E6883]">{d.annual[0]?.citation ?? 'Bangladesh Labour Act 2006, s.102 proviso'}</div>
      </Card>
      <p className="m-0 text-[11.5px] text-[#6E6883]">{d.note}</p>
    </div>
  );
}

function Empty() {
  return <p className="mb-0 mt-2 text-[12.5px] text-[#157A5B]">No breaches.</p>;
}
