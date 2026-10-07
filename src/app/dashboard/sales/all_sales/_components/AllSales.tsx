'use client';
import SalesOverviewCard from './SalesOverviewCard';
import AllSalesTable from './AllSalesTables/AllSalesTable';
import NewTransactionMenu from './NewTransactionMenu';
import { Breadcrumb } from '@/components/violet';

const AllSales = () => {
  return (
    <div className="font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales' },
          { label: 'All Sales' },
        ]}
      />

      {/* Header */}
      <div className="mb-5 mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="m-0 text-[32px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Sales
          </h1>
          <p className="mt-0.5 text-sm text-v-ink500">
            Every estimate, invoice, receipt and payment in one place.
          </p>
        </div>
        <NewTransactionMenu />
      </div>

      <SalesOverviewCard />
      <AllSalesTable />
    </div>
  );
};

export default AllSales;
