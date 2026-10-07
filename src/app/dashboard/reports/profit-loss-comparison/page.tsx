"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";

import { fetchProfitLossComparisonReport } from "@/app/helpers/backend";
import { useAppSelector } from "@/app/redux/store";
import LogoLoader from "@/components/MainLoader/logo-loader";
import { cn } from "@/lib/utils";
import ReportFilter2 from "../_components/filter2";



type RowKind = "group" | "item" | "subtotal" | "total";

interface ReportColumn {
  key: string;
  label: string;
}

interface ReportRow {
  key: string;
  label: string;
  kind: RowKind;
  values?: Record<string, string>;
}

type DateRange = { start_date?: string; end_date?: string };

const depthOf = (key: string) => key.split(".").length - 1;

const rowClass = (kind: RowKind) =>
  kind === "group" || kind === "total" ? "bg-gray-50" : "bg-white";

const labelWeightClass = (kind: RowKind) => {
  if (kind === "total") return "font-bold text-gray-900";
  if (kind === "group") return "font-semibold text-gray-900";
  if (kind === "subtotal") return "font-medium text-gray-800";
  return "text-gray-700";
};

// Bare number for individual line items, "$" only on subtotal/total/group figures —
// matches the reference report and this app's own single-column Profit and Loss page.
const formatCell = (raw: string | undefined, kind: RowKind) => {
  if (raw === undefined || raw === null || raw === "") return "";
  const isNegative = String(raw).trim().startsWith("-");
  const amount = Number(String(raw).replace(/^-/, ""));
  if (!Number.isFinite(amount)) return String(raw);

  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = isNegative ? "-" : "";
  return kind === "item" ? `${sign}${formatted}` : `${sign}$${formatted}`;
};

const ProfitAndLossComparison = () => {
  const { Company } = useAppSelector((state) => state.CompanyData);
  const [range, setRange] = useState<DateRange>({});

  const queryParams = useMemo(
    () => ({ date_from: range.start_date, date_to: range.end_date }),
    [range.start_date, range.end_date],
  );

  const { data, isPending, isError } = useQuery({
    queryKey: ["profitLossComparison", queryParams],
    queryFn: () => fetchProfitLossComparisonReport(queryParams),
  });

  const columns: ReportColumn[] = Array.isArray(data?.columns) ? data.columns : [];
  const rows: ReportRow[] = Array.isArray(data?.rows) ? data.rows : [];

  const subtitle =
    data?.subtitle ||
    (range.start_date && range.end_date
      ? `From ${moment(range.start_date).format("MMM D, YYYY")} to ${moment(range.end_date).format("MMM D, YYYY")}`
      : "All dates");

  return (
    <div>
      <ReportFilter2 defaultRange="this_month" params={range} setParams={setRange} />

      <div id="report-content" className="mx-auto rounded border bg-white/40 p-4 py-7 text-sm">
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-2xl font-bold">{data?.company_name || Company?.name || "Halo Axis"}</h1>
          <h2 className="mb-1 text-xl">{data?.title || "Profit and Loss Comparison"}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-10">
            <LogoLoader size={50} color={"#16151c"} />
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-sm text-red-600">Could not load the report.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-t border-gray-300 bg-gray-50">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700"></th>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="whitespace-nowrap px-3 py-2 text-right font-semibold text-gray-700"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const depth = depthOf(row.key);
                  return (
                    <tr key={row.key} className={cn("border-b border-gray-100", rowClass(row.kind))}>
                      <td
                        className={cn("py-2 pr-3", labelWeightClass(row.kind))}
                        style={{ paddingLeft: `${12 + depth * 16}px` }}
                      >
                        {row.label}
                      </td>
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            "whitespace-nowrap px-3 py-2 text-right tabular-nums",
                            labelWeightClass(row.kind),
                          )}
                        >
                          {formatCell(row.values?.[column.key], row.kind)}
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {!rows.length && (
                  <tr>
                    <td colSpan={(columns.length || 1) + 1} className="px-3 py-8 text-center text-gray-500">
                      No activity for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfitAndLossComparison;
