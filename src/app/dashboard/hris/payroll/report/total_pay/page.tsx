"use client";
import React, { useState } from "react";
import { Settings, BarChart3, Table } from "lucide-react";
import ReportFilter from "../_components/filter2";

interface TotalPayItem {
  id: string;
  name: string;
  salary: string;
  regularPay: string;
  overtimePay: string;
  doubleOvertimePay: string;
  paidTimeOff: string;
  holidayPay: string;
  total: string;
  isTotal?: boolean;
}

// Total pay data matching the image
const staticTotalPayData: TotalPayItem[] = [
  {
    id: "fp1",
    name: "Frankline, John",
    salary: "15,000.00",
    regularPay: "-",
    overtimePay: "2,000.00",
    doubleOvertimePay: "189.00",
    paidTimeOff: "100.00",
    holidayPay: "300.00",
    total: "17,589.00"
  },
  {
    id: "ik1",
    name: "Islam, Kamrul",
    salary: "-",
    regularPay: "16,600.00",
    overtimePay: "400.00",
    doubleOvertimePay: "300.00",
    paidTimeOff: "200.00",
    holidayPay: "-",
    total: "17,500.00"
  },
  {
    id: "rai1",
    name: "Ragib, Abid Israk",
    salary: "50,000.00",
    regularPay: "-",
    overtimePay: "-",
    doubleOvertimePay: "-",
    paidTimeOff: "-",
    holidayPay: "-",
    total: "50,000.00"
  },
  {
    id: "rj1",
    name: "Roberts, James",
    salary: "4,615.38",
    regularPay: "20,000.00",
    overtimePay: "-",
    doubleOvertimePay: "-",
    paidTimeOff: "-",
    holidayPay: "-",
    total: "24,615.38"
  },
  {
    id: "total",
    name: "Total",
    salary: "69,615.38",
    regularPay: "36,600.00",
    overtimePay: "2,400.00",
    doubleOvertimePay: "489.00",
    paidTimeOff: "300.00",
    holidayPay: "300.00",
    total: "109,704.38",
    isTotal: true
  }
];

const TotalPayReport = () => {
  const [processedData] = useState<TotalPayItem[]>(staticTotalPayData);
  const [params, setParams] = useState({
    created_at_after: "01/01/2025",
    created_at_before: "12/31/2025"
  });
  const [viewMode, setViewMode] = useState<'detailed' | 'summary'>('summary');
  const [showCustomizeDropdown, setShowCustomizeDropdown] = useState(false);

  const formatAmount = (amount: string) => {
    if (amount === "-" || amount === "" || amount === "0.00") return "-";
    
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (numAmount === 0) return "-";

    const formatted = numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `$${formatted}`;
  };

  const printReport = () => {
    const printContent = document.getElementById("report-content")?.innerHTML;
    const printWindow = window.open("", "_blank");

    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Total Pay Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
              th { background-color: #f5f5f5; font-weight: 600; }
              .total-row { background-color: #f0f0f0; font-weight: 600; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              h1 { font-size: 24px; margin-bottom: 8px; }
              h2 { font-size: 18px; margin-bottom: 4px; }
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

  const renderDetailedView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-left font-semibold text-gray-900 w-48">
              Employee Name
            </th>
            <th className="px-4 py-4 text-center font-semibold text-gray-900 w-32">
              Salary
            </th>
            <th className="px-4 py-4 text-center font-semibold text-gray-900 w-32">
              Regular Pay
            </th>
            <th className="px-4 py-4 text-center font-semibold text-gray-900 w-32">
              Overtime Pay
            </th>
            <th className="px-4 py-4 text-center font-semibold text-gray-900 w-40">
              Double Overtime Pay
            </th>
            <th className="px-4 py-4 text-center font-semibold text-gray-900 w-32">
              Paid Time Off
            </th>
            <th className="px-4 py-4 text-center font-semibold text-gray-900 w-32">
              Holiday Pay
            </th>
            <th className="px-4 py-4 text-center font-semibold text-gray-900 w-32">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {processedData.map((item) => (
            <tr key={item.id} className={`
              ${item.isTotal ? 'bg-gray-100 font-semibold border-t-2 border-gray-300' : 'border-b border-gray-100'}
            `}>
              <td className="px-6 py-4 font-medium text-gray-900">
                {item.name}
              </td>
              <td className="px-4 py-4 text-right">
                {formatAmount(item.salary)}
              </td>
              <td className="px-4 py-4 text-right">
                {formatAmount(item.regularPay)}
              </td>
              <td className="px-4 py-4 text-right">
                {formatAmount(item.overtimePay)}
              </td>
              <td className="px-4 py-4 text-right">
                {formatAmount(item.doubleOvertimePay)}
              </td>
              <td className="px-4 py-4 text-right">
                {formatAmount(item.paidTimeOff)}
              </td>
              <td className="px-4 py-4 text-right">
                {formatAmount(item.holidayPay)}
              </td>
              <td className="px-4 py-4 text-right font-semibold text-gray-900">
                {formatAmount(item.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSummaryView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-900 border border-gray-300 w-48">
              Name
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 border border-gray-300 w-32">
              Salary
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 border border-gray-300 w-32">
              Regular Pay
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 border border-gray-300 w-32">
              Overtime Pay
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 border border-gray-300 w-40">
              Double Overtime Pay
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 border border-gray-300 w-32">
              Paid time off
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 border border-gray-300 w-32">
              Holiday Pay
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 border border-gray-300 w-32">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {processedData.map((item) => (
            <tr key={item.id} className={`
              ${item.isTotal ? 'bg-gray-100 font-semibold' : 'bg-white'}
            `}>
              <td className="px-4 py-2 border border-gray-300 text-sm font-medium">
                {item.name}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-right text-sm">
                {formatAmount(item.salary)}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-right text-sm">
                {formatAmount(item.regularPay)}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-right text-sm">
                {formatAmount(item.overtimePay)}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-right text-sm">
                {formatAmount(item.doubleOvertimePay)}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-right text-sm">
                {formatAmount(item.paidTimeOff)}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-right text-sm">
                {formatAmount(item.holidayPay)}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-right text-sm font-semibold">
                {formatAmount(item.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4">
        {/* Filter Section */}
        <ReportFilter
          params={params}
          setParams={setParams}
        />

        {/* <div className="flex justify-end">
          <div className="p-2 flex gap-x-1">
            <button
              onClick={() => {
                setViewMode('detailed');
                setShowCustomizeDropdown(false);
              }}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded hover:bg-gray-100 ${viewMode === 'detailed' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
            >
              <BarChart3 size={20} />
            </button>
            <button
              onClick={() => {
                setViewMode('summary');
                setShowCustomizeDropdown(false);
              }}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded hover:bg-gray-100 ${viewMode === 'summary' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
            >
              <Table size={20} />
            </button>
          </div>
        </div> */}

        {/* Report Content */}
        <div id="report-content" className="bg-white rounded-lg shadow">
          {/* Report Header */}
          <div className="px-6 py-8 text-center border-b">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Total pay report
            </h1>
            <h2 className="text-xl text-gray-700 mb-4">
              Halo Axis
            </h2>
            <div className="text-sm font-medium text-gray-600">
              From Jan 01, 2025 to Dec 31, 2025 for all employees from all locations
            </div>
          </div>

          {/* Dynamic Table Content */}
          {viewMode === 'detailed' ? renderDetailedView() : renderSummaryView()}
        </div>
      </div>
    </div>
  );
};

export default TotalPayReport;