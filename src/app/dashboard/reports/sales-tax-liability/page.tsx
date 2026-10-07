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
import { fetchSalesTaxLiability } from '@/app/helpers/backend';

// One rate component within an agency — a state, county, city, or district rate.
// Response shape — see inventory_tax_frontend.md §4.
interface RateRow {
  name: string;
  gross_total: number;
  non_taxable: number;
  taxable_amount: number; // = gross_total − non_taxable
  tax_amount: number; // = taxable_amount × rate, rounded per transaction
}

// An agency groups the rate components you remit to it.
interface Agency {
  agency_uid: string;
  agency: string;
  rows: RateRow[];
  tax_total: number; // agency total = sum of tax_amount ONLY (§4)
}

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

// Negatives (credit memos, refunds, adjustments) are tinted red (§5).
const amountClass = (value: number) => (value < 0 ? 'text-red-600' : 'text-v-ink900');

// Only the Tax Amount column is additive — the same sale is taxed by several component
// rates, so summing Gross/Taxable would double-count it (§4). Prefer the server total.
const agencyTaxTotal = (agency: Agency) =>
  typeof agency.tax_total === 'number'
    ? agency.tax_total
    : (agency.rows ?? []).reduce((sum, r) => sum + (Number(r.tax_amount) || 0), 0);

type SortDir = null | 'asc' | 'desc';

const SalesTaxLiability = () => {
  const from = useSearchParams().get('from');
  const to = useSearchParams().get('to');
  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

  const { data, isPending } = useFetch(
    ['sales-tax-liability', from, to],
    fetchSalesTaxLiability,
    { start_date: from, end_date: to },
  );

  const agencies: Agency[] = data?.agencies ?? [];
  // Period liability = server total when present, else the sum of the agency totals (§4).
  const periodTotal =
    typeof data?.total === 'number'
      ? data.total
      : agencies.reduce((sum, agency) => sum + agencyTaxTotal(agency), 0);

  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Agencies default to expanded once their data arrives.
  React.useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      agencies.forEach((a) => {
        if (next[a.agency_uid] === undefined) next[a.agency_uid] = true;
      });
      return next;
    });
  }, [agencies]);

  const toggleAgency = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Sort cycles default → highest first → lowest first, ordering agencies by what they owe.
  const cycleSort = () =>
    setSortDir((prev) => (prev === null ? 'desc' : prev === 'desc' ? 'asc' : null));

  const displayAgencies = useMemo(() => {
    if (!sortDir) return agencies;
    return [...agencies].sort((a, b) => {
      const diff = agencyTaxTotal(a) - agencyTaxTotal(b);
      return sortDir === 'asc' ? diff : -diff;
    });
  }, [agencies, sortDir]);

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
          <h2 className="mt-1 text-lg font-medium text-v-ink700">Sales Tax Liability Report</h2>
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
          ) : agencies.length === 0 ? (
            <div className="py-16 text-center text-sm text-v-ink400">No data found</div>
          ) : (
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="border-b border-v-border bg-v-wash2 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Tax name
                  </th>
                  <th className="whitespace-nowrap border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Gross total
                  </th>
                  <th className="whitespace-nowrap border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Non-taxable
                  </th>
                  <th className="whitespace-nowrap border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    Taxable amount
                  </th>
                  <th className="border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500">
                    <button
                      type="button"
                      onClick={cycleSort}
                      className="ml-auto flex items-center gap-1.5 uppercase tracking-wider text-v-ink500 transition-colors hover:text-v-primary"
                      title="Sort agencies by tax amount"
                    >
                      <SortIcon className="h-3 w-3" />
                      Tax amount
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayAgencies.map((agency) => {
                  const taxTotal = agencyTaxTotal(agency);
                  const isOpen = expanded[agency.agency_uid];
                  const rows = agency.rows ?? [];
                  return (
                    <React.Fragment key={agency.agency_uid}>
                      {/* Agency group header — collapsible */}
                      <tr
                        className="cursor-pointer bg-v-tint150 transition-colors hover:bg-v-tint100"
                        onClick={() => toggleAgency(agency.agency_uid)}
                      >
                        <td colSpan={5} className="px-4 py-2.5">
                          <div className="flex items-center gap-2 font-semibold text-v-ink900">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/70 text-v-primary shadow-sm">
                              {isOpen ? (
                                <FaChevronDown className="h-3 w-3" />
                              ) : (
                                <FaChevronRight className="h-3 w-3" />
                              )}
                            </span>
                            {agency.agency}
                            <span className="ml-1 rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-v-ink500">
                              {rows.length}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Rate component rows — indented beneath the agency */}
                      {isOpen &&
                        rows.map((rate, idx) => (
                          <tr key={idx} className="transition-colors hover:bg-v-tint50">
                            <td className="border-b border-v-border/60 px-4 py-2 pl-12 text-v-ink700">
                              {rate.name}
                            </td>
                            <td
                              className={`border-b border-v-border/60 px-4 py-2 text-right tabular-nums ${amountClass(rate.gross_total)}`}
                            >
                              {formatNumber(rate.gross_total)}
                            </td>
                            <td
                              className={`border-b border-v-border/60 px-4 py-2 text-right tabular-nums ${amountClass(rate.non_taxable)}`}
                            >
                              {formatNumber(rate.non_taxable)}
                            </td>
                            <td
                              className={`border-b border-v-border/60 px-4 py-2 text-right tabular-nums ${amountClass(rate.taxable_amount)}`}
                            >
                              {formatNumber(rate.taxable_amount)}
                            </td>
                            <td
                              className={`border-b border-v-border/60 px-4 py-2 text-right tabular-nums ${amountClass(rate.tax_amount)}`}
                            >
                              {formatNumber(rate.tax_amount)}
                            </td>
                          </tr>
                        ))}

                      {/* Agency total — only the Tax Amount column is summed (§4) */}
                      {isOpen && (
                        <tr className="bg-v-wash">
                          <td className="border-b border-v-border px-4 py-2 pl-12 text-sm font-semibold text-v-ink700">
                            Total for {agency.agency}
                          </td>
                          <td className="border-b border-v-border px-4 py-2" />
                          <td className="border-b border-v-border px-4 py-2" />
                          <td className="border-b border-v-border px-4 py-2" />
                          <td
                            className={`border-b border-v-border px-4 py-2 text-right text-sm font-semibold tabular-nums ${taxTotal < 0 ? 'text-red-600' : 'text-v-ink900'}`}
                          >
                            {formatCurrency(taxTotal)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Period liability — sum of the agency totals, Tax Amount only (§4) */}
                <tr className="bg-v-tint100">
                  <td className="rounded-bl-xl border-t-2 border-v-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-v-ink900">
                    Total liability for the period
                  </td>
                  <td className="border-t-2 border-v-primary px-4 py-3" />
                  <td className="border-t-2 border-v-primary px-4 py-3" />
                  <td className="border-t-2 border-v-primary px-4 py-3" />
                  <td
                    className={`rounded-br-xl border-t-2 border-v-primary px-4 py-3 text-right text-base font-bold tabular-nums ${periodTotal < 0 ? 'text-red-600' : 'text-v-ink900'}`}
                  >
                    {formatCurrency(periodTotal)}
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
      <SalesTaxLiability />
    </Suspense>
  );
};

export default Page;
