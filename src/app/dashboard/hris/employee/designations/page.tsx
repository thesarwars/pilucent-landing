'use client';

import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Star, Hash, Layers, Plus, Printer, Settings, Pencil, Trash2 } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { deleteDesignation, fetchDesignations } from '@/app/helpers/backend';
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
import Designation from './_components/Designation';
import { LEVEL_META, levelOf } from './_components/designationUtils';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uid, setUID] = useState('');
  const { data, isPending, refetch, setQueryParams } = useFetch(
    ['designations'],
    fetchDesignations
  );

  const designations: any[] = data?.results || data?.data || [];
  const count = data?.count ?? designations.length;

  const { coded, levelCount } = useMemo(() => {
    const withCode = designations.filter((d) => `${d?.code ?? ''}`.trim()).length;
    const levels = new Set(designations.map((d) => levelOf(d?.title)));
    return { coded: withCode, levelCount: levels.size };
  }, [designations]);

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
          const response = await deleteDesignation(id);
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
          text: 'Designation has been deleted.',
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
      key: 'title',
      label: 'Designation',
      w: 'minmax(0,1.8fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-[12px] font-bold text-white"
            style={{ backgroundImage: avatarGradient(row?.title || row?.code || '?') }}
          >
            {initials(row?.title || '?')}
          </span>
          <div className="truncate text-[13.5px] font-bold text-v-ink900">{row?.title || '—'}</div>
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Code',
      w: '140px',
      render: (row) =>
        `${row?.code ?? ''}`.trim() ? (
          <Chip tone="violet" className="tabular-nums">
            {row.code}
          </Chip>
        ) : (
          <span className="inline-flex rounded-full bg-v-wash2 px-3 py-1 text-[11.5px] font-bold text-v-ink400">
            —
          </span>
        ),
    },
    {
      key: 'level',
      label: 'Level',
      w: '130px',
      render: (row) => {
        const lv = levelOf(row?.title);
        return (
          <Chip tone={LEVEL_META[lv].tone} dot>
            {lv}
          </Chip>
        );
      },
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Edit designation"
        onClick={() => {
          setUID(row?.uid);
          setIsModalOpen(true);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete designation"
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
            { label: 'Designations' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Designations
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'designation' : 'designations'}
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
            Create designation
          </VioletButton>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi
          icon={<Star />}
          tone="violet"
          value={count}
          label="Designations"
          bar="#7C4DFF"
          delay={0.06}
        />
        <Kpi
          icon={<Hash />}
          tone="teal"
          value={coded}
          label="With a code"
          bar="#0E7490"
          delay={0.1}
        />
        <Kpi
          icon={<Layers />}
          tone="success"
          value={levelCount}
          label="Seniority levels"
          bar="#1FA97A"
          delay={0.14}
        />
      </div>

      {/* table */}
      <VioletListTable
        icon={<Star />}
        title="All designations"
        subtitle={(_shown, total) =>
          `${total} ${total === 1 ? 'title' : 'titles'} · ${coded} with a code`
        }
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search designations"
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="86px"
        emptyIcon={<Star className="h-[19px] w-[19px]" />}
        emptyTitle="No designations yet"
        emptySub="Create your first job title to start assigning roles."
      />

      {/* create / edit drawer */}
      <Designation isOpen={isModalOpen} setIsOpen={setIsModalOpen} uid={uid} refetch={refetch} />
    </div>
  );
};

export default Page;
