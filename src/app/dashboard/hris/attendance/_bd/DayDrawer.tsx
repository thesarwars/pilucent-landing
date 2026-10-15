'use client';

/**
 * The day drawer (spec §8): the rostered shift, the punches, the computed
 * minutes with their arithmetic, what the day's overtime costs, every
 * exception with its remedy and citation -- and the corrections.
 *
 * A correction is an adjustment that overlays the computation (§15.1);
 * removing it restores the computed day exactly. Punches are never edited.
 */

import * as React from 'react';
import { toast } from '@/lib/ToastService';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { MASK } from '@/app/dashboard/hris/salary/_bd/parts';
import { Chip, DrawerHead, ErrorBlock, LoadingBlock, Note, SideDrawer, TextArea, TextInput, SelectInput } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { formatBDT } from '@/app/dashboard/hris/employee/employees/_bd/format';
import * as api from './api';
import { MIN_REASON, SETTABLE, STATUS, hours, longDate, toMinutes } from './defs';
import { useAttendanceInvalidate, useDay } from './hooks';
import type { DayDetail, DayStatus, ExceptionInfo, ExceptionKind } from './types';

export interface DayFocus {
  kind: ExceptionKind;
  action: string;
}

/** What each exception can be done with: the backend's ADJUSTING and DECIDING tables. */
export const ACTIONS: Record<ExceptionKind, string[]> = {
  MISSING_OUT_PUNCH: ['REGULARISE', 'HALF_DAY'],
  MISSING_IN_PUNCH: ['REGULARISE', 'HALF_DAY'],
  NO_PUNCH_ROSTERED: ['MARK_ABSENT', 'MARK_LEAVE', 'MARK_ON_DUTY'],
  ABSENT_NO_LEAVE: ['MARK_LWP', 'MARK_LEAVE'],
  DAILY_LIMIT_EXCEEDED: ['ACKNOWLEDGE'],
  LATE_ARRIVAL: ['ACCEPT'],
  OT_UNAPPROVED: ['APPROVE', 'REJECT'],
  WORKED_WEEKLY_HOLIDAY: ['CONFIRM'],
  WORKED_FESTIVAL_HOLIDAY: ['CONFIRM'],
};

export const ACTION_LABEL: Record<string, string> = {
  REGULARISE: 'Regularise',
  HALF_DAY: 'Mark half day',
  MARK_ABSENT: 'Mark absent',
  MARK_LEAVE: 'Apply leave',
  MARK_ON_DUTY: 'Mark on duty',
  MARK_LWP: 'Mark LWP',
  ACKNOWLEDGE: 'Acknowledge',
  ACCEPT: 'Accept',
  APPROVE: 'Approve',
  REJECT: 'Reject (still paid)',
  CONFIRM: 'Confirm',
};

/** Actions that write an adjustment, or put a refusal on record, need a reason. */
const NEEDS_REASON = new Set(['REGULARISE', 'HALF_DAY', 'MARK_ABSENT', 'MARK_LEAVE', 'MARK_ON_DUTY', 'MARK_LWP', 'ACKNOWLEDGE', 'REJECT']);

const reasonError = (text: string) =>
  text.trim().length >= MIN_REASON ? null : `A reason of at least ${MIN_REASON} characters (${text.trim().length} so far).`;

export function DayDrawer({
  code,
  date,
  focus,
  sessionReason,
  onClose,
}: {
  code: string;
  date: string;
  focus?: DayFocus | null;
  sessionReason: string;
  onClose: () => void;
}) {
  const day = useDay(code, date);
  const d = day.data;
  return (
    <SideDrawer onClose={onClose} labelledBy="att-day-title" width={560}>
      <DrawerHead
        id="att-day-title"
        title={d ? `${d.employee.nameEn} · ${longDate(d.date)}` : longDate(date)}
        sub={d ? [d.employee.code, d.holidayName ?? DAY_KIND[d.dayKind]].filter(Boolean).join(' · ') : code}
        onClose={onClose}
      />
      <div className="flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
        {day.isPending ? (
          <LoadingBlock />
        ) : day.isError ? (
          <ErrorBlock error={day.error} onRetry={() => void day.refetch()} />
        ) : (
          d && <DayBody d={d} focus={focus ?? null} sessionReason={sessionReason} />
        )}
      </div>
    </SideDrawer>
  );
}

const DAY_KIND: Record<string, string> = { WORKING: '', WEEKLY: 'Weekly holiday', HALF: 'Half day', HOLIDAY: 'Holiday' };

function DayBody({ d, focus, sessionReason }: { d: DayDetail; focus: DayFocus | null; sessionReason: string }) {
  const locked = d.period.status === 'LOCKED';
  const editable = d.can.write && !locked;
  const c = d.computed;
  const live = d.adjustments.find((a) => a.live && !a.removed);
  const status = c.status ? STATUS[c.status] : null;

  return (
    <>
      {locked && (
        <Note tone="violet">
          This month is locked. A day changes only after the month is reopened, with a reason — so payroll reassesses anything it computed.
        </Note>
      )}

      <div className="bd-panel">
        <div className="flex flex-wrap items-center gap-2">
          <div className="bd-eyebrow">Computed</div>
          <span className="flex-1" />
          {status ? (
            <span className="rounded-[8px] px-2 py-0.5 text-[12px] font-bold" style={{ background: status[2], color: status[3] }}>
              {status[1]}
            </span>
          ) : (
            <Chip tone="neutral">{c.pending ? 'Not yet' : c.noShift ? 'No shift' : 'Not employed'}</Chip>
          )}
          {c.adjusted && <Chip tone="violet">Adjusted</Chip>}
        </div>
        {c.noShift && (
          <Note tone="warn" className="mt-3">
            No shift is assigned for this day, so it cannot be computed. Assign one under Shifts.
          </Note>
        )}
        <dl className="bd-att-kv mt-3">
          <dt>Rostered shift</dt>
          <dd>
            {d.shift ? (
              <>
                {d.shift.code} · {d.shift.start}–{d.shift.end}
                <span className="block text-[11.5px] font-medium text-[#6F6A85]">
                  {d.shift.label} · {d.shift.unpaidBreak} min unpaid break · {d.shift.grace} min grace · {d.shift.standardMinutes} standard
                  {d.shift.requiresPreApproval ? ' · overtime needs pre-approval' : ''}
                </span>
              </>
            ) : (
              '—'
            )}
          </dd>
          <dt>In / out</dt>
          <dd className="bd-mono">
            {c.inTime ?? '—'} → {c.outTime ?? '—'}
          </dd>
          <dt>Worked</dt>
          <dd className="bd-mono">
            {c.worked} min{c.worked ? ` (${hours(c.worked)})` : ''}
          </dd>
          <dt>Late</dt>
          <dd className="bd-mono">{c.late} min</dd>
          <dt>Overtime</dt>
          <dd className="bd-mono">{c.overtime} min</dd>
        </dl>
        {c.steps.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-[12px] font-bold text-[#6B3FE8]">The arithmetic</summary>
            <ul className="bd-att-steps mt-2">
              {c.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div className="bd-panel">
        <div className="bd-eyebrow">Overtime rate</div>
        {d.masked ? (
          <p className="mb-0 mt-2 text-[12.5px] text-[#6F6A85]">
            <span className="bd-mono">{MASK}</span> — the rate and what this day costs need the “view salary figures” permission.
          </p>
        ) : d.otRate ? (
          <dl className="bd-att-kv mt-2">
            <dt>Hourly rate</dt>
            <dd className="bd-mono">{formatBDT(d.otRate.rate, { places: 2 })}</dd>
            <dt>Basis</dt>
            <dd>
              {formatBDT(d.otRate.base)} · {d.otRate.basis}
            </dd>
            <dt>This day</dt>
            <dd className="bd-mono">{formatBDT(d.otCost ?? '0', { places: 2 })}</dd>
          </dl>
        ) : (
          <p className="mb-0 mt-2 text-[12.5px] text-[#8A5A06]">No salary structure in force on this day, so there is no rate to compute.</p>
        )}
      </div>

      <div className="bd-panel">
        <div className="bd-eyebrow">Punches</div>
        {d.punches.length === 0 ? (
          <p className="mb-0 mt-2 text-[12.5px] text-[#6F6A85]">No punches on file for this day.</p>
        ) : (
          <ul className="m-0 mt-2 list-none space-y-1 p-0">
            {d.punches.map((p) => (
              <li key={`${p.at}-${p.direction}`} className="flex items-center gap-2 text-[12.5px]">
                <Chip tone={p.direction === 'IN' ? 'ok' : 'neutral'} className="!py-0 !text-[10.5px]">
                  {p.direction}
                </Chip>
                <span className="bd-mono">{p.at}</span>
                <span className="text-[11.5px] text-[#6E6883]">{p.source.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mb-0 mt-2 text-[11.5px] text-[#6E6883]">A punch is never edited. Correct the day below; the punches stay as evidence.</p>
      </div>

      {d.exceptions.map((x) => (
        <ExceptionCard key={x.kind} d={d} x={x} editable={editable} focus={focus?.kind === x.kind ? focus.action : null} sessionReason={sessionReason} />
      ))}

      {editable && !c.pending && <CorrectionForm d={d} sessionReason={sessionReason} live={!!live} />}

      {d.adjustments.length > 0 && <AdjustmentHistory d={d} editable={editable} />}
    </>
  );
}

function useDayWrite<T>(fn: (input: T) => Promise<unknown>, done: string) {
  const invalidate = useAttendanceInvalidate();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const run = async (input: T) => {
    setBusy(true);
    setError(null);
    try {
      await fn(input);
      void invalidate(); // the month refetches behind the toast; the write is done
      toast.success(done);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { run, busy, error };
}

function ExceptionCard({
  d,
  x,
  editable,
  focus,
  sessionReason,
}: {
  d: DayDetail;
  x: ExceptionInfo;
  editable: boolean;
  focus: string | null;
  sessionReason: string;
}) {
  const [action, setAction] = React.useState<string | null>(focus);
  const [reason, setReason] = React.useState(sessionReason);
  const [time, setTime] = React.useState('');
  const [nextDay, setNextDay] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const write = useDayWrite(async (body: { action: string }) => {
    const base = { employeeCode: d.employee.code, date: d.date, kind: x.kind };
    if (body.action === 'ACKNOWLEDGE') return api.acknowledge({ ...base, reason });
    const minutes = toMinutes(time, nextDay);
    return api.resolve({
      ...base,
      action: body.action,
      reason,
      inTimeMin: x.kind === 'MISSING_IN_PUNCH' ? minutes : undefined,
      outTimeMin: x.kind === 'MISSING_OUT_PUNCH' ? minutes : undefined,
    });
  }, x.kind === 'DAILY_LIMIT_EXCEEDED' ? 'Breach acknowledged — it stays in the compliance report' : `${x.label}: done`);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (focus) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [focus]);

  const decided = x.decision;
  const actions = ACTIONS[x.kind].filter((a) => a !== 'ACKNOWLEDGE' || d.can.acknowledge);
  const needsReason = action ? NEEDS_REASON.has(action) : false;
  const needsTime = action === 'REGULARISE';
  const rErr = needsReason ? reasonError(reason) : null;
  const tErr = needsTime && toMinutes(time) === null ? 'A time, HH:MM.' : null;

  const submit = async () => {
    setTouched(true);
    if (!action || rErr || tErr) return;
    if (await write.run({ action })) setAction(null);
  };

  return (
    <div ref={ref} className="bd-panel" style={{ borderColor: decided ? undefined : x.severity === 'HIGH' ? 'rgba(244,63,94,0.35)' : 'rgba(245,178,46,0.45)' }}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13.5px] font-bold">{x.label}</span>
        <Chip tone={x.severity === 'HIGH' ? 'blocked' : 'warn'} className="!py-0 !text-[10.5px]">
          {x.severity === 'HIGH' ? 'High' : 'Medium'}
        </Chip>
        {x.blocksClose && !decided && (
          <Chip tone="neutral" className="!py-0 !text-[10.5px]">
            Blocks the month closing
          </Chip>
        )}
        {decided && (
          <Chip tone={decided.state === 'ACKNOWLEDGED' ? 'violet' : 'ok'} className="!py-0 !text-[10.5px]">
            {decided.state === 'ACKNOWLEDGED' ? 'Acknowledged' : decided.outcome ? decided.outcome.toLowerCase() : 'Resolved'}
          </Chip>
        )}
      </div>
      <p className="mb-0 mt-1.5 text-[12.5px] leading-snug text-[#44405C]">{x.remedy}</p>
      {decided && (
        <p className="mb-0 mt-1.5 text-[12px] text-[#6F6A85]">
          {decided.by ?? 'Someone'} · {new Date(decided.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          {decided.resolution ? ` — “${decided.resolution}”` : ''}
        </p>
      )}
      <div className="mt-2 text-[11px] font-medium text-[#6E6883]">{x.citation}</div>

      {editable && !decided && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={action === a}
                className={action === a ? 'bd-btn-primary !h-8 !rounded-[10px] !px-3 !text-[12px]' : 'bd-btn !border-[rgba(22,23,42,0.14)] !bg-white'}
                onClick={() => {
                  setAction(action === a ? null : a);
                  setTouched(false);
                }}
              >
                {ACTION_LABEL[a]}
              </button>
            ))}
          </div>
          {action && (
            <div className="bd-att-pop mt-3 space-y-2.5">
              {needsTime && (
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor={`t-${x.kind}`} className="text-[12px] font-bold text-[#44405C]">
                    {x.kind === 'MISSING_IN_PUNCH' ? 'The day started at' : 'The day ended at'}
                  </label>
                  <TextInput id={`t-${x.kind}`} value={time} onChange={setTime} placeholder="17:00" className="!h-9 !w-[96px]" invalid={touched && !!tErr} />
                  {x.kind === 'MISSING_OUT_PUNCH' && (
                    <label className="flex items-center gap-1.5 text-[12px] text-[#44405C]">
                      <input type="checkbox" checked={nextDay} onChange={(e) => setNextDay(e.target.checked)} /> next day
                    </label>
                  )}
                </div>
              )}
              {(needsReason || action === 'CONFIRM' || action === 'APPROVE' || action === 'ACCEPT') && (
                <div>
                  <TextArea
                    value={reason}
                    onChange={setReason}
                    rows={2}
                    aria-label="Reason"
                    placeholder={needsReason ? 'Why — at least 10 characters. It goes on the audit.' : 'A note (optional)'}
                    invalid={touched && !!rErr}
                  />
                  {touched && (rErr || tErr) && <div className="bd-error mt-1">{[tErr, rErr].filter(Boolean).join(' ')}</div>}
                </div>
              )}
              {action === 'REJECT' && <Note tone="warn">Rejecting records the refusal. The overtime is still paid: s.108 does not depend on approval.</Note>}
              {action === 'CONFIRM' && (
                <Note tone="violet">
                  {x.kind === 'WORKED_FESTIVAL_HOLIDAY'
                    ? 'Confirming credits 2 compensatory days and 1 substitute holiday, and applies the holiday premium.'
                    : 'Confirming credits 1 compensatory holiday.'}
                </Note>
              )}
              {write.error && (
                <div role="alert" className="bd-error">
                  {write.error}
                </div>
              )}
              <button type="button" className="bd-btn-primary !h-9 !text-[12.5px]" disabled={write.busy} onClick={() => void submit()}>
                {write.busy ? 'Saving…' : ACTION_LABEL[action]}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CorrectionForm({ d, sessionReason, live }: { d: DayDetail; sessionReason: string; live: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<DayStatus | ''>('');
  const [inTime, setIn] = React.useState('');
  const [outTime, setOut] = React.useState('');
  const [outNext, setOutNext] = React.useState(false);
  const [reason, setReason] = React.useState(sessionReason);
  const [note, setNote] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const write = useDayWrite(
    () =>
      api.adjust({
        employeeCode: d.employee.code,
        date: d.date,
        newStatus: status || undefined,
        inTimeMin: inTime ? toMinutes(inTime) : null,
        outTimeMin: outTime ? toMinutes(outTime, outNext) : null,
        reason,
        note,
      }),
    live ? 'Correction replaced' : 'Day corrected'
  );
  const rErr = reasonError(reason);
  const tErr = (inTime && toMinutes(inTime) === null) || (outTime && toMinutes(outTime) === null) ? 'Times are HH:MM.' : null;
  const empty = !status && !inTime && !outTime ? 'Set a status, or an in- or out-time.' : null;

  if (!open) {
    return (
      <button type="button" className="bd-btn-dashed w-full justify-center" onClick={() => setOpen(true)}>
        {live ? 'Replace the correction' : 'Correct this day'}
      </button>
    );
  }
  return (
    <div className="bd-panel bd-att-pop space-y-3">
      <div className="bd-eyebrow">{live ? 'Replace the correction' : 'Correct this day'}</div>
      <div className="grid grid-cols-3 gap-2.5 max-sm:grid-cols-1">
        <div>
          <label htmlFor="att-status" className="bd-label mb-1 block">
            Status
          </label>
          <SelectInput
            id="att-status"
            value={status}
            onChange={(v) => setStatus(v as DayStatus | '')}
            options={SETTABLE.map((s) => ({ value: s, label: STATUS[s][1] }))}
            placeholder="As computed"
          />
        </div>
        <div>
          <label htmlFor="att-in" className="bd-label mb-1 block">
            In-time
          </label>
          <TextInput id="att-in" value={inTime} onChange={setIn} placeholder="08:00" />
        </div>
        <div>
          <label htmlFor="att-out" className="bd-label mb-1 block">
            Out-time
          </label>
          <TextInput id="att-out" value={outTime} onChange={setOut} placeholder="17:00" />
          <label className="mt-1 flex items-center gap-1.5 text-[11.5px] text-[#6F6A85]">
            <input type="checkbox" checked={outNext} onChange={(e) => setOutNext(e.target.checked)} /> next day
          </label>
        </div>
      </div>
      <p className="m-0 text-[11.5px] text-[#6E6883]">
        Holiday and weekly holiday come from the published calendar; overtime and exceptions are computed. Neither is set by hand.
      </p>
      <TextArea value={reason} onChange={setReason} rows={2} aria-label="Reason" placeholder="Why — at least 10 characters. It goes on the audit." invalid={touched && !!rErr} />
      <TextInput value={note} onChange={setNote} aria-label="Note" placeholder="A note (optional)" />
      {touched && (empty || tErr || rErr) && <div className="bd-error">{[empty, tErr, rErr].filter(Boolean).join(' ')}</div>}
      {write.error && (
        <div role="alert" className="bd-error">
          {write.error}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          className="bd-btn-primary !h-9 !text-[12.5px]"
          disabled={write.busy}
          onClick={async () => {
            setTouched(true);
            if (empty || tErr || rErr) return;
            if (await write.run(undefined)) setOpen(false);
          }}
        >
          {write.busy ? 'Saving…' : 'Save correction'}
        </button>
        <button type="button" className="bd-btn" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function AdjustmentHistory({ d, editable }: { d: DayDetail; editable: boolean }) {
  const [removing, setRemoving] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const write = useDayWrite(() => api.removeAdjustment({ employeeCode: d.employee.code, date: d.date, reason }), 'Correction removed — the day is computed as it was');
  const rErr = reasonError(reason);
  const live = d.adjustments.find((a) => a.live && !a.removed);

  return (
    <div className="bd-panel">
      <div className="flex items-center gap-2">
        <div className="bd-eyebrow">Corrections</div>
        <span className="flex-1" />
        {editable && live && !removing && (
          <button type="button" className="bd-btn !h-8 !border-[rgba(244,63,94,0.3)] !bg-white !text-[#E11D48]" onClick={() => setRemoving(true)}>
            Remove the correction
          </button>
        )}
      </div>
      {removing && (
        <div className="bd-att-pop mt-3 space-y-2">
          <TextArea value={reason} onChange={setReason} rows={2} aria-label="Reason for removing" placeholder="Why remove it — at least 10 characters." invalid={touched && !!rErr} />
          {touched && rErr && <div className="bd-error">{rErr}</div>}
          {write.error && (
            <div role="alert" className="bd-error">
              {write.error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              className="bd-btn-primary !h-9 !text-[12.5px]"
              disabled={write.busy}
              onClick={async () => {
                setTouched(true);
                if (rErr) return;
                if (await write.run(undefined)) setRemoving(false);
              }}
            >
              Remove
            </button>
            <button type="button" className="bd-btn" onClick={() => setRemoving(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <ol className="m-0 mt-2 list-none space-y-2 p-0">
        {d.adjustments.map((a) => (
          <li key={a.uid} className="text-[12px]" style={{ opacity: a.live ? 1 : 0.62 }}>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold">
                {a.removed
                  ? 'Removed'
                  : [a.newStatus ? STATUS[a.newStatus][1] : null, a.inTime ? `in ${a.inTime}` : null, a.outTime ? `out ${a.outTime}` : null].filter(Boolean).join(' · ')}
              </span>
              {a.live ? (
                <Chip tone="violet" className="!py-0 !text-[10px]">
                  In effect
                </Chip>
              ) : (
                <Chip tone="neutral" className="!py-0 !text-[10px]">
                  Superseded
                </Chip>
              )}
            </div>
            <div className="text-[#6F6A85]">
              “{a.reason}” — {a.by ?? 'someone'}, {new Date(a.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              {a.note ? ` · ${a.note}` : ''}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
