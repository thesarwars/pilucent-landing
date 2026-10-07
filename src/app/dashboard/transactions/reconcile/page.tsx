'use client';
import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import ReconcileForm from './_components/ReconcileForm';
import { Suspense, useEffect, useState } from 'react';
import MainLoader from '@/components/MainLoader/MainLoader';
import { useSearchParams } from 'next/navigation';
import BankReconciliation from './_components/BankReconciliation';

const Reconcile = () => {
  const actions = useSearchParams().get('a');
  const [data, setData] = useState<any>({
    bank_account_uid: '',
    beginning_balance: '',
    statement_ending_balance: '',
    statement_ending_date: '',
  });
  return (
    <div className="min-h-screen">
      <ManualBreadcrumbs
        items={[
          { label: 'Transactions', href: '#' },
          {
            label: 'Bank Reconcile',
            href: '/dashboard/transactions/reconcile',
          },
        ]}
        className="mb-5 mt-0"
      />
      {actions != '2' && <ReconcileForm data={data} setData={setData} />}
      {actions == '2' && <BankReconciliation data={data} />}
    </div>
  );
};

const Page = () => {
  useEffect(() => {
    document.title = 'Bank Reconcile';
  }, []);

  return (
    <Suspense fallback={<MainLoader />}>
      <Reconcile />
    </Suspense>
  );
};

export default Page;
