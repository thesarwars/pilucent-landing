'use client';

import React, { Suspense, useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import MainLoader from '@/components/MainLoader/MainLoader';
import LogoLoader from '@/components/MainLoader/logo-loader';
import ReportFilter from '../_components/filter';
import moment from 'moment';
import { useAppSelector } from '@/app/redux/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFetch } from '@/app/helpers/hooks';
import { fetchInventoryValuationDetail } from '@/app/helpers/backend';


interface DetailRow {
  uid?: string;
  date: string;
  transaction_type: string; // ready-to-display label, e.g. "Opening balance"
  type?: string; // raw enum: OPENING / PURCHASE / SALE / ADJUSTMENT_IN / …
  quantity: number; // SIGNED: + in, − out
  rate: number | null; // per-unit cost; null if none
  inventory_cost: number; // signed cost moved (COGS negative on sales)
  running_quantity: number; // on-hand AFTER this line
  running_value: number; // asset value AFTER this line
}

interface ProductGroup {
  uid?: string;
  product: string;
  sku?: string;
  rows: DetailRow[];
  subtotal: { quantity: number; inventory_cost: number; asset_value: number };
}

const formatNumber = (value?: number | null) =>
  value === null || value === undefined
    ? ''
    : value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatCurrency = (value: number) => `$${formatNumber(value)}`;

// Negatives (stock out — sales/returns/adjustments) are tinted red (§3/§6).
const signClass = (value?: number | null) => ((value ?? 0) < 0 ? 'text-red-600' : 'text-v-ink900');

const InventoryValuationDetail = () => {
  const from = useSearchParams().get('from');
  const to = useSearchParams().get('to');
  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

  // As-of report: only end_date matters (default today, server-side).
  const { data, isPending } = useFetch(
    ['inventory-valuation-detail', to],
    fetchInventoryValuationDetail,
    { end_date: to }
  );

  const groups: ProductGroup[] = data?.groups ?? [];
  const grandTotal =
    typeof data?.total?.asset_value === 'number'
      ? data.total.asset_value
      : groups.reduce((sum, g) => sum + (Number(g.subtotal?.asset_value) || 0), 0);

  // Groups default to expanded; a group is collapsed only once explicitly set false.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: prev[key] === false }));

  const asOf = data?.as_of ? moment(data.as_of).format('DD MMMM, YYYY') : null;

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('report-content')?.innerHTML;
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch (error) {
          return '';
        }
      })
      .join('\n');

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <style>${styles}</style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  return (
    <div>
      <ReportFilter
        OnPdfClick={() => printReport()}
        params={{}}
        value={{ created_at_after: from, created_at_before: to }}
        setParams={(newParams: any) =>
          router.push(
            `?from=${newParams?.created_at_after || ''}&to=${newParams?.created_at_before || ''}`
          )
        }
        onFilterChange={() => {}}
      />

      <div
        id="report-content"
        className="mx-auto mb-7 overflow-hidden rounded-2xl border border-v-border bg-white shadow-v-card"
      >
        {/* Header */}
        <div className="border-b border-v-border bg-gradient-to-b from-v-tint50 to-white px-6 py-7 text-center sm:px-10">
          <h1 className="text-3xl font-bold tracking-tight text-v-ink900">
            {Company?.name || 'Halo Axis'}
          </h1>
          <h2 className="mt-1 text-lg font-medium text-v-ink700">Inventory Valuation Detail</h2>
          <div className="mt-2 text-sm text-v-ink500">
            {asOf ? <p>As of {asOf}</p> : <p className="text-gray-600">As of today</p>}
          </div>
        </div>

        {/* Opening-balance note (§7) */}
        {!isPending && groups.length > 0 && (
          <div className="border-b border-v-border bg-v-card-subtle px-6 py-2.5 text-center text-xs text-v-ink400">
            History starts at each item&apos;s opening balance (shown as the first line). Running
            balances are computed in date order.
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto p-2 sm:p-4">
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <LogoLoader size={50} color={'#16151c'} />
            </div>
          ) : groups.length === 0 ? (
            <div className="py-16 text-center text-sm text-v-ink400">No data found</div>
          ) : (
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b border-v-border bg-v-wash2 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Transaction date
                  </th>
                  <th className="border-b border-v-border bg-v-wash2 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Transaction type
                  </th>
                  <th className="border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Qty
                  </th>
                  <th className="border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Rate
                  </th>
                  <th className="whitespace-nowrap border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Inventory cost
                  </th>
                  <th className="whitespace-nowrap border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Qty on hand
                  </th>
                  <th className="border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Asset value
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const key = group.uid || group.product;
                  const isOpen = expanded[key] !== false;
                  const rows = group.rows ?? [];
                  const sub = group.subtotal ?? { quantity: 0, inventory_cost: 0, asset_value: 0 };
                  return (
                    <React.Fragment key={key}>
                      {/* Product group header — collapsible */}
                      <tr
                        className="cursor-pointer bg-v-tint150 transition-colors hover:bg-v-tint100"
                        onClick={() => toggle(key)}
                      >
                        <td colSpan={7} className="px-4 py-2.5">
                          <div className="flex items-center gap-2 font-semibold text-v-ink900">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/70 text-v-primary shadow-sm">
                              {isOpen ? (
                                <FaChevronDown className="h-3 w-3" />
                              ) : (
                                <FaChevronRight className="h-3 w-3" />
                              )}
                            </span>
                            {group.product}
                            {group.sku ? (
                              <span className="text-xs font-normal text-v-ink500">
                                ({group.sku})
                              </span>
                            ) : null}
                            <span className="ml-1 rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-v-ink500">
                              {rows.length}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Movement rows */}
                      {isOpen &&
                        rows.map((r, idx) => (
                          <tr key={r.uid || idx} className="transition-colors hover:bg-v-tint50">
                            <td className="whitespace-nowrap border-b border-v-border/60 px-4 py-2 pl-8 text-v-ink700">
                              {r.date ? moment(r.date).format('MM/DD/YYYY') : ''}
                            </td>
                            <td className="whitespace-nowrap border-b border-v-border/60 px-4 py-2 text-v-ink700">
                              {r.transaction_type}
                            </td>
                            <td
                              className={`border-b border-v-border/60 px-4 py-2 text-right tabular-nums ${signClass(r.quantity)}`}
                            >
                              {formatNumber(r.quantity)}
                            </td>
                            <td className="border-b border-v-border/60 px-4 py-2 text-right tabular-nums text-v-ink700">
                              {r.rate === null || r.rate === undefined ? '—' : formatNumber(r.rate)}
                            </td>
                            <td
                              className={`border-b border-v-border/60 px-4 py-2 text-right tabular-nums ${signClass(r.inventory_cost)}`}
                            >
                              {formatNumber(r.inventory_cost)}
                            </td>
                            <td
                              className={`border-b border-v-border/60 px-4 py-2 text-right tabular-nums ${signClass(r.running_quantity)}`}
                            >
                              {formatNumber(r.running_quantity)}
                            </td>
                            <td
                              className={`border-b border-v-border/60 px-4 py-2 text-right tabular-nums ${signClass(r.running_value)}`}
                            >
                              {formatNumber(r.running_value)}
                            </td>
                          </tr>
                        ))}

                      {/* Item subtotal (§3) — net Qty, total Inventory cost, ending Asset value */}
                      {isOpen && (
                        <tr className="bg-v-wash">
                          <td
                            colSpan={2}
                            className="border-b border-v-border px-4 py-2 pl-8 text-sm font-semibold text-v-ink700"
                          >
                            Total for {group.product}
                          </td>
                          <td
                            className={`border-b border-v-border px-4 py-2 text-right text-sm font-semibold tabular-nums ${signClass(sub.quantity)}`}
                          >
                            {formatNumber(sub.quantity)}
                          </td>
                          <td className="border-b border-v-border px-4 py-2" />
                          <td
                            className={`border-b border-v-border px-4 py-2 text-right text-sm font-semibold tabular-nums ${signClass(sub.inventory_cost)}`}
                          >
                            {formatCurrency(sub.inventory_cost)}
                          </td>
                          <td className="border-b border-v-border px-4 py-2" />
                          <td
                            className={`border-b border-v-border px-4 py-2 text-right text-sm font-semibold tabular-nums ${signClass(sub.asset_value)}`}
                          >
                            {formatCurrency(sub.asset_value)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Grand total — ending asset value across all items (§3) */}
                <tr className="bg-v-tint100">
                  <td
                    colSpan={6}
                    className="rounded-bl-xl border-t-2 border-v-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-v-ink900"
                  >
                    Total
                  </td>
                  <td
                    className={`rounded-br-xl border-t-2 border-v-primary px-4 py-3 text-right text-base font-bold tabular-nums ${grandTotal < 0 ? 'text-red-600' : 'text-v-ink900'}`}
                  >
                    {formatCurrency(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer — generation stamp */}
        <div className="border-t border-v-border bg-v-card-subtle px-6 py-3">
          <p className="text-right text-xs text-v-ink400">
            {moment().format('dddd, MMMM DD, YYYY hh:mm A')}
          </p>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<MainLoader />}>
      <InventoryValuationDetail />
    </Suspense>
  );
};

export default Page;
