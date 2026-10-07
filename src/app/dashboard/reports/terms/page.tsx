'use client';
import { fetchTerms } from '@/app/helpers/backend';
import { useCustomFetch, useFetch } from '@/app/helpers/hooks';
import { useAppSelector } from '@/app/redux/store';
import React, { useState, useEffect, useMemo } from 'react';
import ReportFilter from '../_components/filter';
import moment from 'moment';
import LogoLoader from '@/components/MainLoader/logo-loader';

interface Term {
  uid?: string;
  title?: string;
  days?: number;
  is_active?: boolean;
  status?: string;
}

const Page = () => {
  const [processedData, setProcessedData] = useState<Term[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { Company } = useAppSelector((state) => state.CompanyData);

  const { data, setQueryParams, isPending, params } = useCustomFetch(fetchTerms);

  useEffect(() => {
    if (!data) return;

    setProcessedData((prev) => {
      const newData = data?.results || [];
      const existingIds = new Set(prev.map((item) => item?.uid));
      const filteredNewData = newData.filter((item: any) => !existingIds.has(item?.uid));
      return [...prev, ...filteredNewData];
    });

    if (data?.next && hasMore && !isPending) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      setQueryParams({ ...params, page: nextPage });
    } else {
      setHasMore(false);
    }
  }, [data]);

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
            return Array.from(styleSheet?.cssRules || [])
              .map((rule) => rule?.cssText)
              .join('\n');
          } catch {
            return '';
          }
        })
        .join('\n');

      printWindow.document.write(`
        <html>
          <head>
            <title>Terms Report</title>
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

  const activeTermsCount = useMemo(() => {
    return processedData.filter((term) => term?.is_active).length;
  }, [processedData]);

  return (
    <div className="mx-auto p-4">
      <ReportFilter
        OnPdfClick={printReport}
        params={params}
        setParams={setQueryParams}
        onFilterChange={handleFilterChange}
      />

      <div id="report-content" className="rounded border bg-white/40 p-4 py-7 text-sm font-light">
        <div className="mb-4 flex flex-col items-center border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-1 text-2xl font-bold">Terms Report</h1>
          <h2 className="mb-1">{Company?.name || 'Binary Burst'}</h2>
          <div className="mt-1 text-center text-sm text-gray-900">
            From{' '}
            {moment(new Date(params?.created_at_after || new Date().toLocaleDateString())).format(
              'DD MMMM, YYYY'
            )}{' '}
            to{' '}
            {moment(new Date(params?.created_at_before || new Date().toLocaleDateString())).format(
              'DD MMMM, YYYY'
            )}
          </div>
        </div>

        <div className="overflow-x-auto bg-white/60">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b px-4 py-2 text-left">Title</th>
                <th className="border-b px-4 py-2 text-left">Duration (Days)</th>
                <th className="border-b px-4 py-2 text-left">Status</th>
                <th className="border-b px-4 py-2 text-left">Active</th>
              </tr>
            </thead>
            <tbody>
              {isPending && processedData?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <div className="my-4 flex items-center justify-center">
                      <LogoLoader size={50} color={'#16151c'} />
                    </div>
                  </td>
                </tr>
              ) : processedData?.length > 0 ? (
                <>
                  {processedData?.map((term) => (
                    <tr key={term?.uid || Math.random()} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-2">{term?.title || '-'}</td>
                      <td className="border-b px-4 py-2">{term?.days?.toString() || '-'}</td>
                      <td className="border-b px-4 py-2">{term?.status || '-'}</td>
                      <td className="border-b px-4 py-2">{term?.is_active ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border-b px-4 py-2">Total Terms</td>
                    <td className="border-b px-4 py-2">{processedData?.length || '-'}</td>
                    <td className="border-b px-4 py-2">Active Terms</td>
                    <td className="border-b px-4 py-2">{activeTermsCount || '-'}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No terms found
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
