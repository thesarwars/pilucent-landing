'use client';

import Table from '@/app/(admin)/_components/Table';
import { SBadge, Mono, type STone } from '../_components/ui';
import { useFetch } from '@/app/helpers/hooks';
import { fetchAdminALLRecentActivity } from '@/app/helpers/backend';
import moment from 'moment';

/* Subscription status → badge tone */
const STATUS_TONE: Record<string, STone> = {
  ACTIVE: 'good',
  TRIALING: 'info',
  PENDING: 'warn',
  PAST_DUE: 'bad',
  CANCELED: 'bad',
  CANCELLED: 'bad',
  EXPIRED: 'mute',
};

const Columns = [
  {
    text: 'Actor',
    dataField: 'actor_name',
    formatter: (v: any, row: any) => (
      <span className="font-semibold text-[#111935]">
        {v || row?.company_name || 'System'}
      </span>
    ),
  },
  {
    text: 'Event',
    dataField: 'title',
    formatter: (v: any, row: any) => v || row?.event_type || '-',
  },
  {
    text: 'Company',
    dataField: 'company_name',
    formatter: (v: any) => <Mono>{v || '-'}</Mono>,
  },
  {
    text: 'Status',
    dataField: 'new_status',
    formatter: (v: any) =>
      v ? <SBadge tone={STATUS_TONE[v] ?? 'mute'}>{v}</SBadge> : '-',
  },
  {
    text: 'Source',
    dataField: 'source',
    formatter: (v: any) => <Mono>{v || '-'}</Mono>,
  },
  {
    text: 'Time',
    dataField: 'created_at',
    formatter: (v: any) => <Mono>{v ? moment(v).format('MMM DD, HH:mm') : '-'}</Mono>,
  },
];

export default function Page() {
  const { data, setQueryParams, isPending } = useFetch(
    ['audit-logs'],
    fetchAdminALLRecentActivity,
  );

  return (
    <Table
      columns={Columns}
      data={data}
      setParams={setQueryParams}
      loading={isPending}
      title="Audit Logs"
      isCheckbox={true}
      pagination={true}
    />
  );
}
