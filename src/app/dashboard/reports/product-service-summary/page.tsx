"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ChevronsUpDown } from "lucide-react";

import { fetchSalesByProductServiceSummary } from "@/app/helpers/backend";
import { useAppSelector } from "@/app/redux/store";
import LogoLoader from "@/components/MainLoader/logo-loader";
import { cn } from "@/lib/utils";
import ReportFilter from "../_components/filter";
import {
  DateRange,
  SalesReport,
  columnsOf,
  compareRowValues,
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
 * Sales by Product/Service Summary — per-product quantity, amount, cost and margin.
 *
 * Cells are rendered straight off the response metadata, and a null cell stays blank
 * rather than printing 0.00: a product with no sales has no meaningful margin, and both
 * margin cells of the TOTAL row are null on purpose.
 *
 * ⚠ COGS uses each product's CURRENT unit purchase cost — there is no stock-movement
 * ledger, so a product with no purchase cost on file reports 0.00, meaning "cost unknown"
 * rather than "free to produce", and editing a cost restates past periods. The footnote
 * under the table says so rather than letting the margin columns imply otherwise.
 * See SALES_REPORTS.md.
 */

type SortDirection = "asc" | "desc";

const SortIcon = ({ direction }: { direction?: SortDirection }) => {
  if (!direction) {
    return (
      <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover/th:opacity-100" />
    );
  }
  return direction === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-gray-700" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-gray-700" />
  );
};

const SalesByProductServiceSummary = () => {
  const { Company } = useAppSelector((state) => state.CompanyData);

  const [range, setRange] = useState<DateRange>({});
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const queryParams = useMemo(() => toReportParams(range), [range]);

  const { data, isPending, isError } = useQuery<SalesReport>({
    queryKey: ["sales-by-product-service-summary", queryParams],
    queryFn: () => fetchSalesByProductServiceSummary(queryParams),
  });

  const columns = useMemo(() => columnsOf(data), [data]);
  const rows = useMemo(() => rowsOf(data), [data]);
  const [labelColumn, ...valueColumns] = columns;

  // Sorting applies to the product rows only: the grand total stays pinned to the bottom,
  // and grouped rows keep their parent (a sort that scattered a group's children away from
  // its "Total for …" row would be reporting something untrue).
  const sortedRows = useMemo(() => {
    const column = columns.find((item) => item.key === sort?.key);
    if (!sort || !column) return rows;

    const factor = sort.direction === "asc" ? 1 : -1;
    const total = rows.filter(isGrandTotal);
    const rest = rows.filter((row) => !isGrandTotal(row));
    const grouped = rest.some((row) => (row.depth ?? 0) > 0 || row.is_total);
    if (grouped) return rows;

    return [...[...rest].sort((a, b) => factor * compareRowValues(a, b, column)), ...total];
  }, [rows, sort, columns]);

  const parents = useMemo(() => parentRowKeys(sortedRows), [sortedRows]);
  const visibleRows = useMemo(
    () => visibleSummaryRows(sortedRows, collapsed),
    [sortedRows, collapsed],
  );

  const toggleRow = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Third click clears the sort and restores the order the server sent.
  const toggleSort = (key: string) =>
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: "asc" };
      return prev.direction === "asc" ? { key, direction: "desc" } : null;
    });

  return (
    <div>
      <ReportFilter
        pdfFn={(pdfParams: any) =>
          fetchSalesByProductServiceSummary({ ...queryParams, ...pdfParams })
        }
        params={{}}
        value={{ created_at_after: range.start_date, created_at_before: range.end_date }}
        setParams={(newParams: any) => setRange(rangeFromFilter(newParams))}
      />

      <div
        id="report-content"
        className="mx-auto mb-7 max-w-screen-2xl rounded border bg-white/40 p-4 py-7 text-sm"
      >
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-2xl font-bold">
            {data?.company_name || Company?.name || "Halo Axis"}
          </h1>
          <h2 className="mb-1 text-xl">{data?.title || "Sales by Product/Service Summary"}</h2>
          <p className="text-gray-600">{reportSubtitle(data, range)}</p>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-10">
            <LogoLoader size={50} color={"#16151c"} />
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-sm text-red-600">Could not load the report.</div>
        ) : (
          <>
            <div className="overflow-x-auto rounded bg-white/60">
              <table className="w-full border-collapse">
                <thead>
                  {/* The measures all belong to one period, so they sit under a single
                      spanning "TOTAL" band — the same banner the reference report prints. */}
                  <tr className="border-b border-t border-gray-300">
                    <th className="px-3 py-2" />
                    {!!valueColumns.length && (
                      <th
                        colSpan={valueColumns.length}
                        className="border-l border-gray-200 px-3 py-2 text-center font-semibold text-gray-900"
                      >
                        TOTAL
                      </th>
                    )}
                  </tr>
                  <tr className="border-b border-gray-300">
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">
                      {labelColumn?.label}
                    </th>
                    {valueColumns.map((column) => (
                      <th
                        key={column.key}
                        onClick={() => toggleSort(column.key)}
                        className="group/th cursor-pointer select-none whitespace-nowrap px-3 py-2 text-right font-semibold text-gray-900 hover:bg-gray-50"
                      >
                        <span className="flex items-center justify-end gap-1.5">
                          <SortIcon
                            direction={sort?.key === column.key ? sort.direction : undefined}
                          />
                          {column.label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {visibleRows.length ? (
                    visibleRows.map((row) => {
                      const depth = row.depth ?? 0;
                      const isParent = parents.has(row.key);
                      const isExpanded = !collapsed.has(row.key);
                      const grand = isGrandTotal(row);
                      const isRollup = isParent || !!row.is_total;

                      return (
                        <tr
                          key={row.key}
                          onClick={() => isParent && toggleRow(row.key)}
                          className={cn(
                            "border-b border-gray-100",
                            isParent ? "cursor-pointer bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-50",
                            grand && "border-t border-t-accent_soft_black",
                          )}
                        >
                          <td
                            className={cn(
                              "whitespace-nowrap py-2 pr-3 text-gray-900",
                              grand ? "font-bold" : isRollup ? "font-semibold" : "font-normal",
                            )}
                            style={{ paddingLeft: `${12 + depth * 16}px` }}
                          >
                            <span className="flex items-center gap-1.5">
                              {isParent ? (
                                isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-500" />
                                )
                              ) : (
                                <span className="w-4" />
                              )}
                              {row.label}
                            </span>
                          </td>
                          {valueColumns.map((column) => (
                            <td
                              key={column.key}
                              className={cn(
                                "whitespace-nowrap px-3 py-2 text-right tabular-nums",
                                grand
                                  ? "font-bold text-gray-900"
                                  : isRollup
                                    ? "font-semibold text-gray-900"
                                    : "text-gray-700",
                              )}
                            >
                              {formatReportCell(row[column.key], column, {
                                isTotal: isRollup || grand,
                              })}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length || 1}
                        className="px-3 py-8 text-center text-gray-500"
                      >
                        No sales for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!!visibleRows.length && (
              <p className="mt-3 px-3 text-xs text-gray-500">
                COGS is each product&apos;s net quantity at its current unit purchase cost —
                there is no stock-movement ledger, so editing a purchase cost restates past
                periods, and a product with no cost on file reports 0.00 (cost unknown, not
                free to produce). A blank margin cell means the margin isn&apos;t meaningful,
                not zero.
              </p>
            )}

            {data?.basis && <p className="mt-3 text-center text-xs text-gray-500">{data.basis}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default SalesByProductServiceSummary;
