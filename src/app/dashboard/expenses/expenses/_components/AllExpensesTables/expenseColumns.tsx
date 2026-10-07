'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import moment from 'moment';
import { Eye } from 'lucide-react';
import { Chip, money, initials } from '@/components/violet';
import { supplierName, deriveExpenseStatus } from './expenseHelpers';

/* ── column model shared by every expense table ──────────────────────── */
export interface ExpenseColumn {
  key: string;
  label: string;
  w: string;
  align?: 'left' | 'right' | 'center';
  locked?: boolean;
  defaultHidden?: boolean;
  sortValue?: (row: any) => string | number;
  render: (row: any) => React.ReactNode;
  exportValue?: (row: any) => any;
}

export const ICON_BTN =
  'flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border-none bg-transparent text-v-ink400 transition-colors hover:bg-v-tint100 hover:text-v-primary';

function PayeeCell({ row }: { row: any }) {
  const name = supplierName(row?.supplier) || '—';
  const img = row?.supplier?.image;
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {img ? (
        <Image
          src={img}
          width={64}
          height={64}
          alt={name}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-v-tint100 text-[11px] font-bold text-v-primary">
          {initials(name === '—' ? '?' : name)}
        </span>
      )}
      <span className="truncate text-[13.5px] font-semibold text-v-ink900">{name}</span>
    </span>
  );
}

/** The common View/Edit icon action, gated by permission. */
export function EditAction({ href, canView }: { href: string; canView: boolean }) {
  if (!canView) return null;
  return (
    <Link href={href} title="View / Edit" className={ICON_BTN}>
      <Eye className="h-[15px] w-[15px]" />
    </Link>
  );
}

/* ── column builders ─────────────────────────────────────────────────── */
export const colDate = (): ExpenseColumn => ({
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

export const colType = (label: string): ExpenseColumn => ({
  key: 'type',
  label: 'Type',
  w: '120px',
  align: 'left',
  render: () => <span className="truncate text-[13px] text-v-ink500">{label}</span>,
  exportValue: () => label,
});

export const colPurchaseId = (): ExpenseColumn => ({
  key: 'purchase',
  label: 'Purchase ID',
  w: '120px',
  align: 'left',
  sortValue: (r) => String(r?.purchase_id || ''),
  render: (r) => (
    <span className="truncate text-[12.5px] tabular-nums text-v-ink500">{r?.purchase_id || '—'}</span>
  ),
  exportValue: (r) => r?.purchase_id ?? '',
});

export const colPayee = (): ExpenseColumn => ({
  key: 'payee',
  label: 'Payee',
  w: 'minmax(0,1.6fr)',
  align: 'left',
  locked: true,
  sortValue: (r) => supplierName(r?.supplier).toLowerCase(),
  render: (r) => <PayeeCell row={r} />,
  exportValue: (r) => supplierName(r?.supplier),
});

export const colCurrency = (): ExpenseColumn => ({
  key: 'currency',
  label: 'Currency',
  w: '92px',
  align: 'left',
  defaultHidden: true,
  render: (r) => (
    <span className="rounded-md bg-[#E9E5F5] px-1.5 py-[3px] text-[11.5px] font-semibold text-v-ink500">
      {r?.supplier?.currency || '—'}
    </span>
  ),
  exportValue: (r) => r?.supplier?.currency ?? '',
});

export const colBeforeTax = (): ExpenseColumn => ({
  key: 'before',
  label: 'Before tax',
  w: '120px',
  align: 'right',
  defaultHidden: true,
  sortValue: (r) => (Number(r?.total) || 0) - (Number(r?.total_tax) || 0),
  render: (r) => (
    <span className="block text-right text-[13px] tabular-nums text-v-ink700">
      {money((Number(r?.total) || 0) - (Number(r?.total_tax) || 0))}
    </span>
  ),
  exportValue: (r) => (Number(r?.total) || 0) - (Number(r?.total_tax) || 0),
});

export const colSalesTax = (): ExpenseColumn => ({
  key: 'tax',
  label: 'Sales tax',
  w: '110px',
  align: 'right',
  defaultHidden: true,
  sortValue: (r) => Number(r?.total_tax) || 0,
  render: (r) => (
    <span className="block text-right text-[13px] tabular-nums text-v-ink700">
      {money(Number(r?.total_tax) || 0)}
    </span>
  ),
  exportValue: (r) => Number(r?.total_tax) || 0,
});

export const colTotal = (): ExpenseColumn => ({
  key: 'total',
  label: 'Total',
  w: '130px',
  align: 'right',
  sortValue: (r) => Number(r?.total) || 0,
  render: (r) => (
    <span className="block text-right">
      <span className="block text-[13.5px] font-bold tabular-nums text-v-ink900">
        {money(Number(r?.total) || 0)}
      </span>
      {r?.supplier?.currency && (
        <span className="block text-[10.5px] text-v-ink400">{r.supplier.currency}</span>
      )}
    </span>
  ),
  exportValue: (r) => Number(r?.total) || 0,
});

export const colStatus = (): ExpenseColumn => ({
  key: 'status',
  label: 'Status',
  w: '124px',
  align: 'center',
  render: (r) => {
    const s = deriveExpenseStatus(r);
    return (
      <span className="flex justify-center">
        <Chip tone={s.tone} className="text-[11px] tracking-[0.03em]">
          {s.label}
        </Chip>
      </span>
    );
  },
  exportValue: (r) => deriveExpenseStatus(r).label,
});

/** Default column set for the bill-style tables. */
export const baseExpenseColumns = (typeLabel: string): ExpenseColumn[] => [
  colDate(),
  colType(typeLabel),
  colPurchaseId(),
  colPayee(),
  colCurrency(),
  colBeforeTax(),
  colSalesTax(),
  colTotal(),
  colStatus(),
];
