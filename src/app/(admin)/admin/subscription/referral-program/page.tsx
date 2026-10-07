'use client';

import Table from '@/app/(admin)/_components/Table';
import { SBadge, Mono, type STone } from '../_components/ui';
import { useFetch } from '@/app/helpers/hooks';
import { fetchAdminSubscriptionReferrals } from '@/app/helpers/backend';
import moment from 'moment';

/* Redemption status → badge tone */
const STATUS_TONE: Record<string, STone> = {
  PENDING: 'warn',
  APPROVED: 'good',
  PAID: 'good',
  REDEEMED: 'brand',
  REJECTED: 'bad',
};

/** "25.00" → "$25.00" */
const fmtMoney = (v: string | number | undefined | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v ?? 0) || 0);

/* Defensive field readers — the redemptions array was empty, so accept the
   most likely key names. Adjust once a real redemption row is known. */
const referrer = (r: any) => r?.referrer_name || r?.referrer || r?.company_name || '-';
const referred = (r: any) => r?.referred_company || r?.referred_name || r?.referred_company_name || '-';
const reward = (r: any) => r?.reward_amount ?? r?.reward ?? r?.amount;

const Columns = [
  { text: 'Referrer', dataField: 'referrer_name', formatter: (_: any, r: any) => referrer(r) },
  { text: 'Referred Company', dataField: 'referred_company', formatter: (_: any, r: any) => referred(r) },
  {
    text: 'Reward',
    dataField: 'reward_amount',
    formatter: (_: any, r: any) => <Mono>{fmtMoney(reward(r))}</Mono>,
  },
  {
    text: 'Status',
    dataField: 'status',
    formatter: (v: any) => (v ? <SBadge tone={STATUS_TONE[v] ?? 'mute'}>{v}</SBadge> : '-'),
  },
  {
    text: 'Date',
    dataField: 'created_at',
    formatter: (v: any) => <Mono>{v ? moment(v).format('MMM DD, YYYY') : '-'}</Mono>,
  },
];

export default function Page() {
  const { data, isPending } = useFetch(['admin-referrals'], fetchAdminSubscriptionReferrals);

  const summary = data?.summary ?? {};
  const redemptions: any[] = data?.redemptions ?? [];

  const cards = [
    { label: 'Total redemptions', value: String(data?.total_redemptions ?? 0) },
    { label: 'Pending', value: String(summary.pending_count ?? 0) },
    { label: 'Approved', value: String(summary.approved_count ?? 0) },
    { label: 'Total earned', value: fmtMoney(summary.total_earned) },
  ];

  return (
    <div className="space-y-5">
      {/* Program header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E7E8F2] bg-white p-5">
        <div>
          <p className="text-[12px] text-[#5B6478]">Referral code</p>
          <div className="mt-1 flex items-center gap-3">
            <Mono className="!text-[18px] font-bold">{data?.code ?? '—'}</Mono>
            <SBadge tone={data?.program_active ? 'good' : 'mute'}>
              {data?.program_active ? 'Active' : 'Inactive'}
            </SBadge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-[#5B6478]">Reward per referral</p>
          <p className="mt-1 text-[20px] font-extrabold text-[#0B1020] [font-variant-numeric:tabular-nums]">
            {fmtMoney(data?.reward_amount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-[#5B6478]">Available credit</p>
          <p className="mt-1 text-[20px] font-extrabold text-[#0B1020] [font-variant-numeric:tabular-nums]">
            {fmtMoney(summary.available_credit)}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="rounded-2xl border border-[#E7E8F2] bg-white p-4">
            <p className="text-[12px] text-[#5B6478]">{card.label}</p>
            <p className="mt-1 text-[24px] font-extrabold text-[#0B1020] [font-variant-numeric:tabular-nums]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <Table
        columns={Columns}
        data={{ count: redemptions.length, next: null, previous: null, results: redemptions }}
        loading={isPending}
        title="Referral Activity"
        isCheckbox={false}
        isSearch={false}
        isSettings={false}
        isPdfExcel={false}
        pagination={false}
        isScreen={false}
      />
    </div>
  );
}
