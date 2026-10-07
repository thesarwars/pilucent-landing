"use client";
import React, { useState } from "react";
import moment from "moment";
import ReportFilter from "../_components/filter2";

const timeOffDetailsData: any[] = [
  {
    id: 1,
    employeeName: "Frankline, John",
    employeeId: "EMP001",
    details: [
      {
        date: "03/31/2025",
        type: "Adjustment",
        paidTimeOffHoursAccrued: 40,
        used: 0,
        balance: 40,
      },
    ],
  },
  {
    id: 2,
    employeeName: "Islam, Kamrul",
    employeeId: "EMP002",
    details: [
      {
        date: "03/31/2025",
        type: "Adjustment",
        paidTimeOffHoursAccrued: 1.54,
        used: 0,
        balance: 1.54,
      },
    ],
  },
  {
    id: 3,
    employeeName: "Ragib, Abul Israk",
    employeeId: "EMP003",
    details: [
      {
        date: "03/31/2025",
        type: "Adjustment",
        paidTimeOffHoursAccrued: 0,
        used: 0,
        balance: 0,
      },
    ],
  },
  {
    id: 4,
    employeeName: "Roberts, James",
    employeeId: "EMP004",
    details: [
      {
        date: "03/31/2025",
        type: "Adjustment",
        paidTimeOffHoursAccrued: 1.54,
        used: 0,
        balance: 1.54,
      },
    ],
  },
];

const TimeOffDetailsReport = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(timeOffDetailsData[0]);
  const [params, setParams] = useState({
    created_at_after: moment().startOf("year").format("YYYY-MM-DD"),
    created_at_before: moment().endOf("year").format("YYYY-MM-DD"),
  });

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
            <title>Time Off Details Report</title>
            <style>
              ${styles}
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Paid time off hours accrued", "Used", "Balance"];
    const csvContent = [
      headers.join(","),
      ...selectedEmployee.details.map((detail: any) =>
        [
          detail.date,
          detail.type,
          detail.paidTimeOffHoursAccrued,
          detail.used,
          detail.balance,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `time-off-details-${selectedEmployee.employeeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Time off details for {selectedEmployee.employeeName}
          <span className="text-blue-600 ml-2 cursor-pointer hover:underline">
            {selectedEmployee.employeeId}
          </span>
        </h1>
      </div>

      {/* Employee Selector */}
      <div className="mb-6">
        <select
          value={selectedEmployee.id}
          onChange={(e) => {
            const employee = timeOffDetailsData.find(emp => emp.id === parseInt(e.target.value));
            if (employee) setSelectedEmployee(employee);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {timeOffDetailsData.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.employeeName}
            </option>
          ))}
        </select>
      </div>

      {/* Report Filter */}
      <ReportFilter
        defaultRange="this_year"
        params={params}
        setParams={setParams}
        onFilterChange={() => {}}
      />

      {/* Action Buttons */}
      <div className="mb-6 flex items-center justify-end space-x-3 no-print">
        <button
          onClick={exportToCSV}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </button>
        <button
          onClick={printReport}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>

      {/* Report Content */}
      <div
        id="report-content"
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Type
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Paid time off<br />hours accrued
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Used
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Balance for the period row */}
              <tr className="border-b border-gray-200 bg-blue-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Balance for the period
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">-</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-right">
                  {selectedEmployee.details.reduce((sum: number, detail: any) => sum + detail.paidTimeOffHoursAccrued, 0)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 text-right">
                  {selectedEmployee.details.reduce((sum: number, detail: any) => sum + detail.used, 0)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                  {selectedEmployee.details.reduce((sum: number, detail: any) => sum + detail.balance, 0)}
                </td>
              </tr>
              
              {/* Individual detail rows */}
              {selectedEmployee.details.map((detail: any, index: number) => (
                <tr
                  key={index}
                  className={`border-b border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition-colors duration-150`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {detail.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {detail.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {detail.paidTimeOffHoursAccrued}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {detail.used}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {detail.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          Showing time off details for <strong>{selectedEmployee.employeeName}</strong> 
          {" "}from <strong>{moment(params.created_at_after).format("MM/DD/YYYY")}</strong>
          {" "}to <strong>{moment(params.created_at_before).format("MM/DD/YYYY")}</strong>
        </p>
      </div>
    </div>
  );
};

export default TimeOffDetailsReport;