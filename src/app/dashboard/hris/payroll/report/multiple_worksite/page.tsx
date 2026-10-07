"use client";
import React, { useState, useMemo, useEffect } from "react";
import { RefreshCw, Filter, ChevronDown } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { useFetch } from "@/app/helpers/hooks";
import { fetchPayrollMultipleWorksiteReport } from "@/app/helpers/backend";
import { useAppSelector } from "@/app/redux/store";
import Button from "@/components/ui/RawButton";
import { baseURL } from "@/services/FetchMethods";

const MultipleWorksiteReport = () => {
  const { Company } = useAppSelector((state) => state.CompanyData);
  const [apiData, setApiData] = useState<any>(null);
  const [params, setParams] = useState({
    filter_type: "this_quarter",
    date_from: "",
    date_to: ""
  });
  const [selectedFilter, setSelectedFilter] = useState("this_quarter");
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
    ["payrollMultipleWorksiteReport", getCleanParams(params)],
    fetchPayrollMultipleWorksiteReport,
  );

  // Update apiData when API response changes
  useEffect(() => {
    if (data && data.worksites) {
      setApiData(data);
    }
  }, [data]);

  // Filter options
  const filterOptions = [
    { value: "this_quarter", label: "This quarter" },
    { value: "last_quarter", label: "Last quarter" },
    { value: "first_quarter", label: "First quarter" },
    { value: "second_quarter", label: "Second quarter" },
    { value: "third_quarter", label: "Third quarter" },
    { value: "custom", label: "Custom" }
  ];

  // Get date ranges based on filter type
  const getDateRange = (filterType: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    switch (filterType) {
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
      case "first_quarter":
        return {
          date_from: `${currentYear}-01-01`,
          date_to: `${currentYear}-03-31`
        };
      case "second_quarter":
        return {
          date_from: `${currentYear}-04-01`,
          date_to: `${currentYear}-06-30`
        };
      case "third_quarter":
        return {
          date_from: `${currentYear}-07-01`,
          date_to: `${currentYear}-09-30`
        };
      default:
        return {};
    }
  };

  const formatAmount = (amount: number) => {
    if (!amount || amount === 0) return "$0.00";
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
    setSelectedFilter("this_quarter");
    const newParams = { filter_type: "this_quarter", date_from: "", date_to: "" };
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
    return apiData?.quarter_label || "Current quarter";
  };


  const token = localStorage.getItem("access_token");

   const printReport = async () => {
	  // Use existing params, add is_pdf: 'true'
	  const res = await fetch(`${baseURL}we/payroll/reports/payroll/multiple-worksite/?is_pdf=true`, {
		method: "GET",
		headers: {
		  "Content-Type": "application/json",
		  "Authorization": `Bearer ${token}`
		}
	  });
	  // download PDF no if condition
	  const blob = await res.blob();
	  const url = window.URL.createObjectURL(blob);
	  const link = document.createElement("a");
	  link.href = url;
	  link.setAttribute("download", `multiple_worksite_report.pdf`);
	  document.body.appendChild(link);
	  link.click();
	  link.parentNode?.removeChild(link);
	  window.URL.revokeObjectURL(url);
  
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
          <div className="text-sm text-gray-600 mb-2">{apiData?.company_name || Company?.name}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Multiple Worksite Report</h1>
          <div className="text-sm text-gray-600">
            {getDateRangeDisplay()}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={printReport}
            className="m-4 flex items-center gap-1 rounded-md bg-gray-800 px-3 py-2 text-white hover:bg-gray-900"
          >
            Print
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r">Worksite</th>
                {apiData?.month_names?.map((month: string, index: number) => (
                  <th key={index} className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r">
                    No. of Employees ({month})
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Quarterly wages</th>
              </tr>
            </thead>
            <tbody>
              {/* Data Rows */}
              {apiData && apiData.worksites && apiData.worksites.map((worksite: any, index: number) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm border-r">
                    <div className="font-medium">{worksite.worksite}</div>
                    <div className="text-xs text-gray-500">{worksite.address}</div>
                    <div className="text-xs text-gray-500">{worksite.city_state_zip}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm border-r">{worksite.month1_employees || 0}</td>
                  <td className="px-4 py-3 text-center text-sm border-r">{worksite.month2_employees || 0}</td>
                  <td className="px-4 py-3 text-center text-sm border-r">{worksite.month3_employees || 0}</td>
                  <td className="px-4 py-3 text-center text-sm">{formatAmount(worksite.quarterly_wages)}</td>
                </tr>
              ))}

              {/* Totals Row */}
              {apiData?.totals && (
                <tr className="border-b bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-sm border-r">Total</td>
                  <td className="px-4 py-3 text-center text-sm border-r">{apiData.totals.month1_employees || 0}</td>
                  <td className="px-4 py-3 text-center text-sm border-r">{apiData.totals.month2_employees || 0}</td>
                  <td className="px-4 py-3 text-center text-sm border-r">{apiData.totals.month3_employees || 0}</td>
                  <td className="px-4 py-3 text-center text-sm">{formatAmount(apiData.totals.quarterly_wages)}</td>
                </tr>
              )}

              {(!apiData || !apiData.worksites || !apiData.worksites.length) && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No worksite data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MultipleWorksiteReport;