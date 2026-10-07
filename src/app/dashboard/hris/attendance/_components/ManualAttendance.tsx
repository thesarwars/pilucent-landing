'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { ArrowLeft, CalendarRange, Clock, Check, Trash2, Loader2 } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchEmployees, postAttendance } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import { Avatar, Chip, IconChip, VioletButton } from '@/components/violet';
import { cn } from '@/lib/utils';

/**
 * Bulk Manual Attendance.
 * UI-only redesign — persistence still uses the existing `postAttendance`
 * ({ date, employee_uid, check_in, check_out, status }), one call per marked
 * employee. The spec's P/A/L/H/O letters map onto the API's existing status
 * values (no new backend statuses are introduced).
 */
type MarkKey = 'P' | 'A' | 'L' | 'H' | 'O';

const MARKS: {
  key: MarkKey;
  label: string;
  api: string;
  fg: string;
  bg: string;
  solid: string;
  offDay: boolean;
}[] = [
  { key: 'P', label: 'Present', api: 'PRESENT', fg: '#137A57', bg: '#DEF5E9', solid: '#1FA97A', offDay: false },
  { key: 'A', label: 'Absent', api: 'ABSENT', fg: '#D2483E', bg: '#FCE8E8', solid: '#E0452C', offDay: true },
  { key: 'L', label: 'Late', api: 'LATE_ARRIVAL', fg: '#B97608', bg: '#FDF2DE', solid: '#F5B22E', offDay: false },
  { key: 'H', label: 'Half day', api: 'EARLY_DEPARTURE', fg: '#0E7490', bg: '#E0F2F7', solid: '#0E9F9F', offDay: false },
  { key: 'O', label: 'Holiday', api: 'LEAVE', fg: '#7C4DFF', bg: '#EEE9FF', solid: '#7C4DFF', offDay: true },
];

const MARK_BY_KEY = Object.fromEntries(MARKS.map((m) => [m.key, m])) as Record<MarkKey, (typeof MARKS)[number]>;

const DEFAULT_TIMES: Record<MarkKey, [string, string]> = {
  P: ['09:00', '17:00'],
  L: ['10:00', '17:00'],
  H: ['09:00', '13:00'],
  A: ['', ''],
  O: ['', ''],
};

interface RowState {
  mark: MarkKey | null;
  check_in: string;
  check_out: string;
  note: string;
}

const blankRow = (): RowState => ({ mark: null, check_in: '', check_out: '', note: '' });

const empName = (e: any) =>
  `${e?.user?.first_name || ''} ${e?.user?.middle_name || ''} ${e?.user?.last_name || ''}`
    .replace(/\s+/g, ' ')
    .trim() || '—';

const ManualAttendance = () => {
  const router = useRouter();
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [marks, setMarks] = useState<Record<string, RowState>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [qIn, setQIn] = useState('09:00');
  const [qOut, setQOut] = useState('17:00');
  const [qNote, setQNote] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, isPending } = useFetch(['employees'], fetchEmployees, { limit: 200 });
  const employees: any[] = data?.results || data?.data || [];
  const total = employees.length;

  const rowOf = (uid: string) => marks[uid] || blankRow();

  const summary = useMemo(() => {
    const c: Record<MarkKey, number> = { P: 0, A: 0, L: 0, H: 0, O: 0 };
    Object.values(marks).forEach((r) => {
      if (r.mark) c[r.mark] += 1;
    });
    return c;
  }, [marks]);

  const markedCount = useMemo(
    () => Object.values(marks).filter((r) => r.mark).length,
    [marks],
  );
  const progress = total ? Math.round((markedCount / total) * 100) : 0;

  const selectedUids = useMemo(
    () => employees.filter((e) => selected[e?.uid]).map((e) => e.uid),
    [employees, selected],
  );
  const allSelected = total > 0 && selectedUids.length === total;

  /* ── mark helpers ──────────────────────────────────────────────────────── */
  const setMark = (uid: string, key: MarkKey) => {
    setMarks((prev) => {
      const cur = prev[uid] || blankRow();
      const [di, doo] = DEFAULT_TIMES[key];
      return {
        ...prev,
        [uid]: { ...cur, mark: key, check_in: di, check_out: doo },
      };
    });
  };

  const setField = (uid: string, field: keyof RowState, value: string) => {
    setMarks((prev) => ({ ...prev, [uid]: { ...(prev[uid] || blankRow()), [field]: value } }));
  };

  const markEveryone = (key: MarkKey) => {
    const [di, doo] = DEFAULT_TIMES[key];
    const next: Record<string, RowState> = {};
    employees.forEach((e) => {
      const cur = marks[e.uid] || blankRow();
      next[e.uid] = { ...cur, mark: key, check_in: di, check_out: doo };
    });
    setMarks(next);
  };

  const clearAll = () => {
    setMarks({});
    setSelected({});
  };

  const applyQuickFill = () => {
    const scope = selectedUids.length ? selectedUids : employees.map((e) => e.uid);
    setMarks((prev) => {
      const next = { ...prev };
      scope.forEach((uid) => {
        const cur = next[uid] || blankRow();
        next[uid] = { ...cur, check_in: qIn, check_out: qOut, note: qNote || cur.note };
      });
      return next;
    });
  };

  const toggleSelect = (uid: string) =>
    setSelected((p) => ({ ...p, [uid]: !p[uid] }));
  const toggleSelectAll = () => {
    if (allSelected) return setSelected({});
    const next: Record<string, boolean> = {};
    employees.forEach((e) => (next[e.uid] = true));
    setSelected(next);
  };

  /* ── save ──────────────────────────────────────────────────────────────── */
  const handleSave = async () => {
    const toSave = employees.filter((e) => marks[e.uid]?.mark);
    if (!toSave.length) {
      toast.info('Mark at least one employee first.');
      return;
    }
    try {
      setSaving(true);
      const results = await Promise.allSettled(
        toSave.map((e) => {
          const r = marks[e.uid];
          const m = MARK_BY_KEY[r.mark as MarkKey];
          return postAttendance({
            date,
            employee_uid: e.uid,
            check_in: m.offDay ? '' : r.check_in,
            check_out: m.offDay ? '' : r.check_out,
            status: m.api,
          });
        }),
      );
      const ok = results.filter((r) => r.status === 'fulfilled' && (r.value as any)?.success).length;
      if (ok) {
        toast.success(`Attendance saved for ${ok} ${ok === 1 ? 'employee' : 'employees'}.`);
        router.push('/dashboard/hris/attendance/attendance_list');
      } else {
        toast.error('Could not save attendance. Please try again.');
      }
    } catch {
      toast.error('Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  };

  const applyLabel = selectedUids.length ? `Apply to ${selectedUids.length} selected` : 'Apply to all';
  const gridCols = 'minmax(150px,1.2fr) 248px 96px 96px minmax(130px,1fr)';

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta text-v-ink900">
      {/* header */}
      <div className="flex animate-v-rise items-center gap-3">
        <button
          type="button"
          aria-label="Back to attendance"
          onClick={() => router.push('/dashboard/hris/attendance/attendance_list')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-v-border bg-white/70 text-v-ink500 backdrop-blur transition-colors hover:border-v-primary hover:text-v-primary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-white"
          style={{ backgroundImage: 'linear-gradient(140deg,#7C4DFF,#A78BFF)' }}
        >
          <CalendarRange className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <h1 className="m-0 text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
            Bulk attendance
          </h1>
          <p className="text-[12.5px] text-v-ink400">Mark the whole team for a day in one pass</p>
        </div>
        <span className="flex-1" />
        <Chip tone="violet">
          {markedCount} of {total} marked
        </Chip>
      </div>

      {/* summary strip */}
      <div className="grid animate-v-rise grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" style={{ animationDelay: '0.06s' }}>
        {MARKS.map((m) => (
          <div key={m.key} className="flex items-center gap-3 rounded-[14px] bg-white p-3.5 shadow-v-card">
            <span className="h-[34px] w-[10px] shrink-0 rounded-full" style={{ backgroundColor: m.solid }} />
            <div className="min-w-0">
              <div className="text-[21px] font-extrabold tabular-nums leading-none text-v-ink900">
                {summary[m.key]}
              </div>
              <div className="mt-1 text-[11.5px] font-semibold text-v-ink500">{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* control panel */}
      <div className="animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card" style={{ animationDelay: '0.1s' }}>
        {/* gradient header */}
        <div
          className="flex flex-wrap items-center gap-3 border-b border-v-border px-5 py-4"
          style={{ backgroundImage: 'linear-gradient(120deg,#F4F0FF,#FBFAFF)' }}
        >
          <span
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[12px] leading-none text-white"
            style={{ backgroundImage: 'linear-gradient(140deg,#7C4DFF,#A78BFF)' }}
          >
            <span className="text-[9px] font-bold uppercase tracking-wide">{moment(date).format('MMM')}</span>
            <span className="text-[17px] font-extrabold tabular-nums">{moment(date).format('DD')}</span>
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-v-ink400">Attendance date</div>
            <div className="text-[14px] font-extrabold tabular-nums text-v-ink900">
              {moment(date).format('dddd, D MMMM YYYY')}
            </div>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-v-input border border-v-border bg-white px-2.5 py-1.5 text-[12.5px] tabular-nums text-v-ink900 outline-none transition-colors focus:border-v-primary"
          />
          <span className="flex-1" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11.5px] font-semibold text-v-ink500">Mark everyone</span>
            {(['P', 'A', 'O'] as MarkKey[]).map((k) => {
              const m = MARK_BY_KEY[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => markEveryone(k)}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-transform hover:-translate-y-px"
                  style={{ borderColor: `${m.solid}55`, color: m.fg, backgroundColor: m.bg }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.solid }} />
                  All {m.label.toLowerCase()}
                </button>
              );
            })}
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-v-border px-3 py-1.5 text-[12px] font-semibold text-v-ink500 transition-colors hover:border-v-danger-fg hover:text-v-danger-fg"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* quick-fill row */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3.5">
          <IconChip tone="teal" size="sm">
            <Clock />
          </IconChip>
          <span className="text-[12.5px] font-bold text-v-ink900">Quick fill</span>
          <span className="h-5 w-px bg-v-border" />
          <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-v-ink500">
            In
            <input
              type="time"
              value={qIn}
              onChange={(e) => setQIn(e.target.value)}
              className="rounded-v-input border border-v-border bg-v-wash px-2 py-1.5 text-[12px] tabular-nums text-v-ink900 outline-none focus:border-v-primary focus:bg-white"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-v-ink500">
            Out
            <input
              type="time"
              value={qOut}
              onChange={(e) => setQOut(e.target.value)}
              className="rounded-v-input border border-v-border bg-v-wash px-2 py-1.5 text-[12px] tabular-nums text-v-ink900 outline-none focus:border-v-primary focus:bg-white"
            />
          </label>
          <input
            value={qNote}
            onChange={(e) => setQNote(e.target.value)}
            placeholder="Note for everyone"
            className="min-w-[160px] flex-1 rounded-v-input border border-v-border bg-v-wash px-3 py-1.5 text-[12.5px] text-v-ink900 outline-none placeholder:text-v-ink400 focus:border-v-primary focus:bg-white"
          />
          <VioletButton variant="primary" size="sm" onClick={applyQuickFill}>
            {applyLabel}
          </VioletButton>
        </div>
      </div>

      {/* per-employee table */}
      <div className="animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card" style={{ animationDelay: '0.14s' }}>
        {/* progress bar */}
        <div className="h-1 w-full bg-v-wash2">
          <div
            className="h-full transition-[width] duration-300"
            style={{ width: `${progress}%`, backgroundImage: 'linear-gradient(90deg,#A78BFF,#7C4DFF)' }}
          />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* header strip */}
            <div
              className="grid items-center gap-2.5 border-b border-v-border bg-v-card-subtle px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-v-ink400"
              style={{ gridTemplateColumns: gridCols }}
            >
              <label className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 shrink-0 accent-v-primary"
                />
                Employee
              </label>
              <span>Status · P / A / L / H / O</span>
              <span>Check in</span>
              <span>Check out</span>
              <span>Note / remarks</span>
            </div>

            {isPending ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-v-primary" />
              </div>
            ) : total === 0 ? (
              <div className="py-16 text-center text-[13px] text-v-ink400">No employees found.</div>
            ) : (
              employees.map((e, i) => {
                const r = rowOf(e.uid);
                const m = r.mark ? MARK_BY_KEY[r.mark] : null;
                const offDay = m?.offDay;
                const name = empName(e);
                return (
                  <div
                    key={e.uid}
                    className={cn(
                      'grid animate-v-pop items-center gap-2.5 border-b border-[rgba(22,23,42,0.06)] px-4 py-2.5 last:border-0',
                      r.mark && 'bg-v-wash',
                    )}
                    style={{ gridTemplateColumns: gridCols, animationDelay: `${i * 0.03}s` }}
                  >
                    {/* employee */}
                    <div className="flex min-w-0 items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={!!selected[e.uid]}
                        onChange={() => toggleSelect(e.uid)}
                        className="h-4 w-4 shrink-0 accent-v-primary"
                      />
                      <Avatar name={name} size={34} />
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-bold text-v-ink900">{name}</div>
                        <div className="truncate text-[11px] text-v-ink400">
                          {e?.designation?.title || 'Employee'}
                        </div>
                      </div>
                    </div>

                    {/* P/A/L/H/O */}
                    <div className="flex items-center gap-1.5">
                      {MARKS.map((mk) => {
                        const active = r.mark === mk.key;
                        return (
                          <button
                            key={mk.key}
                            type="button"
                            title={mk.label}
                            onClick={() => setMark(e.uid, mk.key)}
                            className="flex h-[38px] w-[42px] items-center justify-center rounded-[11px] text-[14px] font-extrabold transition-colors"
                            style={
                              active
                                ? { backgroundColor: mk.solid, color: '#fff' }
                                : { backgroundColor: mk.bg, color: mk.fg }
                            }
                          >
                            {mk.key}
                          </button>
                        );
                      })}
                    </div>

                    {/* check in */}
                    <input
                      type="time"
                      value={r.check_in}
                      disabled={offDay}
                      onChange={(ev) => setField(e.uid, 'check_in', ev.target.value)}
                      className="w-full rounded-v-input border border-v-border bg-v-wash px-2 py-1.5 text-[12px] tabular-nums text-v-ink900 outline-none focus:border-v-primary focus:bg-white disabled:opacity-40"
                    />

                    {/* check out */}
                    <input
                      type="time"
                      value={r.check_out}
                      disabled={offDay}
                      onChange={(ev) => setField(e.uid, 'check_out', ev.target.value)}
                      className="w-full rounded-v-input border border-v-border bg-v-wash px-2 py-1.5 text-[12px] tabular-nums text-v-ink900 outline-none focus:border-v-primary focus:bg-white disabled:opacity-40"
                    />

                    {/* note */}
                    <input
                      value={r.note}
                      onChange={(ev) => setField(e.uid, 'note', ev.target.value)}
                      placeholder={offDay ? 'Reason (optional)' : 'Note'}
                      className="w-full rounded-v-input border border-v-border bg-v-wash px-2.5 py-1.5 text-[12px] text-v-ink900 outline-none placeholder:text-v-ink400 focus:border-v-primary focus:bg-white"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex flex-wrap items-center gap-3 border-t border-v-border px-5 py-3.5">
          <span className="text-[12px] tabular-nums text-v-ink500">
            {markedCount} of {total} marked · {moment(date).format('DD MMM, YYYY')}
          </span>
          <span className="flex-1" />
          <VioletButton
            variant="outline"
            onClick={() => router.push('/dashboard/hris/attendance/attendance_list')}
          >
            Cancel
          </VioletButton>
          <VioletButton
            variant="primary"
            onClick={handleSave}
            disabled={saving || markedCount === 0}
            leftIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          >
            {saving ? 'Saving…' : 'Save attendance'}
          </VioletButton>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendance;
