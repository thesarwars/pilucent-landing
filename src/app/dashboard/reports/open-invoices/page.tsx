"use client";

import { fetchOpenInvoiceReport } from "@/app/helpers/backend";
import { useCustomFetch } from "@/app/helpers/hooks";
import Button from "@/components/ui/RawButton";
import GetToken from "@/hooks/getToken";
import { GetData } from "@/services/FetchMethods";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import ReportFilter from "../_components/filter";
import moment from "moment";
import { useAppSelector } from "@/app/redux/store";
import LogoLoader from "@/components/MainLoader/logo-loader";

interface Transaction {
  date: string;
  type: string;
  memo?: string;
  no?: string;
  amount: number;
}

interface GroupData {
  name: string;
  transactions: Transaction[];
}

const Page = () => {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [OpenInvoices, setOpenInvoices] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const { Company } = useAppSelector((state) => state.CompanyData);
  const { data, setQueryParams, isPending, params } = useCustomFetch(
    fetchOpenInvoiceReport,
  );

  useEffect(() => {
    if (!data) return;

    // Update processed data
    setProcessedData((prev) => {
      const newData = data.results || [];
      newData?.map((item: any) => {
        togglePrintGroup(item?.uid);
      });
      const existingIds = new Set(prev.map((item) => item.uid));
      const filteredNewData = newData.filter(
        (item: any) => !existingIds.has(item.uid),
      );
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

  const toggleGroup = (id: number) => {
    setExpandedGroups((prev) => {
      const UpdatedRows = new Set(prev);
      if (UpdatedRows.has(id)) {
        UpdatedRows.delete(id);
      } else {
        UpdatedRows.add(id);
      }
      return UpdatedRows;
    });
  };

  const togglePrintGroup = (id: number) => {
    setExpandedGroups((prev) => {
      const UpdatedRows = new Set(prev);
      if (!UpdatedRows.has(id)) {
        UpdatedRows.add(id);
      }
      return UpdatedRows;
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const formatTotalAmount = (invoices: any) => {
    const total = invoices.reduce(
      (acc: any, row: any) => acc + Number(row.due_total),
      0,
    );

    return Number(total).toFixed(2);
  };

  const printReport = () => {
    OpenInvoices.map((invoice: any) => {
      togglePrintGroup(invoice.uid);
    });
    setTimeout(() => {
      const printWindow = window.open("", "_blank");
      const printContent = document.getElementById("report-content")?.innerHTML;

      // Get all styles from the main document
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch (error) {
            return ""; // Ignore cross-origin stylesheets
          }
        })
        .join("\n");

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
    }, 200);
  };

  // Reset pagination when filters change
  const handleFilterChange = () => {
    setProcessedData([]);
    setCurrentPage(1);
    setHasMore(true);
    // setQueryParams({ ...newParams, page: 1 });
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
        className="rounded border bg-white/40 p-4 py-7 text-sm font-light"
      >
        <div className="mb-4 flex flex-col justify-center border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-2xl font-bold">Open Invoices</h1>
          <h2 className="mb-1 text-sm">{Company?.name || "Binary Burst"}</h2>
          <div className="mt-1 text-center text-sm text-gray-900">
            From{" "}
            {moment(
              new Date(
                params?.created_at_after || new Date().toLocaleDateString(),
              ),
            ).format("DD MMMM, YYYY")}
            {"  "} to{" "}
            {moment(
              new Date(
                params?.created_at_before || new Date().toLocaleDateString(),
              ),
            ).format("DD MMMM, YYYY")}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto bg-white/60">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="whitespace-nowrap border-b px-4 py-2 text-left">
                  DATE
                </th>
                <th className="whitespace-nowrap border-b px-4 py-2 text-left">
                  TRANSACTION TYPE
                </th>
                <th className="whitespace-nowrap border-b px-4 py-2 text-left">
                  TERMS
                </th>
                <th className="whitespace-nowrap border-b px-4 py-2 text-left">
                  NO.
                </th>
                <th className="whitespace-nowrap border-b px-4 py-2 text-right">
                  AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData?.map(
                (group: any) =>
                  group?.invoices?.length > 0 && (
                    <React.Fragment key={group.uid}>
                      {/* Group Header */}
                      <tr
                        className="cursor-pointer bg-gray-100 hover:bg-gray-200"
                        onClick={() => toggleGroup(group.uid)}
                      >
                        <td colSpan={5} className="px-4 py-2 font-semibold">
                          <div className="flex items-center gap-2">
                            {expandedGroups.has(group.uid) ? (
                              <FaChevronDown className="h-4 w-4" />
                            ) : (
                              <FaChevronRight className="h-4 w-4" />
                            )}
                            {group?.first_name ? group.first_name : ""}{" "}
                            {group?.middle_name ? group?.middle_name : ""}{" "}
                            {group?.last_name ? group.last_name : ""}
                          </div>
                        </td>
                      </tr>
                      {/* Group Transactions */}
                      {expandedGroups.has(group.uid) && (
                        <>
                          {group.invoices.map((transaction: any, idx: any) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="whitespace-nowrap border-b px-4 py-2">
                                {transaction.due_date}
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2">
                                Invoice
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2">
                                {transaction?.terms?.title || ""}
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2">
                                {transaction.no || "-"}
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-right">
                                $ {formatAmount(transaction.due_total)}
                              </td>
                            </tr>
                          ))}
                          <tr className="whitespace-nowrap hover:bg-gray-50">
                            <td className="border-b px-4 py-2">
                              Total For{" "}
                              <span className="font-semibold">
                                {group?.first_name ? group.first_name : ""}{" "}
                                {group?.middle_name ? group?.middle_name : ""}{" "}
                                {group?.last_name ? group.last_name : ""}
                              </span>
                            </td>
                            <td className="border-b px-4 py-2"></td>
                            <td className="border-b px-4 py-2"></td>
                            <td className="border-b px-4 py-2"></td>
                            <td className="border-b px-4 py-2 text-right">
                              $ {formatTotalAmount(group?.invoices)}
                            </td>
                          </tr>
                        </>
                      )}
                    </React.Fragment>
                  ),
              )}
              {isPending && (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="my-4 flex items-center justify-center">
                      <LogoLoader size={50} color={"#16151c"} />
                    </div>
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
