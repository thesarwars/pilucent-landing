'use client';

import * as React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { Eye } from 'lucide-react';
import { Chip, money, initials } from '@/components/violet';
import { getRowApiType, deriveStatus, fullName } from './salesHelpers';
import { saleTypeLabel } from './saleTypes';

/* ── column model shared by every sales table ────────────────────────── */
export interface SalesColumn {
  key: string;
  label: string;
  w: string;
  align?: 'left' | 'right' | 'center';
  locked?: boolean;
  defaultHidden?: boolean;
  /** omit to make the column non-sortable */
  sortValue?: (row: any) => string | number;
  render: (row: any) => React.ReactNode;
  /** value used for the xlsx export (omit to exclude from export) */
  exportValue?: (row: any) => any;
}

export const ICON_BTN =
  'flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border-none bg-transparent text-v-ink400 transition-colors hover:bg-v-tint100 hover:text-v-primary';

/* ── cells ───────────────────────────────────────────────────────────── */
function CustomerCell({ row }: { row: any }) {
  const name = fullName(row?.customer) || '—';
  const href = row?.customer?.uid ? `/dashboard/sales/customers/${row.customer.uid}` : undefined;
  const inner = (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-v-tint100 text-[11px] font-bold text-v-primary">
        {initials(name === '—' ? '?' : name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13.5px] font-semibold text-v-ink900">{name}</span>
        {row?.company && (
          <span className="block truncate text-[11px] italic text-v-ink400">{row.company}</span>
        )}
      </span>
    </span>
  );
  return href ? (
    <Link href={href} className="inline-flex max-w-full" title="Customer details">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/** The common View/Edit icon action, gated by permission. */
export function EditAction({ href, canEdit }: { href: string; canEdit: boolean }) {
  if (!canEdit) return null;
  return (
    <Link href={href} title="View / Edit" className={ICON_BTN}>
      <Eye className="h-[15px] w-[15px]" />
    </Link>
  );
}

/* ── column builders ─────────────────────────────────────────────────── */
export const colDate = (): SalesColumn => ({
  key: 'date',
  label: 'Date',
  w: 'minmax(0,1fr)',
  align: 'left',
  sortValue: (r) => new Date(r?.date || 0).getTime(),
  render: (r) => (
    <span className="text-[13px] tabular-nums text-v-ink700">
      {r?.date ? moment(r.date).format('DD MMM, YYYY') : '—'}
    </span>
  ),
  exportValue: (r) => (r?.date ? moment(r.date).format('DD MMM, YYYY') : ''),
});

export const colCustomer = (): SalesColumn => ({
  key: 'customer',
  label: 'Customer',
  w: 'minmax(0,1.6fr)',
  align: 'left',
  locked: true,
  sortValue: (r) => fullName(r?.customer).toLowerCase(),
  render: (r) => <CustomerCell row={r} />,
  exportValue: (r) => fullName(r?.customer),
});

export const colType = (): SalesColumn => ({
  key: 'type',
  label: 'Type',
  w: '150px',
  align: 'left',
  sortValue: (r) => saleTypeLabel(getRowApiType(r)).toLowerCase(),
  render: (r) => (
    <span className="truncate text-[13px] text-v-ink500">{saleTypeLabel(getRowApiType(r))}</span>
  ),
  exportValue: (r) => saleTypeLabel(getRowApiType(r)),
});

export const colInvoice = (): SalesColumn => ({
  key: 'invoice',
  label: 'Inv #',
  w: '100px',
  align: 'left',
  sortValue: (r) => String(r?.invoice_id || ''),
  render: (r) => (
    <span className="truncate text-[12.5px] tabular-nums text-v-ink500">{r?.invoice_id || '—'}</span>
  ),
  exportValue: (r) => r?.invoice_id ?? '',
});

export const colCurrency = (): SalesColumn => ({
  key: 'currency',
  label: 'Currency',
  w: '92px',
  align: 'left',
  defaultHidden: true,
  render: (r) => (
    <span className="rounded-md bg-[#E9E5F5] px-1.5 py-[3px] text-[11.5px] font-semibold text-v-ink500">
      {r?.customer?.currency || '—'}
    </span>
  ),
  exportValue: (r) => r?.customer?.currency ?? '',
});

export const colAmount = (): SalesColumn => ({
  key: 'amount',
  label: 'Amount',
  w: '130px',
  align: 'right',
  sortValue: (r) => Number(r?.total) || 0,
  render: (r) => (
    <span className="block text-right">
      <span className="block text-[13.5px] font-bold tabular-nums text-v-ink900">
        {money(Number(r?.total) || 0)}
      </span>
      {r?.customer?.currency && (
        <span className="block text-[10.5px] text-v-ink400">{r.customer.currency}</span>
      )}
    </span>
  ),
  exportValue: (r) => Number(r?.total) || 0,
});

export const colDueTotal = (): SalesColumn => ({
  key: 'due',
  label: 'Due',
  w: '120px',
  align: 'right',
  sortValue: (r) => Number(r?.due_total) || 0,
  render: (r) => (
    <span className="block text-right text-[13px] font-semibold tabular-nums text-v-ink700">
      {money(Number(r?.due_total) || 0)}
    </span>
  ),
  exportValue: (r) => Number(r?.due_total) || 0,
});

export const colStatus = (): SalesColumn => ({
  key: 'status',
  label: 'Status',
  w: '124px',
  align: 'center',
  render: (r) => {
    const s = deriveStatus(r);
    return (
      <span className="flex justify-center">
        <Chip tone={s.tone} className="text-[11px] tracking-[0.03em]">
          {s.label}
        </Chip>
      </span>
    );
  },
  exportValue: (r) => deriveStatus(r).label,
});

/**
 * The default column set every table shares. Currency is intentionally NOT a
 * column — it is surfaced as the sub-line under the Amount (per the spec), so a
 * separate column would duplicate it. colCurrency() stays exported for tables
 * that want it explicitly.
 */
export const baseColumns = (): SalesColumn[] => [
  colDate(),
  colCustomer(),
  colType(),
  colInvoice(),
  colAmount(),
  colStatus(),
];
