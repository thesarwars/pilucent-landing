'use client';

import { useMemo, useState } from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Scale, CalendarRange, CalendarDays, Plus, Printer, Settings, Pencil, Trash2 } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { deleteLeaveBalance, fetchLeaveBalances } from '@/app/helpers/backend';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import LeaveBalance from './_components/LeaveBalance';

const LeaveTable = () => {
  const { data, isPending, setQueryParams, refetch } = useFetch(['leave-balance'], fetchLeaveBalances);
  const [isOpen, setIsOpen] = useState(false);
  const [uid, setUID] = useState('');

  const balances: any[] = data?.results || data?.data || [];
  const count = data?.count ?? balances.length;

  const { thisYear, years } = useMemo(() => {
    const cur = new Date().getFullYear().toString();
    const ty = balances.filter((b) => `${b?.leave_year}` === cur).length;
    const set = new Set(balances.map((b) => b?.leave_year).filter(Boolean));
    return { thisYear: ty, years: set.size };
  }, [balances]);

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
          const response = await deleteLeaveBalance(id);
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
          text: 'Leave balance has been deleted.',
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
      label: 'Balance',
      w: 'minmax(0,1.6fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <IconChip tone="violet" size="md">
            <Scale />
          </IconChip>
          <div className="truncate text-[13.5px] font-bold text-v-ink900">{row?.title || '—'}</div>
        </div>
      ),
    },
    {
      key: 'leave_year',
      label: 'Leave year',
      w: '130px',
      render: (row) => (
        <Chip tone="violet" className="tabular-nums">
          {row?.leave_year || '—'}
        </Chip>
      ),
    },
    {
      key: 'from_date',
      label: 'From',
      w: '120px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">
          {row?.from_date ? moment(row.from_date).format('DD MMM YYYY') : '—'}
        </span>
      ),
    },
    {
      key: 'to_date',
      label: 'To',
      w: '120px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">
          {row?.to_date ? moment(row.to_date).format('DD MMM YYYY') : '—'}
        </span>
      ),
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Edit leave balance"
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
        aria-label="Delete leave balance"
        onClick={() => handleDelete(row?.uid)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'HRIS', href: '#' },
            { label: 'Leave Balance' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Leave Balances
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'balance' : 'balances'}
          </Chip>
          <span className="flex-1" />
          <VioletButton variant="secondary" size="icon" aria-label="Print" onClick={() => window.print()}>
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
            New balance
          </VioletButton>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi icon={<Scale />} tone="violet" value={count} label="Total balances" bar="#7C4DFF" delay={0.06} />
        <Kpi icon={<CalendarDays />} tone="success" value={thisYear} label="This year" bar="#1FA97A" delay={0.1} />
        <Kpi icon={<CalendarRange />} tone="teal" value={years} label="Years covered" bar="#0E7490" delay={0.14} />
      </div>

      <VioletListTable
        icon={<Scale />}
        title="Leave balances"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'balance' : 'balances'} defined`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search by balance..."
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="86px"
        emptyIcon={<Scale className="h-[19px] w-[19px]" />}
        emptyTitle="No leave balances yet"
        emptySub="Create a balance to allocate leaves to employees."
      />

      <LeaveBalance uid={uid} isOpen={isOpen} setIsOpen={setIsOpen} refetch={refetch} />
    </div>
  );
};

export default LeaveTable;
