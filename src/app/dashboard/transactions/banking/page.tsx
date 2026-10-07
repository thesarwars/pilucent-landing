'use client';

import BankDropdown from '../../../../components/ui/ScrollSelectDropDowns/BankDropDown';
import { useEffect, useState } from 'react';
import DropdownButton from './_components/DropdownButton';
import { useSearchParams } from 'next/navigation';
import TransactionImport from './_components/TransactionImport';
import { useFetch } from '@/app/helpers/hooks';
import { fetchBankOverview, fetchTransactions } from '@/app/helpers/backend';
import CardSkeleton from './_components/CardSkeleton';
import ReviewTransactionsTable from './_components/ReviewTransactionsTable';
import CategorizedTransactionsTable from './_components/CategorizedTransactionsTable';
import ExcludedTransactionsTable from './_components/ExcludedTransactionsTable';
import Rule from './_components/RulesRelated/Rule';
import BankDeposit from './_components/BankDeposit/BankDeposit';
import { Breadcrumb, Chip, IconChip, money, type VioletTone } from '@/components/violet';
import { cn } from '@/lib/utils';
import { Landmark, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

const fmtMoney = (v: any) => {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(`${v}`.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? money(n) : `${v}`;
};

const SEGMENTS: { value: string; label: string; sub: string; icon: React.ReactNode; tone: VioletTone }[] = [
  { value: 'FOR_REVIEW', label: 'For Review', sub: 'Needs categorizing', icon: <Clock />, tone: 'warn' },
  { value: 'CATEGORIZED', label: 'Categorized', sub: 'Reviewed & booked', icon: <CheckCircle2 />, tone: 'success' },
  { value: 'EXCLUDED', label: 'Excluded', sub: 'Ignored from books', icon: <XCircle />, tone: 'neutral' },
];

const reviewOptions = [
  {
    title: 'All transactions',
    value: 'ALL_TRANSACTIONS',
  },
  {
    title: 'Uncategorized',
    value: 'UNCATEGORIZED',
  },
  {
    title: 'Missing payee/customer',
    value: 'MISSING_PAYEE_CUSTOMER',
  },
  {
    title: 'Rules',
    value: 'RULES',
  },
  {
    title: 'No rules',
    value: 'NO_RULES',
  },
  {
    title: 'Auto-add rule',
    value: 'AUTO_ADD_RULE',
  },
];

const CategorizedOptions = [
  {
    title: 'All transactions',
    value: 'ALL_TRANSACTIONS',
  },
  {
    title: 'Money in',
    value: 'MONEY_IN',
  },
  {
    title: 'Money out',
    value: 'MONEY_OUT',
  },
  {
    title: 'Recognized',
    value: 'RECOGNIZED',
  },
  {
    title: 'Suggested matches',
    value: 'SUGGESTED_MATCHES',
  },
  {
    title: 'Transfers',
    value: 'TRANSFERS',
  },
  {
    title: 'Rules',
    value: 'RULES',
  },
  {
    title: 'Missing payee/customer',
    value: 'MISSING_PAYEE_CUSTOMER',
  },
  {
    title: 'Uncategorized',
    value: 'UNCATEGORIZED',
  },
];

const tabs = [
  {
    title: 'For Review',
    value: 'FOR_REVIEW',
  },
  {
    title: 'Categorized',
    value: 'CATEGORIZED',
  },
  {
    title: 'Excluded',
    value: 'EXCLUDED',
  },
];

const topTabs = [
  {
    title: 'Bank transactions',
    value: 'BANK_TRANSACTIONS',
  },
  {
    title: 'Rules',
    value: 'RULE',
  },
  {
    title: 'Bank Deposit',
    value: 'BANK_DEPOSIT',
  },
];

const Page = () => {
  const [selectedTab, setSelectedTab] = useState('FOR_REVIEW');
  const [options, setOptions] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>('');
  const [selectedTopTab, setSelectedTopTab] = useState<any>('BANK_TRANSACTIONS');
  const [isBankSelected, setIsBankSelected] = useState(false);
  const {
    data: Accounts,
    isPending: isAccountsPending,
    refetch: AccountRefetch,
  } = useFetch(['transactions_overview'], fetchBankOverview);

  useEffect(() => {
    if (!isAccountsPending && !selectedBank?.uid) {
      setSelectedBank(Accounts?.[0]?.chart_of_account || { uid: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAccountsPending, Accounts]);

  const { data, isPending, setQueryParams, params, refetch } = useFetch(
    ['transactions'],
    fetchTransactions,
    { transaction_status: 'FOR_REVIEW' },
    { enabled: isBankSelected, refetchOnWindowFocus: false }
  );
  useEffect(() => {
    document.title = 'Bank Transactions';
  }, []);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1700 },
      items: 4,
    },
    desktop: {
      breakpoint: { max: 1700, min: 1300 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1300, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  useEffect(() => {
    if (selectedBank) {
      setQueryParams({ ...params, chart_of_account__uid: selectedBank?.uid });
      setTimeout(() => {
        setIsBankSelected(true);
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBank]);
  const action = useSearchParams().get('act');

  useEffect(() => {
    if (selectedTab == 'FOR_REVIEW') {
      setOptions(reviewOptions);
    } else {
      setOptions(CategorizedOptions);
    }
  }, [selectedTab]);

  if (action == 'import') {
    return (
      <div>
        <TransactionImport />
      </div>
    );
  }

  const selectedOverview =
    Accounts?.find((a: any) => a?.chart_of_account?.uid === selectedBank?.uid) || Accounts?.[0];
  const accountTitle = selectedBank?.title || selectedOverview?.chart_of_account?.title || 'Bank account';
  const bankBalance = selectedOverview?.bank_balance;
  const inBalanzify = selectedOverview?.chart_of_account?.opening_balance ?? selectedBank?.opening_balance;
  const forReviewCount = Number(selectedOverview?.status_for_review);

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Transactions', href: '#' },
          { label: 'Bank Transactions' },
        ]}
      />

      {/* page tabs */}
      <div className="flex flex-wrap items-center gap-6 border-b border-[rgba(22,23,42,0.1)]">
        {topTabs.map((tab) => {
          const active = selectedTopTab == tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedTopTab(tab.value)}
              className={cn(
                'relative -mb-px whitespace-nowrap px-1 py-2.5 text-[14px] font-bold transition-colors',
                active ? 'text-v-primary' : 'text-v-ink500 hover:text-v-ink900'
              )}
            >
              {tab.title}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full bg-v-primary" />
              )}
            </button>
          );
        })}
      </div>

      {selectedTopTab == 'BANK_TRANSACTIONS' && (
        <div className="flex flex-col gap-4">
          {/* title row */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-[27px] font-extrabold tracking-[-0.02em] text-v-ink900">
              Transactions
            </h1>
            <BankDropdown options={Accounts} value={selectedBank} setValue={setSelectedBank} />
            <span className="flex-1" />
            <DropdownButton />
          </div>

          {/* hero + stat tiles */}
          <div className="grid items-stretch gap-3.5 lg:grid-cols-[340px_1fr]">
            {/* dark balance hero */}
            {isAccountsPending ? (
              <CardSkeleton />
            ) : (
              <div
                className="relative overflow-hidden rounded-v-card p-[22px] text-white shadow-v-hero"
                style={{ backgroundImage: 'linear-gradient(135deg,#211B38,#463481,#6E4BE0)' }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-[50px] -top-[50px] h-[170px] w-[170px] animate-v-float rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(167,139,255,0.4), transparent 70%)' }}
                />
                <div className="relative">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white/10 text-white">
                      <Landmark className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold text-white">{accountTitle}</div>
                    </div>
                    {Number.isFinite(forReviewCount) && forReviewCount > 0 && (
                      <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-bold">
                        {forReviewCount} new
                      </span>
                    )}
                  </div>
                  <div className="mt-4 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-white/55">
                    Bank balance
                  </div>
                  <div className="mt-1 text-[28px] font-extrabold tabular-nums tracking-[-0.02em]">
                    {fmtMoney(bankBalance)}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-white/60">
                    <RefreshCw className="h-3.5 w-3.5" />
                    In Balanzify {fmtMoney(inBalanzify)} · synced just now
                  </div>
                </div>
              </div>
            )}

            {/* 3 stat-tile segment filters */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SEGMENTS.map((seg) => {
                const active = selectedTab == seg.value;
                return (
                  <button
                    key={seg.value}
                    type="button"
                    onClick={() => {
                      setQueryParams({ ...params, transaction_status: seg.value });
                      setSelectedTab(seg.value);
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-v-card border bg-white p-4 text-left shadow-v-card transition-all',
                      active
                        ? 'border-v-primary bg-[#F8F5FF]'
                        : 'border-transparent hover:shadow-v-tile-hover'
                    )}
                  >
                    <IconChip tone={seg.tone} size="lg">
                      {seg.icon}
                    </IconChip>
                    <div className="min-w-0">
                      <div className="text-[22px] font-extrabold leading-none tabular-nums text-v-ink900">
                        {active ? data?.count ?? 0 : '—'}
                      </div>
                      <div className="mt-1 text-[12.5px] font-bold text-v-ink900">{seg.label}</div>
                      <div className="text-[11px] text-v-ink400">{seg.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* table */}
          {selectedTab == 'FOR_REVIEW' ? (
            <ReviewTransactionsTable
              AccountRefetch={AccountRefetch}
              refetch={refetch}
              params={params}
              setQueryParams={setQueryParams}
              isPending={isPending}
              data={data}
            />
          ) : selectedTab == 'CATEGORIZED' ? (
            <CategorizedTransactionsTable
              AccountRefetch={AccountRefetch}
              refetch={refetch}
              params={params}
              setQueryParams={setQueryParams}
              isPending={isPending}
              data={data}
            />
          ) : (
            <ExcludedTransactionsTable
              AccountRefetch={AccountRefetch}
              refetch={refetch}
              params={params}
              setQueryParams={setQueryParams}
              isPending={isPending}
              data={data}
            />
          )}
        </div>
      )}
      {selectedTopTab == 'RULE' && <Rule />}
      {selectedTopTab == 'BANK_DEPOSIT' && <BankDeposit />}
    </div>
  );
};

export default Page;
