'use client';
import { useMemo, useState } from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Banknote, Users, Coins, Plus, Printer, Settings, Pencil, Trash2 } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { deleteLeaveEncashment, fetchLeaveEncashments } from '@/app/helpers/backend';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  avatarGradient,
  initials,
  money,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import LeaveEncashment from './_components/LeaveEncashment';

const Page = () => {
  const { data, isPending, refetch, setQueryParams } = useFetch(
    ['leave-encashment'],
    fetchLeaveEncashments
  );
  const [isOpen, setIsOpen] = useState(false);
  const [uid, setUID] = useState('');

  const rows: any[] = data?.results || data?.data || [];
  const count = data?.count ?? rows.length;

  const { totalAmount, employees } = useMemo(() => {
    const total = rows.reduce((a, r) => a + (Number(r?.total_encashment_amount) || 0), 0);
    const set = new Set(rows.map((r) => r?.employee?.uid || r?.employee?.full_name).filter(Boolean));
    return { totalAmount: total, employees: set.size };
  }, [rows]);

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
          const response = await deleteLeaveEncashment(id);
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
          text: 'Leave encashment has been deleted.',
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
      key: 'employee',
      label: 'Employee',
      w: 'minmax(0,1.6fr)',
      locked: true,
      render: (row) => {
        const name = row?.employee?.full_name || '—';
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ backgroundImage: avatarGradient(name) }}
            >
              {initials(name === '—' ? '?' : name)}
            </span>
            <div className="truncate text-[13.5px] font-bold text-v-ink900">{name}</div>
          </div>
        );
      },
    },
    {
      key: 'encashment_date',
      label: 'Encashment date',
      w: '160px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">
          {row?.encashment_date ? moment(row.encashment_date).format('DD MMM YYYY') : '—'}
        </span>
      ),
    },
    {
      key: 'total_encashment_amount',
      label: 'Total amount',
      w: '150px',
      align: 'right',
      render: (row) => (
        <span className="text-[13px] font-bold tabular-nums text-v-ink900">
          {money(Number(row?.total_encashment_amount) || 0)}
        </span>
      ),
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Edit encashment"
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
        aria-label="Delete encashment"
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
            { label: 'Leave Encashment' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Leave Encashments
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'record' : 'records'}
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
            Add new
          </VioletButton>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi icon={<Banknote />} tone="violet" value={count} label="Encashments" bar="#7C4DFF" delay={0.06} />
        <Kpi icon={<Coins />} tone="success" value={money(totalAmount)} label="Total amount" bar="#1FA97A" delay={0.1} />
        <Kpi icon={<Users />} tone="teal" value={employees} label="Employees" bar="#0E7490" delay={0.14} />
      </div>

      <VioletListTable
        icon={<Banknote />}
        title="Leave encashments"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'record' : 'records'} · ${money(totalAmount)} total`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search encashments"
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="86px"
        emptyIcon={<Banknote className="h-[19px] w-[19px]" />}
        emptyTitle="No encashments yet"
        emptySub="Record a leave encashment to get started."
      />

      <LeaveEncashment isOpen={isOpen} setIsOpen={setIsOpen} uid={uid} refetch={refetch} />
    </div>
  );
};

export default Page;
