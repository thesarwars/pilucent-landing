'use client';

import React from 'react';
import { Card } from '../ui/card';
import { useFetch } from '@/app/helpers/hooks';
import { getBankOverview } from '@/app/helpers/backend';

interface BankAccountResult {
  uid: string;
  title: string;
  opening_balance: string;
  bank_balance: string;
}

interface BankOverviewResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BankAccountResult[];
  total: string;
}

const BankAccountsGrid = () => {
  const { data, isPending } = useFetch(
    ['bank_accounts_grid'],
    getBankOverview
  );

  const accounts: BankAccountResult[] = data?.results ?? [];

  const formatBalance = (value: string) =>
    Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Card
      style={{
        borderRadius: '24px',
      }}
      className="w-full flex-1 p-5 2xl:max-w-[650px] 2xl:p-8 bg-white/60"
    >
      {/* Header */}
      <h1 className="mb-6 text-xl font-medium text-[#090E4F]">All Attach Bank Account</h1>

      {/* Grid of Cards */}
      {isPending ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[120px] animate-pulse rounded-2xl border border-[rgba(9,14,79,0.12)] bg-gray-100"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:grid-rows-2 2xl:gap-8">
          {accounts.map((account) => (
            <div
              key={account.uid}
              style={{
                borderRadius: '16px',
                border: '0.5px solid rgba(9, 14, 79, 0.12)',
                background: '#FFF',
                boxShadow: '0 1px 6px 1px rgba(9, 14, 79, 0.04)',
              }}
              className="flex flex-col justify-between p-4"
            >
              {/* Top Section - Icon, Title, and initial letter */}
              <div className="mb-8 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      borderRadius: '12px',
                      border: '1px solid rgba(9, 14, 79, 0.12)',
                      background: '#FFF',
                      boxShadow: '0 1px 6px 1px rgba(9, 14, 79, 0.04)',
                    }}
                    className="flex size-8 items-center justify-center rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M11.6667 14.9974C15.3486 14.9974 18.3333 12.0126 18.3333 8.33073C18.3333 4.64883 15.3486 1.66406 11.6667 1.66406C7.98477 1.66406 5 4.64883 5 8.33073C5 12.0126 7.98477 14.9974 11.6667 14.9974Z"
                        stroke="#090E4F"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M2.63056 9.16406C2.02111 10.0954 1.66675 11.2086 1.66675 12.4047C1.66675 15.6776 4.3199 18.3307 7.59272 18.3307C8.78883 18.3307 9.90208 17.9764 10.8334 17.3669"
                        stroke="#090E4F"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M13.1427 6.8381C12.9625 6.07799 12.0455 5.3921 10.9448 5.90522C9.84404 6.41835 9.66921 8.06931 11.3342 8.24469C12.0868 8.32397 12.5774 8.15271 13.0266 8.63715C13.4758 9.12157 13.5593 10.4687 12.411 10.8318C11.2626 11.1949 10.1255 10.6276 10.0017 9.82207M11.6552 5.00391V5.72811M11.6552 10.9436V11.6706"
                        stroke="#090E4F"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text-base font-normal text-[#090E4F]">Balance</div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#090E4F]/10 text-sm font-semibold text-[#090E4F]">
                  {account.title?.trim().charAt(0)?.toUpperCase() || '—'}
                </div>
              </div>

              {/* Bottom Section - Title and Opening Balance */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#090E4F]/80">{account.title}</p>
                  <p className="text-xl font-medium tracking-tight text-[#090E4F] 2xl:text-2xl">
                    ${formatBalance(account.opening_balance)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default BankAccountsGrid;
