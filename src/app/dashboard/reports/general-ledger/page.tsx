'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { fetchBalanceSheet } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { useAppSelector } from '@/app/redux/store';
import ReportFilter from '../_components/filter';
import moment from 'moment';
import LogoLoader from '@/components/MainLoader/logo-loader';

const BalanceSheet = () => {
  const { data, setQueryParams, isPending, refetch } = useFetch(
    ['balanceSheetData'],
    fetchBalanceSheet
  );
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ASSETS: true,
    LIABILITIES: true,
    EQUITIES: true,
    'LIABILITIES AND EQUITY': true,
  });

  const { Company } = useAppSelector((state) => state.CompanyData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // useEffect(() => {
  // const currentDate = new Date();
  // const firstDateOfMonth = new Date(
  //   currentDate.getFullYear(),
  //   currentDate.getMonth(),
  //   1,
  // );
  // const formattedStartDate = firstDateOfMonth.toISOString().split("T")[0];
  // const formattedEndDate = currentDate.toISOString().split("T")[0];

  // setQueryParams({
  //   start_date: formattedStartDate,
  //   end_date: formattedEndDate,
  // })
  // }, []);

  // Helper function to format currency
  const formatCurrency = (amount: any) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    })
      .format(Number(amount))
      .replace('$', '');
  };

  // Toggle expansion state for a section
  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Check if a section is expanded
  const isSectionExpanded = (sectionKey: string) => {
    if (expandedSections[sectionKey] === undefined) {
      return true;
    }
    return expandedSections[sectionKey] === true;
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
    <div>
      <ReportFilter
        OnPdfClick={printReport}
        defaultRange="this_month"
        params={{
          created_at_after: moment().startOf('week').format('YYYY-MM-DD'),
          created_at_before: moment().endOf('week').format('YYYY-MM-DD'),
        }}
        setParams={(newParams: any) => setQueryParams(newParams)}
        onFilterChange={() => {
          setPage(1);
          setHasMore(true);
          refetch();
        }}
      />
      <div id="report-content" className="mx-auto rounded border bg-white/40 p-4 py-7 text-sm">
        {/* Header Section */}
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-3xl font-bold">General Ledger</h1>
          <h2 className="mb-1 text-xl">{Company?.name || 'Binary Burst'}</h2>
          <p className="text-gray-600">As of {new Date().toLocaleDateString()}</p>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center">
            <LogoLoader size={50} color={'#16151c '} />
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/60 py-4">
            <table className="min-w-full ">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b px-4 py-2 text-left">DATE</th>
                  <th className="border-b px-4 py-2 text-left">TRANSACTION TYPE</th>
                  <th className="border-b px-4 py-2 text-left">NUM</th>
                  <th className="border-b px-4 py-2 text-left">NAME</th>
                  <th className="border-b px-4 py-2 text-left">MEMO/DESCRIPTION</th>
                  <th className="border-b px-4 py-2 text-left">SPLIT</th>
                  <th className="border-b px-4 py-2 text-right">AMOUNT</th>
                  <th className="border-b px-4 py-2 text-right">BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {/* ASSETS Section */}
                {data && data.ASSETS && (
                  <>
                    {Object.entries(data.ASSETS)
                      .filter(([key]) => key !== 'total for ASSETS')
                      .map(([accountName, accountData]: [string, any]) => {
                        const sectionKey = `ASSETS-${accountName}`;
                        return (
                          <React.Fragment key={sectionKey}>
                            <tr
                              className="cursor-pointer hover:bg-gray-100"
                              onClick={() => toggleSection(sectionKey)}
                            >
                              <td colSpan={8} className="border-b px-4 py-2 text-left">
                                <div className="flex items-center">
                                  {isSectionExpanded(sectionKey) ? (
                                    <ChevronDown className="mr-2 h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="mr-2 h-4 w-4" />
                                  )}
                                  <span className="font-medium">{accountName}</span>
                                </div>
                              </td>
                            </tr>

                            {isSectionExpanded(sectionKey) && (
                              <>
                                {/* Beginning Balance */}
                                <tr>
                                  <td colSpan={7} className="border-b px-4 py-2 pl-8">
                                    Beginning Balance
                                  </td>
                                  <td className="border-b px-4 py-2 text-right">
                                    {formatCurrency(accountData.beginning_balance)}
                                  </td>
                                </tr>

                                {/* Transactions */}
                                {Object.entries(accountData)
                                  .filter(
                                    ([key]) =>
                                      !['beginning_balance', 'total for ' + accountName].includes(
                                        key
                                      )
                                  )
                                  .map(([date, transactions]: [string, any]) => {
                                    return Array.isArray(transactions)
                                      ? transactions.map((transaction, idx) => (
                                          <tr
                                            key={`${sectionKey}-${date}-${idx}`}
                                            className="text-nowrap hover:bg-gray-50"
                                          >
                                            <td className="border-b px-4 py-2">{date}</td>
                                            <td className="border-b px-4 py-2">
                                              {transaction.transaction_kind || '-'}
                                            </td>
                                            <td className="border-b px-4 py-2">
                                              {transaction.journal || '-'}
                                            </td>
                                            <td className="border-b px-4 py-2">
                                              {transaction.customer || transaction.supplier || '-'}
                                            </td>
                                            <td className="border-b px-4 py-2 text-center">
                                              {transaction.description || '-'}
                                            </td>
                                            <td className="border-b px-4 py-2 text-center">
                                              {transaction.split || '-'}
                                            </td>
                                            <td className="border-b px-4 py-2 text-right">
                                              {formatCurrency(transaction.amount)}
                                            </td>
                                            <td className="border-b px-4 py-2 text-right">
                                              {formatCurrency(transaction.last_balance)}
                                            </td>
                                          </tr>
                                        ))
                                      : null;
                                  })}

                                {/* Total for Account */}
                                <tr className="bg-gray-50">
                                  <td
                                    colSpan={7}
                                    className="border-b px-4 py-2 text-right font-medium"
                                  >
                                    Total for {accountName}
                                  </td>
                                  <td className="border-b px-4 py-2 text-right font-medium">
                                    {formatCurrency(accountData[`total for ${accountName}`])}
                                  </td>
                                </tr>
                              </>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </>
                )}
                {/* LIABILITIES AND EQUITIES Section */}
                {data && (data.LIABILITIES || data.EQUITIES) && (
                  <>
                    {
                      <>
                        {/* Liabilities Section */}
                        {data.LIABILITIES && (
                          <>
                            {Object.entries(data.LIABILITIES)
                              .filter(([key]) => key !== 'total for LIABILITIES')
                              .map(([accountName, accountData]: [string, any]) => {
                                const sectionKey = `LIABILITIES-${accountName}`;
                                return (
                                  <React.Fragment key={sectionKey}>
                                    <tr
                                      className="cursor-pointer hover:bg-gray-100"
                                      onClick={() => toggleSection(sectionKey)}
                                    >
                                      <td colSpan={10} className="border-b px-4 py-2 text-left">
                                        <div className="flex items-center">
                                          {isSectionExpanded(sectionKey) ? (
                                            <ChevronDown className="mr-2 h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="mr-2 h-4 w-4" />
                                          )}
                                          <span className="font-medium">{accountName}</span>
                                        </div>
                                      </td>
                                    </tr>

                                    {isSectionExpanded(sectionKey) && (
                                      <>
                                        {/* Beginning Balance */}
                                        <tr>
                                          <td colSpan={7} className="border-b px-4 py-2 pl-8">
                                            Beginning Balance
                                          </td>
                                          <td className="border-b px-4 py-2 text-right">
                                            {formatCurrency(accountData.beginning_balance)}
                                          </td>
                                        </tr>

                                        {/* Transactions */}
                                        {Object.entries(accountData)
                                          .filter(
                                            ([key]) =>
                                              ![
                                                'beginning_balance',
                                                'total for ' + accountName,
                                              ].includes(key)
                                          )
                                          .map(([date, transactions]: [string, any]) => {
                                            return Array.isArray(transactions)
                                              ? transactions.map((transaction, idx) => (
                                                  <tr
                                                    key={`${sectionKey}-${date}-${idx}`}
                                                    className="hover:bg-gray-50"
                                                  >
                                                    <td className="border-b px-4 py-2">{date}</td>
                                                    <td className="border-b px-4 py-2 text-center">
                                                      {transaction.transaction_kind || '-'}
                                                    </td>
                                                    <td className="border-b px-4 py-2">
                                                      {transaction.journal || '-'}
                                                    </td>
                                                    <td className="border-b px-4 py-2">
                                                      {transaction.customer ||
                                                        transaction.supplier ||
                                                        '-'}
                                                    </td>
                                                    <td className="border-b px-4 py-2">-</td>
                                                    <td className="border-b px-4 py-2">-</td>
                                                    <td className="border-b px-4 py-2 text-right">
                                                      {formatCurrency(transaction.amount)}
                                                    </td>
                                                    <td className="border-b px-4 py-2 text-right">
                                                      {formatCurrency(transaction.last_balance)}
                                                    </td>
                                                  </tr>
                                                ))
                                              : null;
                                          })}

                                        {/* Total for Account */}
                                        <tr className="bg-gray-50">
                                          <td
                                            colSpan={7}
                                            className="border-b px-4 py-2 text-right font-medium"
                                          >
                                            Total for {accountName}
                                          </td>
                                          <td className="border-b px-4 py-2 text-right font-medium">
                                            {formatCurrency(
                                              accountData[`total for ${accountName}`]
                                            )}
                                          </td>
                                        </tr>
                                      </>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                          </>
                        )}

                        {/* EQUITIES Section */}
                        {data.EQUITIES && (
                          <>
                            {Object.entries(data.EQUITIES)
                              .filter(([key]) => key !== 'total for EQUITIES')
                              .map(([accountName, accountData]: [string, any]) => {
                                const sectionKey = `EQUITIES-${accountName}`;
                                return (
                                  <React.Fragment key={sectionKey}>
                                    <tr
                                      className="cursor-pointer hover:bg-gray-100"
                                      onClick={() => toggleSection(sectionKey)}
                                    >
                                      <td colSpan={8} className="border-b px-4 py-2 text-left">
                                        <div className="flex items-center">
                                          {isSectionExpanded(sectionKey) ? (
                                            <ChevronDown className="mr-2 h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="mr-2 h-4 w-4" />
                                          )}
                                          <span className="font-medium">{accountName}</span>
                                        </div>
                                      </td>
                                    </tr>

                                    {isSectionExpanded(sectionKey) && (
                                      <>
                                        {/* Beginning Balance */}
                                        <tr>
                                          <td colSpan={7} className="border-b px-4 py-2 pl-16">
                                            Beginning Balance
                                          </td>
                                          <td className="border-b px-4 py-2 text-right">
                                            {formatCurrency(accountData.beginning_balance)}
                                          </td>
                                        </tr>

                                        {/* Transactions */}
                                        {Object.entries(accountData)
                                          .filter(
                                            ([key]) =>
                                              ![
                                                'beginning_balance',
                                                'total for ' + accountName,
                                              ].includes(key)
                                          )
                                          .map(([date, transactions]: [string, any]) => {
                                            return Array.isArray(transactions)
                                              ? transactions.map((transaction, idx) => (
                                                  <tr
                                                    key={`${sectionKey}-${date}-${idx}`}
                                                    className="hover:bg-gray-50"
                                                  >
                                                    <td className="border-b px-4 py-2">{date}</td>
                                                    <td className="border-b px-4 py-2">
                                                      {transaction.transaction_kind || '-'}
                                                    </td>
                                                    <td className="border-b px-4 py-2">
                                                      {transaction.journal || '-'}
                                                    </td>
                                                    <td className="border-b px-4 py-2">
                                                      {transaction.customer ||
                                                        transaction.supplier ||
                                                        '-'}
                                                    </td>
                                                    <td className="border-b px-4 py-2">-</td>
                                                    <td className="border-b px-4 py-2">-</td>

                                                    <td className="border-b px-4 py-2 text-right">
                                                      {formatCurrency(transaction.amount)}
                                                    </td>
                                                    <td className="border-b px-4 py-2 text-right">
                                                      {formatCurrency(transaction.last_balance)}
                                                    </td>
                                                  </tr>
                                                ))
                                              : null;
                                          })}

                                        {/* Total for Account */}
                                        <tr className="bg-gray-50">
                                          <td
                                            colSpan={7}
                                            className="border-b px-4 py-2 text-right font-medium"
                                          >
                                            Total for {accountName}
                                          </td>
                                          <td className="border-b px-4 py-2 text-right font-medium">
                                            {formatCurrency(
                                              accountData[`total for ${accountName}`]
                                            )}
                                          </td>
                                        </tr>
                                      </>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                          </>
                        )}
                      </>
                    }
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceSheet;
