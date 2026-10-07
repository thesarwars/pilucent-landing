'use client';

import React, { useState } from 'react';
import moment from 'moment';
import {
  RefreshCw,
  Play,
  Loader2,
  CheckCircle2,
  History,
  CalendarDays,
  CalendarClock,
  CalendarRange,
  User,
  Users,
  Fingerprint,
  Timer,
} from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchAttendanceProcess, postAttendanceProcess } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import {
  Breadcrumb,
  Chip,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import { cn } from '@/lib/utils';

type Scope = 'TODAY' | 'PREVIOUS' | 'RANGE';

const SCOPES: {
  key: Scope;
  title: string;
  desc: string;
  fg: string;
  bg: string;
  icon: React.ReactNode;
}[] = [
  { key: 'TODAY', title: 'Today', desc: 'Process punches recorded for the current day', fg: '#137A57', bg: '#DEF5E9', icon: <CalendarDays className="h-[15px] w-[15px]" /> },
  { key: 'PREVIOUS', title: 'Previous', desc: 'Pick an earlier day that was missed', fg: '#B97608', bg: '#FDF2DE', icon: <CalendarClock className="h-[15px] w-[15px]" /> },
  { key: 'RANGE', title: 'Date range', desc: 'Reprocess a span of days at once', fg: '#7C4DFF', bg: '#EEE9FF', icon: <CalendarRange className="h-[15px] w-[15px]" /> },
];

const statusTone = (s?: string): VioletTone => {
  const v = `${s || ''}`.toUpperCase();
  if (v.includes('SUCCESS') || v.includes('COMPLET') || v === 'DONE') return 'success';
  if (v.includes('FAIL') || v.includes('ERROR')) return 'danger';
  if (v.includes('PROGRESS') || v.includes('PENDING') || v.includes('RUNNING')) return 'warn';
  return 'neutral';
};

const durationSec = (row: any) => {
  if (!row?.start_time || !row?.end_time) return null;
  const d = moment(row.end_time).diff(moment(row.start_time), 'seconds');
  return Number.isFinite(d) && d >= 0 ? d : null;
};

/** first defined value among possible API field names (count fields vary by serializer) */
const firstVal = (row: any, keys: string[]) => {
  for (const k of keys) {
    const v = row?.[k];
    if (v != null && v !== '') return v;
  }
  return null;
};

const Page = () => {
  const [scope, setScope] = useState<Scope>('TODAY');
  const [form, setForm] = useState({ start_date: '', end_date: '' });
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rowId = (row: any) => `${row?.uid ?? row?.id ?? row?.created_at ?? ''}`;
  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const { data: history, isPending, refetch, setQueryParams } = useFetch(
    ['process-history-list'],
    fetchAttendanceProcess,
  );

  const rows: any[] = history?.results || history?.data || [];
  const count = history?.count ?? rows.length;
  const lastRun = rows[0];
  const lastDur = durationSec(lastRun);

  const inputCls =
    'w-full rounded-v-input border border-v-border bg-v-wash px-3 py-2.5 text-[13px] tabular-nums text-v-ink900 outline-none transition-colors focus:border-v-primary focus:bg-white';

  const today = moment().format('YYYY-MM-DD');

  const handleProcess = async () => {
    let payload: { start_date: string; end_date: string };
    if (scope === 'TODAY') {
      payload = { start_date: today, end_date: today };
    } else if (scope === 'PREVIOUS') {
      if (!form.start_date) return toast.info('Please enter a process date.');
      payload = { start_date: form.start_date, end_date: form.start_date };
    } else {
      if (!form.start_date || !form.end_date) return toast.info('Please enter a start and end date.');
      payload = { start_date: form.start_date, end_date: form.end_date };
    }

    try {
      setRunning(true);
      setDone(false);
      const res = await postAttendanceProcess(payload);
      if (res?.success) {
        setDone(true);
        toast.success('Attendances processed successfully');
        refetch();
        setTimeout(() => setDone(false), 4000);
      } else {
        toast.error('Could not process attendance.');
      }
    } catch {
      toast.error('Something went wrong while processing.');
    } finally {
      setRunning(false);
    }
  };

  const columns: VListColumn[] = [
    {
      key: 'select',
      label: '',
      w: '30px',
      locked: true,
      render: (row) => {
        const id = rowId(row);
        return (
          <input
            type="checkbox"
            checked={selected.has(id)}
            onChange={() => toggleRow(id)}
            aria-label="Select run"
            className="h-4 w-4 cursor-pointer rounded-[5px] border-v-border accent-[#7C4DFF]"
          />
        );
      },
    },
    {
      key: 'created_at',
      label: 'Process date',
      w: 'minmax(0,1.3fr)',
      locked: true,
      render: (row) => {
        const dur = durationSec(row);
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-[10px] bg-v-tint100 leading-none text-v-primary">
              <span className="text-[8px] font-bold uppercase">{moment(row?.created_at).format('MMM')}</span>
              <span className="text-[14px] font-extrabold tabular-nums">{moment(row?.created_at).format('DD')}</span>
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold tabular-nums text-v-ink900">
                {row?.created_at ? moment(row.created_at).format('DD MMM, YYYY') : '—'}
              </div>
              <div className="truncate text-[11px] tabular-nums text-v-ink400">
                {dur != null ? `Took ${dur} sec` : moment(row?.created_at).format('HH:mm A')}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'created_by',
      label: 'Processed by',
      w: '150px',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-v-ink700">
          <User className="h-3.5 w-3.5 text-v-ink400" />
          {row?.created_by?.full_name || '—'}
        </span>
      ),
    },
    {
      key: 'start_time',
      label: 'Start time',
      w: '120px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">
          {row?.start_time ? moment(row.start_time).format('HH:mm:ss A') : '—'}
        </span>
      ),
    },
    {
      key: 'end_time',
      label: 'End time',
      w: '120px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">
          {row?.end_time ? moment(row.end_time).format('HH:mm:ss A') : '—'}
        </span>
      ),
    },
    {
      key: 'range',
      label: 'Date range',
      w: '140px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink500">
          {row?.start_date ? moment(row.start_date).format('DD MMM') : '—'}
          <span className="text-v-ink400"> – </span>
          {row?.end_date ? moment(row.end_date).format('DD MMM, YY') : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      w: '130px',
      render: (row) =>
        row?.status ? (
          <Chip tone={statusTone(row.status)} dot>
            {`${row.status}`.split('_').join(' ')}
          </Chip>
        ) : (
          <span className="text-[12.5px] text-v-ink400">—</span>
        ),
    },
  ];

  const recordsCompiled = firstVal(lastRun, [
    'total_attendances',
    'attendance_count',
    'total_employees',
    'employee_count',
    'total_records',
    'records',
  ]);
  const punchesRead = firstVal(lastRun, [
    'total_punches',
    'punch_count',
    'total_punch',
    'punches',
    'total_entries',
    'entries',
  ]);

  const heroMeta = [
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Records compiled',
      value: recordsCompiled != null ? `${recordsCompiled} employees` : '—',
    },
    {
      icon: <Fingerprint className="h-4 w-4" />,
      label: 'Punches read',
      value: punchesRead != null ? `${punchesRead} entries` : '—',
    },
    {
      icon: <Timer className="h-4 w-4" />,
      label: 'Duration',
      value: lastDur != null ? `${lastDur} seconds` : '—',
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'HRIS', href: '#' },
            { label: 'Attendance Process' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Daily attendance process
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'run' : 'runs'} logged
          </Chip>
        </div>
      </div>

      {/* top grid: process card + last-run hero */}
      <div className="grid animate-v-rise items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ animationDelay: '0.06s' }}>
        {/* process card */}
        <div className="rounded-v-card bg-white px-6 py-[22px] shadow-v-card">
          <div className="mb-4 flex items-center gap-2.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-white"
              style={{ backgroundImage: 'linear-gradient(140deg,#7C4DFF,#A78BFF)' }}
            >
              <RefreshCw className="h-[19px] w-[19px]" />
            </span>
            <div className="min-w-0">
              <div className="text-[18px] font-extrabold leading-tight text-v-ink900">
                Daily attendance process
              </div>
              <div className="text-[12px] text-v-ink400">
                Compile punches into finalized attendance records
              </div>
            </div>
          </div>

          {/* scope tiles */}
          <div className="flex flex-col gap-2.5 sm:flex-row">
            {SCOPES.map((s) => {
              const active = scope === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setScope(s.key)}
                  className={cn(
                    'flex flex-1 items-start gap-2.5 rounded-[14px] border-[1.5px] p-3 text-left transition-colors',
                    active ? 'border-v-primary bg-[#F8F5FF]' : 'border-v-border bg-white hover:border-[#B49AFF]',
                  )}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
                    style={{ backgroundColor: s.bg, color: s.fg }}
                  >
                    {s.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-bold text-v-ink900">{s.title}</div>
                    <div className="text-[11px] text-v-ink400">{s.desc}</div>
                  </div>
                  <span
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px]',
                      active ? 'border-v-primary' : 'border-v-border',
                    )}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-v-primary" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* conditional date fields */}
          {scope !== 'TODAY' && (
            <div className="mt-4 grid animate-v-pop gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11.5px] font-semibold text-v-ink500">
                  {scope === 'RANGE' ? 'Start date' : 'Enter process date'}{' '}
                  <span className="text-v-primary">*</span>
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className={inputCls}
                />
              </div>
              {scope === 'RANGE' ? (
                <div>
                  <label className="mb-1.5 block text-[11.5px] font-semibold text-v-ink500">
                    End date <span className="text-v-primary">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-[11.5px] font-semibold text-v-ink500">
                    Last processing date
                  </label>
                  <div className="flex items-center gap-1.5 rounded-v-input bg-[#F7F5FC] px-3 py-2.5 text-[12.5px] tabular-nums text-v-ink500">
                    <CalendarClock className="h-3.5 w-3.5 text-v-ink400" />
                    {lastRun?.start_date ? moment(lastRun.start_date).format('DD MMM, YYYY') : '—'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* action row */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <VioletButton
              variant="primary"
              onClick={handleProcess}
              disabled={running}
              className={running ? 'cursor-wait' : undefined}
              leftIcon={running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            >
              {running ? 'Processing…' : 'Process now'}
            </VioletButton>

            {running ? (
              <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-v-primary">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-v-tint100 border-t-v-primary" />
                Compiling attendance…
              </span>
            ) : done ? (
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-v-success-fg">
                <CheckCircle2 className="h-4 w-4" />
                Processing complete
              </span>
            ) : null}
          </div>
        </div>

        {/* last-run hero */}
        <div
          className="relative overflow-hidden rounded-v-card p-[22px] text-white"
          style={{ backgroundImage: 'linear-gradient(155deg,#211B38,#463481)' }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-[50px] -top-[50px] h-[160px] w-[160px] animate-v-float rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(167,139,255,0.4), transparent 70%)' }}
          />
          <div className="relative">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/50">
              Last process run
            </div>
            <div className="mt-1.5 text-[19px] font-extrabold tabular-nums">
              {lastRun?.created_at ? moment(lastRun.created_at).format('DD MMM, YYYY') : 'No runs yet'}
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {heroMeta.map((m) => (
                <div key={m.label} className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white/10 text-white/80">
                    {m.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-white/45">
                      {m.label}
                    </div>
                    <div className="truncate text-[13px] font-bold tabular-nums text-white/95">{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* process history */}
      <VioletListTable
        icon={<History />}
        title="Process history"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'run' : 'runs'} logged`}
        data={history}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search history"
        emptyIcon={<History className="h-[19px] w-[19px]" />}
        emptyTitle="No process history yet"
        emptySub="Run the daily attendance process to see history here."
      />
    </div>
  );
};

export default Page;
