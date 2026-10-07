'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import Swal from 'sweetalert2';
import {
  CalendarRange,
  CalendarDays,
  Globe2,
  Plus,
  Printer,
  Settings,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { deleteHoliday, fetchHoliday } from '@/app/helpers/backend';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
const DAY_ABBR: Record<string, string> = {
  Sunday: 'Sun',
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
};

function parseWeekend(cell: any): string[] {
  try {
    const arr = JSON.parse(cell);
    if (Array.isArray(arr)) return arr.filter((d) => d && DAY_ABBR[d]);
  } catch {
    /* ignore malformed weekend payloads */
  }
  return [];
}

const HolidayPage: React.FC = () => {
  const router = useRouter();
  const { data, isPending, refetch, setQueryParams } = useFetch(['holidays'], fetchHoliday);

  const holidays: any[] = data?.results || data?.data || [];
  const count = data?.count ?? holidays.length;

  const { totalDays, countries } = useMemo(() => {
    const days = holidays.reduce((a, h) => a + (Number(h?.total_holidays) || 0), 0);
    const set = new Set(
      holidays.map((h) => h?.country).filter((c) => c && `${c}`.toUpperCase() !== 'N/A')
    );
    return { totalDays: days, countries: set.size };
  }, [holidays]);

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
          const response = await deleteHoliday(id);
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
          text: 'Holiday has been deleted.',
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
      <div className="mt-3 text-[22px] font-extrabold tabular-nums tracking-[-0.02em] text-v-ink900">
        {value}
      </div>
      <div className="text-[12px] font-medium text-v-ink500">{label}</div>
    </div>
  );

  const columns: VListColumn[] = [
    {
      key: 'title',
      label: 'Holiday list',
      w: 'minmax(0,1.5fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white"
            style={{
              backgroundImage:
                `${row?.color}`.toUpperCase() === 'RED'
                  ? 'linear-gradient(135deg,#E5708A,#B43A6B)'
                  : 'linear-gradient(135deg,#34D399,#1FA97A)',
            }}
          >
            <CalendarRange className="h-[17px] w-[17px]" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-v-ink900">{row?.title || '—'}</div>
            <div className="truncate text-[11px] text-v-ink400">
              {row?.country && `${row.country}`.toUpperCase() !== 'N/A' ? row.country : 'No country'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Date range',
      w: 'minmax(0,1.3fr)',
      render: (row) => (
        <span className="text-[12.5px] font-semibold tabular-nums text-v-ink700">
          {row?.from_date ? moment(row.from_date).format('DD MMM') : '—'}
          {' – '}
          {row?.to_date ? moment(row.to_date).format('DD MMM, YY') : '—'}
        </span>
      ),
    },
    {
      key: 'weekend',
      label: 'Weekend',
      w: 'minmax(0,1.2fr)',
      render: (row) => {
        const days = parseWeekend(row?.weekend);
        if (days.length === 0) return <span className="text-[12.5px] text-v-ink400">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {days.map((d) => (
              <span
                key={d}
                className="rounded-md bg-v-wash2 px-1.5 py-0.5 text-[10.5px] font-bold text-v-ink500"
              >
                {DAY_ABBR[d]}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'total_holidays',
      label: 'Total',
      w: '110px',
      render: (row) => (
        <Chip tone="violet" className="tabular-nums">
          {row?.total_holidays ?? 0} days
        </Chip>
      ),
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Edit holiday"
        onClick={() => router.push(`/dashboard/hris/employee/holiday/edit/${row?.uid}`)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete holiday"
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
            { label: 'Holiday' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Holidays
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'list' : 'lists'}
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
            onClick={() => router.push('/dashboard/hris/employee/holiday/create')}
          >
            Create holiday
          </VioletButton>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi
          icon={<CalendarRange />}
          tone="violet"
          value={count}
          label="Holiday lists"
          bar="#7C4DFF"
          delay={0.06}
        />
        <Kpi
          icon={<CalendarDays />}
          tone="success"
          value={totalDays}
          label="Total holiday days"
          bar="#1FA97A"
          delay={0.1}
        />
        <Kpi
          icon={<Globe2 />}
          tone="teal"
          value={countries}
          label="Countries"
          bar="#0E7490"
          delay={0.14}
        />
      </div>

      {/* table */}
      <VioletListTable
        icon={<CalendarRange />}
        title="All holiday lists"
        subtitle={(_shown, total) =>
          `${total} ${total === 1 ? 'list' : 'lists'} · ${totalDays} days total`
        }
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search holidays"
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="86px"
        emptyIcon={<CalendarRange className="h-[19px] w-[19px]" />}
        emptyTitle="No holiday lists yet"
        emptySub="Create a holiday list to define your team's days off."
      />
    </div>
  );
};

export default HolidayPage;
