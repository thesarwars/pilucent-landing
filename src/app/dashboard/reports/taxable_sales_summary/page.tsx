'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { FaChevronDown, FaChevronRight, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import MainLoader from '@/components/MainLoader/MainLoader';
import LogoLoader from '@/components/MainLoader/logo-loader';
import ReportFilter from '../_components/filter';
import moment from 'moment';
import { useAppSelector } from '@/app/redux/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFetch } from '@/app/helpers/hooks';
import { fetchTaxableSalesSummary } from '@/app/helpers/backend';

interface Item {
  name: string;
  amount: number;
}

// Response shape — see inventory_tax_frontend.md §3. `no_item` is the unlabeled bucket
// (null if none); `items` are uncategorized; `categories` each carry their own subtotal.
// Deleted products keep "(deleted)" already baked into the label.
type ReportRow =
  | { kind: 'item'; name: string; amount: number }
  | { kind: 'category'; name: string; items: Item[] };

// Body figures are plain numbers; subtotals and the grand total carry the currency symbol (§5).
const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

// Negative values (credits, refunds, discounts) are tinted red (§3).
const amountClass = (value: number) => (value < 0 ? 'text-red-600' : 'text-v-ink900');

const categoryTotal = (items: Item[]) => items.reduce((sum, item) => sum + item.amount, 0);
const rowAmount = (row: ReportRow) => (row.kind === 'item' ? row.amount : categoryTotal(row.items));

const isNoItemBucket = (row: ReportRow) => row.kind === 'item' && row.name === '';

type SortDir = null | 'asc' | 'desc';

const TaxableSalesSummary = () => {
  const from = useSearchParams().get('from');
  const to = useSearchParams().get('to');
  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

  const { data, isPending } = useFetch(
    ['taxable-sales-summary', from, to],
    fetchTaxableSalesSummary,
    { start_date: from, end_date: to },
  );

  // Build the render list (§3): no-item bucket first, then uncategorized items, then categories.
  const reportRows: ReportRow[] = useMemo(() => {
    const out: ReportRow[] = [];
    if (data?.no_item) out.push({ kind: 'item', name: '', amount: Number(data.no_item.amount) || 0 });
    (data?.items ?? []).forEach((it: any) =>
      out.push({ kind: 'item', name: it.label, amount: Number(it.amount) || 0 }),
    );
    (data?.categories ?? []).forEach((c: any) =>
      out.push({
        kind: 'category',
        name: c.label,
        items: (c.items ?? []).map((i: any) => ({ name: i.label, amount: Number(i.amount) || 0 })),
      }),
    );
    return out;
  }, [data]);

  // Filing-ready taxable base — server total when present, else sum the rows (§3).
  const grandTotal =
    typeof data?.total === 'number'
      ? data.total
      : reportRows.reduce((sum, row) => sum + rowAmount(row), 0);

  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Categories default to expanded once their data arrives.
  React.useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      reportRows.forEach((row) => {
        if (row.kind === 'category' && next[row.name] === undefined) next[row.name] = true;
      });
      return next;
    });
  }, [reportRows]);

  const toggleCategory = (name: string) => setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  // Sort cycles default → highest first → lowest first. The no-item bucket stays pinned on top.
  const cycleSort = () =>
    setSortDir((prev) => (prev === null ? 'desc' : prev === 'desc' ? 'asc' : null));

  const displayRows = (() => {
    if (!sortDir) return reportRows;
    const pinned = reportRows.filter(isNoItemBucket);
    const sortable = reportRows.filter((row) => !isNoItemBucket(row));
    const sorted = [...sortable].sort((a, b) => {
      const diff = rowAmount(a) - rowAmount(b);
      return sortDir === 'asc' ? diff : -diff;
    });
    return [...pinned, ...sorted];
  })();

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

  const SortIcon = sortDir === 'desc' ? FaSortDown : sortDir === 'asc' ? FaSortUp : FaSort;

  return (
    <div>
      <ReportFilter
        OnPdfClick={() => printReport()}
        params={{}}
        value={{ created_at_after: from, created_at_before: to }}
        setParams={(newParams: any) =>
          router.push(
            `?from=${newParams?.created_at_after || ''}&to=${newParams?.created_at_before || ''}`,
          )
        }
        onFilterChange={() => {}}
      />

      <div
        id="report-content"
        className="mx-auto mb-7 overflow-hidden rounded-2xl border border-v-border bg-white shadow-v-card"
      >
        {/* Header Section */}
        <div className="border-b border-v-border bg-gradient-to-b from-v-tint50 to-white px-6 py-7 text-center sm:px-10">
          <h1 className="text-3xl font-bold tracking-tight text-v-ink900">
            {Company?.name || 'Halo Axis'}
          </h1>
          <h2 className="mt-1 text-lg font-medium text-v-ink700">Taxable Sales Summary Report</h2>
          <div className="mt-2 text-sm text-v-ink500">
            {from && to ? (
              <p>
                From {moment(new Date(from)).format('DD MMMM, YYYY')} to{' '}
                {moment(new Date(to)).format('DD MMMM, YYYY')}
              </p>
            ) : (
              <p>All Dates</p>
            )}
            {data?.as_of && (
              <p className="text-xs text-v-ink400">As of {moment(data.as_of).format('MMMM DD, YYYY')}</p>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto p-2 sm:p-4">
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <LogoLoader size={50} color={'#16151c'} />
            </div>
          ) : reportRows.length === 0 ? (
            <div className="py-16 text-center text-sm text-v-ink400">No data found</div>
          ) : (
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="border-b border-v-border bg-v-wash2 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Product / Service
                  </th>
                  <th className="border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    <button
                      type="button"
                      onClick={cycleSort}
                      className="ml-auto flex items-center gap-1.5 uppercase tracking-wider text-v-ink500 transition-colors hover:text-v-primary"
                      title="Sort by amount"
                    >
                      <SortIcon className="h-3 w-3" />
                      Total
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, idx) => {
                  if (row.kind === 'item') {
                    return (
                      <tr key={idx} className="transition-colors hover:bg-v-tint50">
                        <td className="border-b border-v-border/60 px-4 py-2 pl-6 text-v-ink700">
                          {row.name ? row.name : <span className="text-v-ink400">&nbsp;</span>}
                        </td>
                        <td
                          className={`border-b border-v-border/60 px-4 py-2 text-right tabular-nums ${amountClass(row.amount)}`}
                        >
                          {formatNumber(row.amount)}
                        </td>
                      </tr>
                    );
                  }

                  // Category: collapsible header, indented items, and a subtotal row.
                  const subtotal = categoryTotal(row.items);
                  return (
                    <React.Fragment key={idx}>
                      <tr
                        className="cursor-pointer bg-v-tint150 transition-colors hover:bg-v-tint100"
                        onClick={() => toggleCategory(row.name)}
                      >
                        <td colSpan={2} className="px-4 py-2.5">
                          <div className="flex items-center gap-2 font-semibold text-v-ink900">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/70 text-v-primary shadow-sm">
                              {expanded[row.name] ? (
                                <FaChevronDown className="h-3 w-3" />
                              ) : (
                                <FaChevronRight className="h-3 w-3" />
                              )}
                            </span>
                            {row.name}
                            <span className="ml-1 rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-v-ink500">
                              {row.items.length}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {expanded[row.name] &&
                        row.items.map((item, itemIdx) => (
                          <tr key={itemIdx} className="transition-colors hover:bg-v-tint50">
                            <td className="border-b border-v-border/60 px-4 py-2 pl-12 text-v-ink700">
                              {item.name}
                            </td>
                            <td
                              className={`border-b border-v-border/60 px-4 py-2 text-right tabular-nums ${amountClass(item.amount)}`}
                            >
                              {formatNumber(item.amount)}
                            </td>
                          </tr>
                        ))}

                      {expanded[row.name] && (
                        <tr className="bg-v-wash">
                          <td className="border-b border-v-border px-4 py-2 pl-12 text-sm font-semibold text-v-ink700">
                            Total for {row.name}
                          </td>
                          <td
                            className={`border-b border-v-border px-4 py-2 text-right text-sm font-semibold tabular-nums ${subtotal < 0 ? 'text-red-600' : 'text-v-ink900'}`}
                          >
                            {formatCurrency(subtotal)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Grand total (§3) */}
                <tr className="bg-v-tint100">
                  <td className="rounded-bl-xl border-t-2 border-v-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-v-ink900">
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

        {/* Footer — basis + generation stamp */}
        <div className="border-t border-v-border bg-v-card-subtle px-6 py-3">
          <p className="text-right text-xs text-v-ink400">
            Accrual basis · {moment().format('dddd, MMMM DD, YYYY hh:mm A')}
          </p>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<MainLoader />}>
      <TaxableSalesSummary />
    </Suspense>
  );
};

export default Page;
