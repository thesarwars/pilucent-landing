"use client";

import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ChevronsUpDown } from "lucide-react";
import Link from "next/link";

import { useAppSelector } from "@/app/redux/store";
import LogoLoader from "@/components/MainLoader/logo-loader";
import { cn } from "@/lib/utils";
import ReportFilter from "./filter";
import {
  DateRange,
  SalesReport,
  SalesReportColumn,
  SalesReportRow,
  columnsOf,
  compareRowValues,
  formatReportCell,
  rangeFromFilter,
  reportSubtitle,
  rowsOf,
  toDetailSections,
  toReportParams,
} from "./salesReports";



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

const customerHref = (uid?: string | null) =>
  uid ? `/dashboard/sales/customers/${uid}` : undefined;

const SalesDetailReport = ({
  queryKey,
  fetcher,
  fallbackTitle,
}: {
  queryKey: string;
  fetcher: (params: any) => Promise<any>;
  fallbackTitle: string;
}) => {
  const { Company } = useAppSelector((state) => state.CompanyData);

  const [range, setRange] = useState<DateRange>({});
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const queryParams = useMemo(() => toReportParams(range), [range]);

  const { data, isPending, isError } = useQuery<SalesReport>({
    queryKey: [queryKey, queryParams],
    queryFn: () => fetcher(queryParams),
  });

  const columns = columnsOf(data);
  const { sections, grandTotal } = useMemo(() => toDetailSections(rowsOf(data)), [data]);

  const toggleGroup = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Third click clears the sort and hands the rows back in the order the server sent them —
  // which is the only order in which the running `balance` column reads correctly.
  const toggleSort = (key: string) =>
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: "asc" };
      return prev.direction === "asc" ? { key, direction: "desc" } : null;
    });

  const sortedSections = useMemo(() => {
    const column = columns.find((item) => item.key === sort?.key);
    if (!sort || !column) return sections;

    const factor = sort.direction === "asc" ? 1 : -1;
    // Lines are reordered inside their own group only — the grouping is the report's
    // structure, not a sort order.
    return sections.map((section) => ({
      ...section,
      lines: [...section.lines].sort((a, b) => factor * compareRowValues(a, b, column)),
    }));
  }, [sections, sort, columns]);

  const renderCell = (
    row: SalesReportRow,
    column: SalesReportColumn,
    index: number,
    isTotal: boolean,
  ) => {
    const text = formatReportCell(row[column.key], column, { isTotal });
    const href = column.key === "customer_name" ? customerHref(row.customer_uid) : undefined;

    return (
      <td
        key={column.key}
        className={cn(
          "whitespace-nowrap px-3 py-2",
          column.align === "right" ? "text-right tabular-nums" : "text-left",
          isTotal ? "font-semibold text-gray-900" : "text-gray-700",
          index === 0 && "pl-8",
        )}
      >
        {href ? (
          <Link href={href} className="hover:underline">
            {text}
          </Link>
        ) : (
          text
        )}
      </td>
    );
  };

  return (
    <div>
      <ReportFilter
        pdfFn={(pdfParams: any) => fetcher({ ...queryParams, ...pdfParams })}
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
          <h2 className="mb-1 text-xl">{data?.title || fallbackTitle}</h2>
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
                  <tr className="border-b border-t border-gray-300">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          "group/th cursor-pointer select-none whitespace-nowrap px-3 py-2 font-semibold text-gray-900 hover:bg-gray-50",
                          column.align === "right" ? "text-right" : "text-left",
                        )}
                      >
                        <span
                          className={cn(
                            "flex items-center gap-1.5",
                            column.align === "right" && "justify-end",
                          )}
                        >
                          {column.align === "right" && (
                            <SortIcon
                              direction={sort?.key === column.key ? sort.direction : undefined}
                            />
                          )}
                          {column.label}
                          {column.align !== "right" && (
                            <SortIcon
                              direction={sort?.key === column.key ? sort.direction : undefined}
                            />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {sortedSections.map((section) => {
                    const isExpanded = !collapsed.has(section.group.key);
                    const href = customerHref(section.group.customer_uid);

                    return (
                      <Fragment key={section.group.key}>
                        <tr
                          onClick={() => toggleGroup(section.group.key)}
                          className="cursor-pointer border-b border-gray-100 bg-gray-50 hover:bg-gray-100"
                        >
                          <td
                            colSpan={columns.length || 1}
                            className="px-3 py-2 font-medium text-gray-900"
                          >
                            <span className="flex items-center gap-1.5">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                              {href ? (
                                <Link
                                  href={href}
                                  onClick={(event) => event.stopPropagation()}
                                  className="hover:underline"
                                >
                                  {section.group.label}
                                </Link>
                              ) : (
                                section.group.label
                              )}{" "}
                              ({section.lines.length})
                            </span>
                          </td>
                        </tr>

                        {isExpanded &&
                          section.lines.map((row) => (
                            <tr key={row.key} className="border-b border-gray-100 hover:bg-gray-50">
                              {columns.map((column, index) => renderCell(row, column, index, false))}
                            </tr>
                          ))}

                        {section.total && (
                          <tr className="border-b border-gray-100">
                            {columns.map((column, index) =>
                              index === 0 ? (
                                <td
                                  key={column.key}
                                  className="whitespace-nowrap py-2 pl-8 pr-3 font-semibold text-gray-900"
                                >
                                  {section.total!.label}
                                </td>
                              ) : (
                                renderCell(section.total!, column, index, true)
                              ),
                            )}
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}

                  {grandTotal && (
                    <tr className="border-t border-t-accent_soft_black">
                      {columns.map((column, index) => (
                        <td
                          key={column.key}
                          className={cn(
                            "whitespace-nowrap px-3 py-2 font-bold text-gray-900",
                            column.align === "right" ? "text-right tabular-nums" : "text-left",
                          )}
                        >
                          {index === 0
                            ? grandTotal.label || "TOTAL"
                            : formatReportCell(grandTotal[column.key], column, { isTotal: true })}
                        </td>
                      ))}
                    </tr>
                  )}

                  {!sections.length && (
                    <tr>
                      <td
                        colSpan={columns.length || 1}
                        className="px-3 py-8 text-center text-gray-500"
                      >
                        No transactions for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {data?.basis && <p className="mt-3 text-center text-xs text-gray-500">{data.basis}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default SalesDetailReport;
