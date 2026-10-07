"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { fetchSalesByCustomerSummary } from "@/app/helpers/backend";
import { useAppSelector } from "@/app/redux/store";
import LogoLoader from "@/components/MainLoader/logo-loader";
import { cn } from "@/lib/utils";
import ReportFilter from "../_components/filter";
import {
  DateRange,
  SalesReport,
  SalesReportColumn,
  SalesReportRow,
  columnsOf,
  formatReportCell,
  isGrandTotal,
  parentRowKeys,
  rangeFromFilter,
  reportSubtitle,
  rowsOf,
  toReportParams,
  visibleSummaryRows,
} from "../_components/salesReports";

/**
 * Sales by Customer Summary — one income figure per customer, sub-customers nested under
 * their parent. Same shell as /dashboard/reports/balance-sheet-comparison: collapsible
 * indented rows, subtotals over a rule, grand total over a heavy one.
 *
 * The rows arrive flat and carry their own `depth`, which is not capped at one level — so
 * indentation, collapsing and the "Total for <parent>" rows are all derived from `depth`
 * rather than from a fixed two-level shape. See SALES_REPORTS.md.
 *
 * This report reads the journal's income accounts, unlike the other three sales reports
 * which read transaction lines, so its TOTAL is not expected to tie out to theirs to the
 * cent — a manual journal entry against an income account lands here and nowhere else.
 */

const getIndentClass = (depth: number) => {
  const indentMap: Record<number, string> = {
    0: "pl-4",
    1: "pl-8",
    2: "pl-12",
    3: "pl-16",
    4: "pl-20",
  };
  return indentMap[depth] || "pl-20";
};

const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    className={cn(
      "h-4 w-4 text-gray-500 transition-transform duration-200 group-hover:text-gray-700",
      isExpanded && "rotate-90",
    )}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const isNegative = (value: any) => String(value ?? "").trim().startsWith("-");

const SalesByCustomerSummary = () => {
  const { Company } = useAppSelector((state) => state.CompanyData);

  // Local state, not the URL — same choice balance-sheet-comparison makes. ReportFilter's
  // own param names (created_at_after/before) are adapted to the date_from/date_to pair
  // every sales report takes.
  const [range, setRange] = useState<DateRange>({});
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const queryParams = useMemo(() => toReportParams(range), [range]);

  const { data, isPending, isError } = useQuery<SalesReport>({
    queryKey: ["sales-by-customer-summary", queryParams],
    queryFn: () => fetchSalesByCustomerSummary(queryParams),
  });

  const columns = columnsOf(data);
  const rows = rowsOf(data);
  const [labelColumn, ...valueColumns] = columns;

  const parents = useMemo(() => parentRowKeys(rows), [rows]);
  const visibleRows = useMemo(() => visibleSummaryRows(rows, collapsed), [rows, collapsed]);

  const toggleRow = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const renderValueCell =(row: SalesReportRow, column: SalesReportColumn, isRollup: boolean) => (
    <div
      key={column.key}
      className={cn(
        "min-w-[120px] pr-4 text-right text-sm tabular-nums tracking-wide",
        isRollup ? "font-semibold" : "font-normal",
        isNegative(row[column.key]) ? "text-red-600" : "text-gray-900",
      )}
    >
      {formatReportCell(row[column.key], column, { isTotal: isRollup })}
    </div>
  );

  return (
    <div>
      <ReportFilter
        pdfFn={(pdfParams: any) => fetchSalesByCustomerSummary({ ...queryParams, ...pdfParams })}
        params={{}}
        value={{ created_at_after: range.start_date, created_at_before: range.end_date }}
        setParams={(newParams: any) => setRange(rangeFromFilter(newParams))}
      />

      <div
        id="report-content"
        className="mx-auto mb-7 max-w-screen-2xl rounded border bg-white/40 p-4 py-7 text-sm"
      >
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-3xl font-bold">{data?.title || "Sales by Customer Summary"}</h1>
          <h2 className="mb-1 text-xl">
            {data?.company_name || Company?.name || "Binary Burst"}
          </h2>
          <p className="text-gray-600">{reportSubtitle(data, range)}</p>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center">
            <LogoLoader size={50} color={"#16151c"} />
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-sm text-red-600">Could not load the report.</div>
        ) : (
          <div className="rounded bg-white/60">
            <div className="flex items-center border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="flex-1 text-base font-semibold text-gray-900">
                {labelColumn?.label || "Customer"}
              </h2>
              {valueColumns.map((column) => (
                <h2
                  key={column.key}
                  className="min-w-[120px] pr-4 text-right text-base font-semibold text-gray-900"
                >
                  {column.label}
                </h2>
              ))}
            </div>

            {visibleRows.length ? (
              <div className="divide-y divide-gray-100">
                {visibleRows.map((row) => {
                  const depth = row.depth ?? 0;
                  const isParent = parents.has(row.key);
                  const isExpanded = !collapsed.has(row.key);
                  const grand = isGrandTotal(row);
                  // A parent's own row and every "Total for …" row roll other rows up, so
                  // they carry the currency symbol; leaf customers print bare.
                  const isRollup = isParent || !!row.is_total;
                  const href = row.customer_uid
                    ? `/dashboard/sales/customers/${row.customer_uid}`
                    : undefined;

                  return (
                    <div key={row.key} className="select-none font-light">
                      <div
                        className={cn(
                          "group mx-4 flex items-center py-1 hover:bg-gray-50",
                          getIndentClass(depth),
                          isParent && "cursor-pointer",
                          row.is_total && !grand && "border-t border-t-gray-400",
                          grand && "border-t border-t-accent_soft_black",
                        )}
                        onClick={() => isParent && toggleRow(row.key)}
                      >
                        <div className="flex flex-1 items-center space-x-2">
                          {isParent ? <ChevronIcon isExpanded={isExpanded} /> : <div className="w-4" />}
                          <span
                            className={cn(
                              "text-sm text-gray-900",
                              grand ? "font-bold" : isRollup ? "font-semibold" : "font-normal",
                            )}
                          >
                            {href ? (
                              <Link
                                href={href}
                                onClick={(event) => event.stopPropagation()}
                                className="hover:underline"
                              >
                                {row.label}
                              </Link>
                            ) : (
                              row.label
                            )}
                          </span>
                        </div>
                        {valueColumns.map((column) =>
                          renderValueCell(row, column, isRollup || grand),
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">No sales for the selected period.</p>
            )}

            {data?.basis && <p className="mt-3 text-center text-xs text-gray-500">{data.basis}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesByCustomerSummary;
