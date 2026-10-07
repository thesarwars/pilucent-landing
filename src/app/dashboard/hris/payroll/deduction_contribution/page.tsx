'use client';

import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
  Plus,
  Printer,
  Settings,
  Pencil,
  Trash2,
  Landmark,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import {
  deleteDeductionContribution,
  fetchDeductionContributions,
} from '@/app/helpers/backend';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import DeductionContribution from './_components/DeductionContribution';

const taxLabel = (v?: string) => {
  const t = `${v || ''}`.toUpperCase();
  if (t === 'PRETAX') return 'Pre-tax';
  if (t === 'POST_TAX') return 'Post-tax';
  return null;
};

const Page: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uid, setUID] = useState<any>('');

  const { data, isPending, setQueryParams, refetch } = useFetch(
    ['deduction-contribution'],
    fetchDeductionContributions,
  );

  const rows: any[] = data?.results || data?.data || [];
  const count = data?.count ?? rows.length;

  const taxCounts = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        const t = `${r?.tax_type || ''}`.toUpperCase();
        if (t === 'PRETAX') acc.pre += 1;
        else if (t === 'POST_TAX') acc.post += 1;
        return acc;
      },
      { pre: 0, post: 0 },
    );
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
          const response = await deleteDeductionContribution(id);
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
          text: 'Deduction/Contribution has been deleted.',
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
      label: 'Title',
      w: 'minmax(0,1.6fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white"
            style={{ backgroundImage: 'linear-gradient(135deg,#7C4DFF,#A78BFF)' }}
          >
            <Receipt className="h-[17px] w-[17px]" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-v-ink900">{row?.title || '—'}</div>
            <div className="truncate text-[11px] text-v-ink400">{row?.deduction_type || 'Deduction'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'deduction_type',
      label: 'Deduction type',
      w: 'minmax(0,1fr)',
      render: (row) =>
        row?.deduction_type ? (
          <Chip tone="violet" dot>
            {row.deduction_type}
          </Chip>
        ) : (
          <span className="text-[12.5px] text-v-ink400">—</span>
        ),
    },
    {
      key: 'sub_type',
      label: 'Sub type',
      w: 'minmax(0,1fr)',
      render: (row) => (
        <span className="text-[12.5px] font-semibold text-v-ink700">{row?.sub_type || '—'}</span>
      ),
    },
    {
      key: 'tax_type',
      label: 'Tax type',
      w: '130px',
      render: (row) => {
        const label = taxLabel(row?.tax_type);
        if (!label) return <span className="text-[12.5px] text-v-ink400">—</span>;
        return (
          <Chip tone={label === 'Pre-tax' ? 'success' : 'warn'} dot>
            {label}
          </Chip>
        );
      },
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Edit"
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
        aria-label="Delete"
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
            { label: 'Deduction & Contribution' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Deduction &amp; Contribution
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'entry' : 'entries'}
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
            Create new
          </VioletButton>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi
          icon={<Landmark />}
          tone="violet"
          value={count}
          label="Total entries"
          bar="#7C4DFF"
          delay={0.06}
        />
        <Kpi
          icon={<ShieldCheck />}
          tone="success"
          value={taxCounts.pre}
          label="Pre-tax items"
          bar="#1FA97A"
          delay={0.1}
        />
        <Kpi
          icon={<Receipt />}
          tone="warn"
          value={taxCounts.post}
          label="Post-tax items"
          bar="#B97608"
          delay={0.14}
        />
      </div>

      {/* table */}
      <VioletListTable
        icon={<Landmark />}
        title="All deductions & contributions"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'entry' : 'entries'}`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search deductions"
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="86px"
        emptyIcon={<Landmark className="h-[19px] w-[19px]" />}
        emptyTitle="No entries yet"
        emptySub="Create a deduction or contribution to get started."
      />

      {/* create / edit modal */}
      <DeductionContribution
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        refetch={refetch}
        uid={uid}
      />
    </div>
  );
};

export default Page;
