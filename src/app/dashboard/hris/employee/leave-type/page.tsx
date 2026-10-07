'use client';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Tags, CalendarDays, Clock4, Plus, Printer, Settings, Pencil, Trash2 } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { deleteLeaveType, fetchLeaveTypes } from '@/app/helpers/backend';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import Leave from './_components/Leave';

const LeaveType = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [uid, setUid] = useState('');
  const { data, isPending, setQueryParams, refetch } = useFetch(['leaveType'], fetchLeaveTypes);

  const types: any[] = data?.results || data?.data || [];
  const count = data?.count ?? types.length;

  const { daily, hourly } = useMemo(() => {
    let d = 0;
    let h = 0;
    types.forEach((t) => {
      if (`${t?.leave_type}`.toUpperCase() === 'HOURLY') h += 1;
      else d += 1;
    });
    return { daily: d, hourly: h };
  }, [types]);

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
          const response = await deleteLeaveType(id);
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
          text: 'Leave type has been deleted.',
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
      key: 'name',
      label: 'Leave type',
      w: 'minmax(0,1.6fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
            style={{ backgroundColor: `${row?.color || '#EEE9FF'}22` }}
          >
            <span
              className="h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: row?.color || '#7C4DFF' }}
            />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-v-ink900">{row?.name || '—'}</div>
            {row?.display_name && row.display_name !== row.name && (
              <div className="truncate text-[11px] text-v-ink400">{row.display_name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'definition',
      label: 'Definition',
      w: 'minmax(0,1.4fr)',
      render: (row) => (
        <p className="line-clamp-1 text-[12.5px] text-v-ink700">{row?.definition || '—'}</p>
      ),
    },
    {
      key: 'maximum_allocation',
      label: 'Max alloc.',
      w: '110px',
      align: 'right',
      render: (row) => (
        <span className="text-[12.5px] font-semibold tabular-nums text-v-ink900">
          {row?.maximum_allocation ?? '—'}
        </span>
      ),
    },
    {
      key: 'max_consecutive_allowed',
      label: 'Max consec.',
      w: '110px',
      align: 'right',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">
          {row?.max_consecutive_allowed ?? '—'}
        </span>
      ),
    },
    {
      key: 'leave_type',
      label: 'Type',
      w: '110px',
      render: (row) =>
        `${row?.leave_type}`.toUpperCase() === 'HOURLY' ? (
          <Chip tone="teal" dot>
            Hourly
          </Chip>
        ) : (
          <Chip tone="violet" dot>
            Daily
          </Chip>
        ),
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Edit leave type"
        onClick={() => {
          setUid(row?.uid);
          setIsModalOpen(true);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete leave type"
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
            { label: 'Leave Type' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Leave Types
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'type' : 'types'}
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
              setUid('');
              setIsModalOpen(true);
            }}
          >
            Add leave type
          </VioletButton>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi icon={<Tags />} tone="violet" value={count} label="Leave types" bar="#7C4DFF" delay={0.06} />
        <Kpi icon={<CalendarDays />} tone="success" value={daily} label="Daily" bar="#1FA97A" delay={0.1} />
        <Kpi icon={<Clock4 />} tone="teal" value={hourly} label="Hourly" bar="#0E7490" delay={0.14} />
      </div>

      <VioletListTable
        icon={<Tags />}
        title="All leave types"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'type' : 'types'} configured`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search leave types"
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="86px"
        emptyIcon={<Tags className="h-[19px] w-[19px]" />}
        emptyTitle="No leave types yet"
        emptySub="Create a leave type to define how leaves are allocated."
      />

      <Leave isOpen={isModalOpen} setIsOpen={setIsModalOpen} refetch={refetch} uid={uid} />
    </div>
  );
};

export default LeaveType;
