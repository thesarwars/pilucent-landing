'use client';
import { fetchAccounts } from '@/app/helpers/backend';
import { useCustomFetch, useFetch } from '@/app/helpers/hooks';
import { useAppSelector } from '@/app/redux/store';
import React, { useState, useEffect, useMemo } from 'react';
import ReportFilter from '../_components/filter';
import moment from 'moment';
import LogoLoader from '@/components/MainLoader/logo-loader';

interface AccountType {
  slug: string;
  title: string;
  description: string;
  status: string;
  kind: string;
}

interface Account {
  uid: string;
  title: string;
  date: string;
  code: string;
  status: string;
  kind: string;
  account_type: AccountType | null;
  detail_type: AccountType | null;
  opening_balance: string;
  currency: string;
  description: string;
  parent: {
    uid: string;
    title: string;
    code: string;
    kind: string;
    status: string;
  } | null;
  is_fixed: boolean;
  created_at: string;
  updated_at: string;
}

const Page = () => {
  const [processedData, setProcessedData] = useState<Account[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { Company } = useAppSelector((state) => state.CompanyData);

  const { data, setQueryParams, isPending, params } = useCustomFetch(fetchAccounts);

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
      console.log('Fetching more data...');
      // console.log("Processed Data:", currentPage, params);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      setQueryParams({ ...params, page: nextPage });
    } else {
      setHasMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Reset pagination when filters change
  const handleFilterChange = () => {
    setProcessedData([]);
    setCurrentPage(1);
    setHasMore(true);
    // setQueryParams({ ...newParams, page: 1 });
  };

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    return numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
            <title>Chart of Accounts</title>
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

  const totalBalance = useMemo(() => {
    return processedData.reduce((sum, account) => {
      return sum + Number.parseFloat(account.opening_balance || '0');
    }, 0);
  }, [processedData]);

  return (
    <div className="mx-auto p-4">
      <ReportFilter
        OnPdfClick={printReport}
        params={params}
        setParams={setQueryParams}
        onFilterChange={handleFilterChange}
      />

      <div id="report-content" className="rounded border bg-white/60 p-4 py-7 text-sm font-light">
        <div className="mb-4 flex flex-col justify-center border-b border-b-accent_soft_black pb-4 text-center font-poppins">
          <h1 className="mb-1 text-3xl font-bold">Chart of Accounts</h1>
          <h2 className="mb-1 text-sm">{Company?.name || 'Binary Burst'}</h2>
          <div className="mt-1 text-center text-sm">
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
          <table className="min-w-full border border-gray-200 bg-white/60">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b px-4 py-2 text-left">Code</th>
                <th className="border-b px-4 py-2 text-left">Title</th>
                <th className="border-b px-4 py-2 text-left">Type</th>
                <th className="border-b px-4 py-2 text-left">Detail Type</th>
                <th className="border-b px-4 py-2 text-right">Opening Balance</th>
              </tr>
            </thead>
            <tbody>
              <>
                {processedData?.map((account, idx) => (
                  <tr key={account.uid} className="hover:bg-gray-50">
                    <td className="border-b px-4 py-2">{account.code}</td>
                    <td className="border-b px-4 py-2">{account.title}</td>
                    <td className="border-b px-4 py-2">{account.account_type?.title || '-'}</td>
                    <td className="border-b px-4 py-2">{account.detail_type?.title || '-'}</td>
                    <td className="border-b px-4 py-2 text-right">
                      {formatAmount(account.opening_balance)}
                    </td>
                  </tr>
                ))}
                {isPending && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="flex items-center justify-center">
                        <LogoLoader size={50} color={'#16151c '} />
                      </div>
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border-b px-4 py-2"></td>
                  <td colSpan={2} className="border-t-2 px-4 py-2 text-right">
                    Total Balance:
                  </td>
                  <td colSpan={2} className="border-t-2 px-4 py-2 text-right">
                    {formatAmount(totalBalance.toString())}
                  </td>
                </tr>
              </>
              {!processedData.length && !isPending && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No accounts found
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
