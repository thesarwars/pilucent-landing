'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { Plus, LifeBuoy, Ticket, UserRound } from 'lucide-react';
import { fetchSupportTickets } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import CreateTicket from './_components/CreateTicket';
import {
  Avatar,
  Breadcrumb,
  Chip,
  Drawer,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';

const titleCase = (s?: string) =>
  `${s || ''}`
    .split('_')
    .join(' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const STATUS_META: Record<string, { label: string; tone: VioletTone }> = {
  ON_GOING: { label: 'On going', tone: 'warn' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  PENDING: { label: 'Pending', tone: 'danger' },
  OPEN: { label: 'Open', tone: 'teal' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
};

const statusMeta = (s?: string) =>
  STATUS_META[`${s || ''}`.toUpperCase()] || {
    label: `${s || '—'}`.split('_').join(' '),
    tone: 'neutral' as VioletTone,
  };

const issuerName = (row: any) =>
  row?.user?.is_agent != 'True' ? row?.user?.name : row?.target?.name || 'NO AGENT';
const agentName = (row: any) =>
  row?.user?.is_agent == 'True' ? row?.user?.name : row?.target?.name || 'NO AGENT';

const Page = () => {
  const { data, isPending, setQueryParams, refetch } = useFetch(
    ['/support/tickets/'],
    fetchSupportTickets
  );
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const columns: VListColumn[] = [
    {
      key: 'ticket_noumber',
      label: 'Ticket #',
      w: '130px',
      locked: true,
      render: (row) => (
        <button
          type="button"
          onClick={() => router.push(`/dashboard/support/${row?.uid}`)}
          className="text-[12.5px] font-bold tabular-nums text-v-primary hover:underline"
        >
          {row?.ticket_noumber || '—'}
        </button>
      ),
    },
    {
      key: 'issuer',
      label: 'Issuer',
      w: 'minmax(0,1.2fr)',
      render: (row) => {
        const name = issuerName(row);
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={name || '?'} size={32} />
            <span className="truncate text-[12.5px] font-semibold text-v-ink900">{name || '—'}</span>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Issue date',
      w: '120px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">
          {row?.created_at ? moment(row.created_at).format('DD MMM, YYYY') : '—'}
        </span>
      ),
    },
    {
      key: 'kind',
      label: 'Type',
      w: 'minmax(150px,1fr)',
      render: (row) =>
        row?.kind ? (
          <Chip tone="violet" className="whitespace-nowrap">
            {titleCase(row.kind)}
          </Chip>
        ) : (
          <span className="text-[12.5px] text-v-ink400">—</span>
        ),
    },
    {
      key: 'title',
      label: 'Subject',
      w: 'minmax(0,1.5fr)',
      render: (row) => (
        <span className="line-clamp-1 text-[12.5px] text-v-ink700">{row?.title || '—'}</span>
      ),
    },
    {
      key: 'agent',
      label: 'Agent',
      w: 'minmax(0,1fr)',
      render: (row) => {
        const name = agentName(row);
        const noAgent = name === 'NO AGENT';
        return (
          <span
            className={
              noAgent
                ? 'inline-flex items-center gap-1.5 text-[12px] font-medium text-v-ink400'
                : 'inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-v-ink700'
            }
          >
            <UserRound className="h-3.5 w-3.5 text-v-ink400" />
            {noAgent ? 'No agent' : name}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      w: '130px',
      render: (row) => {
        const m = statusMeta(row?.status);
        return (
          <Chip tone={m.tone} dot>
            {m.label}
          </Chip>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Support' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Support &amp; Tickets
          </h1>
          <span className="flex-1" />
          <VioletButton
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsOpen(true)}
          >
            Create Ticket
          </VioletButton>
        </div>
      </div>

      <VioletListTable
        icon={<LifeBuoy />}
        title="List of tickets"
        subtitle={(shown, total) => `${shown} of ${total} ${total === 1 ? 'ticket' : 'tickets'}`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search tickets"
        emptyIcon={<Ticket className="h-[19px] w-[19px]" />}
        emptyTitle="No tickets yet"
        emptySub="Create a ticket or adjust your search to see results here."
      />

      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width={432}
        icon={<LifeBuoy />}
        title="Create Ticket"
        sub="Tell us what's going on and we'll help"
      >
        <CreateTicket refetch={refetch} setIsOpen={setIsOpen} />
      </Drawer>
    </div>
  );
};

export default Page;
