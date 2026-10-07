'use client';

import { fetchCashFlow } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';
import ReportFilter from '../_components/filter';
import LogoLoader from '@/components/MainLoader/logo-loader';

interface OverviewData {
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  net_income: number;
  total_adjustments: number;
  net_cash_operating: number;
  net_cash_financing: number;
  net_cash_increase: number;
  cash_at_end: number;
}

interface AccountItem {
  uid: string;
  title: string;
  opening_balance: string;
  kind: 'ASSETS' | 'LIABILITIES' | 'EQUITIES';
  created_at: string;
  updated_at: string;
}

const Page = () => {
  const [openSections, setOpenSections] = useState({
    operating: true,
    operatingAdjustments: true,
    financing: false,
  });
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [params, setParams] = useState({});

  const { Company } = useAppSelector((state) => state.CompanyData);

  // State for data with pagination
  const [assetsData, setAssetsData] = useState<AccountItem[]>([]);
  const [liabilitiesData, setLiabilitiesData] = useState<AccountItem[]>([]);
  const [equitiesData, setEquitiesData] = useState<AccountItem[]>([]);

  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Observer for infinite scrolling
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastEquityItemRef = useRef<HTMLDivElement | null>(null);
  const lastLiabilityItemRef = useRef<HTMLDivElement | null>(null);
  const lastAssetItemRef = useRef<HTMLDivElement | null>(null);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => {
      const newState = {
        ...prev,
        [section]: !prev[section],
      };

      // If we're opening the financing section for the first time, reset pagination
      if (section === 'financing' && !prev.financing && newState.financing) {
        setPage(1);
        setEquitiesData([]);
      }

      return newState;
    });
  };

  // Fetch overview data
  const { data: overviewResponse, isPending: isOverviewPending } = useQuery({
    queryKey: ['cash_flow_overview', params],
    queryFn: () => fetchCashFlow({ keywords: 'overview', ...params }),
    refetchOnWindowFocus: false,
  });

  // Fetch all items with pagination
  const { data, isPending: isItemsPending } = useQuery({
    queryKey: ['cash_flow_items', page, params, openSections],
    queryFn: () => {
      // Only fetch financing data if that section is open
      if (openSections.financing) {
        return fetchCashFlow({ page, ...params });
      } else {
        // Only fetch operating data
        return fetchCashFlow({ page, section: 'operating', ...params });
      }
    },
    refetchOnWindowFocus: false,
  });

  // Function to fetch the next page of data
  const fetchNextPage = useCallback(() => {
    if (isItemsPending || !hasMore) return;
    setPage((prev) => prev + 1);
  }, [page, isItemsPending, hasMore]);

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

    const observeLastElements = () => {
      if (lastEquityItemRef.current) {
        observerRef.current?.observe(lastEquityItemRef.current);
      }
      if (lastLiabilityItemRef.current) {
        observerRef.current?.observe(lastLiabilityItemRef.current);
      }
      if (lastAssetItemRef.current) {
        observerRef.current?.observe(lastAssetItemRef.current);
      }
    };

    observeLastElements();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasMore, equitiesData, liabilitiesData, assetsData]);

  // Process overview data
  useEffect(() => {
    if (overviewResponse) {
      setOverviewData(overviewResponse as OverviewData);
    }
  }, [overviewResponse]);

  // Process items data with pagination
  useEffect(() => {
    if (data) {
      if (data.next === null) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      // Process the results
      if (Array.isArray(data.results)) {
        const newItems = data.results as AccountItem[];

        // Sort items by kind
        const assets: AccountItem[] = [];
        const liabilities: AccountItem[] = [];
        const equities: AccountItem[] = [];

        newItems.forEach((item) => {
          switch (item.kind) {
            case 'ASSETS':
              assets.push(item);
              break;
            case 'LIABILITIES':
              liabilities.push(item);
              break;
            case 'EQUITIES':
              equities.push(item);
              break;
          }
        });

        // Only update the data for sections that are open
        if (page === 1) {
          if (openSections.operatingAdjustments) {
            setAssetsData(assets);
            setLiabilitiesData(liabilities);
          }
          if (openSections.financing) {
            setEquitiesData(equities);
          }
        } else {
          // Create maps for existing items to avoid duplicates
          if (openSections.operatingAdjustments) {
            const existingAssetsMap = assetsData.reduce(
              (acc, item) => {
                acc[item.uid] = true;
                return acc;
              },
              {} as Record<string, boolean>
            );

            const existingLiabilitiesMap = liabilitiesData.reduce(
              (acc, item) => {
                acc[item.uid] = true;
                return acc;
              },
              {} as Record<string, boolean>
            );

            // Add only new items
            setAssetsData((prev) => [
              ...prev,
              ...assets.filter((item) => !existingAssetsMap[item.uid]),
            ]);

            setLiabilitiesData((prev) => [
              ...prev,
              ...liabilities.filter((item) => !existingLiabilitiesMap[item.uid]),
            ]);
          }

          if (openSections.financing) {
            const existingEquitiesMap = equitiesData.reduce(
              (acc, item) => {
                acc[item.uid] = true;
                return acc;
              },
              {} as Record<string, boolean>
            );

            setEquitiesData((prev) => [
              ...prev,
              ...equities.filter((item) => !existingEquitiesMap[item.uid]),
            ]);
          }
        }
      }
    }
  }, [data, page, openSections]);

  const isLoading = isOverviewPending || (isItemsPending && page === 1);

  // Print Report functionality
  const printReport = () => {
    const printContent = document.getElementById('report-content')?.innerHTML;
    const printWindow = window.open('', '_blank');

    if (printWindow && printContent) {
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n');
          } catch {
            return '';
          }
        })
        .join('\n');

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
    <div className="">
      <ReportFilter
        OnPdfClick={printReport}
        params={params}
        setParams={setParams}
        onFilterChange={() => {
          setPage(1);
          setAssetsData([]);
          setLiabilitiesData([]);
          setEquitiesData([]);
          setHasMore(true);
        }}
      />

      <div id="report-content" className="rounded border bg-white/40 p-4 py-7 text-sm">
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="text-xl font-semibold text-gray-800">Statement of Cash Flows</h1>
          <h2 className="mb-1 text-xl">
            {Company?.name || 'Binary Burst '} {'  '}
          </h2>
          <p className="text-gray-600">As of {new Date().toLocaleDateString()}</p>
        </div>

        <div className="mb-1 grid grid-cols-12">
          <div className="col-span-9"></div>
          <div className="col-span-3 bg-gray-100 px-2 py-1 text-right font-semibold">TOTAL</div>
        </div>

        <div className="mb-4 border-t border-gray-300"></div>

        {isLoading ? (
          <div className="my-4 flex items-center justify-center">
            <LogoLoader size={50} color={'#16151c'} />
          </div>
        ) : (
          <>
            {/* OPERATING ACTIVITIES */}
            <div className="mb-2 bg-white/60">
              <div
                className="flex cursor-pointer items-center rounded p-1 font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => toggleSection('operating')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`mr-1 h-4 w-4 transition-transform ${openSections.operating ? 'rotate-0 transform' : '-rotate-90 transform'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                OPERATING ACTIVITIES
              </div>

              {openSections.operating && (
                <>
                  <div className="grid grid-cols-12 py-1">
                    <div className="col-span-9 pl-6">Net Income</div>
                    <div className="col-span-3 text-right">
                      {overviewData?.net_income?.toFixed(2)}
                    </div>
                  </div>

                  <div className="py-1">
                    <div
                      className="flex cursor-pointer items-center rounded p-1 pl-4 text-gray-700 hover:bg-gray-50"
                      onClick={() => toggleSection('operatingAdjustments')}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`mr-1 h-4 w-4 transition-transform ${openSections.operatingAdjustments ? 'rotate-0 transform' : '-rotate-90 transform'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Adjustments to reconcile Net Income to Net Cash provided...
                    </div>

                    {openSections.operatingAdjustments && (
                      <>
                        {/* Display Assets items with observer ref on last item */}
                        {assetsData.map((item, index) => (
                          <div
                            key={item.uid}
                            className="grid grid-cols-12 py-1"
                            ref={index === assetsData.length - 1 ? lastAssetItemRef : null}
                          >
                            <div className="col-span-9 pl-10">{item.title}</div>
                            <div className="col-span-3 text-right">
                              {Number.parseFloat(item.opening_balance).toFixed(2)}
                            </div>
                          </div>
                        ))}

                        {/* Display Liabilities items with observer ref on last item */}
                        {liabilitiesData.map((item, index) => (
                          <div
                            key={item.uid}
                            className="grid grid-cols-12 py-1"
                            ref={index === liabilitiesData.length - 1 ? lastLiabilityItemRef : null}
                          >
                            <div className="col-span-9 pl-10">{item.title}</div>
                            <div className="col-span-3 text-right">
                              {Number.parseFloat(item.opening_balance).toFixed(2)}
                            </div>
                          </div>
                        ))}

                        {/* Loading more indicator */}
                        {isItemsPending && page > 1 && (
                          <div className="grid grid-cols-12 py-2">
                            <div className="col-span-12 text-center">
                              <div className="my-4 flex items-center justify-center">
                                <LogoLoader size={50} color={'#16151c'} />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-12 border-t border-gray-200 py-1">
                    <div className="col-span-9 pl-6">
                      Total Adjustments to reconcile Net Income to Net Cash...
                    </div>
                    <div className="col-span-3 text-right">
                      {overviewData?.total_adjustments?.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-t border-gray-200 py-1">
                    <div className="col-span-9 pl-4 font-medium">
                      Net cash provided by operating activities
                    </div>
                    <div className="col-span-3 text-right font-medium">
                      $ {overviewData?.net_cash_operating?.toFixed(2)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* FINANCING ACTIVITIES */}
            <div className="mb-2 bg-white/60">
              <div
                className="flex cursor-pointer items-center rounded p-1 font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => toggleSection('financing')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`mr-1 h-4 w-4 transition-transform ${openSections.financing ? 'rotate-0 transform' : '-rotate-90 transform'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                FINANCING ACTIVITIES
              </div>

              {openSections.financing && (
                <>
                  {/* Display Equities items with observer ref on last item */}
                  {equitiesData.map((item, index) => (
                    <div
                      key={item.uid}
                      className="grid grid-cols-12 py-1"
                      ref={index === equitiesData.length - 1 ? lastEquityItemRef : null}
                    >
                      <div className="col-span-9 pl-6">{item.title}</div>
                      <div className="col-span-3 text-right">
                        {Number.parseFloat(item.opening_balance).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-12 border-t border-gray-200 py-1">
                    <div className="col-span-9 pl-4 font-medium">
                      Net cash provided by financing activities
                    </div>
                    <div className="col-span-3 text-right font-medium">
                      $ {overviewData?.net_cash_financing?.toFixed(2)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* SUMMARY */}
            <div className="mb-2 bg-white/60">
              <div className="grid grid-cols-12 border-t border-gray-200 py-1">
                <div className="col-span-9 pl-4 font-medium">NET CASH INCREASE FOR PERIOD</div>
                <div className="col-span-3 text-right font-medium">
                  $ {overviewData?.net_cash_increase?.toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-12 border-t border-gray-200 py-1">
                <div className="col-span-9 pl-4 font-medium">CASH AT END OF PERIOD</div>
                <div className="col-span-3 text-right font-medium">
                  $ {overviewData?.cash_at_end?.toFixed(2)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
