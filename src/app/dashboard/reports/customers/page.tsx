"use client";
import { fetchCustomers } from "@/app/helpers/backend";
import { useCustomFetch, useFetch } from "@/app/helpers/hooks";
import { useAppSelector } from "@/app/redux/store";
import React, { useState, useEffect, useMemo } from "react";
import ReportFilter from "../_components/filter";
import LogoLoader from "@/components/MainLoader/logo-loader";

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
  company_name: string;
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

  const { data, setQueryParams, isPending, params } =
    useCustomFetch(fetchCustomers);

  // Handle background fetching of all pages
  useEffect(() => {
    if (!data) return;

    // Update processed data
    setProcessedData((prev) => {
      const newData = data.results || [];
      const existingIds = new Set(prev.map((item) => item.uid));
      const filteredNewData = newData.filter(
        (item: any) => !existingIds.has(item.uid),
      );
      return [...prev, ...filteredNewData];
    });
    // Check if there are more pages to fetch
    if (data.next && hasMore && !isPending) {
      console.log("Fetching more data...");
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
    return numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const printReport = () => {
    const printContent = document.getElementById("report-content")?.innerHTML;
    const printWindow = window.open("", "_blank");

    if (printWindow && printContent) {
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch {
            return "";
          }
        })
        .join("\n");

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
        OnPdfClick={printReport}
        params={params}
        setParams={setQueryParams}
        onFilterChange={handleFilterChange}
      />

      <div
        id="report-content"
        className="rounded border bg-white/40 px-4 py-7 text-sm font-light"
      >
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-2xl font-bold">Customers Contact List</h1>
          <h2 className="mb-1">{Company?.name || "Binary Burst"}</h2>
          <p className="text-gray-900">
            As of {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/60">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b px-4 py-2 text-left">
                  Customer Full Name
                </th>
                <th className="border-b px-4 py-2 text-left">Phone Number</th>
                <th className="border-b px-4 py-2 text-left">Email</th>
                <th className="border-b px-4 py-2 text-left">Full Name</th>
                <th className="border-b px-4 py-2 text-right">
                  Billing Address
                </th>
              </tr>
            </thead>
            <tbody>
              {isPending && processedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="my-4 flex items-center justify-center">
                      <LogoLoader size={50} color={"#16151c"} />
                    </div>
                  </td>
                </tr>
              ) : processedData.length > 0 ? (
                <>
                  {processedData.map((account, idx) => (
                    <tr key={account?.uid} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-2">
                        {account?.company_name || "-"}
                      </td>
                      <td className="border-b px-4 py-2">
                        {account?.mobile_number || "-"}
                      </td>
                      <td className="border-b px-4 py-2">
                        {account?.email || "-"}
                      </td>
                      <td className="border-b px-4 py-2">
                        {account?.first_name} {account?.middle_name}{" "}
                        {account?.last_name}
                      </td>
                      <td className="border-b px-4 py-2 text-right">
                        {account?.address?.full_address}{" "}
                        {account?.address?.city} {account?.address?.country}
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
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
