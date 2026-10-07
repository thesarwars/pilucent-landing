"use client";

import { useState } from "react";

import { useAppSelector } from "@/app/redux/store";
import { cn } from "@/lib/utils";
import ReportFilter2 from "../_components/filter2";


interface SummaryRow {
  key: string;
  label: string;
  value: string;
}

const DUMMY_ROWS: SummaryRow[] = [
  { key: "france", label: "France", value: "9000.00" },
  { key: "jumatechs", label: "JumaTechs", value: "300.00" },
];

const DUMMY_TOTAL = "9300.00";

const formatAmount = (raw: string) => {
  const isNegative = raw.trim().startsWith("-");
  const amount = Number(raw.replace(/^-/, ""));
  if (!Number.isFinite(amount)) return raw;
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-${formatted}` : formatted;
};

const CustomSummaryReport = () => {
  const { Company } = useAppSelector((state) => state.CompanyData);
  const [filterParams, setFilterParams] = useState({ start_date: "", end_date: "" });

  return (
    <div>
      <ReportFilter2 defaultRange="this_month" params={filterParams} setParams={setFilterParams} />

      <div id="report-content" className="mx-auto rounded border bg-white/40 p-4 py-7 text-sm">
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-2xl font-bold">{Company?.name || "Halo Axis"}</h1>
          <h2 className="mb-1 text-xl">my custom summary report</h2>
          <p className="text-gray-600">June 2026</p>
        </div>

        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300 bg-white">
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-700">{row.label}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-700">
                    {formatAmount(row.value)}
                  </td>
                </tr>
              ))}
              <tr className={cn("border-t-2 border-gray-300")}>
                <td className="px-4 py-2 font-bold text-gray-900">Total</td>
                <td className="px-4 py-2 text-right font-bold tabular-nums text-gray-900">
                  {formatAmount(DUMMY_TOTAL)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomSummaryReport;
