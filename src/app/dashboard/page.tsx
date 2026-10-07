'use client';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { useAppSelector } from '../redux/store';
import { useRouter } from 'next/navigation';
import { UserIcon } from 'lucide-react';

import CustomizableDashboard from '@/components/DashboardV2/CustomizableDashboard';

const Page = () => {
  const { UserData } = useAppSelector((state) => state.userData);
  const { Company } = useAppSelector((state) => state.CompanyData);
  const router = useRouter();

  useEffect(() => {
    if (UserData?.is_employee && !UserData?.is_admin) {
      router.push('/dashboard/hris/profile?uid=' + UserData?.employee?.uid);
    }
  }, [UserData]);

  const userId = String(UserData?.uid ?? UserData?.id ?? 'guest');
  const companyId = String(Company?.uid ?? Company?.id ?? 'default');

  return (
    <div className="mx-auto max-w-[1630px] space-y-4 pb-6 pt-4 text-sm text-accent_text_black md:px-0 lg:pt-6 xl:space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-normal text-accent_text_black">
          Good Day,{' '}
          {UserData?.image?.original ? (
            <Image
              src={UserData?.image?.original}
              alt="user"
              width={100}
              height={100}
              className="size-9 rounded-full object-cover object-top"
            />
          ) : (
            <UserIcon className="h-7 w-7" />
          )}
          {UserData?.name}
        </h1>
        <p className="mb-1 mt-1.5 text-sm font-normal text-accent_text_black/60">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      <CustomizableDashboard userId={userId} companyId={companyId} />
    </div>
  );
};

export default Page;

/* ============================================================================
 * LEGACY DASHBOARD (commented out — replaced by DashboardV2 implementation above)
 * ============================================================================
 *
 * import Image from 'next/image';
 * import React, { useEffect } from 'react';
 * import { useAppDispatch, useAppSelector } from '../redux/store';
 * import FinancialSummary from '@/components/Dashboard/financial-dashboard';
 * import ExpensesCard from '@/components/Dashboard/ExpensesCard';
 * import ExpensesChart from '@/components/Dashboard/ExpensesChart';
 * import ReportsCard from '@/components/Dashboard/ReportsCard';
 * import AccountsPayableCard from '@/components/Dashboard/AccountsPayableCard';
 * import MileageDashboard from '@/components/Dashboard/MileageCard';
 * import AccountsReceivableCard from '@/components/Dashboard/AccountsReceivableCard';
 * import { getAccountOverview } from '../helpers/backend';
 * import { useQuery } from '@tanstack/react-query';
 * import Head from 'next/head';
 * import ProfitLossChart from '@/components/Dashboard/ProfitLossChart';
 * import BankAccountsGrid from '@/components/Dashboard/BankAccountsGrid';
 * import BankBalanceCard from '@/components/Dashboard/BankBalanceCard';
 * import AccountsReceivableCardV2 from '@/components/Dashboard/AccountsReceivableCardV2';
 * import ReportCard from '@/components/Dashboard/ReportsCard';
 * import AccountsBalanceCardV2 from '@/components/Dashboard/AccountsBalanceCardV2';
 * import MileageCard from '@/components/Dashboard/MileageCard';
 * import Activity from '@/components/Dashboard/Activity';
 * import Navigation from '@/components/Dashboard/Navigation';
 * import ProfitLoss from '@/components/Dashboard/ProfitLoss';
 * import { UserIcon } from 'lucide-react';
 * import InvoiceOverview from '@/components/Dashboard/InvoiceOverview';
 * import OpenSupportTicket from '@/components/Dashboard/OpenSupportTicket';
 * import ProductOverview from '@/components/Dashboard/ProductOverview';
 * import TopCustomers from '@/components/Dashboard/TopCustomers';
 * import { useRouter } from 'next/navigation';
 *
 * const Page = () => {
 *   const { UserData } = useAppSelector((state) => state.userData);
 *   //set the data employee data in redux
 *   const { data, isPending, refetch } = useQuery({
 *     queryKey: ['accounts-overview-data'],
 *     queryFn: () => getAccountOverview(),
 *   });
 *   const router = useRouter();
 *   const payableData = data?.results?.find((r: { title: string }) =>
 *     r.title?.toLowerCase().includes('payable')
 *   );
 *   const receivableData = data?.results?.find((r: { title: string }) =>
 *     r.title?.toLowerCase().includes('receivable')
 *   );
 *
 *   useEffect(() => {
 *     if (UserData?.is_employee && !UserData?.is_admin) {
 *       router.push('/dashboard/hris/profile?uid=' + UserData?.employee?.uid);
 *     }
 *   }, [UserData]);
 *
 *   return (
 *     <div className="mx-auto max-w-[1630px] pb-4 pt-4 md:px-0 lg:pt-6">
 *       <div>
 *         <h1 className="flex items-center gap-2 text-2xl font-semibold">
 *           Good Day,{' '}
 *           {UserData?.image?.original ? (
 *             <Image
 *               src={UserData?.image?.original}
 *               alt="user"
 *               width={100}
 *               height={100}
 *               className="size-9 rounded-full object-cover object-top"
 *             />
 *           ) : (
 *             <UserIcon className="h-7 w-7" />
 *           )}
 *           {UserData?.name}
 *         </h1>
 *         <p className="mb-4 mt-2 text-sm text-accent_text_gray">
 *           Manage your finances and get a clear overview of your financial performance.
 *         </p>
 *       </div>
 *       <ProductOverview />
 *       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5 2xl:gap-6">
 *         <div className="min-w-0 lg:col-span-2">
 *           <ProfitLoss />
 *         </div>
 *         <div className="min-w-0 lg:col-span-1">
 *           <TopCustomers />
 *         </div>
 *       </div>
 *       <div className="mt-4 flex flex-col gap-4 lg:flex-row 2xl:gap-6">
 *         <InvoiceOverview />
 *         <OpenSupportTicket />
 *       </div>
 *       <div className="mt-6 flex justify-between gap-6 max-2xl:hidden">
 *         <BankAccountsGrid />
 *         <BankBalanceCard />
 *         <AccountsReceivableCardV2 data={receivableData} />
 *       </div>
 *       <div className="mt-4 grid grid-cols-1 gap-5 max-2xl:hidden xl:grid-cols-3">
 *         <Activity />
 *         <AccountsBalanceCardV2 data={payableData} />
 *         <Navigation />
 *       </div>
 *       <div className="mt-4 flex flex-1 flex-col gap-4 lg:flex-row 2xl:hidden">
 *         <BankAccountsGrid />
 *         <BankBalanceCard />
 *       </div>
 *       <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row 2xl:hidden">
 *         <AccountsReceivableCardV2 data={receivableData} />
 *         <ReportCard />
 *       </div>
 *       <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row 2xl:hidden">
 *         <AccountsBalanceCardV2 data={payableData} />
 *         <MileageCard />
 *       </div>
 *       <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row 2xl:hidden">
 *         <Activity />
 *         <Navigation />
 *         <ProfitLoss />
 *       </div>
 *     </div>
 *   );
 * };
 *
 * export default Page;
 * ========================================================================== */
