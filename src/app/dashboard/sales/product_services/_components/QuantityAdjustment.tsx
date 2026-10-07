'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { SlidersHorizontal, Plus, Hash, Coins, Boxes } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchQuantityAdjustment } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
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

const QuantityAdjustment = () => {
  const { data, setQueryParams, isPending } = useFetch(
    ['quantity_adjustment'],
    fetchQuantityAdjustment,
  );
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const router = useRouter();

  const rows: any[] = data?.results || data?.data || [];
  const count = data?.count ?? rows.length;

  const totalAmount = useMemo(
    () => rows.reduce((a, r) => a + (Number(r?.sub_total) || 0), 0),
    [rows],
  );

  useEffect(() => {
    if (!Permissions?.includes('view_stockadjustment')) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

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
      key: 'date',
      label: 'Date',
      w: 'minmax(0,1fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-v-tint100 text-v-primary">
            <SlidersHorizontal className="h-[16px] w-[16px]" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold tabular-nums text-v-ink900">
              {row?.date ? moment(row.date).format('DD MMM, YYYY') : '—'}
            </div>
            <div className="truncate text-[11px] tabular-nums text-v-ink400">
              {row?.reference_number || '—'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      w: 'minmax(0,1fr)',
      render: (row) => (
        <span className="truncate text-[12.5px] font-semibold text-v-ink700">
          {row?.reason || '—'}
        </span>
      ),
    },
    {
      key: 'reference_number',
      label: 'Reference',
      w: '140px',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums text-v-ink700">
          <Hash className="h-3.5 w-3.5 text-v-ink400" />
          {row?.reference_number || '—'}
        </span>
      ),
    },
    {
      key: 'sub_total',
      label: 'Total amount',
      w: '140px',
      align: 'right',
      render: (row) => (
        <span className="text-[13px] font-extrabold tabular-nums text-v-ink900">
          {money(Number(row?.sub_total) || 0)}
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      w: '140px',
      align: 'right',
      render: (row) => (
        <span className="text-[12.5px] font-semibold tabular-nums text-v-ink700">
          {row?.journal_connector?.last_balance != null
            ? money(Number(row.journal_connector.last_balance) || 0)
            : '—'}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Memo',
      w: 'minmax(0,1.2fr)',
      defaultHidden: true,
      render: (row) => (
        <p className="line-clamp-1 text-[12.5px] text-v-ink500">{row?.description || '—'}</p>
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
            { label: 'Sales', href: '/dashboard/sales/all_sales' },
            { label: 'Products & Services', href: '/dashboard/sales/product_services' },
            { label: 'Quantity Adjustment' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Quantity adjustment
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'entry' : 'entries'}
          </Chip>
          <span className="flex-1" />
          {Permissions?.includes('add_stockadjustment') && (
            <VioletButton
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/dashboard/sales/product_services/add_new_inventoryqa')}
            >
              Add new
            </VioletButton>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi
          icon={<Boxes />}
          tone="violet"
          value={count}
          label="Adjustments"
          bar="#7C4DFF"
          delay={0.06}
        />
        <Kpi
          icon={<Coins />}
          tone="success"
          value={money(totalAmount)}
          label="Total amount"
          bar="#1FA97A"
          delay={0.1}
        />
        <Kpi
          icon={<Hash />}
          tone="warn"
          value={rows.length}
          label="On this page"
          bar="#B97608"
          delay={0.14}
        />
      </div>

      {/* table */}
      <VioletListTable
        icon={<SlidersHorizontal />}
        title="Quantity adjustments"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'entry' : 'entries'}`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search adjustments"
        emptyIcon={<SlidersHorizontal className="h-[19px] w-[19px]" />}
        emptyTitle="No adjustments yet"
        emptySub="Add a quantity adjustment to correct stock levels."
      />
    </div>
  );
};

export default QuantityAdjustment;
