"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import { useAppSelector } from "@/app/redux/store";
import ReportFilter2 from "../_components/filter2";

interface TransactionRow {
  key: string;
  date: string;
  transaction_type: string;
  memo: string;
  transaction_number: string;
  amount: string;
}

const ROWS: TransactionRow[] = [];

const formatAmount = (raw: string) => {
  const isNegative = raw.trim().startsWith("-");
  const amount = Number(raw.replace(/^-/, ""));
  if (!Number.isFinite(amount)) return raw;
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-$${formatted}` : `$${formatted}`;
};

const InvoiceReceivePaymentReport = () => {
  const { Company } = useAppSelector((state) => state.CompanyData);
  const [filterParams, setFilterParams] = useState({ start_date: "", end_date: "" });

  return (
    <div>
      <ReportFilter2 defaultRange="this_month" params={filterParams} setParams={setFilterParams} />

      <div id="report-content" className="mx-auto rounded border bg-white/40 p-4 py-7 text-sm">
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-2xl font-bold">{Company?.name || "Halo Axis"}</h1>
          <h2 className="mb-1 text-xl">Invoices and Received Payments</h2>
          <p className="text-gray-600">June 2026</p>
        </div>

        {!ROWS.length && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-gray-100 px-4 py-3 text-gray-700">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <p>
              <span className="font-medium">Your selection doesn&apos;t have any info.</span>{" "}
              Change your selection or start a new search.
            </p>
          </div>
        )}

        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300 bg-white">
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Transaction type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Memo/Description</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Transaction number</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Amount</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-700">{row.date}</td>
                  <td className="px-4 py-2 text-gray-700">{row.transaction_type}</td>
                  <td className="px-4 py-2 text-gray-700">{row.memo}</td>
                  <td className="px-4 py-2 text-gray-700">{row.transaction_number}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-700">
                    {formatAmount(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceReceivePaymentReport;
