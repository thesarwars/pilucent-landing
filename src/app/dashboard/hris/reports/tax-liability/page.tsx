"use client";
import React, { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Filter, Info, Printer, RefreshCw } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  fetchPayrollTaxLiabilityReport,
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

const REPORT_PATH = "/we/payroll/reports/payroll/tax-liability/";
const TAX_CENTER_PATH = "/dashboard/hris/payroll/payroll_tax";
// Synthetic group collecting taxes that belong to no known filing group.
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
  tax_amount: string;
  tax_paid: string;
  tax_owed: string;
}

const INITIAL_FILTERS = {
  preset: "last_pay_date",
  date_from: "",
  date_to: "",
  work_location: "",
};

const selectClass =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

const PAID_ALLOCATION_HINT =
  "Allocated pro rata from this filing group's payments — payments are recorded against the group, not an individual tax.";

const PayrollTaxLiabilityReport = () => {
  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [customRange, setCustomRange] = useState({ date_from: "", date_to: "" });
  const [isExporting, setIsExporting] = useState(false);

  // Only DjangoFilterBackend is mounted here, so date_range, created_at_* and search
  // aren't accepted — presets resolve to pay_date bounds client-side. `employee` is
  // deliberately not offered: it narrows the runs feeding the totals, not the rows.
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
    queryKey: ["payrollTaxLiabilityReport", queryParams],
    queryFn: () => fetchPayrollTaxLiabilityReport(queryParams),
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

  // Flat: each group row is immediately followed by its members, so no recursion — and
  // no client-side total row either, so the table stays row-for-row with the PDF.
  const rows: ReportRow[] = useMemo(
    () => (Array.isArray(data?.rows) ? data.rows : []),
    [data],
  );

  const paymentsAttributed: Record<string, number> = data?.payments_attributed ?? {};
  const groupCount = rows.filter((row) => row.is_group).length;
  const hasOtherTaxes = rows.some((row) => row.is_group && row.key === OTHER_TAXES_KEY);

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
        "payroll_tax_liability_report.pdf",
      );
    } catch (err: any) {
      toast.error(err?.message || "Could not export the PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // A group's figure is recorded; a member's is derived. The count of matched payment
  // records explains a group that looks unpaid: 0 matches with money owed can mean a
  // payment exists that the backend couldn't attribute.
  const paidCellHint = (row: ReportRow) => {
    if (!row.is_group) return PAID_ALLOCATION_HINT;
    const matched = paymentsAttributed[row.key] ?? 0;
    return matched > 0
      ? `${matched} payment record${matched === 1 ? "" : "s"} matched to this filing group.`
      : "No payment records matched to this filing group. A payment may exist that could not be attributed — check the Tax Center.";
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
        {/* Server-composed header. This report's subtitle carries no "for all employees"
            clause — it is organised by filing group and never names a person. */}
        <div className="border-b py-6 text-center">
          <div className="mb-2 text-sm text-gray-600">
            {data?.company_name || Company?.name}
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {data?.title || "Tax liability report"}
          </h1>
          <div className="text-sm text-gray-600">{data?.subtitle}</div>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="text-sm text-gray-500">
            {isFetching
              ? "Loading…"
              : groupCount
                ? `${groupCount} filing group${groupCount === 1 ? "" : "s"}`
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
                    title={column.key === "tax_paid" ? data?.payments_note : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.label}
                      {column.key === "tax_paid" && (
                        <Info className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </span>
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
                    // The reference shades group rows and leaves members on white.
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

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          "whitespace-nowrap px-4 py-3 tabular-nums",
                          cellAlign(column, columnIndex),
                        )}
                        title={column.key === "tax_paid" ? paidCellHint(row) : undefined}
                      >
                        {formatReportValue((row as any)[column.key])}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td
                    colSpan={columns.length || 4}
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

        {/* payments_note comes from the payload and has to be shown: tax paid on a member
            row is an allocation, not a record. */}
        {!!rows.length && (
          <div className="space-y-2 border-t px-4 py-4 text-xs text-gray-500">
            <p>
              {data?.payments_note ||
                "Payments are recorded against a filing group, not an individual tax, so a member row's tax paid is allocated pro rata."}{" "}
              Tax paid and tax owed are indicative —{" "}
              <Link
                href={TAX_CENTER_PATH}
                className="font-medium text-accent_soft_blue hover:underline"
              >
                the Tax Center
              </Link>{" "}
              holds the authoritative payment record.
            </p>
            {hasOtherTaxes && (
              <p>
                Taxes under <span className="font-medium">Other taxes</span> matched no
                known filing group. They are counted so nothing understates what is owed —
                worth reporting to support so the tax taxonomy can be extended.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollTaxLiabilityReport;
