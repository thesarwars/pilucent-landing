'use client';

import { useMemo, useState } from 'react';
import Table from '@/app/(admin)/_components/Table';
import { SBadge, Mono, MiniBar, SBtn, type STone } from '../_components/ui';
import { SDrawer } from '../_components/overlays';
import { useSa } from '../_components/SaProvider';
import { useFetch } from '@/app/helpers/hooks';
import { fetchAdminTenantsSubscription } from '@/app/helpers/backend';

interface TenantSubscription {
  company_uid: string;
  company_name: string;
  company_email: string;
  currency: string;
  plan_uid: string | null;
  plan_title: string | null;
  status: string;
  employee_count: number;
  employee_limit: number | null;
  user_count: number;
  user_limit: number | null;
  mrr: string;
  renewal_date: string | null;
  subscription_uid: string;
}

function getInitials(name: string): string {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

const STATUS_TONES: Record<string, STone> = {
  ACTIVE: 'good',
  TRIALING: 'info',
  TRIAL: 'info',
  PAST_DUE: 'bad',
  GRACE: 'warn',
  SUSPENDED: 'bad',
  CANCELED: 'mute',
  CANCELLED: 'mute',
  EXPIRED: 'mute',
  PENDING: 'warn',
};

const statusTone = (status?: string): STone => STATUS_TONES[(status ?? '').toUpperCase()] ?? 'mute';

const prettyStatus = (status?: string) => {
  if (!status) return '—';
  return status
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const fmtMoney = (v: any, currency = 'USD') => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const usagePct = (used: number, limit: number | null) =>
  limit && limit > 0 ? Math.round((used / limit) * 100) : 0;

export default function Page() {
  const { exportCsv } = useSa();
  const { data, setQueryParams, isPending } = useFetch(
    ['admin-tenant-subscriptions'],
    fetchAdminTenantsSubscription,
  );
  const [drawer, setDrawer] = useState<TenantSubscription | null>(null);

  const rows: TenantSubscription[] = useMemo(
    () => (Array.isArray(data) ? data : (data?.results ?? [])),
    [data],
  );

  const handleExport = () => {
    exportCsv(
      'tenant-subscriptions.csv',
      ['Company', 'Email', 'Plan', 'Status', 'Employees', 'Users', 'MRR', 'Renewal'],
      rows.map(r => [
        r.company_name,
        r.company_email,
        r.plan_title ?? '—',
        prettyStatus(r.status),
        `${r.employee_count}/${r.employee_limit ?? '∞'}`,
        `${r.user_count}/${r.user_limit ?? '∞'}`,
        fmtMoney(r.mrr, r.currency),
        fmtDate(r.renewal_date),
      ]),
    );
  };

  const Columns = [
    {
      text: 'Company',
      dataField: 'company_name',
      formatter: (v: any, row: TenantSubscription) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(140deg,#5B5BF0,#7C5CFC)] text-[11px] font-bold text-white">
            {getInitials(v || '?')}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-semibold text-[#111935]">{v || '—'}</span>
            <span className="text-[11px] text-[#8A93A6]">{row.company_email || row.currency}</span>
          </div>
        </div>
      ),
    },
    {
      text: 'Plan',
      dataField: 'plan_title',
      formatter: (v: any) =>
        v ? <SBadge tone="brand">{v}</SBadge> : <span className="text-[#8A93A6]">—</span>,
    },
    {
      text: 'Status',
      dataField: 'status',
      formatter: (v: any) => <SBadge tone={statusTone(v)}>{prettyStatus(v)}</SBadge>,
    },
    {
      text: 'Employees',
      dataField: 'employee_count',
      formatter: (v: any, row: TenantSubscription) => {
        const used = Number(v) || 0;
        const limit = row.employee_limit;
        const isOver = limit != null && used > limit;
        return (
          <div className="flex items-center gap-2">
            <Mono>
              {used} / {limit ?? '∞'}
            </Mono>
            {isOver && <SBadge tone="warn">+{used - limit} over</SBadge>}
          </div>
        );
      },
    },
    {
      text: 'Users',
      dataField: 'user_count',
      formatter: (v: any, row: TenantSubscription) => {
        const used = Number(v) || 0;
        const limit = row.user_limit;
        const pct = usagePct(used, limit);
        return (
          <div className="min-w-[88px]">
            <Mono>
              {used} / {limit ?? '∞'}
            </Mono>
            {pct > 0 && (
              <MiniBar
                value={pct}
                tone={pct >= 90 ? 'bad' : pct >= 75 ? 'warn' : 'good'}
                className="mt-1.5"
              />
            )}
          </div>
        );
      },
    },
    {
      text: 'MRR',
      dataField: 'mrr',
      formatter: (v: any, row: TenantSubscription) => <Mono>{fmtMoney(v, row.currency)}</Mono>,
    },
    {
      text: 'Renewal',
      dataField: 'renewal_date',
      formatter: (v: any) => <span className="text-[13px] text-[#111935]">{fmtDate(v)}</span>,
    },
  ];

  const drawerUserPct = drawer ? usagePct(drawer.user_count, drawer.user_limit) : 0;
  const drawerEmpPct = drawer ? usagePct(drawer.employee_count, drawer.employee_limit) : 0;

  return (
    <>
      <Table
        columns={Columns}
        data={{
          count: data?.count ?? rows.length,
          next: data?.next ?? null,
          previous: data?.previous ?? null,
          results: rows,
        }}
        setParams={setQueryParams}
        loading={isPending}
        title="Tenant Subscriptions"
        isCheckbox={false}
        isSettings={false}
        isPdfExcel={false}
        isScreen={false}
        onView={(row: TenantSubscription) => setDrawer(row)}
        isView
      >
        <SBtn onClick={handleExport}>Export</SBtn>
      </Table>

      <SDrawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawer?.company_name ?? ''}
        subtitle={drawer ? `${drawer.plan_title ?? 'No plan'} · ${prettyStatus(drawer.status)}` : ''}
      >
        {drawer && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <SBadge tone={statusTone(drawer.status)}>{prettyStatus(drawer.status)}</SBadge>
              {drawer.plan_title && <SBadge tone="brand">{drawer.plan_title}</SBadge>}
              <SBadge tone="mute">{drawer.currency}</SBadge>
            </div>

            <div className="rounded-2xl border border-[#E7E8F2] bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9AA0BF]">
                Account
              </p>
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex justify-between gap-4">
                  <span className="text-[#6B7090]">Email</span>
                  <span className="text-[#0B1020]">{drawer.company_email || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#6B7090]">Renewal</span>
                  <span className="text-[#0B1020]">{fmtDate(drawer.renewal_date)}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-[#E7E8F2] pt-2 font-semibold">
                  <span>Monthly recurring revenue</span>
                  <span>{fmtMoney(drawer.mrr, drawer.currency)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold text-[#6B7090]">Employee usage</p>
              <MiniBar
                value={drawerEmpPct}
                tone={drawerEmpPct >= 90 ? 'bad' : drawerEmpPct >= 75 ? 'warn' : 'good'}
              />
              <p className="mt-1 font-mono text-[12px] text-[#6B7090]">
                {drawer.employee_count} / {drawer.employee_limit ?? '∞'} employees
              </p>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold text-[#6B7090]">User usage</p>
              <MiniBar
                value={drawerUserPct}
                tone={drawerUserPct >= 90 ? 'bad' : drawerUserPct >= 75 ? 'warn' : 'good'}
              />
              <p className="mt-1 font-mono text-[12px] text-[#6B7090]">
                {drawer.user_count} / {drawer.user_limit ?? '∞'} users
              </p>
            </div>
          </div>
        )}
      </SDrawer>
    </>
  );
}
