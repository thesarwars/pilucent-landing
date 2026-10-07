"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import moment from "moment";

import { useAppSelector } from "@/app/redux/store";
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
  /** Set on a `group` row so the rows nested under it can be collapsed. */
  collapsible?: boolean;
  values?: Record<string, string>;
}

type DateRange = { start_date?: string; end_date?: string };

const DUMMY_COLUMNS: ReportColumn[] = [
  { key: "jul_2026", label: "Jul 2026" },
  { key: "total", label: "Total" },
];

const DUMMY_ROWS: ReportRow[] = [
  { key: "income", label: "Income", kind: "group", collapsible: true },
  {
    key: "income.discounts_given",
    label: "Discounts given",
    kind: "item",
    values: { jul_2026: "400.00", total: "400.00" },
  },
  {
    key: "income.total",
    label: "Total for Income",
    kind: "subtotal",
    values: { jul_2026: "400.00", total: "400.00" },
  },
  {
    key: "gross_profit",
    label: "Gross Profit",
    kind: "subtotal",
    values: { jul_2026: "400.00", total: "400.00" },
  },
  { key: "expenses", label: "Expenses", kind: "group" },
  {
    key: "net_operating_income",
    label: "Net Operating Income",
    kind: "subtotal",
    values: { jul_2026: "400.00", total: "400.00" },
  },
  { key: "other_expenses", label: "Other Expenses", kind: "group", collapsible: true },
  {
    key: "other_expenses.other_miscellaneous_expense",
    label: "Other Miscellaneous Expense",
    kind: "item",
    values: { jul_2026: "7000.00", total: "7000.00" },
  },
  {
    key: "other_expenses.total",
    label: "Total for Other Expenses",
    kind: "subtotal",
    values: { jul_2026: "7000.00", total: "7000.00" },
  },
  {
    key: "net_other_income",
    label: "Net Other Income",
    kind: "subtotal",
    values: { jul_2026: "-7000.00", total: "-7000.00" },
  },
  {
    key: "net_income",
    label: "Net Income",
    kind: "total",
    values: { jul_2026: "-6600.00", total: "-6600.00" },
  },
];

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
// matches the reference report and the Profit and Loss Comparison page.
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

const QuarterlyProfitAndLossSummary = () => {
  const { Company } = useAppSelector((state) => state.CompanyData);
  const [range, setRange] = useState<DateRange>({});
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const toggleGroup = (key: string) =>
    setCollapsed((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );

  const columns = DUMMY_COLUMNS;

  const rows = useMemo(
    () =>
      DUMMY_ROWS.filter(
        (row) => !collapsed.some((key) => row.key !== key && row.key.startsWith(`${key}.`)),
      ),
    [collapsed],
  );

  const subtitle =
    range.start_date && range.end_date
      ? `From ${moment(range.start_date).format("MMM D, YYYY")} to ${moment(range.end_date).format("MMM D, YYYY")}`
      : "July 2026";

  return (
    <div>
      <ReportFilter2 defaultRange="this_month" params={range} setParams={setRange} />

      <div id="report-content" className="mx-auto rounded border bg-white/40 p-4 py-7 text-sm">
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-2xl font-bold">{Company?.name || "Halo Axis"}</h1>
          <h2 className="mb-1 text-xl">Quarterly Profit and Loss Summary</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>

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
                const isCollapsed = collapsed.includes(row.key);

                return (
                  <tr key={row.key} className={cn("border-b border-gray-100", rowClass(row.kind))}>
                    <td
                      className={cn("py-2 pr-3", labelWeightClass(row.kind))}
                      style={{ paddingLeft: `${12 + depth * 16}px` }}
                    >
                      {row.collapsible ? (
                        <button
                          type="button"
                          onClick={() => toggleGroup(row.key)}
                          className="flex items-center gap-1 hover:underline"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                          {row.label}
                        </button>
                      ) : (
                        row.label
                      )}
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
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Accrual basis &nbsp;|&nbsp; {moment().format("dddd, MMMM D, YYYY hh:mm A")}
        </p>
      </div>
    </div>
  );
};

export default QuarterlyProfitAndLossSummary;
