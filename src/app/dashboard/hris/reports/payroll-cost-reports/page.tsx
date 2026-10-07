"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import moment from "moment";

import { useAppSelector } from "@/app/redux/store";
import LogoLoader from "@/components/MainLoader/logo-loader";
import ReportFilter2 from "@/app/dashboard/reports/_components/filter2";

interface ReportItem {
  uid: string;
  title: string;
  opening_balance: string;
  created_at: string;
  updated_at: string;
}

interface OverviewData {
  total_payroll_expense_cao: number;
  total_company_contribution_cao: number;
  total_payroll_liabilities_cao: number;
}

const ProfitLossReport = () => {
  const { Company } = useAppSelector((state) => state.CompanyData);
  const token = localStorage.getItem("access_token");
  // expanded/collapsed sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    payrollExpenses: true,
    companyContributions: false,
    payrollLiabilities: false,
  });

  // data storage
  const [sectionData, setSectionData] = useState<Record<string, ReportItem[]>>({
    payrollExpenses: [],
    companyContributions: [],
    payrollLiabilities: [],
  });

  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const currentFetchingSection = useRef<string | null>(null);

  // ✅ local filters
  const [filters, setFilters] = useState<{ start_date?: string; end_date?: string }>({
    start_date: moment().startOf("month").format("YYYY-MM-DD"),
    end_date: moment().endOf("month").format("YYYY-MM-DD"),
  });

  // section → API query mapping
  const sectionApi: Record<string, string> = {
    payrollExpenses: "detail_type__title=Payroll Expenses",
    companyContributions: "parent__title=Company Contributions",
    payrollLiabilities: "detail_type__title=Payroll Liabilities",
  };

  // base URL
  const BASE_URL = "https://balanzifyapi.jumatechs.xyz/api/v1/we/reports/payroll-cost-reports";

  const fetchSection = async (section: string) => {
    if (!filters.start_date || !filters.end_date) return;
    try {
      setIsLoading(true);
      currentFetchingSection.current = section;
      //data getting from api
      const res = await fetch(
        `${BASE_URL}?${sectionApi[section]}&start_date=${filters.start_date}&end_date=${filters.end_date}`,{
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      const json = await res.json();
      setSectionData((prev) => ({ ...prev, [section]: json.results || [] }));
    } catch (err) {
      console.error("Fetch section failed:", err);
    } finally {
      setIsLoading(false);
      currentFetchingSection.current = null;
    }
  };

  const fetchOverview = async () => {
    if (!filters.start_date || !filters.end_date) return;
    try {
      //overviewiNg
      const res = await fetch(
        `${BASE_URL}?keywords=overview&start_date=${filters.start_date}&end_date=${filters.end_date}`,{
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      const json = await res.json();
      setOverviewData(json);
    } catch (err) {
      console.error("Fetch overview failed:", err);
    }
  };

  // re-fetch when filters change
  useEffect(() => {
    fetchOverview();
    if (expandedSections.payrollExpenses) fetchSection("payrollExpenses");
    if (expandedSections.companyContributions) fetchSection("companyContributions");
    if (expandedSections.payrollLiabilities) fetchSection("payrollLiabilities");
  }, [filters]);

  const handleFilterChange = (params: any) => {
    setFilters({
      start_date: params?.start_date,
      end_date: params?.end_date,
    });
  };

  const toggleSection = (section: string) => {
    // toggle section
    setExpandedSections((prev) => {
      const newState = { ...prev, [section]: !prev[section] };
      if (newState[section] && sectionData[section].length === 0) {
        fetchSection(section);
      }
      return newState;
    });
  };

  const formatCurrency = (value: any) => {
    if (!value) return "0.00";
    return Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  return (
    <div>
      {/* Report Filter */}
      <ReportFilter2
        params={filters}
        setParams={handleFilterChange}
        onFilterChange={() => {
          // reset data on filter change
          setSectionData({
            payrollExpenses: [],
            companyContributions: [],
            payrollLiabilities: [],
          });
        }}
      />

      {/* Report Header */}
      <div
        id="report-content"
        className="mx-auto w-full rounded border bg-white p-4 py-7 text-sm"
      >
        <div className="mb-4 border-b pb-4 text-center">
          <h2 className="mb-1 text-xl">{Company?.name || "Binary Burst"}</h2>
          <h2 className="text-xl">Payroll Cost Reports</h2>
          <p className="text-gray-600">
            {filters.start_date} to {filters.end_date}
          </p>
        </div>

        {/* Payroll Expenses */}
        <div className="mb-2 border-b">
          <div
            className="flex cursor-pointer items-center py-2 font-medium hover:bg-gray-50"
            onClick={() => toggleSection("payrollExpenses")}
          >
            {expandedSections.payrollExpenses ? (
              <ChevronDown className="mr-1 h-4 w-4" />
            ) : (
              <ChevronRight className="mr-1 h-4 w-4" />
            )}
            Payroll Expenses
          </div>
          {expandedSections.payrollExpenses && (
            <div className="mb-2">
              {isLoading && currentFetchingSection.current === "payrollExpenses" ? (
                <div className="flex justify-center py-4">
                  <LogoLoader size={50} color="#16151c" />
                </div>
              ) : (
                <>
                  {sectionData.payrollExpenses.map((item) => (
                    <div key={item.uid} className="grid grid-cols-12 py-1">
                      <div className="col-span-9 pl-6">{item.title}</div>
                      <div className="col-span-3 text-right">
                        {formatCurrency(item.opening_balance)}
                      </div>
                    </div>
                  ))}
                  {overviewData && (
                    <div className="grid grid-cols-12 border-t py-1 font-semibold">
                      <div className="col-span-9">Total Payroll Expenses</div>
                      <div className="col-span-3 text-right">
                        ${formatCurrency(overviewData.total_payroll_expense_cao)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Company Contributions */}
        <div className="mb-2 border-b">
          <div
            className="flex cursor-pointer items-center py-2 font-medium hover:bg-gray-50"
            onClick={() => toggleSection("companyContributions")}
          >
            {expandedSections.companyContributions ? (
              <ChevronDown className="mr-1 h-4 w-4" />
            ) : (
              <ChevronRight className="mr-1 h-4 w-4" />
            )}
            Company Contributions
          </div>
          {expandedSections.companyContributions && (
            <div className="mb-2">
              {isLoading && currentFetchingSection.current === "companyContributions" ? (
                <div className="flex justify-center py-4">
                  <LogoLoader size={50} color="#16151c" />
                </div>
              ) : (
                <>
                  {sectionData.companyContributions.map((item) => (
                    <div key={item.uid} className="grid grid-cols-12 py-1">
                      <div className="col-span-9 pl-6">{item.title}</div>
                      <div className="col-span-3 text-right">
                        {formatCurrency(item.opening_balance)}
                      </div>
                    </div>
                  ))}
                  {overviewData && (
                    <div className="grid grid-cols-12 border-t py-1 font-semibold">
                      <div className="col-span-9">Total Company Contributions</div>
                      <div className="col-span-3 text-right">
                        ${formatCurrency(overviewData.total_company_contribution_cao)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Payroll Liabilities */}
        <div className="mb-2 border-b">
          <div
            className="flex cursor-pointer items-center py-2 font-medium hover:bg-gray-50"
            onClick={() => toggleSection("payrollLiabilities")}
          >
            {expandedSections.payrollLiabilities ? (
              <ChevronDown className="mr-1 h-4 w-4" />
            ) : (
              <ChevronRight className="mr-1 h-4 w-4" />
            )}
            Payroll Liabilities
          </div>
          {expandedSections.payrollLiabilities && (
            <div className="mb-2">
              {isLoading && currentFetchingSection.current === "payrollLiabilities" ? (
                <div className="flex justify-center py-4">
                  <LogoLoader size={50} color="#16151c" />
                </div>
              ) : (
                <>
                  {sectionData.payrollLiabilities.map((item) => (
                    <div key={item.uid} className="grid grid-cols-12 py-1">
                      <div className="col-span-9 pl-6">{item.title}</div>
                      <div className="col-span-3 text-right">
                        {formatCurrency(item.opening_balance)}
                      </div>
                    </div>
                  ))}
                  {overviewData && (
                    <div className="grid grid-cols-12 border-t py-1 font-semibold">
                      <div className="col-span-9">Total Payroll Liabilities</div>
                      <div className="col-span-3 text-right">
                        ${formatCurrency(overviewData.total_payroll_liabilities_cao)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
