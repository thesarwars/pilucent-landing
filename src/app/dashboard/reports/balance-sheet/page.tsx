'use client';

import { fetchBalanceSheets, fetchBalanceSheetSummary } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import MainLoader from '@/components/MainLoader/MainLoader';
import { Suspense, useEffect, useState } from 'react';
import ReportFilter from '../_components/filter';
import moment from 'moment';
import { useAppSelector } from '@/app/redux/store';
import LogoLoader from '@/components/MainLoader/logo-loader';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';

interface AccountItem {
  id: string;
  name: string;
  amount?: number;
  children?: AccountItem[];
  isTotal?: boolean;
}

interface TreeNodeProps {
  item: AccountItem;
  level: number;
}

const ChevronIcon = ({
  isExpanded,
  className = '',
}: {
  isExpanded: boolean;
  className?: string;
}) => (
  <svg
    className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const TreeNode = ({ item, level }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const getIndentClass = (level: number) => {
    const indentMap: { [key: number]: string } = {
      0: 'pl-4',
      1: 'pl-8',
      2: 'pl-12',
      3: 'pl-16',
      4: 'pl-20',
    };
    return indentMap[level] || 'pl-20';
  };

  const getTextColor = (amount?: number) => {
    if (amount === undefined) return 'text-gray-900';
    return amount < 0 ? 'text-red-600' : 'text-gray-900';
  };

  return (
    <div className="select-none font-light">
      <div
        className={`group mx-4 flex cursor-pointer items-center justify-between py-1 hover:bg-gray-50 ${getIndentClass(level)} ${item.isTotal ? 'border-t border-t-gray-400' : ''}`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div className={`flex flex-1 items-center space-x-2`}>
          {hasChildren ? (
            <ChevronIcon
              isExpanded={isExpanded}
              className="text-gray-500 group-hover:text-gray-700"
            />
          ) : (
            <div className="w-4" />
          )}
          <span
            className={`text-sm ${item.isTotal ? 'font-semibold' : 'font-normal'} ${getTextColor(item.amount)}`}
          >
            {item.name}
          </span>
        </div>
        {item.amount !== undefined && (
          <div
            className={`min-w-[100px] pr-4 text-right text-sm ${item.isTotal ? 'font-semibold' : 'font-normal'} tracking-wide`}
          >
            <span className={getTextColor(item.amount)}>{formatAmount(item.amount)}</span>
          </div>
        )}
      </div>

      {hasChildren && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {item.children?.map((child) => (
            <TreeNode key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FinancialStatement = () => {
  const [accountData, setAccountData] = useState<any[]>([]);
  const from = useSearchParams().get('from');
  const to = useSearchParams().get('to');

  const { data, isPending } = useFetch(
    ['overview', 'balance-sheet', from, to],
    fetchBalanceSheets,
    { keywords: 'overview', start_date: from, end_date: to }
  );

  const [banks, receivableAccounts, otherCurrentAssets, fixedAssets, OthersAssets] = useQueries({
    queries: [
      {
        queryKey: ['bank', 'balance_sheet', from, to],
        queryFn: () =>
          fetchBalanceSheets({
            kind: 'ASSETS',
            account_type__title: 'Bank',
            start_date: from,
            end_date: to,
          }),
      },
      {
        queryKey: ['Accounts Receivable (A/R)', 'balance_sheet', from, to],
        queryFn: () =>
          fetchBalanceSheets({
            kind: 'ASSETS',
            account_type__title: 'Accounts Receivable (A/R)',
            start_date: from,
            end_date: to,
          }),
      },
      {
        queryKey: ['Other Current Assets', 'balance_sheet', from, to],
        queryFn: () =>
          fetchBalanceSheets({
            kind: 'ASSETS',
            account_type__title: 'Other Current Assets',
            start_date: from,
            end_date: to,
          }),
      },
      {
        queryKey: ['Fixed Assets', 'balance_sheet', from, to],
        queryFn: () =>
          fetchBalanceSheets({
            kind: 'ASSETS',
            account_type__title: 'Fixed Assets',
            start_date: from,
            end_date: to,
          }),
      },
      {
        queryKey: ['Other Assets', 'balance_sheet', from, to],
        queryFn: () =>
          fetchBalanceSheets({
            kind: 'ASSETS',
            account_type__title: 'Other Assets',
            start_date: from,
            end_date: to,
          }),
      },
    ],
  });

  const [PayableAccounts, CreditCards, OtherCurrentLiabilities, payroll, TermLiabilities, equity] =
    useQueries({
      queries: [
        {
          queryKey: ['Accounts Payable (A/P)', 'balance_sheet', from, to],
          queryFn: () =>
            fetchBalanceSheets({
              kind: 'LIABILITIES',
              account_type__title: 'Accounts Payable (A/P)',
              start_date: from,
              end_date: to,
            }),
        },
        {
          queryKey: ['Credit Cards', 'balance_sheet', from, to],
          queryFn: () =>
            fetchBalanceSheets({
              kind: 'LIABILITIES',
              account_type__title: 'Credit Cards',
              start_date: from,
              end_date: to,
            }),
        },
        {
          queryKey: ['Other Current Liabilities', 'balance_sheet', from, to],
          queryFn: () =>
            fetchBalanceSheets({
              kind: 'LIABILITIES',
              account_type__title: 'Other Current Liabilities',
              start_date: from,
              end_date: to,
            }),
        },
        {
          queryKey: ['Payroll Liabilities', 'balance_sheet', from, to],
          queryFn: () =>
            fetchBalanceSheets({
              kind: 'LIABILITIES',
              account_type__title: 'Other Current Liabilities',
              detail_type__title: 'Payroll Liabilities',
              start_date: from,
              end_date: to,
            }),
        },
        {
          queryKey: ['Long Term Liabilities', 'balance_sheet', from, to],
          queryFn: async () =>
            await fetchBalanceSheets({
              kind: 'LIABILITIES',
              account_type__title: 'Long Term Liabilities',
              start_date: from,
              end_date: to,
            }),
        },
        {
          queryKey: ['Equity', 'balance_sheet', from, to],
          queryFn: () =>
            fetchBalanceSheets({
              kind: 'EQUITIES',
              account_type__title: 'Equity',
              start_date: from,
              end_date: to,
            }),
        },
      ],
    });

  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

  useEffect(() => {
    if (
      data &&
      banks?.data &&
      receivableAccounts?.data &&
      otherCurrentAssets?.data &&
      fixedAssets?.data &&
      OthersAssets?.data &&
      PayableAccounts?.data &&
      CreditCards?.data &&
      OtherCurrentLiabilities?.data &&
      payroll?.data &&
      TermLiabilities?.data &&
      equity?.data &&
      !banks?.isPending &&
      !receivableAccounts?.isPending &&
      !otherCurrentAssets?.isPending &&
      !fixedAssets?.isPending &&
      !OthersAssets?.isPending &&
      !PayableAccounts?.isPending &&
      !CreditCards?.isPending &&
      !OtherCurrentLiabilities?.isPending &&
      !payroll?.isPending &&
      !TermLiabilities?.isPending &&
      !equity?.isPending &&
      !isPending
    ) {
      const converted = [
        {
          id: 'assets',
          name: 'Assets',
          children: [
            {
              id: 'current-assets',
              name: 'Current Assets',
              children: [
                {
                  id: 'bank-accounts',
                  name: 'Bank Accounts',
                  children: [
                    ...banks?.data?.map((d: any) => {
                      return {
                        id: d?.title,
                        name: d?.title,
                        amount: d?.opening_balance,
                      };
                    }),
                    {
                      id: 'total-banks',
                      name: 'Total for Bank Accounts',
                      amount: data.total_for_bank_accounts,
                      isTotal: true,
                    },
                  ],
                },
                {
                  id: 'accounts-receivable',
                  name: 'Accounts Receivable',
                  children: [
                    ...receivableAccounts?.data?.map((d: any) => {
                      return {
                        id: d?.title,
                        name: d?.title,
                        amount: d?.opening_balance,
                      };
                    }),
                    {
                      id: 'total-accounts-receivable',
                      name: 'Total for Accounts Receivable',
                      amount: data.total_for_account_receivables,
                      isTotal: true,
                    },
                  ],
                },
                {
                  id: 'other-current-assets',
                  name: 'Other Current Assets',
                  children: [
                    ...otherCurrentAssets?.data?.map((d: any) => {
                      return {
                        id: d?.title,
                        name: d?.title,
                        amount: d?.opening_balance,
                      };
                    }),
                    {
                      id: 'total-other-current-assets',
                      name: 'Total for Other Current Assets',
                      amount: data.total_for_other_current_assets,
                      isTotal: true,
                    },
                  ],
                },
                {
                  id: 'total-current-assets',
                  name: 'Total for Current Assets',
                  amount: data.total_for_current_asset,
                  isTotal: true,
                },
              ],
            },

            {
              id: 'fixed-assets',
              name: 'Fixed Assets',
              children: [
                ...fixedAssets?.data?.map((d: any) => {
                  return {
                    id: d?.title,
                    name: d?.title,
                    amount: d?.opening_balance,
                  };
                }),
                {
                  id: 'total-fixed-assets',
                  name: 'Total for Fixed Assets',
                  amount: data.total_for_fixed_assets,
                  isTotal: true,
                },
              ],
            },
            {
              id: 'other-assets',
              name: 'Other Assets',
              amount: data.total_for_other_assets,
            },
            {
              id: 'total-assets',
              name: 'Total for Assets',
              amount: data.total_for_assets,
              isTotal: true,
            },
          ],
        },
        {
          id: 'liabilities-equity',
          name: 'Liabilities and Equity',
          children: [
            {
              id: 'liabilities',
              name: 'Liabilities',
              children: [
                {
                  id: 'current-liabilities',
                  name: 'Current Liabilities',
                  children: [
                    {
                      id: 'accounts-payable',
                      name: 'Accounts Payable',
                      children: [
                        ...PayableAccounts?.data?.map((d: any) => {
                          return {
                            id: d?.title,
                            name: d?.title,
                            amount: d?.opening_balance,
                          };
                        }),
                        {
                          id: 'total-accounts-payable',
                          name: 'Total for Accounts Payable',
                          amount: data.total_for_account_payables,
                          isTotal: true,
                        },
                      ],
                    },
                    {
                      id: 'credit-cards',
                      name: 'Credit Cards',
                      children: [
                        ...CreditCards?.data?.map((d: any) => {
                          return {
                            id: d?.title,
                            name: d?.title,
                            amount: d?.opening_balance,
                          };
                        }),
                        {
                          id: 'total-credit-cards',
                          name: 'Total for Credit Cards',
                          amount: data.total_for_credit_cards,
                          isTotal: true,
                        },
                      ],
                    },
                    {
                      id: 'other-current-liabilities',
                      name: 'Other Current Liabilities',
                      children: [
                        ...OtherCurrentLiabilities?.data?.map((d: any) => {
                          return {
                            id: d?.title,
                            name: d?.title,
                            amount: d?.opening_balance,
                          };
                        }),

                        {
                          id: 'payroll-liabilities',
                          name: 'Payroll Liabilities',
                          children: [
                            ...payroll?.data?.map((d: any) => {
                              return {
                                id: d?.title,
                                name: d?.title,
                                amount: d?.opening_balance,
                              };
                            }),
                            {
                              id: 'total-payroll-liabilities',
                              name: 'Total for Payroll Liabilities',
                              amount: data.total_for_payroll_liabilities,
                              isTotal: true,
                            },
                          ],
                        },
                        {
                          id: 'total-other-current-liabilities',
                          name: 'Total for Other Current Liabilities',
                          amount: data.total_for_other_current_liabilities,
                          isTotal: true,
                        },
                      ],
                    },
                    {
                      id: 'total-current-liabilities',
                      name: 'Total for Current Liabilities',
                      amount: data.total_for_current_liabilities,
                      isTotal: true,
                    },
                  ],
                },
                {
                  id: 'long-term-liabilities',
                  name: 'Long-term Liabilities',
                  children: [
                    ...TermLiabilities?.data?.map((d: any) => {
                      return {
                        id: d?.title,
                        name: d?.title,
                        amount: d?.opening_balance,
                      };
                    }),
                    {
                      id: 'total-long-term-liabilities',
                      name: 'Total for Long-term Liabilities',
                      amount: data.total_for_long_term_liabilities,
                      isTotal: true,
                    },
                  ],
                },
                {
                  id: 'total-liabilities',
                  name: 'Total for Liabilities',
                  amount: data.total_for_liabilities,
                  isTotal: true,
                },
              ],
            },
            {
              id: 'equity',
              name: 'Equity',
              children: [
                ...equity?.data?.map((d: any) => {
                  return {
                    id: d?.title,
                    name: d?.title,
                    amount: d?.opening_balance,
                  };
                }),
                {
                  id: 'total-equity',
                  name: 'Total for Equity',
                  amount: data.total_for_equity,
                  isTotal: true,
                },
              ],
            },
            {
              id: 'total-liabilities-equity',
              name: 'Total for Liabilities and Equity',
              amount: data.total_for_liabilities_and_equity || 0.0,
              isTotal: true,
            },
          ],
        },
      ];
      console.log('converted', converted);
      setAccountData(converted);
    }
  }, [
    isPending,
    data,
    banks?.data &&
      receivableAccounts?.data &&
      otherCurrentAssets?.data &&
      fixedAssets?.data &&
      OthersAssets?.data &&
      PayableAccounts?.data &&
      CreditCards?.data &&
      OtherCurrentLiabilities?.data &&
      payroll?.data &&
      TermLiabilities?.data &&
      equity?.data &&
      !banks?.isPending &&
      !receivableAccounts?.isPending &&
      !otherCurrentAssets?.isPending &&
      !fixedAssets?.isPending &&
      !OthersAssets?.isPending &&
      !PayableAccounts?.isPending &&
      !CreditCards?.isPending &&
      !OtherCurrentLiabilities?.isPending &&
      !payroll?.isPending &&
      !TermLiabilities?.isPending &&
      !equity?.isPending,
  ]);

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
    <div className="">
      <ReportFilter
        OnPdfClick={() => printReport()}
        params={{}}
        // refetch={refetch}
        value={{ created_at_after: from, created_at_before: to }}
        setParams={(newParams: any) =>
          router.push(
            `?from=${newParams?.created_at_after || ''}&to=${newParams?.created_at_before || ''}`
          )
        }
        onFilterChange={() => {
          // refetch();
        }}
      />
      <div
        id="report-content"
        className="mx-auto mb-7 max-w-screen-2xl rounded border bg-white/40 p-4 py-7 text-sm"
      >
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-3xl font-bold">Balance Sheet</h1>
          <h2 className="mb-1 text-xl">
            {Company?.name || 'Binary Burst '} {'  '}
          </h2>
          <div className="mt-2 text-center text-sm font-medium text-gray-900">
            {from && to ? (
              <p>
                From{' '}
                {moment(new Date(from || new Date().toLocaleDateString())).format('DD MMMM, YYYY')}{' '}
                to{' '}
                {moment(new Date(from || new Date().toLocaleDateString())).format('DD MMMM, YYYY')}
              </p>
            ) : (
              <p className="text-gray-600">As of {new Date().toLocaleDateString()}</p>
            )}
          </div>
        </div>
        {banks?.isPending ||
        receivableAccounts?.isPending ||
        otherCurrentAssets?.isPending ||
        fixedAssets?.isPending ||
        OthersAssets?.isPending ||
        PayableAccounts?.isPending ||
        CreditCards?.isPending ||
        OtherCurrentLiabilities?.isPending ||
        payroll?.isPending ||
        TermLiabilities?.isPending ||
        equity?.isPending ||
        isPending ||
        !accountData?.length ? (
          <div className="flex items-center justify-center">
            <LogoLoader size={50} color={'#16151c'} />
          </div>
        ) : (
          <div className="rounded bg-white/60">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">Account</h2>
              <h2 className="text-base font-semibold text-gray-900">Total</h2>
            </div>

            {/* Tree Content */}
            <div className="divide-y divide-gray-100">
              {accountData.map((item, id) => (
                <TreeNode key={id} item={item} level={0} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<MainLoader />}>
      <FinancialStatement />
    </Suspense>
  );
};

export default Page;
