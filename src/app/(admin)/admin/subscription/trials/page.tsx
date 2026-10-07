'use client';

import Table from '@/app/(admin)/_components/Table';
import { SBadge, Mono, MiniBar, type STone } from '../_components/ui';
import { useFetch } from '@/app/helpers/hooks';
import { fetchAdminSubscriptionTrials } from '@/app/helpers/backend';
import moment from 'moment';

/* Trial status → badge tone */
const STATUS_TONE: Record<string, STone> = {
  TRIALING: 'info',
  ACTIVE: 'good',
  CONVERTED: 'good',
  EXPIRED: 'mute',
  CANCELED: 'bad',
  CANCELLED: 'bad',
  PAST_DUE: 'warn',
};

/* Defensive field readers — the trials payload was empty, so accept the
   most likely key names and fall back gracefully. Adjust once the real
   response shape is known. */
const company = (r: any) => r?.company_name || r?.company || '-';
const plan = (r: any) => r?.plan_title || r?.plan_name || r?.plan || '-';
const ownerEmail = (r: any) => r?.owner_email || r?.email || r?.company_email || '-';
const trialEnd = (r: any) => r?.trial_end || r?.trial_end_at || r?.current_period_end || null;
const hasCard = (r: any) => Boolean(r?.has_payment_method ?? r?.card_on_file ?? r?.has_card);

/** Whole days from now until the trial ends (negative = already expired) */
const daysLeft = (r: any): number | null => {
  const end = trialEnd(r);
  if (!end) return typeof r?.days_left === 'number' ? r.days_left : null;
  return Math.ceil((new Date(end).getTime() - new Date().getTime()) / 86_400_000);
};

const Columns = [
  { text: 'Company', dataField: 'company_name', formatter: (_: any, r: any) => company(r) },
  {
    text: 'Plan',
    dataField: 'plan_title',
    formatter: (_: any, r: any) => <SBadge tone="brand">{plan(r)}</SBadge>,
  },
  {
    text: 'Owner Email',
    dataField: 'owner_email',
    formatter: (_: any, r: any) => <Mono>{ownerEmail(r)}</Mono>,
  },
  {
    text: 'Card On File',
    dataField: 'has_payment_method',
    formatter: (_: any, r: any) => (
      <SBadge tone={hasCard(r) ? 'good' : 'mute'}>{hasCard(r) ? 'Yes' : 'No'}</SBadge>
    ),
  },
  {
    text: 'Days Left',
    dataField: 'trial_end',
    formatter: (_: any, r: any) => {
      const n = daysLeft(r);
      if (n === null) return <span className="text-[13px] text-[#8A93A6]">—</span>;
      const barValue = Math.min(100, Math.max(0, (n / 14) * 100));
      const tone: 'bad' | 'warn' | 'good' = n <= 3 ? 'bad' : n <= 7 ? 'warn' : 'good';
      return (
        <div className="flex min-w-[72px] flex-col gap-1">
          <Mono>{n}d</Mono>
          <MiniBar value={barValue} tone={tone} />
        </div>
      );
    },
  },
  {
    text: 'Status',
    dataField: 'status',
    formatter: (v: any) => (v ? <SBadge tone={STATUS_TONE[v] ?? 'mute'}>{v}</SBadge> : '-'),
  },
  {
    text: 'Started',
    dataField: 'created_at',
    formatter: (v: any) => <Mono>{v ? moment(v).format('MMM DD, YYYY') : '-'}</Mono>,
  },
];

export default function Page() {
  const { data, setQueryParams, isPending } = useFetch(
    ['admin-trials'],
    fetchAdminSubscriptionTrials,
  );

  const results: any[] = data?.results ?? [];
  const active = data?.count ?? results.length;
  const converting = results.filter(r => {
    const n = daysLeft(r);
    return n !== null && n <= 3;
  }).length;
  const withCard = results.length
    ? Math.round((results.filter(hasCard).length / results.length) * 100)
    : 0;

  const cards = [
    { label: 'Active trials', value: String(active) },
    { label: 'Converting ≤3 days', value: String(converting) },
    { label: 'With card on file', value: `${withCard}%` },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        title="Active Trials"
        isCheckbox={false}
      />
    </div>
  );
}
