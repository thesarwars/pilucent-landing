"use client";

import { useState } from "react";
import ReportFilter from "../_components/filter2";



export default function MultipleWorksiteReport() {
  const [params, setParams] = useState({
    created_at_after: "2025-04-01",
    created_at_before: "2025-06-30",
  });

  const worksiteData = [
    {
      worksite: "Halo Axis",
      address: "",
      employeesApr: 0,
      employeesMay: 4,
      employeesJun: 0,
      quarterlyWages: "$109,654.39"
    },
    {
      worksite: "5396 N Reese Ave, Fresno, CA 93722-6112",
      address: "",
      employeesApr: 0,
      employeesMay: 0,
      employeesJun: 0,
      quarterlyWages: "$0.00"
    },
    {
      worksite: "Halo Axis",
      address: "3106 68th Ave N, Minneapolis, MN 55429-4217",
      employeesApr: 0,
      employeesMay: 0,
      employeesJun: 0,
      quarterlyWages: "$0.00"
    },
    {
      worksite: "Halo Axis",
      address: "300 Mercer St Apt 23L, New York, NY 10003-6740",
      employeesApr: 0,
      employeesMay: 0,
      employeesJun: 0,
      quarterlyWages: "$0.00"
    }
  ];

  const totals = {
    employeesApr: 0,
    employeesMay: 4,
    employeesJun: 0,
    quarterlyWages: "$109,654.39"
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
        defaultRange="quarterly"
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
            Multiple worksite report (MWR)
          </h1>
          <p className="text-gray-600">Halo Axis</p>
          <p className="text-gray-600">From Apr 01, 2025 to Jun 30, 2025 from all locations</p>
        </div>

        <div className="w-full">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Worksite
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    No. of employees (Apr)
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    No. of employees (May)
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    No. of employees (Jun)
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Quarterly wages
                  </th>
                </tr>
              </thead>
              <tbody>
                {worksiteData.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-300 ${
                      index % 2 === 1 ? "bg-gray-50" : "bg-white"
                    } transition-colors duration-150 hover:bg-gray-100`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      <div>
                        <div className="font-medium">{item.worksite}</div>
                        {item.address && (
                          <div className="text-xs text-gray-600 mt-1">
                            {item.address}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-800">
                      {item.employeesApr}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-800">
                      {item.employeesMay}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-800">
                      {item.employeesJun}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-800">
                      {item.quarterlyWages}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="border-b-2 border-gray-400 bg-gray-100 font-semibold">
                  <td className="px-4 py-3 text-sm font-bold text-gray-800">
                    Total
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-gray-800">
                    {totals.employeesApr}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-gray-800">
                    {totals.employeesMay}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-gray-800">
                    {totals.employeesJun}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                    {totals.quarterlyWages}
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