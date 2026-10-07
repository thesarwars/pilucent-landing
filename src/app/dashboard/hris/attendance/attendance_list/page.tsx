/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import {
  CalendarCheck2,
  CalendarDays,
  LogIn,
  LogOut,
  Plus,
  Printer,
  Pencil,
  Layers,
  UserCheck,
  UserX,
  Plane,
  Clock,
} from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchAttendances } from '@/app/helpers/backend';
import {
  Avatar,
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import Modal from '@/app/(admin)/_components/Modal';
import Attendance from './_components/Attendance';

/* ── status metadata (UI only — API status values unchanged) ─────────────── */
type Cat = 'present' | 'late' | 'absent' | 'holiday' | 'other';

const STATUS_META: Record<string, { label: string; tone: VioletTone; dot: string; cat: Cat }> = {
  PRESENT: { label: 'Present', tone: 'success', dot: '#1FA97A', cat: 'present' },
  OVERTIME: { label: 'Overtime', tone: 'success', dot: '#1FA97A', cat: 'present' },
  LATE_ARRIVAL: { label: 'Late', tone: 'warn', dot: '#F5B22E', cat: 'late' },
  EARLY_DEPARTURE: { label: 'Early departure', tone: 'warn', dot: '#F5B22E', cat: 'late' },
  ABSENT: { label: 'Absent', tone: 'danger', dot: '#E0452C', cat: 'absent' },
  REMOVED: { label: 'Removed', tone: 'neutral', dot: '#9A95AE', cat: 'absent' },
  LEAVE: { label: 'Leave', tone: 'violet', dot: '#A78BFF', cat: 'holiday' },
  DRAFT: { label: 'Draft', tone: 'neutral', dot: '#9A95AE', cat: 'other' },
};

const metaOf = (s?: string) =>
  STATUS_META[`${s || ''}`.toUpperCase()] || {
    label: `${s || '—'}`.split('_').join(' '),
    tone: 'neutral' as VioletTone,
    dot: '#9A95AE',
    cat: 'other' as Cat,
  };

const fmtTime = (t?: string) => (t ? moment(t, 'HH:mm:ss').format('hh:mm A') : '—');
const empName = (e?: any) =>
  e?.full_name || [e?.first_name, e?.middle_name, e?.last_name].filter(Boolean).join(' ') || '—';

const AttendanceList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uid, setUid] = useState<string | null>('');

  const [mode, setMode] = useState<'day' | 'range'>('day');
  const [day, setDay] = useState(moment().format('YYYY-MM-DD'));
  const [from, setFrom] = useState(moment().format('YYYY-MM-DD'));
  const [to, setTo] = useState(moment().format('YYYY-MM-DD'));

  const { data, isPending, setQueryParams, refetch } = useFetch(
    ['attendances_list', 'payroll'],
    fetchAttendances,
    {
      created_at_before: moment().add(1, 'day').format('YYYY-MM-DD'),
      created_at_after: moment().format('YYYY-MM-DD'),
    },
  );

  const rows: any[] = data?.results || data?.data || [];
  const count = data?.count ?? rows.length;

  /* same API params as before — just driven by the new Day/Range controls */
  const applyDay = (d: string) => {
    setDay(d);
    setQueryParams({
      page: 1,
      created_at_after: d,
      created_at_before: moment(d).add(1, 'day').format('YYYY-MM-DD'),
    });
  };
  const applyRange = (f: string, t: string) => {
    setFrom(f);
    setTo(t);
    setQueryParams({
      page: 1,
      created_at_after: f,
      created_at_before: moment(t).add(1, 'day').format('YYYY-MM-DD'),
    });
  };

  const stats = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0, holiday: 0, other: 0 };
    rows.forEach((r) => {
      c[metaOf(r?.status).cat] += 1;
    });
    const tracked = c.present + c.late + c.absent + c.holiday;
    const rate = tracked ? Math.round(((c.present + c.late) / tracked) * 100) : 0;
    return { ...c, tracked, rate };
  }, [rows]);

  const donut = useMemo(() => {
    const segs = [
      { v: stats.present, c: '#1FA97A' },
      { v: stats.late, c: '#F5B22E' },
      { v: stats.absent, c: '#E0452C' },
      { v: stats.holiday, c: '#A78BFF' },
    ];
    const tot = segs.reduce((a, s) => a + s.v, 0) || 1;
    let acc = 0;
    const parts: string[] = [];
    segs.forEach((s) => {
      if (s.v <= 0) return;
      const start = (acc / tot) * 360;
      acc += s.v;
      const end = (acc / tot) * 360;
      parts.push(`${s.c} ${start}deg ${end}deg`);
    });
    return parts.length
      ? `conic-gradient(${parts.join(',')})`
      : 'conic-gradient(rgba(167,139,255,0.35) 0deg 360deg)';
  }, [stats]);

  const dateLabel =
    mode === 'day'
      ? moment(day).format('DD MMM, YYYY')
      : `${moment(from).format('DD MMM')} – ${moment(to).format('DD MMM, YYYY')}`;

  /* ── stat card ─────────────────────────────────────────────────────────── */
  const StatCard = ({
    icon,
    tone,
    value,
    label,
    bar,
    delay,
  }: {
    icon: React.ReactNode;
    tone: VioletTone;
    value: number;
    label: string;
    bar: string;
    delay: number;
  }) => {
    const share = stats.tracked ? Math.round((value / stats.tracked) * 100) : 0;
    return (
      <div
        className="group relative animate-v-rise overflow-hidden rounded-[18px] bg-white p-[16px] shadow-v-card transition-shadow hover:shadow-v-tile-hover"
        style={{ animationDelay: `${delay}s` }}
      >
        <span
          className="absolute left-0 top-0 h-full w-[3px] origin-top animate-v-grow-y"
          style={{ backgroundColor: bar }}
        />
        <div className="flex items-center justify-between">
          <IconChip tone={tone} size="lg">
            {icon}
          </IconChip>
          <span
            className="rounded-full px-2 py-0.5 text-[10.5px] font-bold tabular-nums"
            style={{ backgroundColor: `${bar}1A`, color: bar }}
          >
            {share}%
          </span>
        </div>
        <div className="mt-2.5 text-[23px] font-extrabold tabular-nums tracking-[-0.02em] text-v-ink900">
          {value}
        </div>
        <div className="text-[12px] font-semibold text-v-ink700">{label}</div>
      </div>
    );
  };

  /* ── columns ───────────────────────────────────────────────────────────── */
  const columns: VListColumn[] = [
    {
      key: 'employee',
      label: 'Employee',
      w: 'minmax(0,1.5fr)',
      locked: true,
      render: (row) => {
        const m = metaOf(row?.status);
        const name = empName(row?.employee);
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="relative shrink-0">
              <Avatar name={name} size={36} />
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
                style={{ backgroundColor: m.dot }}
              />
            </span>
            <div className="min-w-0">
              <Link
                href={`/dashboard/hris/employee/employees/summary/${row?.employee?.uid}`}
                className="block truncate text-[13px] font-bold text-v-ink900 hover:text-v-primary"
              >
                {name}
              </Link>
              <div className="truncate text-[11px] tabular-nums text-v-ink400">
                {row?.date ? moment(row.date).format('DD MMM, YYYY') : '—'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'check_in',
      label: 'Check in',
      w: '130px',
      render: (row) => {
        if (!row?.check_in) return <span className="text-[12.5px] text-v-ink400">—</span>;
        const late = metaOf(row?.status).cat === 'late';
        return (
          <span
            className={
              late
                ? 'inline-flex items-center gap-1.5 rounded-full bg-v-warn-bg px-2.5 py-1 text-[12px] font-bold tabular-nums text-v-warn-fg'
                : 'inline-flex items-center gap-1.5 rounded-full bg-v-success-bg px-2.5 py-1 text-[12px] font-bold tabular-nums text-v-success-fg'
            }
          >
            <LogIn className="h-3.5 w-3.5" />
            {fmtTime(row.check_in)}
          </span>
        );
      },
    },
    {
      key: 'check_out',
      label: 'Check out',
      w: '130px',
      render: (row) =>
        row?.check_out ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-v-teal-bg px-2.5 py-1 text-[12px] font-bold tabular-nums text-v-teal-fg">
            <LogOut className="h-3.5 w-3.5" />
            {fmtTime(row.check_out)}
          </span>
        ) : (
          <span className="text-[12.5px] text-v-ink400">—</span>
        ),
    },
    {
      key: 'shift',
      label: 'Shift',
      w: 'minmax(0,1.1fr)',
      render: (row) =>
        row?.shift ? (
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold tabular-nums text-v-ink900">
              {fmtTime(row.shift.in_time)} – {fmtTime(row.shift.out_time)}
            </div>
            <div className="truncate text-[11px] text-v-ink400">
              {row.shift.regular_hour}h · {row.shift.title}
            </div>
          </div>
        ) : (
          <span className="text-[12.5px] text-v-ink400">No shift</span>
        ),
    },
    {
      key: 'worked_hour_count',
      label: 'Worked',
      w: '150px',
      render: (row) => {
        const worked = Number(row?.worked_hour_count) || 0;
        const pct = Math.min(100, (worked / 8) * 100);
        const m = metaOf(row?.status);
        const barColor =
          m.cat === 'absent' ? '#E0452C' : m.cat === 'late' ? '#F5B22E' : m.cat === 'holiday' ? '#A78BFF' : '#1FA97A';
        return (
          <div className="min-w-0">
            <div className="text-[12.5px] font-bold tabular-nums text-v-ink900">
              {worked.toFixed(2)}h
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-v-wash2">
              <div
                className="h-full origin-left animate-v-grow rounded-full"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      w: '130px',
      render: (row) => {
        const m = metaOf(row?.status);
        return (
          <Chip tone={m.tone} dot>
            {m.label}
          </Chip>
        );
      },
    },
  ];

  const renderActions = (row: any) => (
    <button
      type="button"
      aria-label="Edit attendance"
      onClick={() => {
        setUid(row?.uid);
        setIsOpen(true);
      }}
      className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
    >
      <Pencil className="h-4 w-4" />
    </button>
  );

  /* ── advanced toolbar (Day/Range toggle + date inputs + print) ─────────── */
  const inputCls =
    'rounded-v-input border border-v-border bg-v-wash px-2.5 py-1.5 text-[12.5px] tabular-nums text-v-ink900 outline-none transition-colors focus:border-v-primary focus:bg-white';
  const toolbarExtra = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-full bg-v-wash2 p-1">
        {(['day', 'range'] as const).map((mObj) => (
          <button
            key={mObj}
            type="button"
            onClick={() => setMode(mObj)}
            className={
              mode === mObj
                ? 'rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold capitalize text-v-primary shadow-sm'
                : 'rounded-full px-3 py-1.5 text-[12px] font-semibold capitalize text-v-ink500 hover:text-v-ink900'
            }
          >
            {mObj}
          </button>
        ))}
      </div>
      {mode === 'day' ? (
        <input
          type="date"
          value={day}
          onChange={(e) => applyDay(e.target.value)}
          className={inputCls}
        />
      ) : (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={from}
            onChange={(e) => applyRange(e.target.value, to)}
            className={inputCls}
          />
          <span className="text-[12px] text-v-ink400">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => applyRange(from, e.target.value)}
            className={inputCls}
          />
        </div>
      )}
      <VioletButton variant="primary" size="icon" aria-label="Print" onClick={() => window.print()}>
        <Printer className="h-[15px] w-[15px]" />
      </VioletButton>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'HRIS', href: '#' },
            { label: 'Attendance' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Attendance
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'record' : 'records'}
          </Chip>
          <span className="flex-1" />
          {/* <VioletButton
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setUid('');
              setIsOpen(true);
            }}
          >
            Add
          </VioletButton> */}
          <Link href="/dashboard/hris/attendance/manual_attendance">
            <VioletButton variant="primary" leftIcon={<Layers className="h-4 w-4" />}>
              Bulk attendance
            </VioletButton>
          </Link>
        </div>
      </div>

      {/* hero + stats strip */}
      <div
        className="grid animate-v-rise items-stretch gap-3.5 lg:grid-cols-[340px_1fr]"
        style={{ animationDelay: '0.06s' }}
      >
        {/* dark donut hero */}
        <div
          className="relative flex items-center gap-4 overflow-hidden rounded-v-card p-[22px] text-white"
          style={{ backgroundImage: 'linear-gradient(135deg,#211B38,#463481,#6E4BE0)' }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-[50px] -top-[50px] h-[170px] w-[170px] animate-v-float rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(167,139,255,0.4), transparent 70%)' }}
          />
          {/* donut */}
          <div
            className="relative h-[116px] w-[116px] shrink-0 rounded-full"
            style={{ backgroundImage: donut }}
          >
            <div className="absolute inset-[15px] flex flex-col items-center justify-center rounded-full bg-[#211B38]">
              <div className="text-[25px] font-extrabold leading-none tabular-nums">{stats.rate}%</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/55">
                Present
              </div>
            </div>
          </div>
          {/* legend */}
          <div className="relative min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-white/50">
              Today · {moment().format('DD MMM')}
            </div>
            <div className="mt-1 text-[15px] font-extrabold leading-tight">
              {stats.present + stats.late} of {stats.tracked} on the clock
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {[
                { c: '#1FA97A', label: 'On time', v: stats.present },
                { c: '#F5B22E', label: 'Late', v: stats.late },
                { c: '#E0452C', label: 'Absent', v: stats.absent },
                { c: '#A78BFF', label: 'Holiday', v: stats.holiday },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2 text-[11.5px] text-white/75">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: l.c }} />
                  <span className="flex-1">{l.label}</span>
                  <span className="font-bold tabular-nums text-white/95">{l.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2×2 stat grid */}
        <div className="grid grid-cols-2 gap-3.5">
          <StatCard icon={<UserCheck />} tone="success" value={stats.present} label="Present" bar="#1FA97A" delay={0.08} />
          <StatCard icon={<UserX />} tone="danger" value={stats.absent} label="Absent" bar="#E0452C" delay={0.12} />
          <StatCard icon={<Plane />} tone="violet" value={stats.holiday} label="On holiday" bar="#7C4DFF" delay={0.16} />
          <StatCard icon={<Clock />} tone="warn" value={stats.late} label="Late" bar="#F5B22E" delay={0.2} />
        </div>
      </div>

      {/* table */}
      <VioletListTable
        icon={<CalendarCheck2 />}
        title="Attendance list"
        subtitle={(shown, total) => `${shown} of ${total} records · ${dateLabel}`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search employees"
        toolbarExtra={toolbarExtra}
        renderActions={renderActions}
        actionLabel="Edit"
        actionWidth="64px"
        emptyIcon={<CalendarDays className="h-[19px] w-[19px]" />}
        emptyTitle="No attendance records"
        emptySub="Adjust the date filter or mark attendance to see records here."
      />

      {/* edit / add modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        widthClass="w-full md:w-[550px]"
        title={uid ? 'Edit Attendance' : 'Add Attendance'}
      >
        <Attendance setIsOpen={setIsOpen} uid={uid} />
      </Modal>
    </div>
  );
};

export default AttendanceList;
