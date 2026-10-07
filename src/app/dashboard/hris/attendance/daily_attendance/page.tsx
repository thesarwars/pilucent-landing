/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import {
  Clock,
  CalendarDays,
  Activity,
  LogIn,
  LogOut,
  Timer,
  Play,
  Square,
  Pencil,
  Clock3,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchEmployee,
  fetchMeTimeTracking,
  fetchTimeSlots,
  patchMeTimeTracking,
  patchTimeSlots,
  postMeTimeTracking,
  postTimeSlots,
} from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { useAppSelector } from '@/app/redux/store';
import { toast } from '@/lib/ToastService';
import {
  Avatar,
  Breadcrumb,
  Chip,
  VioletListTable,
  type VListColumn,
} from '@/components/violet';
import { cn } from '@/lib/utils';
import EditTimeSlot from '../_components/EditTimeSlot';

const hms = (secs: number) => moment.utc((secs || 0) * 1000).format('HH:mm:ss');
const fmtTime = (t?: string) => (t ? moment(t, 'HH:mm:ss').format('hh:mm A') : '—');

const Page = () => {
  const [time, setTime] = useState<number>(0);
  const [currentTracker, setCurrentTracker] = useState<any>({});
  const [runningSlot, setRunningSlot] = useState<any>({});
  const [lastSlot, setLastSlot] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uid, setUID] = useState('');
  const [renderAgain, setRenderAgain] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const timerRef = useRef<any>(null);

  const rowId = (row: any) => `${row?.uid ?? ''}`;
  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const { data, isPending, setQueryParams, refetch } = useFetch(
    ['time-slots'],
    () => fetchTimeSlots(currentTracker?.uid),
    { enabled: !!currentTracker?.uid || !isLoading },
  );

  const { UserData } = useAppSelector((state) => state?.userData);
  const { data: employee, isPending: isEmployeePending } = useQuery({
    queryKey: ['employee-info'],
    queryFn: () => fetchEmployee(UserData?.employee?.uid),
    enabled: !!UserData?.employee?.uid || !isLoading,
  });

  /* seed the live timer from the running slot's check-in */
  useEffect(() => {
    if (runningSlot?.check_in) {
      const diff = moment().diff(moment(runningSlot.check_in, 'HH:mm:ss'), 'seconds');
      setTime(diff || 0);
    }
  }, [runningSlot]);

  /* load today's tracker + slots */
  useEffect(() => {
    const fn = async () => {
      try {
        setIsLoading(true);
        const currentDate = moment(new Date()).format('YYYY-MM-DD');
        const res = await fetchMeTimeTracking({ date: currentDate });
        if (res?.results?.[0]) {
          setCurrentTracker(res.results[0]);
          const slotRes = await fetchTimeSlots(res.results[0]?.uid);
          const first = slotRes?.results?.[0];
          if (first && !first.check_out) setRunningSlot(first);
          else setRunningSlot({});
          if (first && first.check_out) setLastSlot(first);
          else setLastSlot({});
        } else {
          setCurrentTracker({});
        }
      } catch {
        //err
      } finally {
        setIsLoading(false);
      }
    };
    fn();
  }, [renderAgain]);

  /* tick while a slot is running */
  useEffect(() => {
    if (runningSlot?.uid) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [runningSlot]);

  const handleStart = async () => {
    try {
      setIsSubmitting(true);
      const currentTime = moment().format('HH:mm:ss');
      if (currentTracker?.uid) {
        const res = await postTimeSlots(currentTracker.uid, { check_in: currentTime });
        if (res?.success) {
          refetch();
          toast.success('Timer started!');
          setRenderAgain((v) => !v);
        }
      } else {
        const res = await postMeTimeTracking();
        if (res?.success) {
          const slotRes = await postTimeSlots(res.uid, { check_in: currentTime });
          if (slotRes?.success) {
            refetch();
            toast.success('Timer started!');
            setRenderAgain((v) => !v);
          }
        }
      }
    } catch {
      //err
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStop = async () => {
    try {
      setIsSubmitting(true);
      const currentTime = moment().format('HH:mm:ss');
      const diffInSeconds = moment().diff(moment(runningSlot?.check_in, 'HH:mm:ss'), 'seconds');
      const diffInHour = diffInSeconds / 3600;
      const res = await patchTimeSlots(currentTracker?.uid, runningSlot?.uid, {
        check_out: currentTime,
        worked_hour: diffInHour,
      });
      if (res?.success) {
        await patchMeTimeTracking(currentTracker?.uid, { check_out: currentTime });
        refetch();
        toast.success('Timer stopped!');
        setRenderAgain((v) => !v);
        setTime(0);
      }
    } catch {
      //err
    } finally {
      setIsSubmitting(false);
    }
  };

  const running = !!runningSlot?.uid;
  const regHours = employee?.shift?.regular_hour || 8;
  const liveHours = time > 0 ? time / 3600 : currentTracker?.worked_hour_count || 0;
  const pct = Math.min(100, Math.max(0, (liveHours / regHours) * 100));
  const elapsed = time > 0 ? hms(time) : hms((currentTracker?.worked_hour_count || 0) * 3600);
  const busy = isEmployeePending || isLoading || isSubmitting;

  /* ── hero tiles ────────────────────────────────────────────────────────── */
  const tiles = [
    {
      label: 'Shift',
      icon: <Clock className="h-3.5 w-3.5" />,
      accent: '#22B8CF',
      value: employee?.shift
        ? `${employee.shift.title} · ${moment(employee.shift.in_time, 'HH:mm:ss').format('HH:mm')}–${moment(employee.shift.out_time, 'HH:mm:ss').format('HH:mm')}`
        : '—',
    },
    {
      label: 'Scheduled',
      icon: <CalendarDays className="h-3.5 w-3.5" />,
      accent: '#4C6FFF',
      value: `${regHours} hours`,
    },
    {
      label: 'Status',
      icon: <Activity className="h-3.5 w-3.5" />,
      accent: running ? '#1FA97A' : '#F5B22E',
      value: currentTracker?.status
        ? `${currentTracker.status}`.split('_').join(' ')
        : 'Not started',
    },
    {
      label: 'Check in',
      icon: <LogIn className="h-3.5 w-3.5" />,
      accent: '#1FA97A',
      value: currentTracker?.uid ? fmtTime(currentTracker?.check_in) : 'Not checked in',
    },
    {
      label: 'Check out',
      icon: <LogOut className="h-3.5 w-3.5" />,
      accent: '#FF6B9A',
      value: running ? 'Not checked out' : lastSlot?.uid ? fmtTime(lastSlot?.check_out) : 'Not checked out',
    },
    {
      label: 'Worked',
      icon: <Timer className="h-3.5 w-3.5" />,
      accent: '#A78BFF',
      value: hms((currentTracker?.worked_hour_count || 0) * 3600),
    },
  ];

  /* ── time-slot table ───────────────────────────────────────────────────── */
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
            aria-label="Select slot"
            className="h-4 w-4 cursor-pointer rounded-[5px] border-v-border accent-[#7C4DFF]"
          />
        );
      },
    },
    {
      key: 'check_in',
      label: 'Check in',
      w: 'minmax(0,1fr)',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-v-success-bg px-2.5 py-1 text-[12px] font-bold tabular-nums text-v-success-fg">
          <LogIn className="h-3.5 w-3.5" />
          {fmtTime(row?.check_in)}
        </span>
      ),
    },
    {
      key: 'check_out',
      label: 'Check out',
      w: 'minmax(0,1fr)',
      render: (row) =>
        row?.check_out ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-v-teal-bg px-2.5 py-1 text-[12px] font-bold tabular-nums text-v-teal-fg">
            <LogOut className="h-3.5 w-3.5" />
            {fmtTime(row.check_out)}
          </span>
        ) : (
          <Chip tone="warn" dot>
            Running
          </Chip>
        ),
    },
    {
      key: 'worked_hour',
      label: 'Worked hour',
      w: '140px',
      render: (row) => (
        <span className="text-[12.5px] font-semibold tabular-nums text-v-ink900">
          {hms((row?.worked_hour || 0) * 3600)}
        </span>
      ),
    },
    {
      key: 'remark',
      label: 'Remark',
      w: 'minmax(0,1.4fr)',
      render: (row) => (
        <span className="line-clamp-1 text-[12.5px] text-v-ink500">{row?.remark || '—'}</span>
      ),
    },
  ];

  const renderActions = (row: any) => (
    <button
      type="button"
      aria-label="Edit remark"
      onClick={() => {
        setUID(row?.uid);
        setIsOpen(true);
      }}
      className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
    >
      <Pencil className="h-4 w-4" />
    </button>
  );

  const R = 54;
  const C = 2 * Math.PI * R;
  const dashOffset = C * (1 - pct / 100);

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HRIS', href: '#' },
          { label: 'Daily Attendance' },
        ]}
      />

      {/* dark clock-in hero */}
      <div
        className="relative animate-v-rise overflow-hidden rounded-v-card p-6 text-white"
        style={{ backgroundImage: 'linear-gradient(135deg,#241D44,#3B2E73,#6E4BE0)' }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-[60px] -top-[60px] h-[200px] w-[200px] animate-v-float rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(167,139,255,0.4), transparent 70%)' }}
        />
        {busy && (
          <div className="absolute inset-0 z-30 flex items-center justify-center rounded-v-card bg-[#241D44]/60 backdrop-blur-sm">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          </div>
        )}

        <div className="relative grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* left: greeting + tiles */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Avatar name={employee?.user?.name || 'Employee'} size={44} />
              <div className="min-w-0">
                <div className="truncate text-[20px] font-extrabold leading-tight">
                  Good day, {employee?.user?.name || 'there'}
                </div>
                <div className="text-[12.5px] text-white/55">
                  {moment().format('dddd, MMMM D, YYYY')}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tiles.map((t) => (
                <div
                  key={t.label}
                  className="relative overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.06] p-3.5"
                >
                  <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: t.accent }} />
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                      style={{ backgroundColor: `${t.accent}26`, color: t.accent }}
                    >
                      {t.icon}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/45">
                      {t.label}
                    </span>
                  </div>
                  <div className="mt-2 truncate text-[15px] font-extrabold tabular-nums text-white">
                    {t.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* right: elapsed ring + progress + start/stop */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative h-[150px] w-[150px]">
              <svg viewBox="0 0 130 130" className="h-full w-full -rotate-90">
                <circle cx="65" cy="65" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
                <circle
                  cx="65"
                  cy="65"
                  r={R}
                  fill="none"
                  stroke="#A78BFF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">
                  Elapsed
                </span>
                <span className="mt-1 text-[26px] font-extrabold leading-none tabular-nums">
                  {elapsed}
                </span>
                <span
                  className={cn(
                    'mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
                    running ? 'bg-[#1FA97A]/20 text-[#7DEBC0]' : 'bg-white/10 text-white/60',
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', running ? 'bg-[#3FE0A4]' : 'bg-white/50')} />
                  {running ? 'Running' : 'Stopped'}
                </span>
              </div>
            </div>

            <div className="mt-5 w-full">
              <div className="flex items-center justify-between text-[11px] text-white/55">
                <span>Shift progress</span>
                <span className="tabular-nums">{Math.round(pct)}% of {regHours}h</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.14]">
                <div className="h-full rounded-full bg-[#A78BFF]" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <button
              type="button"
              onClick={running ? handleStop : handleStart}
              disabled={isSubmitting}
              className={cn(
                'mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[14px] font-bold text-white transition-colors disabled:opacity-60',
                running ? 'bg-[#E0452C] hover:bg-[#c93d27]' : 'bg-[#1FA97A] hover:bg-[#188f67]',
              )}
            >
              {running ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              {running ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>
      </div>

      {/* time slots */}
      <VioletListTable
        icon={<Clock3 />}
        title="Time slots"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'slot' : 'slots'} today`}
        data={data}
        loading={isPending && isLoading}
        setParams={setQueryParams}
        columns={columns}
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="64px"
        searchPlaceholder="Search slots"
        emptyIcon={<Clock3 className="h-[19px] w-[19px]" />}
        emptyTitle="No time slots yet"
        emptySub="Hit Start above to clock in and log your first slot."
      />

      {/* edit remark modal */}
      <EditTimeSlot
        refetch={refetch}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        uid={currentTracker?.uid}
        tUID={uid}
      />
    </div>
  );
};

export default Page;
