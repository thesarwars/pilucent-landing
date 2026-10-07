"use client";
import React, { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Filter, Printer, RefreshCw } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import moment from "moment";

import { fetchPayrollDetailsReport, fetchWorkLocations } from "@/app/helpers/backend";
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

const REPORT_PATH = "/we/payroll/reports/payroll/details/";

interface ReportColumn {
  key: string;
  label: string;
  align?: string;
}

interface CellEntry {
  label: string;
  depth: number;
  // null on the Adjusted gross line, and on every taxes/contributions entry.
  hours: string | null;
  amount: string;
}

interface ReportRow {
  key: string;
  is_total?: boolean;
  pay_date?: string | null;
  pay_period?: string;
  name?: string;
  employee_uid?: string | null;
  cells?: Record<string, CellEntry[] | string>;
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

const toEntries = (cell: CellEntry[] | string | undefined): CellEntry[] =>
  Array.isArray(cell) ? cell : [];

const alignClass = (align?: string) =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

// depth 0 is a group or subtotal line, 1 a named tax under it. The reference PDF lets
// position carry the hierarchy, so weight varies but nothing is indented.
const entryClass = (depth: number) =>
  depth === 0 ? "font-medium text-gray-900" : "text-xs text-gray-600";

/**
 * The Hours column and the Gross pay column are two printed columns driven by the one
 * `gross_pay` list — same entries, same order, so the lines stay level across the pair.
 * The labels live on the Hours side.
 */
const HoursCell = ({ entries }: { entries: CellEntry[] }) => (
  <div className="space-y-1">
    {entries.map((entry, index) => (
      <div
        key={`${entry.label}-${index}`}
        className={cn(
          "flex items-baseline justify-between gap-4 whitespace-nowrap",
          entryClass(entry.depth),
        )}
      >
        <span>{entry.label}</span>
        {/* Adjusted gross has no hours — blank, never 0.00h. */}
        <span className="tabular-nums">{formatReportValue(entry.hours, "hours", "")}</span>
      </div>
    ))}
  </div>
);

const GrossPayCell = ({ entries }: { entries: CellEntry[] }) => (
  <div className="space-y-1">
    {entries.map((entry, index) => (
      <div
        key={`${entry.label}-${index}`}
        className={cn(
          "whitespace-nowrap text-right tabular-nums",
          entryClass(entry.depth),
        )}
      >
        {formatReportValue(entry.amount)}
      </div>
    ))}
  </div>
);

/**
 * Taxes, deductions and contributions. Which lines appear is data-driven — employee
 * taxes lead with a `Total` line only when both taxes and deductions exist, employer
 * costs always lead with one, and either list is `[]` when that side has nothing, which
 * is a blank cell rather than a zero. Labels print exactly as sent: the server already
 * abbreviates on detail rows (FIT, SS, Med) and spells them out on the Total row.
 */
const BreakdownCell = ({ entries }: { entries: CellEntry[] }) => (
  <div className="space-y-1">
    {entries.map((entry, index) => (
      <div
        key={`${entry.label}-${index}`}
        className={cn(
          "flex items-baseline justify-between gap-4 whitespace-nowrap",
          entryClass(entry.depth),
        )}
      >
        <span>{entry.label}</span>
        <span className="tabular-nums">{formatReportValue(entry.amount)}</span>
      </div>
    ))}
  </div>
);

const PayrollDetailsReport = () => {
  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [customRange, setCustomRange] = useState({ date_from: "", date_to: "" });
  const [employeeOptions, setEmployeeOptions] = useState<
    { uid: string; label: string }[]
  >([]);
  const [isExporting, setIsExporting] = useState(false);

  // This view mounts only DjangoFilterBackend, so date_range, created_at_* and search
  // aren't accepted at all — presets are resolved to pay_date bounds client-side. No
  // pagination either, so no page/limit.
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
    queryKey: ["payrollDetailsReport", queryParams],
    queryFn: () => fetchPayrollDetailsReport(queryParams),
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

  // rows[0] is always the Total row, then one row per payroll run, ordered by employee
  // and chronologically within each employee. Never re-sorted here.
  const rows: ReportRow[] = useMemo(
    () => (Array.isArray(data?.rows) ? data.rows : []),
    [data],
  );

  const detailRows = useMemo(() => rows.filter((row) => !row.is_total), [rows]);

  // A response narrowed by ?employee= only carries that person's runs, so the picker is
  // only refreshed from an unfiltered response.
  useEffect(() => {
    if (filters.employee) return;
    const seen = new Map<string, string>();
    detailRows.forEach((row) => {
      if (row.employee_uid && !seen.has(row.employee_uid)) {
        seen.set(row.employee_uid, row.name || "");
      }
    });
    if (seen.size) {
      setEmployeeOptions(
        Array.from(seen, ([uid, label]) => ({ uid, label: label || uid })),
      );
    }
  }, [detailRows, filters.employee]);

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
      await downloadReportPdf(REPORT_PATH, queryParams, "payroll_details_report.pdf");
    } catch (err: any) {
      toast.error(err?.message || "Could not export the PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const renderCell = (row: ReportRow, column: ReportColumn) => {
    const cells = row.cells ?? {};

    switch (column.key) {
      case "pay_date":
        // The Total row carries no pay_date or pay_period — it prints the literal word.
        if (row.is_total) return "Total";
        return (
          <div>
            <div className="font-medium text-gray-900">
              {row.pay_date ? moment(row.pay_date).format("MM/DD/YYYY") : ""}
            </div>
            {row.pay_period && (
              <div className="text-xs text-gray-500">{row.pay_period}</div>
            )}
          </div>
        );
      case "name":
        return row.name || "";
      case "hours":
        return <HoursCell entries={toEntries(cells.gross_pay)} />;
      case "gross_pay":
        return <GrossPayCell entries={toEntries(cells.gross_pay)} />;
      case "net_pay":
      case "total_payroll_cost":
        return (
          <span className="whitespace-nowrap font-medium tabular-nums text-gray-900">
            {formatReportValue(cells[column.key] as string, "money", "")}
          </span>
        );
      default:
        // other_pay (always empty today), employee taxes & deductions, employer taxes &
        // contributions — all breakdown lists.
        return <BreakdownCell entries={toEntries(cells[column.key])} />;
    }
  };

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
        {/* title and subtitle are server-composed — the subtitle already narrows itself
            per filter, so rendering it as given keeps the page and the PDF in step. */}
        <div className="border-b py-6 text-center">
          <div className="mb-2 text-sm text-gray-600">
            {data?.company_name || Company?.name}
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {data?.title || "Payroll details report"}
          </h1>
          <div className="text-sm text-gray-600">{data?.subtitle}</div>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="text-sm text-gray-500">
            {isFetching
              ? "Loading…"
              : detailRows.length
                ? `${detailRows.length} payroll run${detailRows.length === 1 ? "" : "s"}`
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
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={cn(
                      "whitespace-nowrap border-b border-r border-gray-200 bg-gray-50 px-4 py-3 align-bottom text-xs font-medium uppercase tracking-wider text-gray-700",
                      alignClass(column.align),
                      // pay_date is always columns[0]; freeze it while the nine columns
                      // and their nested breakdowns scroll.
                      index === 0 && "sticky left-0 z-20 min-w-[9rem]",
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const rowBg = row.is_total ? "bg-gray-50" : "bg-white";
                return (
                  <tr key={row.key || rowIndex}>
                    {columns.map((column, columnIndex) => (
                      <td
                        key={column.key}
                        className={cn(
                          "border-b border-r border-gray-200 px-4 py-4 align-top",
                          rowBg,
                          alignClass(column.align),
                          row.is_total && "font-medium text-gray-900",
                          columnIndex === 0 && "sticky left-0 z-10",
                        )}
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {!detailRows.length && (
                <tr>
                  <td
                    colSpan={columns.length || 9}
                    className="border-b border-gray-200 bg-white px-4 py-8 text-center text-gray-500"
                  >
                    {isPending
                      ? "Loading report…"
                      : errorMessage
                        ? "The report could not be loaded."
                        : "No payroll runs for the selected filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailsReport;
