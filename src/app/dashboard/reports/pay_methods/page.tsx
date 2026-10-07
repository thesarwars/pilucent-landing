'use client';
import { fetchPaymentMethods } from '@/app/helpers/backend';
import { useCustomFetch, useFetch } from '@/app/helpers/hooks';
import { useAppSelector } from '@/app/redux/store';
import React, { useState, useEffect, useMemo } from 'react';
import ReportFilter from '../_components/filter';
import moment from 'moment';
import LogoLoader from '@/components/MainLoader/logo-loader';

interface PaymentMethod {
  uid: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Page = () => {
  const [processedData, setProcessedData] = useState<PaymentMethod[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { Company } = useAppSelector((state) => state.CompanyData);

  const { data, setQueryParams, isPending, params } = useCustomFetch(fetchPaymentMethods);

  // Handle background fetching of all pages
  useEffect(() => {
    if (!data) return;

    // Update processed data
    setProcessedData((prev) => {
      const newData = data.results || [];
      const existingIds = new Set(prev.map((item) => item.uid));
      const filteredNewData = newData.filter((item: any) => !existingIds.has(item.uid));
      return [...prev, ...filteredNewData];
    });

    // Check if there are more pages to fetch
    if (data.next && hasMore && !isPending) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      setQueryParams({ ...params, page: nextPage });
    } else {
      setHasMore(false);
    }
  }, [data]);

  // Reset pagination when filters change
  const handleFilterChange = () => {
    setProcessedData([]);
    setCurrentPage(1);
    setHasMore(true);
  };

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
            <title>Payment Methods Report</title>
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
    <div className="mx-auto p-4">
      <ReportFilter
        OnPdfClick={printReport}
        params={params}
        setParams={setQueryParams}
        onFilterChange={handleFilterChange}
      />

      <div id="report-content" className="rounded border bg-white/40 px-4 py-7 text-sm font-light">
        <div className="mb-4 flex flex-col justify-center border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-2xl font-bold">Payment Methods</h1>
          <h2 className="mb-1">{Company?.name || 'Binary Burst'}</h2>
          <div className="mt-1 text-center text-sm text-gray-900">
            From{' '}
            {moment(new Date(params?.created_at_after || new Date().toLocaleDateString())).format(
              'DD MMMM, YYYY'
            )}
            {'  '} to{' '}
            {moment(new Date(params?.created_at_before || new Date().toLocaleDateString())).format(
              'DD MMMM, YYYY'
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/60">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b px-4 py-2 text-left">Title</th>
                <th className="border-b px-4 py-2 text-left">Status</th>
                <th className="border-b px-4 py-2 text-left">Created At</th>
                <th className="border-b px-4 py-2 text-left">Updated At</th>
              </tr>
            </thead>
            <tbody>
              <>
                {processedData?.map((method) => (
                  <tr key={method.uid} className="hover:bg-gray-50">
                    <td className="border-b px-4 py-2">{method.title}</td>
                    <td className="border-b px-4 py-2">{method.status}</td>
                    <td className="border-b px-4 py-2">
                      {moment(method.created_at).format('DD MMMM, YYYY')}
                    </td>
                    <td className="border-b px-4 py-2">
                      {moment(method.updated_at).format('DD MMMM, YYYY')}
                    </td>
                  </tr>
                ))}
                {isPending && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <div className="my-4 flex items-center justify-center">
                        <LogoLoader size={50} color={'#16151c'} />
                      </div>
                    </td>
                  </tr>
                )}
              </>
              {!processedData.length && !isPending && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No payment methods found
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

export default Page;
