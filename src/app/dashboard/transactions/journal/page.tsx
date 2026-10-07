'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { BookText, Plus, Eye, Hash, CircleDollarSign, FileSpreadsheet } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { getJournals } from '@/app/helpers/backend';
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

const statusTone = (s?: string): VioletTone => {
  const v = `${s || ''}`.toUpperCase();
  if (v.includes('POST') || v.includes('APPROV') || v.includes('COMPLET') || v === 'ACTIVE') return 'success';
  if (v.includes('DRAFT') || v.includes('PENDING')) return 'warn';
  if (v.includes('VOID') || v.includes('REJECT') || v.includes('CANCEL')) return 'danger';
  return 'neutral';
};

const Page = () => {
  const { data, isPending, setQueryParams } = useFetch(['journal_data-for_table'], getJournals);
  const router = useRouter();
  const { Permissions } = useAppSelector((state) => state.Permissions);

  useEffect(() => {
    document.title = 'Journal Entry';
  }, []);

  const rows: any[] = data?.results || data?.data || [];
  const count = data?.count ?? rows.length;

  const totalAmount = useMemo(
    () => rows.reduce((a, r) => a + (Number(r?.amount) || 0), 0),
    [rows],
  );

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
      key: 'entry_number',
      label: 'Entry',
      w: 'minmax(0,1.4fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white"
            style={{ backgroundImage: 'linear-gradient(135deg,#7C4DFF,#A78BFF)' }}
          >
            <BookText className="h-[17px] w-[17px]" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold tabular-nums text-v-ink900">
              {row?.entry_number || '—'}
            </div>
            <div className="truncate text-[11px] tabular-nums text-v-ink400">
              {row?.date ? moment(row.date).format('DD MMM, YYYY') : '—'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      w: '150px',
      render: (row) => (
        <span className="text-[12.5px] font-semibold tabular-nums text-v-ink700">
          {row?.date ? moment(row.date).format('YYYY-MM-DD') : '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      w: 'minmax(0,1fr)',
      align: 'right',
      render: (row) => (
        <span className="text-[13px] font-extrabold tabular-nums text-v-ink900">
          {money(Number(row?.amount) || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      w: '140px',
      render: (row) =>
        row?.status ? (
          <Chip tone={statusTone(row.status)} dot>
            {`${row.status}`.split('_').join(' ')}
          </Chip>
        ) : (
          <span className="text-[12.5px] text-v-ink400">—</span>
        ),
    },
  ];

  const renderActions = (row: any) => (
    <Link
      href={`/dashboard/transactions/journal/${row?.uid}`}
      aria-label="View journal entry"
      className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
    >
      <Eye className="h-4 w-4" />
    </Link>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Transactions', href: '#' },
            { label: 'Journal Entry' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Journal entries
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'entry' : 'entries'}
          </Chip>
          <span className="flex-1" />
          {Permissions?.includes('add_journalentry') && (
            <VioletButton
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/dashboard/transactions/journal/create')}
            >
              Create
            </VioletButton>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi
          icon={<FileSpreadsheet />}
          tone="violet"
          value={count}
          label="Journal entries"
          bar="#7C4DFF"
          delay={0.06}
        />
        <Kpi
          icon={<CircleDollarSign />}
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
        icon={<BookText />}
        title="Journal entries"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'entry' : 'entries'}`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search journal entry"
        renderActions={renderActions}
        actionLabel="View"
        actionWidth="64px"
        emptyIcon={<BookText className="h-[19px] w-[19px]" />}
        emptyTitle="No journal entries yet"
        emptySub="Create a journal entry to record a manual transaction."
      />
    </div>
  );
};

export default Page;
