"use client";
import React, { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Filter, Printer, RefreshCw } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";

import {
  fetchPayrollSummaryByEmployeeReport,
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

const REPORT_PATH = "/we/payroll/reports/payroll/summary-by-employee/";

interface ReportColumn {
  key: string;
  label: string;
  // Absent — not null — on the Total column, so key off is_total instead.
  employee_uid?: string;
  is_total?: boolean;
}

interface ReportRow {
  key: string;
  label: string;
  depth: number;
  format: string;
  is_empty?: boolean;
  values?: Record<string, string>;
}

interface FlatSection {
  key: string;
  label: string;
  rows: ReportRow[];
}

// An `is_empty` row prints a dash rather than 0.00; a real 0.00 still prints as $0.00 so
// columns stay comparable down their full length.
const formatCell = (raw: string | undefined, format: string, isEmpty?: boolean) =>
  isEmpty ? "-" : formatReportValue(raw, format);

/**
 * Sections are walked, never hard-coded: the seven group headers are always present, but
 * the tax / deduction / contribution subtotals and their lines only appear when the
 * company has components of that kind. A node carrying a `values` map is a row; a node
 * carrying `rows` is a container, and a section may do both (its own group-header values
 * plus its child rows), so handle either shape.
 */
const flattenRows = (node: any, inheritedFormat: string): ReportRow[] => {
  if (!node || typeof node !== "object") return [];

  const format = typeof node.format === "string" ? node.format : inheritedFormat;
  const rows: ReportRow[] = [];

  if (node.values && typeof node.values === "object") {
    rows.push({
      key: String(node.key ?? node.label ?? ""),
      label: String(node.label ?? ""),
      depth: Number(node.depth ?? 0),
      format,
      is_empty: Boolean(node.is_empty),
      values: node.values,
    });
  }

  const children = Array.isArray(node.rows)
    ? node.rows
    : Array.isArray(node.children)
      ? node.children
      : [];
  children.forEach((child: any) => rows.push(...flattenRows(child, format)));

  return rows;
};

const INITIAL_FILTERS = {
  preset: "last_pay_date",
  date_from: "",
  date_to: "",
  employee: "",
  work_location: "",
};

const selectClass =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

const PayrollSummaryByEmployeeReport = () => {
  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [customRange, setCustomRange] = useState({ date_from: "", date_to: "" });
  const [employeeOptions, setEmployeeOptions] = useState<
    { uid: string; label: string }[]
  >([]);
  const [isExporting, setIsExporting] = useState(false);

  // Only params the report actually honours. `date_range`, `created_at_*` and `search`
  // are deliberately never sent — the first two filter created_at instead of pay_date,
  // the last is silently ignored. There is no pagination, so no page/limit either.
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};

    if (filters.preset === "last_pay_date") {
      params.filter_type = "last_pay_date";
    } else if (filters.date_from && filters.date_to) {
      params.date_from = filters.date_from;
      params.date_to = filters.date_to;
    }
    if (filters.employee) params.employee = filters.employee;
    if (filters.work_location) params.work_location = filters.work_location;

    return params;
  }, [filters]);

  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: ["payrollSummaryByEmployee", queryParams],
    queryFn: () => fetchPayrollSummaryByEmployeeReport(queryParams),
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

  const sections: FlatSection[] = useMemo(() => {
    const raw = Array.isArray(data?.sections) ? data.sections : [];
    return raw
      .map((section: any) => ({
        key: String(section?.key ?? ""),
        label: String(section?.label ?? ""),
        rows: flattenRows(section, section?.key === "hours" ? "hours" : "money"),
      }))
      .filter((section: FlatSection) => section.rows.length > 0);
  }, [data]);

  // Employee columns are already sorted by display name and labelled "Last, First
  // Middle" — reuse them for the picker instead of rebuilding names. A response narrowed
  // by ?employee= carries one employee column, so only refresh the list from a full one.
  useEffect(() => {
    if (filters.employee) return;
    const options = columns
      .filter((column) => !column.is_total && column.employee_uid)
      .map((column) => ({ uid: column.employee_uid as string, label: column.label }));
    if (options.length) setEmployeeOptions(options);
  }, [columns, filters.employee]);

  const employeeCount = columns.filter((column) => !column.is_total).length;

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
        "payroll_summary_by_employee_report.pdf",
      );
    } catch (err: any) {
      toast.error(err?.message || "Could not export the PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const totalColumnCount = columns.length + 1;

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
            <label className="text-sm font-medium text-gray-700">Employee</label>
            <select
              value={filters.employee}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, employee: event.target.value }))
              }
              className={cn(selectClass, "w-56")}
            >
              <option value="">All employees</option>
              {employeeOptions.map((option) => (
                <option key={option.uid} value={option.uid}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

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
        {/* title and subtitle are server-composed — the subtitle already narrows its own
            wording per filter, so rendering it as given keeps the page and PDF in step. */}
        <div className="border-b py-6 text-center">
          <div className="mb-2 text-sm text-gray-600">
            {data?.company_name || Company?.name}
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {data?.title || "Payroll summary by employee report"}
          </h1>
          <div className="text-sm text-gray-600">{data?.subtitle}</div>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="text-sm text-gray-500">
            {isFetching
              ? "Loading…"
              : employeeCount
                ? `${employeeCount} employee${employeeCount === 1 ? "" : "s"}`
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

        {/* The label column freezes; the Total plus one column per employee scroll. */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 min-w-[16rem] border-b border-r border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium text-gray-700">
                  Payroll
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "whitespace-nowrap border-b border-r border-gray-200 bg-gray-50 px-4 py-3 text-right font-medium text-gray-700",
                      column.is_total && "font-semibold text-gray-900",
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            {sections.map((section, sectionIndex) => (
              <tbody key={section.key || sectionIndex}>
                {section.rows.map((row, rowIndex) => {
                  const isGroupHeader = row.depth === 0;
                  // Each section is its own bordered block in the PDF.
                  const startsSection = rowIndex === 0 && sectionIndex > 0;
                  const rowBg = isGroupHeader ? "bg-gray-50" : "bg-white";
                  const cellBase = cn(
                    "border-b border-gray-200 px-4 py-2",
                    rowBg,
                    startsSection && "border-t-2 border-t-gray-300",
                    isGroupHeader
                      ? "font-semibold text-gray-900"
                      : row.depth === 1
                        ? "font-medium text-gray-800"
                        : "text-gray-600",
                  );

                  return (
                    <tr key={row.key || `${section.key}-${rowIndex}`}>
                      {/* depth carries the hierarchy through weight, not indentation —
                          the reference PDF renders every level flush left. */}
                      <td className={cn(cellBase, "sticky left-0 z-10 border-r")}>
                        {row.label}
                      </td>
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            cellBase,
                            "whitespace-nowrap border-r text-right tabular-nums",
                            column.is_total && "font-semibold text-gray-900",
                          )}
                        >
                          {formatCell(row.values?.[column.key], row.format, row.is_empty)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            ))}

            {!sections.length && (
              <tbody>
                <tr>
                  <td
                    colSpan={totalColumnCount}
                    className="border-b border-gray-200 px-4 py-8 text-center text-gray-500"
                  >
                    {isPending
                      ? "Loading report…"
                      : errorMessage
                        ? "The report could not be loaded."
                        : "No payroll data for the selected filters."}
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollSummaryByEmployeeReport;
