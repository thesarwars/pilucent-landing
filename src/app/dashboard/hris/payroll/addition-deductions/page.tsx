'use client';

import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import moment from 'moment';
import {
  Plus,
  Printer,
  Settings,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
} from 'lucide-react';
import {
  deleteSalaryAdditionDeduction,
  fetchSalaryAdditionDeductions,
} from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  money,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import AdditionDeductions from './_components/AdditionDeductions';

const num = (v: any) => Number(v) || 0;
const isAddition = (k?: string) => `${k || ''}`.toUpperCase() === 'ADDITION';
const fmtDate = (d?: string) => (d ? moment(d).format('DD MMM, YY') : '—');

const Page: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [uid, setUID] = useState('');
  const { data, isPending, setQueryParams, refetch } = useFetch(
    ['salary-adjustments'],
    fetchSalaryAdditionDeductions,
  );

  const rows: any[] = data?.results || data?.data || [];
  const count = data?.count ?? rows.length;

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        const amt = num(r?.amount);
        if (isAddition(r?.kind)) acc.addition += amt;
        else acc.deduction += amt;
        return acc;
      },
      { addition: 0, deduction: 0 },
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
          const response = await deleteSalaryAdditionDeduction(id);
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
          text: 'Addition/Deduction has been deleted.',
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
      label: 'Adjustment',
      w: 'minmax(0,1.6fr)',
      locked: true,
      render: (row) => {
        const add = isAddition(row?.kind);
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white"
              style={{
                backgroundImage: add
                  ? 'linear-gradient(135deg,#1FA97A,#46C79A)'
                  : 'linear-gradient(135deg,#D2483E,#E97A72)',
              }}
            >
              {add ? <TrendingUp className="h-[17px] w-[17px]" /> : <TrendingDown className="h-[17px] w-[17px]" />}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-bold text-v-ink900">{row?.title || '—'}</div>
              <div className="truncate text-[11px] text-v-ink400">{row?.employee?.name || 'Employee'}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'kind',
      label: 'Type',
      w: '130px',
      render: (row) =>
        isAddition(row?.kind) ? (
          <Chip tone="success" dot>
            Addition
          </Chip>
        ) : (
          <Chip tone="danger" dot>
            Deduction
          </Chip>
        ),
    },
    {
      key: 'amount',
      label: 'Amount',
      w: 'minmax(0,1fr)',
      align: 'right',
      render: (row) => {
        const add = isAddition(row?.kind);
        const v = num(row?.amount);
        return (
          <span
            className={
              add
                ? 'text-[13px] font-extrabold tabular-nums text-v-success-fg'
                : 'text-[13px] font-extrabold tabular-nums text-v-danger-fg'
            }
          >
            {add ? '+' : '−'}
            {money(v)}
          </span>
        );
      },
    },
    {
      key: 'input_date',
      label: 'Input date',
      w: '130px',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums text-v-ink700">
          <Calendar className="h-3.5 w-3.5 text-v-ink400" />
          {fmtDate(row?.input_date)}
        </span>
      ),
    },
    {
      key: 'join_date',
      label: 'Join date',
      w: '120px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink500">{fmtDate(row?.join_date)}</span>
      ),
    },
    {
      key: 'remark',
      label: 'Remark',
      w: 'minmax(0,1.2fr)',
      defaultHidden: true,
      render: (row) => (
        <p className="line-clamp-1 text-[12.5px] text-v-ink500">{row?.remark || '—'}</p>
      ),
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Edit adjustment"
        onClick={() => {
          setUID(row?.uid);
          setModalOpen(true);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete adjustment"
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
            { label: 'Additions & Deductions' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Additions &amp; Deductions
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
              setModalOpen(true);
            }}
          >
            Add new
          </VioletButton>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi
          icon={<Scale />}
          tone="violet"
          value={count}
          label="Total entries"
          bar="#7C4DFF"
          delay={0.06}
        />
        <Kpi
          icon={<TrendingUp />}
          tone="success"
          value={money(totals.addition)}
          label="Total additions"
          bar="#1FA97A"
          delay={0.1}
        />
        <Kpi
          icon={<TrendingDown />}
          tone="danger"
          value={money(totals.deduction)}
          label="Total deductions"
          bar="#D2483E"
          delay={0.14}
        />
      </div>

      {/* table */}
      <VioletListTable
        icon={<Scale />}
        title="All adjustments"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'entry' : 'entries'}`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search adjustments"
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="86px"
        emptyIcon={<Scale className="h-[19px] w-[19px]" />}
        emptyTitle="No adjustments yet"
        emptySub="Add an addition or deduction to adjust employee pay."
      />

      {/* add / edit modal */}
      <AdditionDeductions
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        refetch={refetch}
        uid={uid}
      />
    </div>
  );
};

export default Page;
