'use client';

import React, { useMemo, useState } from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import {
  CalendarRange,
  CalendarCheck,
  CalendarClock,
  Plus,
  Printer,
  Settings,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { deletePaySchedule, fetchPaySchedules } from '@/app/helpers/backend';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import PaySchedulesForm from './_components/PaySchedules';

/* backend frequency values → spec labels + runs/year */
const FREQ_META: Record<string, { label: string; runs: number }> = {
  EVERY_WEEK: { label: 'Weekly', runs: 52 },
  OTHER_WEEK: { label: 'Bi-weekly', runs: 26 },
  TWICE_A_MONTH: { label: 'Semi-monthly', runs: 24 },
  EVERY_MONTH: { label: 'Monthly', runs: 12 },
};

const freqLabel = (v?: string) =>
  FREQ_META[v || '']?.label ||
  (v ? v.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ') : '—');

const humanDay = (v?: string) => (!v ? '—' : v === 'END_OF_MONTH' ? 'End of month' : v);
const humanEnd = (v?: string) =>
  v === 'BEFORE_END_DAY' ? 'Days before payday' : v === 'END_DAY' ? 'End date' : '—';
const fmtDate = (d?: string) => (d ? moment(d).format('DD MMM, YY') : '—');

const Page: React.FC = () => {
  const [uid, setUID] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data, isPending, setQueryParams, refetch } = useFetch(['pay-schedules'], fetchPaySchedules);

  const schedules: any[] = data?.results || data?.data || [];
  const count = data?.count ?? schedules.length;

  const defaultSchedule = useMemo(() => schedules.find((s) => s?.is_default), [schedules]);

  const nextRun = useMemo(() => {
    const dates = schedules
      .map((s) => s?.next_pay_date)
      .filter(Boolean)
      .map((d: string) => moment(d))
      .filter((m) => m.isValid());
    if (!dates.length) return null;
    const upcoming = dates.filter((m) => m.isSameOrAfter(moment(), 'day'));
    return (upcoming.length ? upcoming : dates).sort((a, b) => a.valueOf() - b.valueOf())[0];
  }, [schedules]);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      timerProgressBar: true,
      timer: 20000,
      theme: 'dark',
      background: '#181640a1',
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, delete`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await deletePaySchedule(id);
          if (response.success) {
            refetch();
            return response;
          }
          throw new Error('Failed');
        } catch (error) {
          Swal.showValidationMessage(`${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          background: '#181640',
          title: 'Success!',
          text: 'Pay schedule has been deleted.',
          icon: 'success',
          color: 'white',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const Kpi = ({
    icon,
    tone,
    value,
    label,
    bar,
    delay,
  }: {
    icon: React.ReactNode;
    tone: VioletTone;
    value: React.ReactNode;
    label: string;
    bar: string;
    delay: number;
  }) => (
    <div
      className="group relative animate-v-rise overflow-hidden rounded-[18px] bg-white p-[18px] shadow-v-card transition-shadow hover:shadow-v-tile-hover"
      style={{ animationDelay: `${delay}s` }}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px] origin-top animate-v-grow-y"
        style={{ backgroundColor: bar }}
      />
      <IconChip tone={tone} size="lg">
        {icon}
      </IconChip>
      <div className="mt-3 truncate text-[22px] font-extrabold tabular-nums tracking-[-0.02em] text-v-ink900">
        {value}
      </div>
      <div className="text-[12px] font-medium text-v-ink500">{label}</div>
    </div>
  );

  const columns: VListColumn[] = [
    {
      key: 'title',
      label: 'Name',
      w: 'minmax(0,1.2fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white"
            style={{ backgroundImage: 'linear-gradient(135deg,#7C4DFF,#A78BFF)' }}
          >
            <CalendarRange className="h-[17px] w-[17px]" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-v-ink900">{row?.title || '—'}</div>
            <div className="truncate text-[11px] text-v-ink400">
              {FREQ_META[row?.pay_frequency]?.runs ?? '—'} runs/year
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'pay_frequency',
      label: 'Pay frequency',
      w: '150px',
      render: (row) => (
        <Chip tone="violet" dot>
          {freqLabel(row?.pay_frequency)}
        </Chip>
      ),
    },
    {
      key: 'first_payday',
      label: 'First payday',
      w: '130px',
      render: (row) => (
        <span className="text-[12.5px] font-semibold tabular-nums text-v-ink700">
          {humanDay(row?.first_payday)}
        </span>
      ),
    },
    {
      key: 'first_end_day',
      label: 'End of first',
      w: '120px',
      render: (row) => <span className="text-[12.5px] text-v-ink500">{humanEnd(row?.first_end_day)}</span>,
    },
    {
      key: 'next_pay_date',
      label: 'Next pay date',
      w: '150px',
      render: (row) =>
        row?.next_pay_date ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-v-success-bg px-2.5 py-1 text-[11.5px] font-bold tabular-nums text-v-success-fg">
            <CalendarCheck className="h-3.5 w-3.5" />
            {fmtDate(row.next_pay_date)}
          </span>
        ) : (
          <span className="text-[12.5px] text-v-ink400">—</span>
        ),
    },
    {
      key: 'end_of_next_pay_period',
      label: 'End of next',
      w: '130px',
      render: (row) => (
        <span className="text-[12.5px] font-semibold tabular-nums text-v-ink700">
          {fmtDate(row?.end_of_next_pay_period)}
        </span>
      ),
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Edit pay schedule"
        onClick={() => {
          setUID(row?.uid);
          setIsOpen(true);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete pay schedule"
        onClick={() => handleDelete(row?.uid)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'HRIS', href: '#' },
            { label: 'Pay Schedule' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Pay schedules
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'schedule' : 'schedules'}
          </Chip>
          <span className="flex-1" />
          <VioletButton
            variant="secondary"
            size="icon"
            aria-label="Print"
            onClick={() => window.print()}
          >
            <Printer className="h-[15px] w-[15px]" />
          </VioletButton>
          <VioletButton variant="secondary" size="icon" aria-label="Settings">
            <Settings className="h-[15px] w-[15px]" />
          </VioletButton>
          <VioletButton
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setUID('');
              setIsOpen(true);
            }}
          >
            Add new
          </VioletButton>
        </div>
      </div>

      {isOpen ? (
        /* in-layout create / edit (replaces the list) */
        <PaySchedulesForm isOpen={isOpen} setIsOpen={setIsOpen} uid={uid} refetch={refetch} />
      ) : (
        <>
          {/* KPI strip */}
          <div className="grid gap-3.5 sm:grid-cols-3">
            <Kpi
              icon={<CalendarRange />}
              tone="violet"
              value={count}
              label="Pay schedules"
              bar="#7C4DFF"
              delay={0.06}
            />
            <Kpi
              icon={<CalendarCheck />}
              tone="success"
              value={defaultSchedule ? freqLabel(defaultSchedule.pay_frequency) : 'None'}
              label="Default schedule"
              bar="#1FA97A"
              delay={0.1}
            />
            <Kpi
              icon={<CalendarClock />}
              tone="warn"
              value={nextRun ? nextRun.format('DD MMM') : '—'}
              label="Next pay run"
              bar="#B97608"
              delay={0.14}
            />
          </div>

          {/* table */}
          <VioletListTable
            icon={<CalendarRange />}
            title="All pay schedules"
            subtitle={(_shown, total) => `${total} ${total === 1 ? 'schedule' : 'schedules'}`}
            data={data}
            loading={isPending}
            setParams={setQueryParams}
            columns={columns}
            searchPlaceholder="Search pay schedules"
            renderActions={renderActions}
            actionLabel="Action"
            actionWidth="86px"
            emptyIcon={<CalendarRange className="h-[19px] w-[19px]" />}
            emptyTitle="No pay schedules yet"
            emptySub="Add a pay schedule to define how often your team gets paid."
          />
        </>
      )}
    </div>
  );
};

export default Page;
