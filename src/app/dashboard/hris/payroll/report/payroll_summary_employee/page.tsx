"use client";
import React, { useState } from "react";
import ReportFilter from "../_components/filter2";

// Mock ReportFilter component

const PayrollSummaryReport = () => {
  const [params, setParams] = useState({
    created_at_after: "2025-05-27",
    created_at_before: "2025-05-27"
  });

  const formatCurrency = (amount: any) => {
    if (amount === 0) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const formatNegativeCurrency = (amount: any) => {
    if (amount === 0) return "$0.00";
    return "-" + formatCurrency(Math.abs(amount));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="  mx-auto">
        
        <ReportFilter
          params={params}
          setParams={setParams}
        />

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="text-center py-6 border-b bg-gray-50">
            <h1 className="text-xl font-semibold text-gray-800 mb-1">Halo Axis</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payroll summary by employee report</h2>
            <p className="text-gray-600 text-sm">From May 27, 2025 to May 27, 2025 for all employees from all locations</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r w-32">Name</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r w-24">Hours</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r w-24">Gross pay</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r w-24">Other pay</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r w-32">Employee taxes & deductions</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r w-24">Net pay</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r w-32">Employer taxes & contributions</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-24">Total payroll cost</th>
                </tr>
              </thead>
              <tbody>
                {/* Total Row */}
                <tr className="border-b bg-gray-25">
                  <td className="px-4 py-4 font-semibold text-gray-900 border-r">Total</td>
                  <td className="px-2 py-4 text-xs border-r">
                    <div className="space-y-1">
                      <div><span className="font-medium">Gross</span> <span className="float-right">160h</span></div>
                      <div><span className="text-gray-600">Regular Pay</span> <span className="float-right">80h</span></div>
                      <div><span className="text-gray-600">Overtime Pay</span></div>
                      <div><span className="text-gray-600">Double Overtime Pay</span></div>
                      <div><span className="text-gray-600">Paid time off</span></div>
                      <div><span className="text-gray-600">Salary</span> <span className="float-right">80h</span></div>
                      <div className="border-t pt-1 mt-1"><span className="font-medium">Adjusted gross</span></div>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-xs text-right border-r">
                    <div className="space-y-1">
                      <div className="font-medium">{formatCurrency(6215.38)}</div>
                      <div className="text-gray-600">{formatCurrency(1600.00)}</div>
                      <div className="text-gray-600">{formatCurrency(0)}</div>
                      <div className="text-gray-600">{formatCurrency(0)}</div>
                      <div className="text-gray-600">{formatCurrency(0)}</div>
                      <div className="text-gray-600">{formatCurrency(4615.38)}</div>
                      <div className="border-t pt-1 mt-1 font-medium">{formatCurrency(6215.38)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-r text-gray-400">-</td>
                  <td className="px-2 py-4 text-xs text-right border-r">
                    <div className="space-y-1">
                      <div><span className="font-medium">Total</span> <span className="float-right">{formatNegativeCurrency(1696.75)}</span></div>
                      <div><span className="text-gray-600 font-medium">Employee taxes</span> <span className="float-right">{formatNegativeCurrency(1696.75)}</span></div>
                      <div><span className="text-gray-600">Federal Income Tax</span> <span className="float-right">{formatNegativeCurrency(807.72)}</span></div>
                      <div><span className="text-gray-600">Social Security</span> <span className="float-right">{formatNegativeCurrency(385.35)}</span></div>
                      <div><span className="text-gray-600">Medicare</span> <span className="float-right">{formatNegativeCurrency(90.12)}</span></div>
                      <div><span className="text-gray-600">CA Income Tax</span> <span className="float-right">{formatNegativeCurrency(338.98)}</span></div>
                      <div><span className="text-gray-600">CA State Disability Ins</span> <span className="float-right">{formatNegativeCurrency(74.58)}</span></div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold border-r">{formatCurrency(4518.63)}</td>
                  <td className="px-2 py-4 text-xs text-right border-r">
                    <div className="space-y-1">
                      <div><span className="font-medium">Total</span> <span className="float-right">{formatCurrency(475.47)}</span></div>
                      <div><span className="text-gray-600 font-medium">Employer taxes</span> <span className="float-right">{formatCurrency(475.47)}</span></div>
                      <div><span className="text-gray-600">FUTA Employer</span> <span className="float-right">{formatCurrency(0)}</span></div>
                      <div><span className="text-gray-600">Social Security Employer</span> <span className="float-right">{formatCurrency(385.35)}</span></div>
                      <div><span className="text-gray-600">Medicare Employer</span> <span className="float-right">{formatCurrency(90.12)}</span></div>
                      <div><span className="text-gray-600">CA ETT</span> <span className="float-right">{formatCurrency(0)}</span></div>
                      <div><span className="text-gray-600">CA SUI Employer</span> <span className="float-right">{formatCurrency(0)}</span></div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold">{formatCurrency(6690.85)}</td>
                </tr>

                {/* Islam, Kamrul Row */}
                <tr className="border-b">
                  <td className="px-4 py-4 font-medium text-gray-900 border-r">Islam, Kamrul</td>
                  <td className="px-2 py-4 text-xs border-r">
                    <div className="space-y-1">
                      <div><span className="font-medium">Gross</span> <span className="float-right">80h</span></div>
                      <div><span className="text-gray-600">Regular Pay</span> <span className="float-right">80h</span></div>
                      <div><span className="text-gray-600">Overtime Pay</span></div>
                      <div><span className="text-gray-600">Double Overtime Pay</span></div>
                      <div><span className="text-gray-600">Paid time off</span></div>
                      <div className="border-t pt-1 mt-1"><span className="font-medium">Adjusted gross</span></div>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-xs text-right border-r">
                    <div className="space-y-1">
                      <div className="font-medium">{formatCurrency(1600.00)}</div>
                      <div className="text-gray-600">{formatCurrency(1600.00)}</div>
                      <div className="text-gray-600">{formatCurrency(0)}</div>
                      <div className="text-gray-600">{formatCurrency(0)}</div>
                      <div className="text-gray-600">{formatCurrency(0)}</div>
                      <div className="border-t pt-1 mt-1 font-medium">{formatCurrency(1600.00)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-r text-gray-400">-</td>
                  <td className="px-2 py-4 text-xs text-right border-r">
                    <div className="space-y-1">
                      <div><span className="font-medium">Total</span> <span className="float-right">{formatNegativeCurrency(290.10)}</span></div>
                      <div><span className="text-gray-600 font-medium">Employee taxes</span> <span className="float-right">{formatNegativeCurrency(290.10)}</span></div>
                      <div><span className="text-gray-600">Federal Income Tax</span> <span className="float-right">{formatNegativeCurrency(113.60)}</span></div>
                      <div><span className="text-gray-600">Social Security</span> <span className="float-right">{formatNegativeCurrency(99.20)}</span></div>
                      <div><span className="text-gray-600">Medicare</span> <span className="float-right">{formatNegativeCurrency(23.20)}</span></div>
                      <div><span className="text-gray-600">CA Income Tax</span> <span className="float-right">{formatNegativeCurrency(34.90)}</span></div>
                      <div><span className="text-gray-600">CA State Disability Ins</span> <span className="float-right">{formatNegativeCurrency(19.20)}</span></div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold border-r">{formatCurrency(1309.90)}</td>
                  <td className="px-2 py-4 text-xs text-right border-r">
                    <div className="space-y-1">
                      <div><span className="font-medium">Total</span> <span className="float-right">{formatCurrency(122.40)}</span></div>
                      <div><span className="text-gray-600 font-medium">Employer taxes</span> <span className="float-right">{formatCurrency(122.40)}</span></div>
                      <div><span className="text-gray-600">FUTA Employer</span> <span className="float-right">{formatCurrency(0)}</span></div>
                      <div><span className="text-gray-600">Social Security Employer</span> <span className="float-right">{formatCurrency(99.20)}</span></div>
                      <div><span className="text-gray-600">Medicare Employer</span> <span className="float-right">{formatCurrency(23.20)}</span></div>
                      <div><span className="text-gray-600">CA ETT</span> <span className="float-right">{formatCurrency(0)}</span></div>
                      <div><span className="text-gray-600">CA SUI Employer</span> <span className="float-right">{formatCurrency(0)}</span></div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold">{formatCurrency(1722.40)}</td>
                </tr>

                {/* Roberts, James Row */}
                <tr className="border-b">
                  <td className="px-4 py-4 font-medium text-gray-900 border-r">Roberts, James</td>
                  <td className="px-2 py-4 text-xs border-r">
                    <div className="space-y-1">
                      <div><span className="font-medium">Gross</span> <span className="float-right">80h</span></div>
                      <div><span className="text-gray-600">Regular Pay</span></div>
                      <div><span className="text-gray-600">Salary</span> <span className="float-right">80h</span></div>
                      <div className="border-t pt-1 mt-1"><span className="font-medium">Adjusted gross</span></div>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-xs text-right border-r">
                    <div className="space-y-1">
                      <div className="font-medium">{formatCurrency(4615.38)}</div>
                      <div className="text-gray-600">{formatCurrency(0)}</div>
                      <div className="text-gray-600">{formatCurrency(4615.38)}</div>
                      <div className="border-t pt-1 mt-1 font-medium">{formatCurrency(4615.38)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-r text-gray-400">-</td>
                  <td className="px-2 py-4 text-xs text-right border-r">
                    <div className="space-y-1">
                      <div><span className="font-medium">Total</span> <span className="float-right">{formatNegativeCurrency(1406.65)}</span></div>
                      <div><span className="text-gray-600 font-medium">Employee taxes</span> <span className="float-right">{formatNegativeCurrency(1406.65)}</span></div>
                      <div><span className="text-gray-600">Federal Income Tax</span> <span className="float-right">{formatNegativeCurrency(694.12)}</span></div>
                      <div><span className="text-gray-600">Social Security</span> <span className="float-right">{formatNegativeCurrency(286.15)}</span></div>
                      <div><span className="text-gray-600">Medicare</span> <span className="float-right">{formatNegativeCurrency(66.92)}</span></div>
                      <div><span className="text-gray-600">CA Income Tax</span> <span className="float-right">{formatNegativeCurrency(304.08)}</span></div>
                      <div><span className="text-gray-600">CA State Disability Ins</span> <span className="float-right">{formatNegativeCurrency(55.38)}</span></div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold border-r">{formatCurrency(3208.73)}</td>
                  <td className="px-2 py-4 text-xs text-right border-r">
                    <div className="space-y-1">
                      <div><span className="font-medium">Total</span> <span className="float-right">{formatCurrency(353.07)}</span></div>
                      <div><span className="text-gray-600 font-medium">Employer taxes</span> <span className="float-right">{formatCurrency(353.07)}</span></div>
                      <div><span className="text-gray-600">FUTA Employer</span> <span className="float-right">{formatCurrency(0)}</span></div>
                      <div><span className="text-gray-600">Social Security Employer</span> <span className="float-right">{formatCurrency(286.15)}</span></div>
                      <div><span className="text-gray-600">Medicare Employer</span> <span className="float-right">{formatCurrency(66.92)}</span></div>
                      <div><span className="text-gray-600">CA ETT</span> <span className="float-right">{formatCurrency(0)}</span></div>
                      <div><span className="text-gray-600">CA SUI Employer</span> <span className="float-right">{formatCurrency(0)}</span></div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold">{formatCurrency(4968.45)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollSummaryReport;