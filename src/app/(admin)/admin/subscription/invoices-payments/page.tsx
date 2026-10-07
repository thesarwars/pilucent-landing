'use client';

import Table from '@/app/(admin)/_components/Table';
import { SBadge, Mono, SBtn, type STone } from '../_components/ui';
import { useFetch } from '@/app/helpers/hooks';
import { fetchAdminSubscriptionInvoices } from '@/app/helpers/backend';
import moment from 'moment';

/* Invoice status → badge tone */
const STATUS_TONE: Record<string, STone> = {
  PAID: 'good',
  OPEN: 'info',
  DRAFT: 'mute',
  PAST_DUE: 'warn',
  FAILED: 'bad',
  UNCOLLECTIBLE: 'bad',
  VOID: 'mute',
  REFUNDED: 'mute',
};

/** "45.990" + "USD" → "$45.99" */
const fmtMoney = (v: string | number | undefined | null, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(v ?? 0) || 0);

const Columns = [
  {
    text: 'Invoice ID',
    dataField: 'stripe_invoice_id',
    formatter: (v: any, row: any) => <Mono>{v || row?.uid?.slice(0, 8) || '-'}</Mono>,
  },
  {
    text: 'Company',
    dataField: 'company_name',
    formatter: (v: any) => v || '-',
  },
  {
    text: 'Amount',
    dataField: 'total',
    formatter: (v: any, row: any) => <Mono>{fmtMoney(v, row?.currency)}</Mono>,
  },
  {
    text: 'Reason',
    dataField: 'billing_reason',
    formatter: (v: any) => <span className="capitalize">{v ? v.replace(/_/g, ' ') : '-'}</span>,
  },
  {
    text: 'Status',
    dataField: 'status',
    formatter: (v: any) =>
      v ? <SBadge tone={STATUS_TONE[v] ?? 'mute'}>{v}</SBadge> : '-',
  },
  {
    text: 'Date',
    dataField: 'created_at',
    formatter: (v: any) => <Mono>{v ? moment(v).format('MMM DD, YYYY') : '-'}</Mono>,
  },
  {
    text: 'Action',
    dataField: 'hosted_invoice_url',
    formatter: (v: any) =>
      v ? (
        <a href={v} target="_blank" rel="noopener noreferrer">
          <SBtn variant="ghost" className="!h-8 !text-[12px]">View</SBtn>
        </a>
      ) : (
        <span className="text-[13px] text-[#8A93A6]">—</span>
      ),
  },
];

export default function Page() {
  const { data, setQueryParams, isPending } = useFetch(
    ['admin-invoices'],
    fetchAdminSubscriptionInvoices,
  );

  const summary = data?.summary ?? {};

  const cards = [
    { label: 'Collected this cycle', value: fmtMoney(summary.collected_total) },
    { label: 'Outstanding', value: fmtMoney(summary.outstanding_total) },
    { label: 'Failed in dunning', value: fmtMoney(summary.failed_total) },
  ];

  return (
    <div className="space-y-5">
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(card => (
          <div key={card.label} className="rounded-2xl border border-[#E7E8F2] bg-white p-4">
            <p className="text-[12px] text-[#5B6478]">{card.label}</p>
            <p className="text-[24px] font-extrabold text-[#0B1020] [font-variant-numeric:tabular-nums]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <Table
        columns={Columns}
        data={data}
        setParams={setQueryParams}
        loading={isPending}
        title="Billing Ledger"
        isCheckbox={false}
        pagination={true}
      />
    </div>
  );
}
