"use client";
import { useAppSelector } from "@/app/redux/store";
import React, { useState, useMemo } from "react";
import moment from "moment";
import ReportFilter from "../_components/filter2";

interface TaxPaymentData {
  id: string;
  paymentDate: string;
  taxType: string;
  dateRange: string;
  amount: string;
  paymentMethod: string;
  notes: string;
}

// Static data based on the image
const staticTaxPaymentData: TaxPaymentData[] = [
  {
    id: "1",
    paymentDate: "06/18/2025",
    taxType: "Federal Taxes (941/943/944)",
    dateRange: "04/01/2025 - 04/30/2025",
    amount: "1,758.84",
    paymentMethod: "Manual",
    notes: "Marked as paid on 06/17/2025"
  },
  {
    id: "2",
    paymentDate: "06/13/2025",
    taxType: "Federal Taxes (941/943/944)",
    dateRange: "04/01/2025 - 05/31/2025",
    amount: "515,916.18",
    paymentMethod: "Manual",
    notes: ""
  },
  {
    id: "3",
    paymentDate: "06/12/2025",
    taxType: "CA PIT / SDI",
    dateRange: "04/01/2025 - 04/30/2025",
    amount: "549.00",
    paymentMethod: "Manual",
    notes: ""
  },
  {
    id: "4",
    paymentDate: "06/13/2025",
    taxType: "CA SUI / ETT",
    dateRange: "04/01/2025 - 04/30/2025",
    amount: "12,256.00",
    paymentMethod: "Manual",
    notes: ""
  }
];

const PayrollTaxPaymentsPage = () => {
  const [processedData, setProcessedData] = useState<TaxPaymentData[]>(staticTaxPaymentData);
  const [params, setParams] = useState({
    created_at_after: "06/01/2025",
    created_at_before: "06/30/2025"
  });
  
  const { Company } = useAppSelector((state) => state.CompanyData);

  // Handle filter changes
  const handleFilterChange = (newParams: any) => {
    setParams(newParams);
    // Apply any filtering logic here if needed
  };

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    return numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const printReport = () => {
    const printContent = document.getElementById("report-content")?.innerHTML;
    const printWindow = window.open("", "_blank");

    if (printWindow && printContent) {
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch {
            return "";
          }
        })
        .join("\n");

      printWindow.document.write(`
        <html>
          <head>
            <title>Payroll Tax Payments</title>
            <style>${styles}</style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const totalAmount = useMemo(() => {
    return processedData.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount.replace(/,/g, ''));
    }, 0);
  }, [processedData]);

  return (
    <div className="mx-auto p-4">
     
      {/* Report Filter */}
      <ReportFilter
        params={params}
        setParams={setParams}
        // onFilterChange={handleFilterChange}
      />

      <div id="report-content">
        <div className="mb-8 text-center flex flex-col justify-center">
          <h1 className="mb-2 text-3xl font-bold">Payroll Tax Payments</h1>
          <h2 className="mb-1 text-xl">
            {Company?.name || "Binary Burst"}
          </h2>
          <div className="mt-4 text-center text-sm font-medium text-gray-900">
            From{" "}
            {moment(new Date(params?.created_at_after || "06/01/2025")).format("DD MMMM, YYYY")}
            {"  "} to{" "}
            {moment(new Date(params?.created_at_before || "06/30/2025")).format("DD MMMM, YYYY")}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b px-4 py-2 text-left cursor-pointer hover:bg-gray-100">
                  Payment date
                </th>
                <th className="border-b px-4 py-2 text-left cursor-pointer hover:bg-gray-100">
                  Tax type
                </th>
                <th className="border-b px-4 py-2 text-right cursor-pointer hover:bg-gray-100">
                  Amount
                </th>
                <th className="border-b px-4 py-2 text-left cursor-pointer hover:bg-gray-100">
                  Payment method
                </th>
                <th className="border-b px-4 py-2 text-left cursor-pointer hover:bg-gray-100">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData?.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 border-b">
                  <td className="px-4 py-3">{payment.paymentDate}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{payment.taxType}</div>
                    <div className="text-sm text-gray-500">{payment.dateRange}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${formatAmount(payment.amount)}
                  </td>
                  <td className="px-4 py-3">{payment.paymentMethod}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{payment.notes || "-"}</td>
                </tr>
              ))}
              
              {!processedData.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No tax payment records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary section */}
        {/* <div className="mt-6 bg-gray-50 p-4 rounded">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Records: {processedData.length}</span>
            <div className="flex gap-8">
              <div>
                <span className="font-semibold">Total Amount: ${formatAmount(totalAmount.toString())}</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default PayrollTaxPaymentsPage;