'use client';
import { useMemo, useState } from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import { CalendarCheck, CalendarDays, Clock4, Plus, Check, X } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchLeaveRequests, patchLeaveApproval } from '@/app/helpers/backend';
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
import LeaveRequest from '../employee-leaves/_components/LeaveRequest';

function statusMeta(status?: string): { tone: VioletTone; label: string } {
  const s = `${status || ''}`.toUpperCase();
  if (s === 'APPROVED') return { tone: 'success', label: 'Approved' };
  if (s === 'PENDING') return { tone: 'warn', label: 'Pending' };
  if (s === 'REJECTED' || s === 'DECLINED') return { tone: 'danger', label: 'Rejected' };
  if (s === 'CANCELLED' || s === 'CANCELED') return { tone: 'neutral', label: 'Cancelled' };
  if (!s) return { tone: 'neutral', label: '—' };
  return { tone: 'neutral', label: s.charAt(0) + s.slice(1).toLowerCase() };
}

const LeaveApproval = () => {
  const { data, isPending, setQueryParams, refetch } = useFetch(
    ['hr-leave-request-list'],
    fetchLeaveRequests
  );

  const [uid, setUID] = useState('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const requests: any[] = data?.results || data?.data || [];
  const count = data?.count ?? requests.length;

  const { pending, approved } = useMemo(() => {
    let p = 0;
    let a = 0;
    requests.forEach((r) => {
      const s = `${r?.status || ''}`.toUpperCase();
      if (s === 'PENDING') p += 1;
      else if (s === 'APPROVED') a += 1;
    });
    return { pending: p, approved: a };
  }, [requests]);

  const handleStatusChange = (id: string, status: string) => {
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
      confirmButtonText: `Yes, ${status}`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await patchLeaveApproval(id, { status: status });
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
          text: `Leave request status changed to ${status}`,
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
      key: 'from_date',
      label: 'Leave dates',
      w: 'minmax(0,1.4fr)',
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
              {row?.leave_type?.display_name || row?.leave_type?.name || 'Leave'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'total_days',
      label: 'Days',
      w: '90px',
      render: (row) => {
        const days = row?.from_date && row?.to_date
          ? new Date(row.to_date).getDate() - new Date(row.from_date).getDate() + 1
          : null;
        return (
          <span className="text-[12.5px] font-semibold tabular-nums text-v-ink900">
            {days != null ? `${days} ${days === 1 ? 'day' : 'days'}` : '—'}
          </span>
        );
      },
    },
    {
      key: 'assigned_to',
      label: 'Desk look by',
      w: 'minmax(0,1.1fr)',
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

  const renderActions = (row: any) =>
    row?.status === 'PENDING' ? (
      <>
        <button
          type="button"
          aria-label="Approve"
          title="Approve"
          onClick={() => handleStatusChange(row?.uid, 'APPROVED')}
          className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-success-fg transition-colors hover:bg-v-success-bg"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Reject"
          title="Reject"
          onClick={() => handleStatusChange(row?.uid, 'REJECTED')}
          className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-danger-fg transition-colors hover:bg-v-danger-bg"
        >
          <X className="h-4 w-4" />
        </button>
      </>
    ) : (
      <span className="text-[11.5px] font-semibold text-v-ink400">—</span>
    );

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'HRIS', href: '#' },
            { label: 'Leave Approval' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Leave Approval
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'request' : 'requests'}
          </Chip>
          {pending > 0 && (
            <Chip tone="warn" dot>
              {pending} awaiting
            </Chip>
          )}
          <span className="flex-1" />
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

      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi icon={<CalendarDays />} tone="violet" value={count} label="Total requests" bar="#7C4DFF" delay={0.06} />
        <Kpi icon={<Clock4 />} tone="warn" value={pending} label="Pending" bar="#F5B22E" delay={0.1} />
        <Kpi icon={<CalendarCheck />} tone="success" value={approved} label="Approved" bar="#1FA97A" delay={0.14} />
      </div>

      <VioletListTable
        icon={<CalendarCheck />}
        title="Leave approvals"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'request' : 'requests'} · ${pending} pending`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search requests"
        renderActions={renderActions}
        actionLabel="Decision"
        actionWidth="100px"
        emptyIcon={<CalendarCheck className="h-[19px] w-[19px]" />}
        emptyTitle="No leave requests found"
        emptySub="Requests awaiting approval will appear here."
      />

      <LeaveRequest
        refetch={refetch}
        setIsOpen={setIsModalOpen}
        isOpen={isModalOpen}
        uid={uid}
        isAdmin={true}
      />
    </div>
  );
};

export default LeaveApproval;
