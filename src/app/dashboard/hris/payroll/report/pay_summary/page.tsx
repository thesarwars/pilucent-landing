"use client";
import React, { useState, useMemo, useEffect } from "react";
import { RefreshCw, Filter, ChevronDown } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";

import { useFetch } from "@/app/helpers/hooks";
import { fetchPayrollPayReport } from "@/app/helpers/backend";
import { useAppSelector } from "@/app/redux/store";


const PayrollSummaryReport = () => {
  const { Company } = useAppSelector((state) => state.CompanyData);
  const [apiData, setApiData] = useState<any>(null);
  const [params, setParams] = useState({
    filter_type: "last_pay_date",
    date_from: "",
    date_to: ""
  });
  const [selectedFilter, setSelectedFilter] = useState("last_pay_date");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: ""
  });

  // Only pass allowed params to API
  const allowedParams = ['filter_type', 'date_from', 'date_to'];
  const getCleanParams = (paramsObj: typeof params) => {
    const clean: Record<string, string> = {};
    allowedParams.forEach((key) => {
      if (key in paramsObj && typeof paramsObj[key as keyof typeof paramsObj] === 'string') {
        clean[key] = paramsObj[key as keyof typeof paramsObj];
      }
    });
    return clean;
  };

  const { data, setQueryParams, isPending, refetch } = useFetch(
    ["payrollSummaryReport", getCleanParams(params)],
    fetchPayrollPayReport,
  );

  // Update apiData when API response changes
  useEffect(() => {
    if (data && data.employees) {
      setApiData(data);
    }
  }, [data]);

  // Filter options
  const filterOptions = [
    { value: "last_pay_date", label: "Last pay date" },
    { value: "this_month", label: "This month" },
    { value: "last_month", label: "Last month" },
    { value: "this_quarter", label: "This quarter" },
    { value: "last_quarter", label: "Last quarter" },
    { value: "this_year", label: "This year" },
    { value: "last_year", label: "Last year" },
    { value: "custom", label: "Custom" }
  ];

  // Get date ranges based on filter type
  const getDateRange = (filterType: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    switch (filterType) {
      case "this_month":
        return {
          date_from: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
          date_to: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
        };
      case "last_month":
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return {
          date_from: `${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}-01`,
          date_to: new Date(lastMonthYear, lastMonth + 1, 0).toISOString().split('T')[0]
        };
      case "this_quarter":
        const quarterStart = currentQuarter * 3;
        return {
          date_from: `${currentYear}-${String(quarterStart + 1).padStart(2, '0')}-01`,
          date_to: new Date(currentYear, quarterStart + 3, 0).toISOString().split('T')[0]
        };
      case "last_quarter":
        const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
        const lastQuarterYear = currentQuarter === 0 ? currentYear - 1 : currentYear;
        const lastQuarterStart = lastQuarter * 3;
        return {
          date_from: `${lastQuarterYear}-${String(lastQuarterStart + 1).padStart(2, '0')}-01`,
          date_to: new Date(lastQuarterYear, lastQuarterStart + 3, 0).toISOString().split('T')[0]
        };
      case "this_year":
        return {
          date_from: `${currentYear}-01-01`,
          date_to: `${currentYear}-12-31`
        };
      case "last_year":
        return {
          date_from: `${currentYear - 1}-01-01`,
          date_to: `${currentYear - 1}-12-31`
        };
      default:
        return {};
    }
  };

  const formatAmount = (amount: number) => {
    if (!amount || amount === 0) return "";
    const formatted = Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Calculate totals from API data
  const totals = useMemo(() => {
    if (!apiData || !apiData.employees) {
      return {
        hours: 0,
        grossPay: 0,
        otherPay: 0,
        employeeTaxes: 0,
        netPay: 0,
        employerTaxes: 0,
        companyContributions: 0,
        totalPayrollCost: 0
      };
    }
    const employees = Object.values(apiData.employees ?? {}) as any[];
    return employees.reduce((acc: any, employee: any) => {
      return {
        hours: (acc.hours ?? 0) + (employee?.totals?.total_hours ?? 0),
        grossPay: (acc.grossPay ?? 0) + (employee?.totals?.total_gross_pay ?? 0),
        otherPay: (acc.otherPay ?? 0) + (employee?.totals?.total_other_pay ?? 0),
        employeeTaxes: (acc.employeeTaxes ?? 0) + (employee?.totals?.total_employee_taxes ?? 0),
        netPay: (acc.netPay ?? 0) + (employee?.totals?.total_net_pay ?? 0),
        employerTaxes: (acc.employerTaxes ?? 0) + (employee?.totals?.total_employer_taxes ?? 0),
        companyContributions: (acc.companyContributions ?? 0) + (employee?.totals?.total_company_paid_contributions ?? 0),
        totalPayrollCost: (acc.totalPayrollCost ?? 0) + (employee?.totals?.total_payroll_cost ?? 0)
      };
    }, {
      hours: 0,
      grossPay: 0,
      otherPay: 0,
      employeeTaxes: 0,
      netPay: 0,
      employerTaxes: 0,
      companyContributions: 0,
      totalPayrollCost: 0
    });
  }, [apiData]);

  const handleFilterChange = (filterType: string) => {
    setSelectedFilter(filterType);
    setShowFilterDropdown(false);

    if (filterType === "custom") {
      // For custom, don't update params until user applies
      return;
    }

    const dateRange = getDateRange(filterType);
    let newParams = {
      filter_type: filterType,
      date_from: dateRange.date_from || "",
      date_to: dateRange.date_to || ""
    };
  setParams(newParams);
  setQueryParams(getCleanParams(newParams));
  };

  const applyCustomDateRange = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      const newParams = {
        filter_type: "custom",
        date_from: customDateRange.startDate,
        date_to: customDateRange.endDate
      };
  setParams(newParams);
  setQueryParams(getCleanParams(newParams));
    }
  };

  const resetFilters = () => {
  setSelectedFilter("last_pay_date");
  const newParams = { filter_type: "last_pay_date", date_from: "", date_to: "" };
  setParams(newParams);
  setQueryParams(getCleanParams(newParams));
  setCustomDateRange({ startDate: "", endDate: "" });
  };

  const getDateRangeDisplay = () => {
    if (selectedFilter === "custom" && customDateRange.startDate && customDateRange.endDate) {
      return `${formatDate(customDateRange.startDate)} to ${formatDate(customDateRange.endDate)}`;
    }
    if (params.date_from && params.date_to) {
      return `${formatDate(params.date_from)} to ${formatDate(params.date_to)}`;
    }
    return "All employees from all locations";
  };

  return (
    <div className="mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button className="flex items-center gap-1 px-0 mb-4 font-medium text-blue-600 hover:underline">
        <IoIosArrowBack className="text-xl" />
        Back
      </button>

      {/* Filter Section */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          {/* Filter Dropdown */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Filter by
            </label>
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center justify-between w-48 px-3 py-2 text-left bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <span>{filterOptions.find(opt => opt.value === selectedFilter)?.label}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute z-10 w-48 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-md last:rounded-b-md"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Date Range */}
          {selectedFilter === "custom" && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Custom Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            {selectedFilter === "custom" && (
              <button
                onClick={applyCustomDateRange}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700"
                disabled={!customDateRange.startDate || !customDateRange.endDate}
              >
                <Filter className="h-4 w-4" />
                Apply
              </button>
            )}
            {selectedFilter !== "custom" && (
            <button className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700">
              <Filter className="h-4 w-4" />
              Run Report
            </button>
            )}
          </div>
        </div>

        {/* Date Range Display */}
        <div className="mt-4 text-center text-sm text-gray-900">
          {getDateRangeDisplay()}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="text-center py-6 border-b">
          <div className="text-sm text-gray-600 mb-2">{Company?.name}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payroll summary report</h1>
          <div className="text-sm text-gray-600">
            {getDateRangeDisplay()}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r">Name</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r">Hours</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r">Gross pay</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r">Pretax deductions</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r">Other pay</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r">Employee taxes</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r">Aftertax deductions</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r">Net pay</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r">Employer taxes</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r">Company contributions</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Total payroll cost</th>
              </tr>
            </thead>
            <tbody>
              {/* Total Row */}
              <tr className="border-b bg-gray-50 font-semibold">
                <td className="px-4 py-3 text-sm border-r">Total</td>
                <td className="px-4 py-3 text-center text-sm border-r">{totals.hours.toFixed(2)}h</td>
                <td className="px-4 py-3 text-center text-sm border-r">{formatAmount(totals.grossPay)}</td>
                <td className="px-4 py-3 text-center text-sm border-r"></td>
                <td className="px-4 py-3 text-center text-sm border-r">{formatAmount(totals.otherPay)}</td>
                <td className="px-4 py-3 text-center text-sm border-r">-{formatAmount(totals.employeeTaxes)}</td>
                <td className="px-4 py-3 text-center text-sm border-r"></td>
                <td className="px-4 py-3 text-center text-sm border-r">{formatAmount(totals.netPay)}</td>
                <td className="px-4 py-3 text-center text-sm border-r">{formatAmount(totals.employerTaxes)}</td>
                <td className="px-4 py-3 text-center text-sm border-r">{formatAmount(totals.companyContributions)}</td>
                <td className="px-4 py-3 text-center text-sm">{formatAmount(totals.totalPayrollCost)}</td>
              </tr>

              {/* Employee Rows */}
              {apiData && apiData.employees && Object.values(apiData.employees).map((employee: any) => (
                <tr key={employee?.employee_info?.employee_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm border-r">{employee?.employee_info?.name ?? ""}</td>
                  <td className="px-4 py-3 text-center text-sm border-r">{(employee?.totals?.total_hours ?? 0).toFixed(2)}h</td>
                  <td className="px-4 py-3 text-center text-sm border-r">{formatAmount(employee?.totals?.total_gross_pay ?? 0)}</td>
                  <td className="px-4 py-3 text-center text-sm border-r">{formatAmount(employee?.totals?.total_employee_deductions ?? 0)}</td>
                  <td className="px-4 py-3 text-center text-sm border-r">{formatAmount(employee?.totals?.total_other_pay ?? 0)}</td>
                  <td className="px-4 py-3 text-center text-sm border-r">-{formatAmount(employee?.totals?.total_employee_taxes ?? 0)}</td>
                  <td className="px-4 py-3 text-center text-sm border-r"></td>
                  <td className="px-4 py-3 text-center text-sm border-r">{formatAmount(employee?.totals?.total_net_pay ?? 0)}</td>
                  <td className="px-4 py-3 text-center text-sm border-r">{formatAmount(employee?.totals?.total_employer_taxes ?? 0)}</td>
                  <td className="px-4 py-3 text-center text-sm border-r">{formatAmount(employee?.totals?.total_company_paid_contributions ?? 0)}</td>
                  <td className="px-4 py-3 text-center text-sm">{formatAmount(employee?.totals?.total_payroll_cost ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollSummaryReport;