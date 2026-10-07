'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, ScrollText, SlidersHorizontal } from 'lucide-react';
import {
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';

interface AuditRow {
  dateTime: string;
  user: string;
  action: string;
  dataType: string;
  recordsAffected: string;
  status: 'In Progress' | 'Success' | 'Failed';
  details: string;
}

const ROWS: AuditRow[] = [
  {
    dateTime: '2023-10-26 10:30 AM',
    user: 'John Doe',
    action: 'Import Initiated',
    dataType: 'Invoices',
    recordsAffected: '150',
    status: 'In Progress',
    details: 'File: invoices_Q3.csv',
  },
  {
    dateTime: '2023-10-26 10:25 AM',
    user: 'Jane Smith',
    action: 'Mapping Saved',
    dataType: 'Customers',
    recordsAffected: 'N/A',
    status: 'Success',
    details: 'Template: Customer_Mapping_V2',
  },
  {
    dateTime: '2023-10-26 09:45 AM',
    user: 'John Doe',
    action: 'Validation Fix',
    dataType: 'Journal Entries',
    recordsAffected: '5',
    status: 'Success',
    details: 'Fixed unbalanced entries',
  },
  {
    dateTime: '2023-10-25 03:10 PM',
    user: 'Admin User',
    action: 'Import Approved',
    dataType: 'Payroll Data',
    recordsAffected: 'N/A',
    status: 'Success',
    details: 'Approved by Admin',
  },
  {
    dateTime: '2023-10-25 02:00 PM',
    user: 'John Doe',
    action: 'Import Failed',
    dataType: 'Bank Data',
    recordsAffected: '0',
    status: 'Failed',
    details: 'Invalid file format',
  },
];

const STATUS_TONE: Record<AuditRow['status'], VioletTone> = {
  'In Progress': 'violet',
  Success: 'success',
  Failed: 'danger',
};

const VSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <div>
    <label className="mb-1.5 block text-[11.5px] font-semibold text-v-ink500">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-v-input border border-v-border bg-v-wash px-3 py-2 pr-9 text-[13px] font-medium text-v-ink900 outline-none transition-colors focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_var(--tw-shadow-color)] focus:shadow-v-tint100"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-v-ink400" />
    </div>
  </div>
);

const AuditLog: React.FC = () => {
  const [filters, setFilters] = useState({
    dateRange: 'Last 7 Days',
    user: 'All Users',
    dataType: 'All Data Types',
    status: 'All Statuses',
    actionType: 'All Actions',
  });

  const filtered = useMemo(() => {
    return ROWS.filter((r) => {
      if (filters.user !== 'All Users' && r.user !== filters.user) return false;
      if (filters.dataType !== 'All Data Types' && r.dataType !== filters.dataType) return false;
      if (filters.status !== 'All Statuses' && r.status !== filters.status) return false;
      if (filters.actionType !== 'All Actions' && r.action !== filters.actionType) return false;
      return true;
    });
  }, [filters]);

  const columns: VListColumn[] = [
    {
      key: 'dateTime',
      label: 'Date & time',
      w: 'minmax(0,1.1fr)',
      locked: true,
      render: (row) => (
        <span className="text-[12.5px] font-semibold tabular-nums text-v-ink900">{row.dateTime}</span>
      ),
    },
    {
      key: 'user',
      label: 'User',
      w: '130px',
      render: (row) => <span className="text-[12.5px] text-v-ink700">{row.user}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      w: '150px',
      render: (row) => <span className="text-[12.5px] font-semibold text-v-primary">{row.action}</span>,
    },
    {
      key: 'dataType',
      label: 'Data type',
      w: '140px',
      render: (row) => <span className="text-[12.5px] text-v-ink700">{row.dataType}</span>,
    },
    {
      key: 'recordsAffected',
      label: 'Records',
      w: '100px',
      align: 'right',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink500">{row.recordsAffected}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      w: '130px',
      render: (row) => (
        <Chip tone={STATUS_TONE[row.status as AuditRow['status']]} dot>
          {row.status}
        </Chip>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      w: 'minmax(0,1.3fr)',
      render: (row) => <span className="line-clamp-1 text-[12.5px] text-v-ink500">{row.details}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header */}
      <div className="animate-v-rise">
        <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
          Audit Log
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] text-v-ink500">
          Detailed timeline of all import-related activities, user actions, and system changes.
        </p>
      </div>

      {/* filters card */}
      <div className="animate-v-rise rounded-v-card bg-white p-5 shadow-v-card" style={{ animationDelay: '0.06s' }}>
        <div className="flex items-center gap-2.5">
          <IconChip tone="violet" size="sm">
            <SlidersHorizontal />
          </IconChip>
          <div className="flex-1">
            <div className="text-[13.5px] font-bold text-v-ink900">Activity filters</div>
            <div className="text-[11.5px] text-v-ink400">Narrow the audit trail below</div>
          </div>
          <VioletButton variant="primary" size="sm">
            Apply filters
          </VioletButton>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <VSelect
            label="Date range"
            value={filters.dateRange}
            options={['Last 7 Days', 'Last 30 Days', 'This Month', 'Custom']}
            onChange={(v) => setFilters({ ...filters, dateRange: v })}
          />
          <VSelect
            label="User"
            value={filters.user}
            options={['All Users', 'John Doe', 'Jane Smith', 'Admin User']}
            onChange={(v) => setFilters({ ...filters, user: v })}
          />
          <VSelect
            label="Data type"
            value={filters.dataType}
            options={['All Data Types', 'Invoices', 'Customers', 'Journal Entries', 'Payroll Data', 'Bank Data']}
            onChange={(v) => setFilters({ ...filters, dataType: v })}
          />
          <VSelect
            label="Status"
            value={filters.status}
            options={['All Statuses', 'Success', 'Failed', 'In Progress']}
            onChange={(v) => setFilters({ ...filters, status: v })}
          />
          <VSelect
            label="Action type"
            value={filters.actionType}
            options={['All Actions', 'Import Initiated', 'Mapping Saved', 'Validation Fix', 'Import Approved', 'Import Failed']}
            onChange={(v) => setFilters({ ...filters, actionType: v })}
          />
        </div>
      </div>

      {/* audit trail table */}
      <VioletListTable
        icon={<ScrollText />}
        title="Audit trail"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'event' : 'events'}`}
        data={{ count: filtered.length, results: filtered }}
        clientSide
        searchFn={(row, q) =>
          [row.user, row.action, row.dataType, row.details, row.status]
            .join(' ')
            .toLowerCase()
            .includes(q.toLowerCase())
        }
        columns={columns}
        searchPlaceholder="Search activity"
        emptyIcon={<ScrollText className="h-[19px] w-[19px]" />}
        emptyTitle="No matching activity"
        emptySub="Try adjusting the filters above."
      />
    </div>
  );
};

export default AuditLog;
