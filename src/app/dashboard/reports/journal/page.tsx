'use client';

import { fetchJournals } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useAppSelector } from '@/app/redux/store';
import moment from 'moment';
import PDFModal from '../_components/PDFModal';
import Link from 'next/link';
import DownloadButton from '../_components/PDFDownloadButton';
import ReportFilter from '../_components/filter';
import LogoLoader from '@/components/MainLoader/logo-loader';

interface AccountData {
  uid: string;
  title: string;
  code: string;
  kind: string;
  status: string;
}

interface CustomerData {
  uid: string;
  currency: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  image: string | null;
  email: string;
  company_name: string;
  company_email: string;
}

interface SupplierData {
  uid: string;
  currency: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  image: string | null;
  display_name: string;
  company_name: string;
  opening_balance: string;
  total_credit: string;
}

interface JournalData {
  uid: string;
  date: string;
  amount: string;
  status: string;
  kind: string;
  is_journal_entry: boolean;
  is_transaction: boolean;
  created_at: string;
}

interface JournalEntryConnector {
  uid: string;
  debit: string;
  credit: string;
  kind: string;
  request_kind: string;
  account: AccountData;
  supplier: SupplierData | null;
  customer: CustomerData | null;
  warehose: any | null;
  tax: any | null;
  created_by: number | null;
  created_at: string;
}

interface JournalWithEntries {
  uid: string;
  date: string;
  amount: string;
  status: string;
  kind: string;
  is_journal_entry: boolean;
  is_transaction: boolean;
  created_at: string;
  journalentryconnector_set: JournalEntryConnector[];
  total_debit: number;
  total_credit: number;
}

const JournalReport = () => {
  const [expandedJournals, setExpandedJournals] = useState<Record<string, boolean>>({});
  const [processedData, setProcessedData] = useState<JournalWithEntries[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLTableRowElement | null>(null);
  const { Company } = useAppSelector((state) => state.CompanyData);
  const [isOpen, setIsOpen] = useState(false);

  // Modified useFetch to handle pagination and default to this_month
  const { data, setQueryParams, isPending, refetch, params } = useFetch(
    ['journals_report', 'journals'],
    fetchJournals
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

  // Handle filter changes
  const handleFilterChange = () => {
    // Reset pagination when filter changes
    // setProcessedData([]);
    setCurrentPage(1);
    setHasMore(true);
  };

  // Process API data into the format needed for display
  useEffect(() => {
    if (!data) return;

    setIsLoadingMore(false);

    try {
      if (data.next === null) {
        setHasMore(false);
      }

      let journalEntries: JournalWithEntries[] = [];
      if (Array.isArray(data.results)) {
        journalEntries = data.results.map((item: any) => ({
          uid: item.uid,
          date: item.date,
          amount: item.amount,
          status: item.status,
          kind: item.kind,
          is_journal_entry: item.is_journal_entry,
          is_transaction: item.is_transaction,
          created_at: item.created_at,
          journalentryconnector_set: item.journalentryconnector_set || [],
          total_debit: item.total_debit || 0,
          total_credit: item.total_credit || 0,
        }));
      }

      let mergedEntries: JournalWithEntries[];
      if (currentPage === 1) {
        mergedEntries = journalEntries;
      } else {
        const existingEntriesMap = processedData.reduce(
          (acc, entry) => {
            acc[entry.uid] = entry;
            return acc;
          },
          {} as Record<string, JournalWithEntries>
        );

        mergedEntries = [...processedData];
        journalEntries.forEach((newEntry) => {
          if (!existingEntriesMap[newEntry.uid]) {
            mergedEntries.push(newEntry);
          }
        });

        mergedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      setProcessedData(mergedEntries);

      // Initialize expanded state for new entries
      const newExpandedState = { ...expandedJournals };
      mergedEntries.forEach((journal) => {
        if (newExpandedState[journal.uid] === undefined) {
          newExpandedState[journal.uid] = true; // Default to expanded
        }
      });
      setExpandedJournals(newExpandedState);
    } catch (error) {
      console.error('Error processing journal data:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const toggleJournal = (uid: string) => {
    setExpandedJournals((prev) => ({
      ...prev,
      [uid]: !prev[uid],
    }));
  };

  const formatAmount = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
    if (numAmount === 0) return '-';
    return numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatKind = (kind: string) => {
    switch (kind) {
      case 'SALE_PAYMENT_RECEIVE':
        return 'Payment';
      case 'SALE':
        return 'Invoice';
      case 'PURCHASE':
        return 'Bill';
      case 'CHART_OF_ACCOUNT':
        return 'Deposit';
      case 'SALE_RECEPT':
        return 'Sale Receipt';
      default:
        return kind
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
    }
  };

  const getDisplayName = (customer: CustomerData | null, supplier: SupplierData | null) => {
    if (customer) {
      const { first_name, middle_name, last_name, company_name } = customer;
      return (
        company_name || `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}`.trim()
      );
    } else if (supplier) {
      const { first_name, last_name, company_name } = supplier;
      return company_name || `${first_name} ${last_name}`.trim();
    }
    return '-';
  };

  // Calculate grand totals
  const grandTotalDebit = processedData.reduce((sum, journal) => sum + journal.total_debit, 0);

  const grandTotalCredit = processedData.reduce((sum, journal) => sum + journal.total_credit, 0);

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

  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = now;
    return {
      start: startOfMonth.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      end: today.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  };

  const { start, end } = getCurrentMonthRange();

  return (
    <div className="">
      <ReportFilter
        OnPdfClick={() => setIsOpen(true)}
        setProcessedData={setProcessedData}
        defaultRange="this_month"
        onFilterChange={handleFilterChange}
        setParams={setQueryParams}
        params={params}
        refetch={refetch}
      />

      {/* Filter Section */}

      <div id="report-content" className="rounded border bg-white/40 p-4 py-7 text-sm">
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-3xl font-bold">Journal Report</h1>
          <h2 className="mb-1 text-xl">
            {Company?.name || 'Binary Burst '} {'  '}
          </h2>
          <div className="mt-2 text-center text-sm font-medium text-gray-900">
            {params?.created_at_after && params?.created_at_before ? (
              <p>
                From{' '}
                {moment(
                  new Date(params?.created_at_after || new Date().toLocaleDateString())
                ).format('DD MMMM, YYYY')}{' '}
                to{' '}
                {moment(
                  new Date(params?.created_at_before || new Date().toLocaleDateString())
                ).format('DD MMMM, YYYY')}
              </p>
            ) : (
              <p className="text-gray-600">As of {new Date().toLocaleDateString()}</p>
            )}
          </div>
        </div>
        {/* Table Section */}
        <div className="overflow-x-auto bg-white/60">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b px-4 py-2 text-left">Transaction date</th>
                <th className="border-b px-4 py-2 text-left">Transaction type</th>
                <th className="border-b px-4 py-2 text-left">Name</th>
                <th className="border-b px-4 py-2 text-left">Title</th>
                <th className="border-b px-4 py-2 text-right">Debit</th>
                <th className="border-b px-4 py-2 text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {isPending && currentPage === 1 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex items-center justify-center">
                      <LogoLoader size={50} color={'#16151c '} />
                    </div>
                  </td>
                </tr>
              ) : processedData.length > 0 ? (
                <>
                  {processedData.map((journal, journalIndex) => (
                    <React.Fragment key={journal.uid}>
                      {/* Journal Header - Add lastItemRef to the last journal header if it's the last item */}
                      <tr
                        className="cursor-pointer bg-gray-100 hover:bg-gray-200"
                        onClick={() => toggleJournal(journal.uid)}
                        ref={journalIndex === processedData.length - 1 ? lastItemRef : null}
                      >
                        <td colSpan={6} className="px-4 py-2 font-semibold">
                          <div className="flex items-center gap-2">
                            {expandedJournals[journal.uid] ? (
                              <FaChevronDown className="h-4 w-4" />
                            ) : (
                              <FaChevronRight className="h-4 w-4" />
                            )}
                            {formatDate(journal.date)} - ({journal.journalentryconnector_set.length}{' '}
                            )
                          </div>
                        </td>
                      </tr>

                      {/* Journal Entry Connectors */}
                      {expandedJournals[journal.uid] &&
                        journal.journalentryconnector_set.map((entry, entryIdx) => (
                          <tr key={`${journal.uid}-${entry.uid}`} className="hover:bg-gray-50">
                            <td className="border-b px-4 py-2">{formatDate(journal.date)}</td>
                            <td className="border-b px-4 py-2">{formatKind(journal.kind)}</td>
                            <td className="border-b px-4 py-2">
                              {getDisplayName(entry.customer, entry.supplier)}
                            </td>
                            <td className="border-b px-4 py-2">{entry.account.title || '-'}</td>
                            <td className="border-b px-4 py-2 text-right">
                              {formatAmount(entry.debit)}
                            </td>
                            <td className="border-b px-4 py-2 text-right">
                              {formatAmount(entry.credit)}
                            </td>
                          </tr>
                        ))}

                      {/* Journal Total */}
                      {expandedJournals[journal.uid] &&
                        journal.journalentryconnector_set.length > 0 && (
                          <tr className="bg-gray-50 font-medium">
                            <td colSpan={4} className="border-b px-4 py-2">
                              Total for this entry
                            </td>
                            <td className="border-b px-4 py-2 text-right">
                              {formatAmount(journal.total_debit)}
                            </td>
                            <td className="border-b px-4 py-2 text-right">
                              {formatAmount(journal.total_credit)}
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  ))}

                  {/* Loading indicator for next page */}
                  {isLoadingMore && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <LogoLoader size={50} color={'#16151c '} />
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Grand Total */}
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={4} className="border-b px-4 py-2">
                      TOTAL
                    </td>
                    <td className="border-b px-4 py-2 text-right">
                      ${formatAmount(grandTotalDebit)}
                    </td>
                    <td className="border-b px-4 py-2 text-right">
                      ${formatAmount(grandTotalCredit)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No journal entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <PDFModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Journal Report">
        <div className="mt-2 flex items-start gap-16 font-lexend">
          <div>
            <h1 className="mb-4 font-lexend text-2xl font-semibold">Print or save as PDF</h1>
            <p>
              To print, right-the preview and select Print. Or, click the Print icon if you see one
              below.
            </p>
            <div className="mt-12 flex items-center gap-8">
              {/* <a
                href="https://api.codetabs.com/v1/proxy?quest=https://pdfobject.com/pdf/sample.pdf"
                download="your-file.pdf"
                className="w-36 rounded-md border-2 border-accent_soft_blue px-4 py-2 text-center text-base font-semibold text-accent_soft_blue transition-colors hover:bg-accent_soft_blue hover:text-white active:scale-95"
              >
                Save as PDF
              </a> */}
              <DownloadButton pdfUrl="https://pdfobject.com/pdf/sample.pdf" filename="demo.pdf" />
              <Link
                target="_blank"
                href={`/view?href=https://pdfobject.com/pdf/sample.pdf&base_type=external`}
                className="w-36 rounded-md border-2 border-accent_soft_blue bg-accent_soft_blue px-4 py-2 text-center text-base font-semibold text-white transition-colors hover:bg-opacity-80 active:scale-95"
              >
                Print
              </Link>
            </div>
          </div>
          <div className="flex h-full flex-1 flex-col items-center justify-center">
            <iframe
              src="https://pdfobject.com/pdf/sample.pdf"
              className="h-[90vh] w-full max-w-full"
            />
          </div>
        </div>
      </PDFModal>
    </div>
  );
};

export default JournalReport;
