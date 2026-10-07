"use client";
import React from "react";
import ReportFilter from "../../payroll/report/_components/filter2";
import moment from "moment";

const employeeData: any[] = [
  {
    id: 1,
    name: "Frankline, John",
    paidTimeOff: "Casual Leave",
    balance: 40,
    ytdUsed: 0,
  },
  {
    id: 2,
    name: "Islam, Kamrul",
    paidTimeOff: "Casual Leave",
    balance: 1.54,
    ytdUsed: 0,
  },
  {
    id: 3,
    name: "Ragib, Abul Israk",
    paidTimeOff: "",
    balance: 0,
    ytdUsed: 0,
  },
  {
    id: 4,
    name: "Roberts, James",
    paidTimeOff: "Casual Leave",
    balance: 1.54,
    ytdUsed: 0,
  },
];

const Page = () => {
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
      <ReportFilter
        defaultRange="this_month"
        params={{
          created_at_after: moment().startOf("week").format("YYYY-MM-DD"),
          created_at_before: moment().endOf("week").format("YYYY-MM-DD"),
        }}
        setParams={(newParams: any) => {}}
        onFilterChange={() => {}}
      />
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={printReport}
          className="rounded-lg bg-gray-400 px-6 py-2 text-sm font-semibold text-white"
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
            Vacancy And Sick Leaves
          </h1>
          <p className="text-gray-600">Halo Axis</p>
          <p className="text-gray-600">January-May, 2025</p>
        </div>

        <div className="w-full">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Paid time off
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    YTD used
                  </th>
                </tr>
              </thead>
              <tbody>
                {employeeData.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-300 ${
                      index % 2 === 1 ? "bg-gray-50" : "bg-white"
                    } transition-colors duration-150 hover:bg-gray-100`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-800">
                      {item.paidTimeOff}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-800">
                      {item.balance}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-800">
                      {item.ytdUsed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
