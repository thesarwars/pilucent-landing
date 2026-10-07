'use client';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useAppSelector } from '@/app/redux/store';
import { Breadcrumb } from '@/components/violet';
import AllExpensesTable from './AllExpensesTable';
import SupplierOverviewCard from '../../suppliers/_components/Overview';
import NewExpenseMenu from './NewExpenseMenu';

const AllExpenses = () => {
  const { Permissions } = useAppSelector((state) => state.Permissions);

  return (
    <div className="font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Expenses' },
          { label: 'All expenses' },
        ]}
      />

      {/* Header */}
      <div className="relative z-[300] mb-5 mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Expenses
          </h1>
          <p className="mt-0.5 text-sm text-v-ink500">
            Every bill you owe, and what needs paying first.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {Permissions?.includes('add_paybill') && (
            <Link
              href="/dashboard/expenses/expenses/pay-bill"
              className="flex items-center gap-1.5 rounded-v-btn border border-white/75 bg-white/60 px-[15px] py-2.5 text-[12.5px] font-semibold text-v-ink700 backdrop-blur-md transition-colors hover:text-v-primary"
            >
              <Check className="h-4 w-4" /> Pay bills
            </Link>
          )}
          <NewExpenseMenu />
        </div>
      </div>

      <SupplierOverviewCard />
      <AllExpensesTable />
    </div>
  );
};

export default AllExpenses;
