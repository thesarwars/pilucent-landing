"use client";
import React, { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Filter, Printer, RefreshCw } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";

import {
  fetchPayrollTaxWageSummaryReport,
  fetchWorkLocations,
} from "@/app/helpers/backend";
import { useFetch } from "@/app/helpers/hooks";
import {
  PAYROLL_REPORT_PRESETS,
  downloadReportPdf,
  formatReportValue,
  getPayDatePresetRange,
  getReportErrorMessage,
} from "@/app/helpers/payrollReports";
import { useAppSelector } from "@/app/redux/store";
import Button from "@/components/ui/RawButton";
import { toast } from "@/lib/ToastService";
import { cn } from "@/lib/utils";

const REPORT_PATH = "/we/payroll/reports/payroll/tax-and-wage-summary/";
// Synthetic group on the sibling tax-liability report; wages carry the same key scheme.
const OTHER_TAXES_KEY = "OTHER_TAXES";

interface ReportColumn {
  key: string;
  label: string;
  align?: string;
}

interface ReportRow {
  key: string;
  label: string;
  is_group?: boolean;
  // null on group rows — several taxes in a group share the same wages, so summing them
  // would multiply-count the payroll. Only tax_amount aggregates meaningfully.
  total_wages: string | null;
  excess_wages: string | null;
  taxable_wages: string | null;
  tax_amount: string;
}

const INITIAL_FILTERS = {
  preset: "last_pay_date",
  date_from: "",
  date_to: "",
  work_location: "",
};

const selectClass =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

const WAGE_COLUMN_KEYS = ["total_wages", "excess_wages", "taxable_wages"];

const PayrollTaxAndWageSummaryReport = () => {
  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [customRange, setCustomRange] = useState({ date_from: "", date_to: "" });
  const [isExporting, setIsExporting] = useState(false);

  // Same filterset as tax-liability: only DjangoFilterBackend is mounted, so date_range,
  // created_at_* and search are not accepted. `employee` isn't offered for the same
  // reason it isn't on that screen — it narrows the runs feeding the totals, not the rows.
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};

    if (filters.preset === "last_pay_date") {
      params.filter_type = "last_pay_date";
    } else if (filters.date_from && filters.date_to) {
      params.date_from = filters.date_from;
      params.date_to = filters.date_to;
    }
    if (filters.work_location) params.work_location = filters.work_location;

    return params;
  }, [filters]);

  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: ["payrollTaxWageSummaryReport", queryParams],
    queryFn: () => fetchPayrollTaxWageSummaryReport(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  const { data: workLocations } = useFetch(["work-locations"], fetchWorkLocations);

  const columns: ReportColumn[] = useMemo(
    () => (Array.isArray(data?.columns) ? data.columns : []),
    [data],
  );

  // Flat, same shape as tax-liability: a group row immediately followed by its members,
  // rendered top to bottom with no recursion and no client-side regrouping.
  const rows: ReportRow[] = useMemo(
    () => (Array.isArray(data?.rows) ? data.rows : []),
    [data],
  );

  const groupCount = rows.filter((row) => row.is_group).length;
  const hasOtherTaxes = rows.some((row) => row.is_group && row.key === OTHER_TAXES_KEY);
  const hasFullyExcessRow = rows.some(
    (row) =>
      !row.is_group &&
      row.total_wages &&
      row.excess_wages &&
      Number(row.total_wages) > 0 &&
      Number(row.excess_wages) >= Number(row.total_wages),
  );

  const errorMessage = useMemo(() => getReportErrorMessage(error), [error]);

  const handlePresetChange = (preset: string) => {
    if (preset === "custom") {
      setFilters((prev) => ({ ...prev, preset, date_from: "", date_to: "" }));
      return;
    }
    setFilters((prev) => ({ ...prev, preset, ...getPayDatePresetRange(preset) }));
  };

  const applyCustomRange = () => {
    if (!customRange.date_from || !customRange.date_to) return;
    setFilters((prev) => ({
      ...prev,
      preset: "custom",
      date_from: customRange.date_from,
      date_to: customRange.date_to,
    }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCustomRange({ date_from: "", date_to: "" });
  };

  const exportPdf = async () => {
    setIsExporting(true);
    try {
      await downloadReportPdf(
        REPORT_PATH,
        queryParams,
        "payroll_tax_wage_summary_report.pdf",
      );
    } catch (err: any) {
      toast.error(err?.message || "Could not export the PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const cellAlign = (column: ReportColumn, index: number) =>
    column.align === "left" || (!column.align && index === 0) ? "text-left" : "text-right";

  return (
    <div className="mx-auto min-h-screen bg-gray-50 p-4">
      <Button
        className="mb-4 flex items-center gap-1 px-0 font-medium text-accent_soft_blue hover:underline"
        onClick={() => router.back()}
      >
        <IoIosArrowBack className="text-xl" />
        Back
      </Button>

      {/* Filters */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Filter by</label>
            <select
              value={filters.preset}
              onChange={(event) => handlePresetChange(event.target.value)}
              className={cn(selectClass, "w-48")}
            >
              {PAYROLL_REPORT_PRESETS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {filters.preset === "custom" && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Custom date range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customRange.date_from}
                  onChange={(event) =>
                    setCustomRange((prev) => ({ ...prev, date_from: event.target.value }))
                  }
                  className={selectClass}
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customRange.date_to}
                  onChange={(event) =>
                    setCustomRange((prev) => ({ ...prev, date_to: event.target.value }))
                  }
                  className={selectClass}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Work location</label>
            <select
              value={filters.work_location}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, work_location: event.target.value }))
              }
              className={cn(selectClass, "w-56")}
            >
              <option value="">All locations</option>
              {(Array.isArray(workLocations) ? workLocations : []).map((location: any) => (
                <option key={location?.uid} value={location?.uid}>
                  {location?.location_address ||
                    location?.location_name ||
                    location?.location_state ||
                    "Work location"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 md:ml-auto">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            {filters.preset === "custom" ? (
              <button
                onClick={applyCustomRange}
                disabled={!customRange.date_from || !customRange.date_to}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Filter className="h-4 w-4" />
                Apply
              </button>
            ) : (
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Filter className="h-4 w-4" />
                Run report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report */}
      <div className="rounded-lg bg-white shadow-sm">
        {/* Server-composed header, rendered as given so it stays in step with the PDF. */}
        <div className="border-b py-6 text-center">
          <div className="mb-2 text-sm text-gray-600">
            {data?.company_name || Company?.name}
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {data?.title || "Payroll tax and wage summary report"}
          </h1>
          <div className="text-sm text-gray-600">{data?.subtitle}</div>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="text-sm text-gray-500">
            {isFetching
              ? "Loading…"
              : groupCount
                ? `${groupCount} filing group${groupCount === 1 ? "" : "s"}${
                    data?.wage_base_year ? ` · ${data.wage_base_year} wage base` : ""
                  }`
                : ""}
          </div>
          <Button
            onClick={exportPdf}
            isLoading={isExporting}
            className="flex items-center gap-1 rounded-md bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-900"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>

        {errorMessage && (
          <div className="mx-4 mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={cn(
                      "whitespace-nowrap px-4 py-3 font-medium text-gray-700",
                      cellAlign(column, index),
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row.key || rowIndex}
                  className={cn(
                    "border-b border-gray-200",
                    // Same shading convention as tax-liability: group rows shaded, members white.
                    row.is_group ? "bg-gray-50 font-semibold text-gray-900" : "bg-white",
                  )}
                >
                  {columns.map((column, columnIndex) => {
                    if (columnIndex === 0 || column.key === "tax_type") {
                      return (
                        <td
                          key={column.key}
                          className={cn("px-4 py-3", cellAlign(column, columnIndex))}
                        >
                          {row.label}
                          {row.is_group && row.key === OTHER_TAXES_KEY && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              unmapped
                            </span>
                          )}
                        </td>
                      );
                    }

                    const value = (row as any)[column.key];
                    // Group rows carry null on the three wage columns by design — blank,
                    // never $0.00, since the wages behind each tax in the group overlap.
                    const isBlankWageCell =
                      row.is_group && WAGE_COLUMN_KEYS.includes(column.key);

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          "whitespace-nowrap px-4 py-3 tabular-nums",
                          cellAlign(column, columnIndex),
                        )}
                      >
                        {isBlankWageCell ? "" : formatReportValue(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td
                    colSpan={columns.length || 5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {isPending
                      ? "Loading report…"
                      : errorMessage
                        ? "The report could not be loaded."
                        : "No payroll taxes for the selected filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Excess wages is the most-asked question on this report: a whole range can be
            100% excess once an employee has already passed an annual wage base earlier in
            the year — that's correct, not a bug, so it's worth explaining in place. */}
        {!!rows.length && (
          <div className="space-y-2 border-t px-4 py-4 text-xs text-gray-500">
            <p>
              Excess wages reflect each employee&apos;s wage base for the full calendar
              year, not just this date range — once someone passes a tax&apos;s annual cap,
              every later dollar is excess and untaxed, even within a single pay date.
              Uncapped taxes such as income tax and Medicare always show taxable wages
              equal to total wages.
            </p>
            {hasFullyExcessRow && (
              <p>
                One or more rows below show total wages fully in excess for this range —
                expected when that employee already passed the tax&apos;s wage base earlier
                in the year.
              </p>
            )}
            {hasOtherTaxes && (
              <p>
                Taxes under <span className="font-medium">Other taxes</span> matched no
                known filing group — the same grouping used on the Tax Liability report.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollTaxAndWageSummaryReport;
