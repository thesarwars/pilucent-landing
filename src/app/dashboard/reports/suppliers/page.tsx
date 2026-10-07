'use client';
import { fetchSuppliers } from '@/app/helpers/backend';
import { useCustomFetch, useFetch } from '@/app/helpers/hooks';
import { useAppSelector } from '@/app/redux/store';
import React, { useState, useEffect, useMemo } from 'react';
import ReportFilter from '../_components/filter';

interface AccountType {
  slug: string;
  title: string;
  description: string;
  status: string;
  kind: string;
}

interface Account {
  uid: string;
  mobile_number: string;
  date: string;
  display_name: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  is_fixed: boolean;
  created_at: string;
  updated_at: string;
  address: {
    full_address: string;
    city: string;
    country: string;
  };
  account_number: string;
}

const Page = () => {
  const [processedData, setProcessedData] = useState<Account[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { Company } = useAppSelector((state) => state.CompanyData);

  const { data, setQueryParams, isPending, params } = useCustomFetch(fetchSuppliers);

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
    console.log(data);
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

  return (
    <div className="mx-auto p-4">
      <ReportFilter
        params={params}
        setParams={setQueryParams}
        onFilterChange={handleFilterChange}
      />
      <button
        onClick={printReport}
        className="float-end mt-4 rounded-lg bg-gray-400 px-6 py-2 text-sm font-semibold text-white"
      >
        Print
      </button>
      <div id="report-content" className="rounded border bg-white/40 px-4 py-7 text-sm font-light">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Suppliers Contact List</h1>
          <h2 className="mb-1 text-xl">{Company?.name || 'Binary Burst'}</h2>
          <p className="text-gray-600">As of {new Date().toLocaleDateString()}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white/60">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b px-4 py-2 text-left">Supplier</th>
                <th className="border-b px-4 py-2 text-left">Phone Number</th>
                <th className="border-b px-4 py-2 text-left">Email</th>
                <th className="border-b px-4 py-2 text-left">Full Name</th>
                <th className="border-b px-4 py-2 text-right">Billing Address</th>
                <th className="border-b px-4 py-2 text-right">Account</th>
              </tr>
            </thead>
            <tbody>
              {isPending && processedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : processedData.length > 0 ? (
                <>
                  {processedData.map((account, idx) => (
                    <tr key={account?.uid} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-2">{account?.display_name || '-'}</td>
                      <td className="border-b px-4 py-2">{account?.mobile_number || '-'}</td>
                      <td className="border-b px-4 py-2">{account?.email || '-'}</td>
                      <td className="border-b px-4 py-2">
                        {account?.first_name} {account?.middle_name} {account?.last_name}
                      </td>
                      <td className="border-b px-4 py-2 text-right">
                        {account?.address.full_address} {account?.address.city}{' '}
                        {account?.address.country}
                      </td>
                      <td className="border-b px-4 py-2">{account?.account_number || '-'}</td>
                    </tr>
                  ))}
                </>
              ) : (
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
