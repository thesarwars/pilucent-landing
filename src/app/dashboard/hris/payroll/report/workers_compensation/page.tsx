"use client";

import { useState } from "react";
import ReportFilter from "../_components/filter2";



export default function WorkersCompReport() {
  const [params, setParams] = useState({
    created_at_after: "2025-01-01",
    created_at_before: "2025-12-31",
  });

  const workersCompData = [
    {
      employee: "Frankline, John",
      state: "CA",
      workersCompClass: "No Name Specified",
      premiumWagePaid: "$761.17",
      tipsPaid: "$0.00",
      employeeTaxes: "$0.00",
      wagesPaid: "$17,589.00"
    },
    {
      employee: "Islam, Kamrul",
      state: "CA",
      workersCompClass: "No Name Specified",
      premiumWagePaid: "$283.33",
      tipsPaid: "$0.00",
      employeeTaxes: "$0.00",
      wagesPaid: "$17,500.00"
    },
    {
      employee: "Ragib, Abid Israk",
      state: "CA",
      workersCompClass: "No Name Specified",
      premiumWagePaid: "$0.00",
      tipsPaid: "$0.00",
      employeeTaxes: "$0.00",
      wagesPaid: "$50,000.00"
    },
    {
      employee: "Roberts, James",
      state: "CA",
      workersCompClass: "No Name Specified",
      premiumWagePaid: "$0.00",
      tipsPaid: "$0.00",
      employeeTaxes: "$0.00",
      wagesPaid: "$24,615.38"
    }
  ];

  const totals = {
    premiumWagePaid: "$1,044.50",
    tipsPaid: "$0.00",
    employeeTaxes: "$0.00",
    wagesPaid: "$109,704.38"
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

  return (
    <div>
      {/* Header */}
      <ReportFilter
        defaultRange="this_year"
        params={params}
        setParams={setParams}
        onFilterChange={() => {}}
      />
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={printReport}
          className="black-2 rounded-lg bg-gray-400 p-2 px-6 text-sm font-semibold text-white hover:bg-gray-500"
        >
          Print
        </button>
      </div>
      <div
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="my-8 rounded-xl border bg-white p-6"
        id="report-content"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-gray-800">
            Workers' compensation report: CA (No Name Specified)
          </h1>
          <p className="text-gray-600">Halo Axis</p>
          <p className="text-gray-600">From Jan 01, 2025 to Dec 31, 2025 from all locations</p>
        </div>

        <div className="w-full">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    State
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Workers' comp class
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Premium wage paid
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Tips paid
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Employee taxes paid by employer
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Wages paid
                  </th>
                </tr>
              </thead>
              <tbody>
                {workersCompData.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-300 ${
                      index % 2 === 1 ? "bg-gray-50" : "bg-white"
                    } transition-colors duration-150 hover:bg-gray-100`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {item.employee}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-800">
                      {item.state}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-800">
                      {item.workersCompClass}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-800">
                      {item.premiumWagePaid}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-800">
                      {item.tipsPaid}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-800">
                      {item.employeeTaxes}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-800">
                      {item.wagesPaid}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="border-b-2 border-gray-400 bg-gray-100 font-semibold">
                  <td className="px-4 py-3 text-sm font-bold text-gray-800">
                    Total
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-800">
                    -
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-800">
                    -
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                    {totals.premiumWagePaid}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                    {totals.tipsPaid}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                    {totals.employeeTaxes}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                    {totals.wagesPaid}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}