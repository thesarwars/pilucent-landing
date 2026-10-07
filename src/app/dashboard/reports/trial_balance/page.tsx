'use client';
import { fetchTrailBalance } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { useAppSelector } from '@/app/redux/store';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReportFilter from '../_components/filter';
import moment from 'moment';
import PrintPDF from '../_components/PrintPDF';
import LogoLoader from '@/components/MainLoader/logo-loader';

const TrialBalanceSheet = () => {
  // State for pagination and data handling
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLTableRowElement | null>(null);

  const { Company } = useAppSelector((state) => state.CompanyData);

  // Fetch trial balance data with pagination
  const { data, setQueryParams, isPending, params } = useFetch(
    ['trial_balance'],
    fetchTrailBalance
  );

  // For overview data if needed
  const { data: listData, isPending: isListPending } = useFetch(
    ['trial_balance_list'],
    (params: any) => fetchTrailBalance({ ...params, keywords: 'overview' })
  );

  // Function to fetch next page of data
  const fetchNextPage = useCallback(() => {
    if (isPending || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setQueryParams({ page: currentPage + 1 });
    setCurrentPage((prev) => prev + 1);
  }, [currentPage, isPending, isLoadingMore, hasMore, setQueryParams]);

  // Setup Intersection Observer for infinite scrolling
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (lastItemRef.current) {
      observerRef.current.observe(lastItemRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasMore]);

  // Process API data
  useEffect(() => {
    if (!data) return;

    setIsLoadingMore(false);

    try {
      if (data.next === null) {
        setHasMore(false);
      }

      let balanceItems: any[] = [];
      if (Array.isArray(data.results)) {
        balanceItems = data.results.map((item: any) => ({
          uid: item.uid,
          title: item.title,
          total_debit: item.total_debit,
          total_credit: item.total_credit,
        }));
      }

      // Merge new data with existing data
      let mergedItems: any[];
      if (currentPage === 1) {
        mergedItems = balanceItems;
      } else {
        const existingItemsMap = processedData.reduce(
          (acc, item) => {
            acc[item.uid] = item;
            return acc;
          },
          {} as Record<string, any>
        );

        mergedItems = [...processedData];
        balanceItems.forEach((newItem) => {
          if (!existingItemsMap[newItem.uid]) {
            mergedItems.push(newItem);
          }
        });
      }

      setProcessedData(mergedItems);
    } catch (error) {
      console.error('Error processing trial balance data:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Format number to show commas and decimal places
  const formatNumber = (value: any) => {
    if (!value || value === '0' || value === '0.000') return '0';
    const num = parseFloat(value);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!processedData || processedData.length === 0) return { totalDebit: 0, totalCredit: 0 };

    return processedData.reduce(
      (acc: any, item: any) => {
        const debit = parseFloat(item.total_debit) || 0;
        const credit = parseFloat(item.total_credit) || 0;

        acc.totalDebit += debit;
        acc.totalCredit += credit;

        return acc;
      },
      { totalDebit: 0, totalCredit: 0 }
    );
  };

  const totals = calculateTotals();

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('report-content')?.innerHTML;

    // Get all styles from the main document
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch (error) {
          return ''; // Ignore cross-origin stylesheets
        }
      })
      .join('\n');

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <style>${styles}</style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // printWindow.close();
      };
    }
  };

  return (
    <div>
      <div className="mx-auto p-2">
        <ReportFilter
          pdfFn={fetchTrailBalance}
          defaultRange="this_month"
          params={{
            created_at_after: moment().startOf('week').format('YYYY-MM-DD'),
            created_at_before: moment().endOf('week').format('YYYY-MM-DD'),
          }}
          setParams={setQueryParams}
          onFilterChange={() => {
            setCurrentPage(1);
            setProcessedData([]);
            setHasMore(true);
          }}
        />

        <div id="report-content" className="mt-4 rounded border bg-white/40 p-4 py-7 text-[15px]">
          {/* Header Section */}
          <div className="mb-4 border-b border-accent_soft_black  pb-4 text-center">
            <h1 className="mb-2 text-3xl font-bold">Trial Balance</h1>
            <h2 className="mb-1 text-xl">
              {Company?.name || 'Binary Burst '} {'  '}
            </h2>
            <p className="text-gray-600">As of {new Date().toLocaleDateString()}</p>
          </div>

          {/* Loading State - Only show for initial load */}
          {isPending && currentPage === 1 && (
            <div className="py-4 text-center">
              <div className="flex items-center justify-center">
                <LogoLoader size={50} color={'#16151c '} />
              </div>
            </div>
          )}

          {/* Table Section */}
          {(!isPending || currentPage > 1) && (
            <div className="overflow-x-auto bg-white/60">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b px-4 py-2 text-left">FULL NAME</th>
                    <th className="border-b px-4 py-2 text-right">DEBIT</th>
                    <th className="border-b px-4 py-2 text-right">CREDIT</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.length > 0
                    ? processedData.map((item: any, index: number) => {
                        const debit = parseFloat(item.total_debit) || 0;
                        const credit = parseFloat(item.total_credit) || 0;

                        // Add ref to the last item for intersection observer
                        const isLastItem = index === processedData.length - 1;

                        return (
                          <tr
                            key={item.uid || index}
                            className="hover:bg-gray-50"
                            ref={isLastItem ? lastItemRef : null}
                          >
                            <td className="border-b px-4 py-2">{item.title}</td>
                            <td className="border-b px-4 py-2 text-right">
                              {debit > 0 ? formatNumber(item.total_debit) : ''}
                            </td>
                            <td className="border-b px-4 py-2 text-right">
                              {credit > 0 ? formatNumber(item.total_credit) : ''}
                            </td>
                          </tr>
                        );
                      })
                    : !isPending && (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                            No trial balance data found
                          </td>
                        </tr>
                      )}

                  {/* Loading indicator for next page */}
                  {isLoadingMore && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <LogoLoader size={50} color={'#16151c '} />
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border-b px-4 py-2 text-left">TOTAL</td>
                    <td className="border-b px-4 py-2 text-right">
                      ${listData?.total_debit.toFixed(2)}
                    </td>
                    <td className="border-b px-4 py-2 text-right">
                      ${listData?.total_credit.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrialBalanceSheet;
