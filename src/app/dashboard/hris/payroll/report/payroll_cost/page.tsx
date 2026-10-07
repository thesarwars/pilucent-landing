"use client";
import React, { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Filter, Printer, RefreshCw } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";

import {
  fetchEmployees,
  fetchPayrollTotalCostReport,
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

const REPORT_PATH = "/we/payroll/reports/payroll/total-cost/";

type RowKind = "group" | "item" | "subtotal" | "total";

interface ReportColumn {
  key: string;
  label: string;
  align?: string;
}

interface ReportRow {
  key: string;
  label: string;
  kind: RowKind;
  // null on every `group` row — several items belong under one heading, so there is no
  // single figure to show there. Every other kind carries a string.
  amount: string | null;
}

const INITIAL_FILTERS = {
  preset: "last_pay_date",
  date_from: "",
  date_to: "",
  employee: "",
  work_location: "",
};

const selectClass =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

const employeeLabel = (employee: any) => {
  const name = `${employee?.user?.first_name || ""} ${employee?.user?.middle_name || ""} ${
    employee?.user?.last_name || ""
  }`
    .replace(/\s+/g, " ")
    .trim();
  return name || employee?.user?.email || employee?.uid;
};

// Shading follows `kind`, not depth: `group` headings and the final `total` row are
// shaded; `subtotal` rows sit on white with the `item` rows above them.
const rowClass = (kind: RowKind) =>
  kind === "group" || kind === "total" ? "bg-gray-50" : "bg-white";

const labelClass = (kind: RowKind) => {
  if (kind === "total") return "font-bold text-gray-900";
  if (kind === "group") return "font-semibold text-gray-900";
  if (kind === "subtotal") return "font-medium text-gray-800";
  return "pl-4 text-gray-600";
};

const amountClass = (kind: RowKind) => {
  if (kind === "total") return "font-bold text-gray-900";
  if (kind === "subtotal") return "font-medium text-gray-800";
  return "text-gray-700";
};

const PayrollTotalCostReport = () => {
  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [customRange, setCustomRange] = useState({ date_from: "", date_to: "" });
  const [isExporting, setIsExporting] = useState(false);

  // Same filterset as the other payroll reports: date_range, created_at_* and search are
  // not accepted, so presets resolve to pay_date bounds client-side. No pagination.
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
    queryKey: ["payrollTotalCostReport", queryParams],
    queryFn: () => fetchPayrollTotalCostReport(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  const { data: workLocations } = useFetch(["work-locations"], fetchWorkLocations);
  const { data: employeesData } = useFetch(["employees", "payroll-total-cost"], fetchEmployees, {
    limit: 200,
  });
  const employees: any[] = employeesData?.results || employeesData?.data || [];

  const columns: ReportColumn[] = useMemo(
    () => (Array.isArray(data?.columns) ? data.columns : []),
    [data],
  );

  // Flat ladder in print order — walked as sent, never hard-coded, since the `item` rows
  // between each heading and its subtotal are data-driven.
  const rows: ReportRow[] = useMemo(
    () => (Array.isArray(data?.rows) ? data.rows : []),
    [data],
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
      await downloadReportPdf(REPORT_PATH, queryParams, "payroll_total_cost_report.pdf");
    } catch (err: any) {
      toast.error(err?.message || "Could not export the PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const cellAlign = (column: ReportColumn, index: number) =>
    column.align === "right" || (!column.align && index > 0) ? "text-right" : "text-left";

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
              {employees.map((employee: any) => (
                <option key={employee?.uid} value={employee?.uid}>
                  {employeeLabel(employee)}
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
        {/* Server-composed header, rendered as given so it stays in step with the PDF. */}
        <div className="border-b py-6 text-center">
          <div className="mb-2 text-sm text-gray-600">
            {data?.company_name || Company?.name}
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {data?.title || "Total payroll cost report"}
          </h1>
          <div className="text-sm text-gray-600">{data?.subtitle}</div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3">
          {isFetching && <span className="text-sm text-gray-500">Loading…</span>}
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
                {(columns.length
                  ? columns
                  : [
                      { key: "item", label: "Item", align: "left" },
                      { key: "amount", label: "Amount", align: "right" },
                    ]
                ).map((column, index) => (
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
                  className={cn("border-b border-gray-200", rowClass(row.kind))}
                >
                  <td className={cn("px-4 py-3", labelClass(row.kind))}>{row.label}</td>
                  <td
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-right tabular-nums",
                      amountClass(row.kind),
                    )}
                  >
                    {/* amount is null on every group heading — blank, never $0.00. */}
                    {row.kind === "group" ? "" : formatReportValue(row.amount)}
                  </td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    {isPending
                      ? "Loading report…"
                      : errorMessage
                        ? "The report could not be loaded."
                        : "No payroll data for the selected filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Employee taxes are deliberately absent from this ladder: they come out of
            gross, which Total pay already counts, so including them would double-count.
            Worth stating so the total isn't mistaken for missing figures. */}
        {!!rows.length && (
          <div className="border-t px-4 py-4 text-xs text-gray-500">
            Total payroll cost = total pay + company contributions + employer taxes.
            Employee taxes and deductions are not included here — they come out of gross
            pay, which is already counted in Total pay.
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollTotalCostReport;
