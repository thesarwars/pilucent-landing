'use client';

import { useMemo, useState } from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import {
  CalendarDays,
  CalendarCheck,
  Clock4,
  Plus,
  Printer,
  Settings,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { deleteLeaveRequest, fetchLeaveRequests } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  avatarGradient,
  initials,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import LeaveRequest from './_components/LeaveRequest';
import UserProfile from './_components/UserProfile';

function statusMeta(status?: string): { tone: VioletTone; label: string } {
  const s = `${status || ''}`.toUpperCase();
  if (s === 'APPROVED') return { tone: 'success', label: 'Approved' };
  if (s === 'PENDING') return { tone: 'warn', label: 'Pending' };
  if (s === 'REJECTED' || s === 'DECLINED') return { tone: 'danger', label: 'Rejected' };
  if (s === 'CANCELLED' || s === 'CANCELED') return { tone: 'neutral', label: 'Cancelled' };
  if (!s) return { tone: 'neutral', label: '—' };
  return { tone: 'neutral', label: s.charAt(0) + s.slice(1).toLowerCase() };
}

/* ── KPI tile ─────────────────────────────────────────────────────────── */

function Kpi({
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
}) {
  return (
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
}

/* ── page ─────────────────────────────────────────────────────────────── */

const Page = () => {
  const [uid, setUID] = useState('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data, isPending, refetch, setQueryParams } = useFetch(
    ['leave-requests'],
    fetchLeaveRequests
  );

  const requests: any[] = data?.results || data?.data || [];
  const count = data?.count ?? requests.length;

  const { approved, pending } = useMemo(() => {
    let a = 0;
    let p = 0;
    requests.forEach((r) => {
      const s = `${r?.status || ''}`.toUpperCase();
      if (s === 'APPROVED') a += 1;
      else if (s === 'PENDING') p += 1;
    });
    return { approved: a, pending: p };
  }, [requests]);

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
          const response = await deleteLeaveRequest(id);
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
          text: 'Leave request has been deleted.',
          icon: 'success',
          color: 'white',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const columns: VListColumn[] = [
    {
      key: 'from_date',
      label: 'Leave dates',
      w: 'minmax(0,1.5fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <IconChip tone="violet" size="md">
            <CalendarDays />
          </IconChip>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold tabular-nums text-v-ink900">
              {row?.from_date ? moment(row.from_date).format('DD MMM') : '—'}
              {' – '}
              {row?.to_date ? moment(row.to_date).format('DD MMM, YY') : '—'}
            </div>
            <div className="truncate text-[11px] text-v-ink400">
              {row?.leave_type?.name || 'Leave'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'leave_type',
      label: 'Type',
      w: '150px',
      render: (row) => <Chip tone="violet">{row?.leave_type?.name || '—'}</Chip>,
    },
    {
      key: 'total_days',
      label: 'Days',
      w: '90px',
      render: (row) => (
        <span className="text-[12.5px] font-semibold tabular-nums text-v-ink900">
          {row?.total_days ?? '—'}
        </span>
      ),
    },
    {
      key: 'assigned_to',
      label: 'Desk look by',
      w: 'minmax(0,1.2fr)',
      render: (row) => {
        const lead = row?.assigned_to?.full_name;
        if (!lead) return <span className="text-[12.5px] text-v-ink400">Unassigned</span>;
        return (
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundImage: avatarGradient(lead) }}
            >
              {initials(lead)}
            </span>
            <span className="truncate text-[12.5px] font-semibold text-v-ink700">{lead}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      w: '120px',
      render: (row) => {
        const m = statusMeta(row?.status);
        return (
          <Chip tone={m.tone} dot>
            {m.label}
          </Chip>
        );
      },
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Edit leave request"
        onClick={() => {
          if (row?.status === 'PENDING') {
            setUID(row?.uid);
            setIsModalOpen(true);
          } else {
            toast.error('Only pending requests can be edited');
          }
        }}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete leave request"
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
            { label: 'Employee Leaves' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Employee Leaves
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'request' : 'requests'}
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
              setIsModalOpen(true);
            }}
          >
            New request
          </VioletButton>
        </div>
      </div>

      {/* profile */}
      <UserProfile />

      {/* KPI strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi
          icon={<CalendarDays />}
          tone="violet"
          value={count}
          label="Total requests"
          bar="#7C4DFF"
          delay={0.06}
        />
        <Kpi
          icon={<CalendarCheck />}
          tone="success"
          value={approved}
          label="Approved"
          bar="#1FA97A"
          delay={0.1}
        />
        <Kpi
          icon={<Clock4 />}
          tone="warn"
          value={pending}
          label="Pending"
          bar="#F5B22E"
          delay={0.14}
        />
      </div>

      {/* table */}
      <VioletListTable
        icon={<CalendarDays />}
        title="Leave requests"
        subtitle={(_shown, total) =>
          `${total} ${total === 1 ? 'request' : 'requests'} · ${pending} pending`
        }
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search leave requests"
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="86px"
        emptyIcon={<CalendarDays className="h-[19px] w-[19px]" />}
        emptyTitle="No leaves found"
        emptySub="Create a leave request to get started."
      />

      {/* create / edit drawer */}
      <LeaveRequest refetch={refetch} setIsOpen={setIsModalOpen} isOpen={isModalOpen} uid={uid} />
    </div>
  );
};

export default Page;
