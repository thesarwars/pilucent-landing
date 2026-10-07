'use client';

import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
  Building2,
  Users,
  Gauge,
  Plus,
  Printer,
  Settings,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchDepartments, deleteDepartments } from '@/app/helpers/backend';
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
import Department from './_components/Department';

/* headcount / lead can live under a few shapes — read defensively. */
function headcountOf(row: any): number {
  const n =
    row?.employee_count ??
    row?.total_employee ??
    row?.headcount ??
    row?.employees_count ??
    row?.member_count ??
    row?.employees?.length ??
    0;
  return Number(n) || 0;
}
function leadOf(row: any): string {
  return (
    row?.lead?.name ||
    row?.department_lead?.name ||
    row?.head?.name ||
    row?.lead_name ||
    row?.lead ||
    ''
  );
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editUid, setEditUid] = useState<string | null>('');

  const { data, isPending, refetch, setQueryParams } = useFetch(
    ['departments'],
    fetchDepartments
  );

  const departments: any[] = data?.results || data?.data || [];
  const count = data?.count ?? departments.length;

  const { peopleAssigned, avgTeam } = useMemo(() => {
    const people = departments.reduce((a, d) => a + headcountOf(d), 0);
    return {
      peopleAssigned: people,
      avgTeam: departments.length ? Math.round(people / departments.length) : 0,
    };
  }, [departments]);

  const handleDeleteDepartment = (uid: string) => {
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
          const response = await deleteDepartments(uid);
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
          text: 'Department has been deleted.',
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
      key: 'code',
      label: 'Code',
      w: '150px',
      render: (row) => (
        <Chip tone="violet" className="tabular-nums">
          {row?.code || '—'}
        </Chip>
      ),
    },
    {
      key: 'title',
      label: 'Department',
      w: 'minmax(0,1.6fr)',
      locked: true,
      render: (row) => {
        const lead = leadOf(row);
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[12.5px] font-bold text-white"
              style={{ backgroundImage: avatarGradient(row?.title || row?.code || '?') }}
            >
              {initials(row?.title || '?')}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-bold text-v-ink900">
                {row?.title || '—'}
              </div>
              <div className="truncate text-[11px] text-v-ink400">
                {lead ? `Led by ${lead}` : 'No lead assigned'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'headcount',
      label: 'Headcount',
      w: '130px',
      render: (row) => {
        const n = headcountOf(row);
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-v-wash2 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-v-ink700">
            <Users className="h-3 w-3 text-v-ink400" />
            {n} {n === 1 ? 'person' : 'people'}
          </span>
        );
      },
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Edit department"
        onClick={() => {
          setEditUid(row?.uid);
          setIsModalOpen(true);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete department"
        onClick={() => handleDeleteDepartment(row?.uid)}
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
            { label: 'Departments' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Departments
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'department' : 'departments'}
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
              setEditUid('');
              setIsModalOpen(true);
            }}
          >
            Create department
          </VioletButton>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi
          icon={<Building2 />}
          tone="violet"
          value={count}
          label="Departments"
          bar="#7C4DFF"
          delay={0.06}
        />
        <Kpi
          icon={<Users />}
          tone="success"
          value={peopleAssigned}
          label="People assigned"
          bar="#1FA97A"
          delay={0.1}
        />
        <Kpi
          icon={<Gauge />}
          tone="warn"
          value={avgTeam}
          label="Avg team size"
          bar="#F5B22E"
          delay={0.14}
        />
      </div>

      {/* table */}
      <VioletListTable
        icon={<Building2 />}
        title="All departments"
        subtitle={(_shown, total) =>
          `${total} ${total === 1 ? 'team' : 'teams'} · ${peopleAssigned} people total`
        }
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search departments"
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="86px"
        emptyIcon={<Building2 className="h-[19px] w-[19px]" />}
        emptyTitle="No departments yet"
        emptySub="Create your first team to start organizing employees."
      />

      {/* create / edit drawer */}
      <Department
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        refetch={refetch}
        uid={editUid}
      />
    </div>
  );
};

export default Page;
