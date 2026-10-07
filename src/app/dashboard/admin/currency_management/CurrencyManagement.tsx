'use client';

import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Plus, Printer, Settings, Pencil, Coins, CircleDollarSign, Clock } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchCurrencies } from '@/app/helpers/backend';
import {
  Avatar,
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import Modal from '@/app/(admin)/_components/Modal';
import Currency from './Currency';

const isActive = (s?: string) => `${s || ''}`.toUpperCase() === 'ACTIVE';

const CurrencyManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [updateUID, setUpdateUID] = useState('');

  const { data, isPending, refetch, setQueryParams } = useFetch(
    ['currency_list'],
    fetchCurrencies,
  );

  const rows: any[] = data?.results || data?.data || [];
  const count = data?.count ?? rows.length;

  const stats = useMemo(() => {
    const active = rows.filter((r) => isActive(r?.status)).length;
    const latest = rows
      .map((r) => r?.date)
      .filter(Boolean)
      .map((d: string) => moment(d))
      .filter((m) => m.isValid())
      .sort((a, b) => b.valueOf() - a.valueOf())[0];
    return { active, latest };
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
      key: 'kind',
      label: 'Currency',
      w: 'minmax(0,1.4fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={row?.kind || '—'} size={36} square className="text-[11px]">
            {row?.kind || '—'}
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-v-ink900">{row?.kind || '—'}</div>
            <div className="truncate text-[11px] text-v-ink400">Currency</div>
          </div>
        </div>
      ),
    },
    {
      key: 'exchange_rate',
      label: 'Exchange rate',
      w: 'minmax(0,1fr)',
      align: 'right',
      render: (row) => (
        <span className="text-[13px] font-extrabold tabular-nums text-v-ink900">
          {row?.exchange_rate != null ? Number(row.exchange_rate).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          }) : '—'}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Last updated',
      w: '170px',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums text-v-ink700">
          <Clock className="h-3.5 w-3.5 text-v-ink400" />
          {row?.date ? moment(row.date).format('DD MMM, YY · HH:mm') : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      w: '120px',
      render: (row) =>
        row?.status ? (
          <Chip tone={isActive(row.status) ? 'success' : 'neutral'} dot>
            {isActive(row.status) ? 'Active' : `${row.status}`.replace(/_/g, ' ')}
          </Chip>
        ) : (
          <span className="text-[12.5px] text-v-ink400">—</span>
        ),
    },
  ];

  const renderActions = (row: any) => (
    <button
      type="button"
      aria-label="Edit currency"
      onClick={() => {
        setUpdateUID(row?.uid);
        setIsOpen(true);
      }}
      className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
    >
      <Pencil className="h-4 w-4" />
    </button>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Currencies' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Currencies
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'currency' : 'currencies'}
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
              setUpdateUID('');
              setIsOpen(true);
            }}
          >
            Add currency
          </VioletButton>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi
          icon={<Coins />}
          tone="violet"
          value={count}
          label="Total currencies"
          bar="#7C4DFF"
          delay={0.06}
        />
        <Kpi
          icon={<CircleDollarSign />}
          tone="success"
          value={stats.active}
          label="Active currencies"
          bar="#1FA97A"
          delay={0.1}
        />
        <Kpi
          icon={<Clock />}
          tone="warn"
          value={stats.latest ? stats.latest.format('DD MMM') : '—'}
          label="Last updated"
          bar="#B97608"
          delay={0.14}
        />
      </div>

      {/* table */}
      <VioletListTable
        icon={<Coins />}
        title="All currencies"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'currency' : 'currencies'}`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search currencies"
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="70px"
        emptyIcon={<Coins className="h-[19px] w-[19px]" />}
        emptyTitle="No currencies yet"
        emptySub="Add a currency to manage exchange rates."
      />

      {/* add / edit modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={updateUID ? 'Edit Currency' : 'Add Currency'}
        widthClass="w-full md:w-[550px]"
      >
        <Currency refetch={refetch} isOpen={isOpen} setIsOpen={setIsOpen} uid={updateUID} />
      </Modal>
    </div>
  );
};

export default CurrencyManagement;
