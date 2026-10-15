'use client';

/**
 * What the grid is computed from: the site's holiday calendar, its shifts and
 * who is on them, punches imported from a file, and the payroll elections.
 * No day is computed without a published calendar (backend §3.7): assuming
 * Friday is right for a factory and wrong for a shop.
 */

import * as React from 'react';
import { toast } from '@/lib/ToastService';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { Checkbox, Chip, DateInput, DrawerHead, ErrorBlock, LoadingBlock, Note, SelectInput, SideDrawer, SwitchRow, TextInput } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import * as api from './api';
import { fromMinutes, hours, parsePunchCsv, toMinutes } from './defs';
import { useAttendanceInvalidate, useCalendar, useElections, useShifts } from './hooks';
import type { CalendarDayRow, Elections } from './types';

const errorText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong.');

function useWrite() {
  const invalidate = useAttendanceInvalidate();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const run = async <T,>(fn: () => Promise<T>, done?: string): Promise<T | null> => {
    setBusy(true);
    setError(null);
    try {
      const out = await fn();
      void invalidate(); // the month refetches behind the toast; the write is done
      if (done) toast.success(done);
      return out;
    } catch (err) {
      setError(errorText(err));
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { run, busy, error };
}

function Alert({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div role="alert" className="bd-error">
      {text}
    </div>
  );
}

/* ── the holiday calendar ─────────────────────────────────────────── */

const WEEKDAYS: [string, string][] = [
  ['1', 'Mon'],
  ['2', 'Tue'],
  ['3', 'Wed'],
  ['4', 'Thu'],
  ['5', 'Fri'],
  ['6', 'Sat'],
  ['7', 'Sun'],
];
const KINDS = [
  { value: 'FESTIVAL_HOLIDAY', label: 'Festival holiday' },
  { value: 'PUBLIC_HOLIDAY', label: 'Public holiday' },
  { value: 'HALF_DAY', label: 'Half day' },
];

export function CalendarDrawer({ site, year: initialYear, onClose }: { site: string; year: number; onClose: () => void }) {
  const [year, setYear] = React.useState(initialYear);
  const cal = useCalendar(site, year);
  return (
    <SideDrawer onClose={onClose} labelledBy="att-cal-title" width={620}>
      <DrawerHead
        id="att-cal-title"
        title="Holiday calendar"
        sub="The weekly holiday and the festival and public holidays for this site. Attendance is computed only against a published calendar."
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="bd-att-stepper mb-4 w-fit">
          <button type="button" aria-label="Previous year" onClick={() => setYear(year - 1)}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
          <span className="bd-mono">{year}</span>
          <button type="button" aria-label="Next year" onClick={() => setYear(year + 1)}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
        {cal.isPending ? <LoadingBlock /> : cal.isError ? <ErrorBlock error={cal.error} onRetry={() => void cal.refetch()} /> : <CalendarForm key={`${year}-${cal.data.publishedAt}`} site={site} data={cal.data} />}
      </div>
    </SideDrawer>
  );
}

function CalendarForm({ site, data }: { site: string; data: import('./types').CalendarRead }) {
  const [pattern, setPattern] = React.useState<Record<string, number>>(
    Object.keys(data.weeklyPattern).length || data.status ? data.weeklyPattern : { '5': 1 }
  );
  const [days, setDays] = React.useState<CalendarDayRow[]>(data.days);
  const [consulted, setConsulted] = React.useState(data.consultedWith);
  const w = useWrite();
  const locked = data.lockedMonths.length > 0;
  const editable = (data.can?.write ?? false) && !locked;

  const cycle = (k: string) => {
    const now = pattern[k] ?? 0;
    const next = now === 0 ? 1 : now === 1 ? 0.5 : 0;
    const copy = { ...pattern };
    if (next) copy[k] = next;
    else delete copy[k];
    setPattern(copy);
  };
  const setDay = (i: number, patch: Partial<CalendarDayRow>) => setDays(days.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const save = () =>
    api.saveCalendar(data.year, {
      weeklyPattern: pattern,
      days: days.filter((d) => d.date || d.name).map((d) => ({ ...d, nameBn: d.nameBn || null })),
      consultedWith: consulted,
      site: site || undefined,
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {data.status === 'PUBLISHED' ? (
          <Chip tone="ok" dot>
            Published{data.publishedAt ? ` ${new Date(data.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}` : ''}
          </Chip>
        ) : data.status === 'DRAFT' ? (
          <Chip tone="warn" dot>
            Draft — not used until published
          </Chip>
        ) : (
          <Chip tone="neutral">Not set up</Chip>
        )}
        {locked && <Chip tone="violet">Locked months: {data.lockedMonths.join(', ')}</Chip>}
      </div>
      {locked && <Note tone="violet">A month of {data.year} is locked, so the calendar it was computed on cannot change. Reopen the month first.</Note>}

      <div className="bd-panel">
        <div className="bd-eyebrow">Weekly holiday</div>
        <p className="mb-2.5 mt-1 text-[12px] text-[#6F6A85]">Click a day: full holiday, half day, working. A worker is entitled to at least one full weekly holiday (s.103).</p>
        <div className="bd-att-weekpick" role="group" aria-label="Weekly pattern">
          {WEEKDAYS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              data-v={pattern[k] ?? 0}
              disabled={!editable}
              aria-label={`${label}: ${pattern[k] === 1 ? 'weekly holiday' : pattern[k] === 0.5 ? 'half day' : 'working'}`}
              onClick={() => cycle(k)}
            >
              {label}
              {pattern[k] === 0.5 ? ' ½' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="bd-panel">
        <div className="flex items-center gap-2">
          <div className="bd-eyebrow">Holidays</div>
          <span className="flex-1" />
          <span className="bd-mono text-[11.5px] text-[#6E6883]">{days.length}</span>
        </div>
        <div className="mt-2.5 space-y-2">
          {days.map((d, i) => (
            <div key={i} className="grid grid-cols-[140px_minmax(0,1fr)_150px_32px] items-center gap-2 max-sm:grid-cols-1">
              <DateInput value={d.date} onChange={(v) => setDay(i, { date: v ?? '' })} aria-label="Date" disabled={!editable} />
              <TextInput value={d.name} onChange={(v) => setDay(i, { name: v })} placeholder="Name, e.g. Eid-ul-Fitr" aria-label="Name" disabled={!editable} />
              <SelectInput value={d.kind} onChange={(v) => setDay(i, { kind: v as CalendarDayRow['kind'] })} options={KINDS} placeholder={null} aria-label="Kind" disabled={!editable} />
              {editable && (
                <button type="button" className="bd-iconbtn !h-8 !w-8" aria-label={`Remove ${d.name || 'this holiday'}`} onClick={() => setDays(days.filter((_, j) => j !== i))}>
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        {editable && (
          <button type="button" className="bd-btn-dashed mt-3" onClick={() => setDays([...days, { date: '', name: '', nameBn: null, kind: 'FESTIVAL_HOLIDAY' }])}>
            Add a holiday
          </button>
        )}
      </div>

      <div className="bd-panel">
        <label htmlFor="att-consulted" className="bd-eyebrow block">
          Consulted with
        </label>
        <p className="mb-2 mt-1 text-[12px] text-[#6F6A85]">Festival holidays are fixed in consultation with the participation committee (s.118).</p>
        <TextInput id="att-consulted" value={consulted} onChange={setConsulted} placeholder="e.g. Participation committee, meeting of 12 Dec" disabled={!editable} />
      </div>

      <Alert text={w.error} />
      {editable && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="bd-btn !border-[rgba(22,23,42,0.14)] !bg-white" disabled={w.busy} onClick={() => void w.run(save, 'Calendar saved as a draft')}>
            Save draft
          </button>
          <button
            type="button"
            className="bd-btn-primary"
            disabled={w.busy}
            onClick={() =>
              void w.run(async () => {
                await save();
                return api.publishCalendar(data.year, site || undefined);
              }, `${data.year} calendar published`)
            }
          >
            {data.status === 'PUBLISHED' ? 'Save and republish' : 'Publish'}
          </button>
        </div>
      )}
      {!data.can?.write && <p className="text-[12px] text-[#6F6A85]">Changing the calendar needs the “write attendance” permission.</p>}
    </div>
  );
}

/* ── shifts ───────────────────────────────────────────────────────── */

export function ShiftsDrawer({ site, month, onClose }: { site: string; month: string; onClose: () => void }) {
  const shifts = useShifts(site);
  const [creating, setCreating] = React.useState(false);
  const data = shifts.data;
  return (
    <SideDrawer onClose={onClose} labelledBy="att-shift-title" width={620}>
      <DrawerHead
        id="att-shift-title"
        title="Shifts"
        sub="A shift that has been worked is never edited; a change is a new version. Assignments are effective-dated and never overlap."
        onClose={onClose}
      />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {shifts.isPending ? (
          <LoadingBlock />
        ) : shifts.isError ? (
          <ErrorBlock error={shifts.error} onRetry={() => void shifts.refetch()} />
        ) : (
          data && (
            <>
              {data.rows.length === 0 && !creating && <Note tone="warn">No shifts yet. A day with no shift cannot be computed: create one, then assign people to it.</Note>}
              {data.rows.map((s) => (
                <div key={s.uid} className="bd-panel !py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bd-mono rounded-[7px] bg-[rgba(124,77,255,0.1)] px-1.5 py-0.5 text-[12px] font-bold text-[#5A2BE0]">{s.code}</span>
                    <span className="text-[13.5px] font-bold">{s.label}</span>
                    <span className="bd-mono text-[12.5px] text-[#44405C]">
                      {s.start}–{s.end}
                    </span>
                    {s.isNightShift && <Chip tone="violet">Night</Chip>}
                    <span className="flex-1" />
                    <span className="text-[12px] text-[#6F6A85]">{s.assigned} assigned</span>
                  </div>
                  <div className="mt-1 text-[12px] text-[#6F6A85]">
                    {hours(s.standardMinutes)} standard · {s.unpaidBreak} min unpaid break · {s.grace} min grace
                    {s.otStartsAfter ? ` · overtime after ${s.otStartsAfter} min` : ''} · {s.requiresPreApproval ? 'overtime needs pre-approval' : 'no pre-approval'} · from{' '}
                    {s.effectiveFrom}
                  </div>
                </div>
              ))}
              {data.can.write && (creating ? <ShiftForm site={site} onDone={() => setCreating(false)} /> : <button type="button" className="bd-btn-dashed" onClick={() => setCreating(true)}>New shift</button>)}
              {data.rows.length > 0 && <AssignForm site={site} month={month} data={data} />}
            </>
          )
        )}
      </div>
    </SideDrawer>
  );
}

function ShiftForm({ site, onDone }: { site: string; onDone: () => void }) {
  const [f, setF] = React.useState({ code: '', label: '', start: '08:00', end: '17:00', unpaidBreak: '60', grace: '10', otStartsAfter: '0', pre: true, from: new Date().toISOString().slice(0, 10) });
  const w = useWrite();
  const set = (patch: Partial<typeof f>) => setF({ ...f, ...patch });
  const start = toMinutes(f.start);
  const endRaw = toMinutes(f.end);
  const end = start !== null && endRaw !== null ? (endRaw <= start ? endRaw + 1440 : endRaw) : null;
  const span = start !== null && end !== null ? end - start : null;
  const standard = span !== null ? span - Number(f.unpaidBreak || 0) : null;
  const submit = () =>
    w.run(
      () =>
        api.createShift({
          code: f.code,
          label: f.label,
          startMin: start ?? -1,
          endMin: end ?? -1,
          unpaidBreak: Number(f.unpaidBreak || 0),
          grace: Number(f.grace || 0),
          otStartsAfter: Number(f.otStartsAfter || 0),
          requiresPreApproval: f.pre,
          effectiveFrom: f.from,
          site: site || undefined,
        }),
      `Shift ${f.code.toUpperCase()} created`
    ).then((out) => out && onDone());

  return (
    <div className="bd-panel bd-att-pop space-y-3">
      <div className="bd-eyebrow">New shift</div>
      <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2.5">
        <TextInput value={f.code} onChange={(v) => set({ code: v.toUpperCase() })} placeholder="Code, A" aria-label="Code" maxLength={20} />
        <TextInput value={f.label} onChange={(v) => set({ label: v })} placeholder="Label, e.g. General" aria-label="Label" />
      </div>
      <div className="grid grid-cols-5 gap-2.5 max-sm:grid-cols-2">
        {(
          [
            ['start', 'Start'],
            ['end', 'End'],
            ['unpaidBreak', 'Break (min)'],
            ['grace', 'Grace (min)'],
            ['otStartsAfter', 'OT after (min)'],
          ] as const
        ).map(([k, label]) => (
          <div key={k}>
            <label htmlFor={`att-sf-${k}`} className="bd-label mb-1 block">
              {label}
            </label>
            <TextInput id={`att-sf-${k}`} value={f[k]} onChange={(v) => set({ [k]: v } as Partial<typeof f>)} inputMode={k === 'start' || k === 'end' ? 'text' : 'numeric'} />
          </div>
        ))}
      </div>
      <p className="m-0 text-[12px] text-[#6F6A85]">
        {span !== null && standard !== null
          ? `${fromMinutes(start!)}–${fromMinutes(end!)}${end! > 1439 ? ' (next day)' : ''}: a ${hours(span)} span less the break is ${hours(Math.max(0, standard))} standard.`
          : 'Times are HH:MM. An end before the start crosses midnight.'}
      </p>
      <SwitchRow checked={f.pre} onChange={(v) => set({ pre: v })} label="Overtime needs pre-approval (unapproved overtime is still paid)" />
      <div className="flex items-center gap-2">
        <label htmlFor="att-sf-from" className="bd-label">
          Effective from
        </label>
        <DateInput id="att-sf-from" value={f.from} onChange={(v) => set({ from: v ?? '' })} className="!w-[170px]" />
      </div>
      <Alert text={w.error} />
      <div className="flex gap-2">
        <button type="button" className="bd-btn-primary !h-9 !text-[12.5px]" disabled={w.busy || !f.code || !f.label || start === null || end === null} onClick={() => void submit()}>
          Create shift
        </button>
        <button type="button" className="bd-btn" onClick={onDone}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function AssignForm({ site, month, data }: { site: string; month: string; data: import('./types').ShiftsRead }) {
  const [shift, setShift] = React.useState(data.rows[0]?.uid ?? '');
  const [picked, setPicked] = React.useState<string[]>([]);
  const [from, setFrom] = React.useState(`${month}-01`);
  const [codes, setCodes] = React.useState('');
  const w = useWrite();
  const toggle = (code: string) => setPicked(picked.includes(code) ? picked.filter((c) => c !== code) : [...picked, code]);
  const extra = codes
    .split(/[\s,]+/)
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  const all = Array.from(new Set([...picked, ...extra]));
  return (
    <div className="bd-panel space-y-3">
      <div className="bd-eyebrow">Assign</div>
      {data.unassigned.length > 0 ? (
        <>
          <p className="m-0 text-[12px] text-[#8A5A06]">
            {data.unassigned.length} {data.unassigned.length === 1 ? 'employee has' : 'employees have'} no shift today.
          </p>
          <div className="max-h-[200px] space-y-1 overflow-y-auto">
            <Checkbox checked={picked.length === data.unassigned.length} onChange={(on) => setPicked(on ? data.unassigned.map((u) => u.code) : [])}>
              <span className="text-[12.5px] font-bold">All unassigned</span>
            </Checkbox>
            {data.unassigned.map((u) => (
              <Checkbox key={u.code} checked={picked.includes(u.code)} onChange={() => toggle(u.code)}>
                <span className="text-[12.5px]">
                  {u.nameEn} <span className="bd-mono text-[10.5px] text-[#6E6883]">{u.code}</span>
                  {u.department ? <span className="text-[#6F6A85]"> · {u.department}</span> : null}
                </span>
              </Checkbox>
            ))}
          </div>
        </>
      ) : (
        <p className="m-0 text-[12px] text-[#157A5B]">Everyone has a shift today.</p>
      )}
      <div>
        <label htmlFor="att-as-codes" className="bd-label mb-1 block">
          Or move people by code
        </label>
        <TextInput id="att-as-codes" value={codes} onChange={setCodes} placeholder="EMP-0001, EMP-0002" />
      </div>
      <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
        <div>
          <label htmlFor="att-as-shift" className="bd-label mb-1 block">
            Shift
          </label>
          <SelectInput id="att-as-shift" value={shift} onChange={setShift} options={data.rows.map((s) => ({ value: s.uid, label: `${s.code} · ${s.label} · ${s.start}–${s.end}` }))} placeholder={null} />
        </div>
        <div>
          <label htmlFor="att-as-from" className="bd-label mb-1 block">
            From
          </label>
          <DateInput id="att-as-from" value={from} onChange={(v) => setFrom(v ?? '')} />
        </div>
      </div>
      <p className="m-0 text-[11.5px] text-[#6E6883]">The assignment in force closes the day before. A later assignment is refused, not overwritten; a locked month cannot change.</p>
      <Alert text={w.error} />
      {data.can.write && (
        <button
          type="button"
          className="bd-btn-primary !h-9 !text-[12.5px]"
          disabled={w.busy || !all.length || !shift || !from}
          onClick={() =>
            void w
              .run(() => api.assignShift({ shift, employeeCodes: all, effectiveFrom: from, site: site || undefined }), `${all.length} assigned`)
              .then((out) => {
                if (out) {
                  setPicked([]);
                  setCodes('');
                }
              })
          }
        >
          Assign {all.length || ''}
        </button>
      )}
    </div>
  );
}

/* ── punch import ─────────────────────────────────────────────────── */

export function ImportDrawer({ site, onClose }: { site: string; onClose: () => void }) {
  const [text, setText] = React.useState('');
  const [result, setResult] = React.useState<import('./types').ImportResult | null>(null);
  const w = useWrite();
  const rows = parsePunchCsv(text);
  const onFile = async (file: File | undefined) => {
    if (file) setText(await file.text());
  };
  return (
    <SideDrawer onClose={onClose} labelledBy="att-imp-title" width={620}>
      <DrawerHead
        id="att-imp-title"
        title="Import punches"
        sub="Until the device feed is connected, punches come from a file. Importing the same file twice adds nothing; a row that cannot be placed is held with the reason, never dropped."
        onClose={onClose}
      />
      <div className="flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
        <div className="bd-panel space-y-2.5">
          <div className="bd-eyebrow">The file</div>
          <p className="m-0 text-[12px] text-[#6F6A85]">
            CSV, one punch a line: <span className="bd-mono">employeeCode,punchedAt,direction</span> — e.g. <span className="bd-mono">EMP-0001,2026-10-14 08:02,IN</span>. Times are
            Dhaka time. A night shift’s 02:00 belongs to the day it started; that is worked out for you.
          </p>
          <input type="file" accept=".csv,text/csv,text/plain" aria-label="Choose a CSV file" onChange={(e) => void onFile(e.target.files?.[0])} className="text-[12.5px]" />
          <textarea
            className="bd-input bd-mono !h-[160px] !text-[12px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'employeeCode,punchedAt,direction\nEMP-0001,2026-10-14 08:02,IN\nEMP-0001,2026-10-14 17:05,OUT'}
            aria-label="Punches, CSV"
          />
          <div className="text-[12px] text-[#6F6A85]">{rows.length} punches read</div>
        </div>
        <Alert text={w.error} />
        <button
          type="button"
          className="bd-btn-primary"
          disabled={w.busy || !rows.length}
          onClick={() =>
            void w.run(() => api.importPunches(rows, site || undefined)).then((out) => {
              if (out) {
                setResult(out);
                toast.success(`${out.inserted} punches imported`);
              }
            })
          }
        >
          {w.busy ? 'Importing…' : `Import ${rows.length || ''}`}
        </button>
        {result && (
          <div className="bd-panel bd-att-pop space-y-2" aria-live="polite">
            <div className="flex flex-wrap gap-2">
              <Chip tone="ok">{result.inserted} imported</Chip>
              <Chip tone="neutral">{result.duplicates} already on file</Chip>
              <Chip tone={result.quarantined.length ? 'warn' : 'neutral'}>{result.quarantined.length} held</Chip>
            </div>
            {result.quarantined.length > 0 && (
              <ul className="m-0 max-h-[220px] list-none space-y-1 overflow-y-auto p-0 text-[12px]">
                {result.quarantined.map((q, i) => (
                  <li key={i}>
                    <span className="bd-mono">{[q.row.employeeCode, q.row.punchedAt, q.row.direction].filter(Boolean).join(', ') || JSON.stringify(q.row)}</span>
                    <span className="text-[#8A5A06]"> — {q.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </SideDrawer>
  );
}

/* ── payroll elections ────────────────────────────────────────────── */

export function ElectionsDrawer({ onClose, canWrite }: { onClose: () => void; canWrite: boolean }) {
  const el = useElections();
  return (
    <SideDrawer onClose={onClose} labelledBy="att-el-title">
      <DrawerHead id="att-el-title" title="Payroll elections" sub="Three choices the Act leaves to the employer. They are stated, not assumed." onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {el.isPending ? <LoadingBlock /> : el.isError ? <ErrorBlock error={el.error} /> : <ElectionsForm data={el.data} canWrite={canWrite} />}
      </div>
    </SideDrawer>
  );
}

function ElectionsForm({ data, canWrite }: { data: Elections; canWrite: boolean }) {
  const [v, setV] = React.useState(data);
  const w = useWrite();
  const dw = (k: keyof Elections['daysWorked'], on: boolean) => setV({ ...v, daysWorked: { ...v.daysWorked, [k]: on } });
  return (
    <div className="space-y-4">
      <div className="bd-panel space-y-2">
        <div className="bd-eyebrow">Overtime base</div>
        <p className="m-0 text-[12px] text-[#6F6A85]">The hourly overtime rate is the monthly base ÷ 208 × 2 (s.108). The two bases differ by about 40%.</p>
        {(
          [
            ['BASIC_PLUS_DA', 'Basic + dearness allowance', 'Read from the salary structure in force.'],
            ['GROSS', 'Gross', 'Every component of the structure in force.'],
          ] as const
        ).map(([value, label, help]) => (
          <label key={value} className="flex cursor-pointer items-start gap-2.5 py-1">
            <input type="radio" name="otbase" checked={v.overtimeBase === value} onChange={() => setV({ ...v, overtimeBase: value })} disabled={!canWrite} className="mt-1" />
            <span>
              <span className="block text-[13px] font-semibold">{label}</span>
              <span className="block text-[12px] text-[#6F6A85]">{help}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="bd-panel">
        <div className="bd-eyebrow">Days worked for leave accrual (s.117)</div>
        <p className="mb-1 mt-1 text-[12px] text-[#6F6A85]">Present and on-duty days always count; absence and leave without pay never do. These three are independent.</p>
        <SwitchRow checked={v.daysWorked.paidLeave} onChange={(on) => dw('paidLeave', on)} label="Paid leave counts" disabled={!canWrite} />
        <SwitchRow checked={v.daysWorked.festival} onChange={(on) => dw('festival', on)} label="Festival holidays count" disabled={!canWrite} />
        <SwitchRow checked={v.daysWorked.weekly} onChange={(on) => dw('weekly', on)} label="Weekly holidays count" disabled={!canWrite} />
      </div>
      <Alert text={w.error} />
      {canWrite && (
        <button type="button" className="bd-btn-primary" disabled={w.busy} onClick={() => void w.run(() => api.saveElections(v), 'Elections saved')}>
          Save
        </button>
      )}
    </div>
  );
}
