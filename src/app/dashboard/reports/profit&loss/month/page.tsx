'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Printer } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchProfitLoss } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import ReportFilter2 from '../../_components/filter2';
import LogoLoader from '@/components/MainLoader/logo-loader';

interface ReportItem {
  uid: string;
  title: string;
  opening_balance: string;
  created_at: string;
  updated_at: string;
}

interface OverviewData {
  total_income: number;
  total_cost_of_goods: number;
  total_gross_profit: number;
  total_expenses: number;
  total_net_operating_income: number;
  total_other_income: number;
  total_other_expenses: number;
  total_net_other_income: number;
  total_net_income: number;
}

const ProfitLossReport = () => {
  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    income: true,
    costOfGoodsSold: false,
    expenses: false,
    otherIncome: false,
    otherExpenses: false,
  });

  // State to store section data
  const [sectionData, setSectionData] = useState<Record<string, ReportItem[]>>({
    income: [],
    costOfGoodsSold: [],
    expenses: [],
    otherIncome: [],
    otherExpenses: [],
  });

  // State for overview data
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);

  // State for filter parameters
  const [filterParams, setFilterParams] = useState({
    start_date: '',
    end_date: '',
  });

  // Track current section being fetched
  const currentFetchingSection = useRef<string | null>(null);

  // Map of section names to their query parameters
  const sectionQueryParams = {
    income: { kind: 'INCOMES' },
    costOfGoodsSold: { account_type__title: 'Cost of Goods Sold (COGS)' },
    expenses: { kind: 'EXPENSES' },
    otherIncome: { account_type__title: 'Other Income' },
    otherExpenses: { account_type__title: 'Other Expenses' },
  };

  const { Company } = useAppSelector((state) => state.CompanyData);

  // Fetch overview data
  const { data: overviewResponse, isLoading: isOverviewLoading } = useFetch(
    ['profit_loss_overview', filterParams],
    () =>
      fetchProfitLoss({
        keywords: 'overview',
        start_date: filterParams.start_date,
        end_date: filterParams.end_date,
      })
  );

  // Fetch section data
  const {
    data: sectionResponse,
    isLoading: isSectionLoading,
    setQueryParams,
  } = useFetch(['profit_loss_section'], fetchProfitLoss);

  // Initialize with income data
  useEffect(() => {
    if (expandedSections.income && filterParams.start_date && filterParams.end_date) {
      currentFetchingSection.current = 'income';
      setQueryParams(
        {
          ...sectionQueryParams.income,
          start_date: filterParams.start_date,
          end_date: filterParams.end_date,
        },
        true
      );
    }
  }, [filterParams]);

  // Process overview data
  useEffect(() => {
    if (overviewResponse) {
      setOverviewData(overviewResponse as unknown as OverviewData);
    }
  }, [overviewResponse]);

  // Process section data
  useEffect(() => {
    if (sectionResponse && sectionResponse.results && currentFetchingSection.current) {
      // Use the tracked section reference to update the correct section
      const section = currentFetchingSection.current;

      setSectionData((prev) => ({
        ...prev,
        [section]: sectionResponse.results,
      }));

      // Reset the current fetching section
      currentFetchingSection.current = null;
    }
  }, [sectionResponse]);

  // Toggle section expansion and fetch data if needed
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newState = {
        ...prev,
        [section]: !prev[section],
      };

      // If we're opening a section and it doesn't have data yet, fetch it
      if (newState[section] && (sectionData[section].length === 0 || filterParams.start_date)) {
        // Set the current fetching section before making the API call
        currentFetchingSection.current = section;

        // Set the appropriate query parameters based on the section
        // Include both section-specific params and date filter params
        setQueryParams(
          {
            ...sectionQueryParams[section as keyof typeof sectionQueryParams],
            start_date: filterParams.start_date,
            end_date: filterParams.end_date,
          },
          true
        );
      }

      return newState;
    });
  };

  // Format currency
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
    const absAmount = Math.abs(numAmount);
    const formatted = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return numAmount < 0 ? `-${formatted}` : formatted;
  };

  // Print report functionality
  const printReport = () => {
    window.print();
  };

  const isLoading = isOverviewLoading || isSectionLoading;

  return (
    <div>
      {/* Report Filter */}
      <ReportFilter2
        OnPdfClick={printReport}
        defaultRange="this_month"
        params={filterParams}
        setParams={setFilterParams}
        onFilterChange={() => {
          // Reset section data when filters change
          setSectionData({
            income: [],
            costOfGoodsSold: [],
            expenses: [],
            otherIncome: [],
            otherExpenses: [],
          });

          // Keep income expanded, collapse others
          setExpandedSections({
            income: true,
            costOfGoodsSold: false,
            expenses: false,
            otherIncome: false,
            otherExpenses: false,
          });

          // Fetch income data with new filters
          if (expandedSections.income) {
            currentFetchingSection.current = 'income';
            setQueryParams(
              {
                ...sectionQueryParams.income,
                start_date: filterParams.start_date,
                end_date: filterParams.end_date,
              },
              true
            );
          }
        }}
      />

      <div id="report-content" className="mx-auto rounded border bg-white/40 p-4 py-7 text-sm">
        {/* Report Header */}
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h2 className="mb-1 text-xl">
            {Company?.name || 'Binary Burst '} {'  '}
          </h2>
          <h2 className="text-xl">Profit and Loss</h2>
          <p className="text-gray-600">All Dates</p>
        </div>

        {/* Report Table */}
        <div className="w-full">
          {/* Header Row */}
          <div className="mb-1 border-b border-t border-gray-300 bg-white/60 py-2">
            <div className="grid grid-cols-12">
              <div className="col-span-9"></div>
              <div className="col-span-3 bg-gray-100 px-2 py-1 text-right font-semibold">TOTAL</div>
            </div>
          </div>

          {/* Income Section */}
          <div className="mb-2 border-b border-gray-200 bg-white/60">
            <div
              className="flex cursor-pointer items-center py-2 font-medium hover:bg-gray-50"
              onClick={() => toggleSection('income')}
            >
              {expandedSections.income ? (
                <ChevronDown className="mr-1 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-1 h-4 w-4" />
              )}
              Income
            </div>

            {expandedSections.income && (
              <div className="mb-2">
                {isSectionLoading && currentFetchingSection.current === 'income' ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
                  </div>
                ) : (
                  <>
                    {sectionData.income.map((item) => (
                      <div key={item.uid} className="grid grid-cols-12 py-1">
                        <div className="col-span-9 pl-6">{item.title}</div>
                        <div className="col-span-3 text-right">
                          {formatCurrency(item.opening_balance)}
                        </div>
                      </div>
                    ))}
                    {overviewData && (
                      <div className="grid grid-cols-12 border-t border-gray-200 py-1">
                        <div className="col-span-9 font-semibold">Total Income</div>
                        <div className="col-span-3 text-right font-semibold">
                          ${formatCurrency(overviewData.total_income)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cost of Goods Sold Section */}
          <div className="mb-2 border-b border-gray-200 bg-white/60">
            <div
              className="flex cursor-pointer items-center py-2 font-medium hover:bg-gray-50"
              onClick={() => toggleSection('costOfGoodsSold')}
            >
              {expandedSections.costOfGoodsSold ? (
                <ChevronDown className="mr-1 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-1 h-4 w-4" />
              )}
              Cost of Goods Sold
            </div>

            {expandedSections.costOfGoodsSold && (
              <div className="mb-2">
                {isSectionLoading && currentFetchingSection.current === 'costOfGoodsSold' ? (
                  <div className="my-4 flex items-center justify-center">
                    <LogoLoader size={50} color={'#16151c'} />
                  </div>
                ) : (
                  <>
                    {sectionData.costOfGoodsSold.map((item) => (
                      <div key={item.uid} className="grid grid-cols-12 py-1">
                        <div className="col-span-9 pl-6">{item.title}</div>
                        <div className="col-span-3 text-right">
                          {formatCurrency(item.opening_balance)}
                        </div>
                      </div>
                    ))}
                    {overviewData && (
                      <div className="grid grid-cols-12 border-t border-gray-200 py-1">
                        <div className="col-span-9 font-semibold">Total Cost of Goods Sold</div>
                        <div className="col-span-3 text-right font-semibold">
                          ${formatCurrency(overviewData.total_cost_of_goods)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Gross Profit */}
          {overviewData && (
            <div className="mb-2 border-b border-gray-200 bg-white/60 py-2">
              <div className="grid grid-cols-12">
                <div className="col-span-9 font-semibold">GROSS PROFIT</div>
                <div className="col-span-3 text-right font-semibold">
                  ${formatCurrency(overviewData.total_gross_profit)}
                </div>
              </div>
            </div>
          )}

          {/* Expenses Section */}
          <div className="mb-2 border-b border-gray-200 bg-white/60">
            <div
              className="flex cursor-pointer items-center py-2 font-medium hover:bg-gray-50"
              onClick={() => toggleSection('expenses')}
            >
              {expandedSections.expenses ? (
                <ChevronDown className="mr-1 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-1 h-4 w-4" />
              )}
              Expenses
            </div>

            {expandedSections.expenses && (
              <div className="mb-2">
                {isSectionLoading && currentFetchingSection.current === 'expenses' ? (
                  <div className="my-4 flex items-center justify-center">
                    <LogoLoader size={50} color={'#16151c'} />
                  </div>
                ) : (
                  <>
                    {sectionData.expenses.map((item) => (
                      <div key={item.uid} className="grid grid-cols-12 py-1">
                        <div className="col-span-9 pl-6">{item.title}</div>
                        <div className="col-span-3 text-right">
                          {formatCurrency(item.opening_balance)}
                        </div>
                      </div>
                    ))}
                    {overviewData && (
                      <div className="grid grid-cols-12 border-t border-gray-200 py-1">
                        <div className="col-span-9 font-semibold">Total Expenses</div>
                        <div className="col-span-3 text-right font-semibold">
                          ${formatCurrency(overviewData.total_expenses)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Net Operating Income */}
          {overviewData && (
            <div className="mb-2 border-b border-gray-200 bg-white/60 py-2">
              <div className="grid grid-cols-12">
                <div className="col-span-9 font-semibold">NET OPERATING INCOME</div>
                <div className="col-span-3 text-right font-semibold">
                  ${formatCurrency(overviewData.total_net_operating_income)}
                </div>
              </div>
            </div>
          )}

          {/* Other Income Section */}
          <div className="mb-2 border-b border-gray-200 bg-white/60">
            <div
              className="flex cursor-pointer items-center py-2 font-medium hover:bg-gray-50"
              onClick={() => toggleSection('otherIncome')}
            >
              {expandedSections.otherIncome ? (
                <ChevronDown className="mr-1 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-1 h-4 w-4" />
              )}
              Other Income
            </div>

            {expandedSections.otherIncome && (
              <div className="mb-2">
                {isSectionLoading && currentFetchingSection.current === 'otherIncome' ? (
                  <div className="my-4 flex items-center justify-center">
                    <LogoLoader size={50} color={'#16151c'} />
                  </div>
                ) : (
                  <>
                    {sectionData.otherIncome.map((item) => (
                      <div key={item.uid} className="grid grid-cols-12 py-1">
                        <div className="col-span-9 pl-6">{item.title}</div>
                        <div className="col-span-3 text-right">
                          {formatCurrency(item.opening_balance)}
                        </div>
                      </div>
                    ))}
                    {overviewData && (
                      <div className="grid grid-cols-12 border-t border-gray-200 py-1">
                        <div className="col-span-9 font-semibold">Total Other Income</div>
                        <div className="col-span-3 text-right font-semibold">
                          ${formatCurrency(overviewData.total_other_income)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Other Expenses Section */}
          <div className="mb-2 border-b border-gray-200 bg-white/60">
            <div
              className="flex cursor-pointer items-center py-2 font-medium hover:bg-gray-50"
              onClick={() => toggleSection('otherExpenses')}
            >
              {expandedSections.otherExpenses ? (
                <ChevronDown className="mr-1 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-1 h-4 w-4" />
              )}
              Other Expenses
            </div>

            {expandedSections.otherExpenses && (
              <div className="mb-2">
                {isSectionLoading && currentFetchingSection.current === 'otherExpenses' ? (
                  <div className="my-4 flex items-center justify-center">
                    <LogoLoader size={50} color={'#16151c'} />
                  </div>
                ) : (
                  <>
                    {sectionData.otherExpenses.map((item) => (
                      <div key={item.uid} className="grid grid-cols-12 py-1">
                        <div className="col-span-9 pl-6">{item.title}</div>
                        <div className="col-span-3 text-right">
                          {formatCurrency(item.opening_balance)}
                        </div>
                      </div>
                    ))}
                    {overviewData && (
                      <div className="grid grid-cols-12 border-t border-gray-200 py-1">
                        <div className="col-span-9 font-semibold">Total Other Expenses</div>
                        <div className="col-span-3 text-right font-semibold">
                          ${formatCurrency(overviewData.total_other_expenses)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Net Other Income */}
          {overviewData && (
            <div className="mb-2 border-b border-gray-200 bg-white/60 py-2">
              <div className="grid grid-cols-12">
                <div className="col-span-9 font-semibold">NET OTHER INCOME</div>
                <div className="col-span-3 text-right font-semibold">
                  ${formatCurrency(overviewData.total_net_other_income)}
                </div>
              </div>
            </div>
          )}

          {/* Net Income */}
          {overviewData && (
            <div className="mb-2 border-b-2 border-t border-gray-800 bg-white/60 py-2">
              <div className="grid grid-cols-12">
                <div className="col-span-9 font-bold">NET INCOME</div>
                <div className="col-span-3 text-right font-bold">
                  ${formatCurrency(overviewData.total_net_income)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
