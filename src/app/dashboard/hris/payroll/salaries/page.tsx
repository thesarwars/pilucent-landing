'use client';

import React, { useMemo } from 'react';
import {
  Wallet,
  Printer,
  Settings,
  TrendingUp,
  TrendingDown,
  Banknote,
  Coins,
} from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchEmployeeSalaries } from '@/app/helpers/backend';
import {
  Avatar,
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  money,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';

const num = (v: any) => Number(v) || 0;

const Page: React.FC = () => {
  const { data, isPending, setQueryParams } = useFetch(['salaries'], fetchEmployeeSalaries);

  const rows: any[] = data?.results || data?.data || [];
  const count = data?.count ?? rows.length;

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        gross: acc.gross + num(r?.gross),
        addition: acc.addition + num(r?.salary_breakdown?.total_addition),
        deduction: acc.deduction + num(r?.salary_breakdown?.total_deduction),
        net: acc.net + num(r?.total),
      }),
      { gross: 0, addition: 0, deduction: 0, net: 0 },
    );
  }, [rows]);

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
      key: 'name',
      label: 'Employee',
      w: 'minmax(0,1.6fr)',
      locked: true,
      render: (row) => {
        const name = row?.employee?.name || '—';
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={name} size={36} square />
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-bold text-v-ink900">{name}</div>
              <div className="truncate text-[11px] text-v-ink400">
                {row?.employee?.email || row?.employee?.designation || 'Employee'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'gross',
      label: 'Earnings',
      w: 'minmax(0,1fr)',
      align: 'right',
      render: (row) => (
        <span className="text-[12.5px] font-semibold tabular-nums text-v-ink900">
          {money(num(row?.gross))}
        </span>
      ),
    },
    {
      key: 'addition',
      label: 'Additions',
      w: 'minmax(0,1fr)',
      align: 'right',
      render: (row) => {
        const v = num(row?.salary_breakdown?.total_addition);
        return (
          <span
            className={
              v > 0
                ? 'inline-flex items-center gap-1 rounded-full bg-v-success-bg px-2.5 py-1 text-[12px] font-bold tabular-nums text-v-success-fg'
                : 'text-[12.5px] tabular-nums text-v-ink400'
            }
          >
            {v > 0 && <TrendingUp className="h-3 w-3" />}
            {v > 0 ? `+${money(v)}` : money(v)}
          </span>
        );
      },
    },
    {
      key: 'deduction',
      label: 'Deductions',
      w: 'minmax(0,1fr)',
      align: 'right',
      render: (row) => {
        const v = num(row?.salary_breakdown?.total_deduction);
        return (
          <span
            className={
              v > 0
                ? 'inline-flex items-center gap-1 rounded-full bg-v-danger-bg px-2.5 py-1 text-[12px] font-bold tabular-nums text-v-danger-fg'
                : 'text-[12.5px] tabular-nums text-v-ink400'
            }
          >
            {v > 0 && <TrendingDown className="h-3 w-3" />}
            {v > 0 ? `−${money(v)}` : money(v)}
          </span>
        );
      },
    },
    {
      key: 'total',
      label: 'Net Pay',
      w: 'minmax(0,1.1fr)',
      align: 'right',
      render: (row) => (
        <span className="text-[13.5px] font-extrabold tabular-nums text-v-primary">
          {money(num(row?.total))}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'HRIS', href: '#' },
            { label: 'Salaries' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Salaries
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'employee' : 'employees'}
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
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<Wallet />}
          tone="violet"
          value={money(totals.gross)}
          label="Gross earnings"
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
        <Kpi
          icon={<Banknote />}
          tone="warn"
          value={money(totals.net)}
          label="Net pay"
          bar="#B97608"
          delay={0.18}
        />
      </div>

      {/* table */}
      <VioletListTable
        icon={<Coins />}
        title="Employee salaries"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'employee' : 'employees'}`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search employees"
        emptyIcon={<Coins className="h-[19px] w-[19px]" />}
        emptyTitle="No salaries yet"
        emptySub="Salary records will appear here once payroll is configured."
      />
    </div>
  );
};

export default Page;
