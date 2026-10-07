'use client';

import { useEffect, useState } from 'react';
import { Card } from '../ui/card';

interface MetricRow {
  label: string;
  value: string | number;
  barPercentage: number;
  barColor: string;
}

interface AccountOverviewItem {
  uid: string;
  title: string;
  opening_balance: string;
  supplier_count: number;
  customer_count: number;
  invoice_count: number;
  bill_count: number;
}

export default function AccountsBalanceCardV2({
  data,
}: {
  data?: AccountOverviewItem | null;
}) {
  const formattedAmount = data?.opening_balance
    ? `$${Number(data.opening_balance).toFixed(2)}`
    : '$0.00';
  const supplierCount = data?.supplier_count ?? 0;
  const billCount = data?.bill_count ?? 0;
  const maxCount = Math.max(supplierCount, billCount, 1);

  const [metrics, setMetrics] = useState<MetricRow[]>([
    { label: 'Total Suppliers', value: 0, barPercentage: 0, barColor: 'bg-[#EDA147]' },
    { label: 'Bills', value: 0, barPercentage: 0, barColor: 'bg-gray-200' },
  ]);

  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => {
      setMetrics([
        {
          label: 'Total Suppliers',
          value: supplierCount,
          barPercentage: Math.min(100, (supplierCount / maxCount) * 100),
          barColor: 'bg-[#EDA147]',
        },
        {
          label: 'Bills',
          value: billCount,
          barPercentage: Math.min(100, (billCount / maxCount) * 100),
          barColor: 'bg-[#7E54D9]',
        },
      ]);
    }, 100);
    return () => clearTimeout(timer);
  }, [data, supplierCount, billCount, maxCount]);

  return (
    <Card
      style={{
        borderRadius: '24px',
      }}
      className="w-full flex-1 p-8 min-w-0"
    >
      {/* Header */}
      <div className="mb-11">
        <h1 className="mb-2 text-xl font-medium text-[#090E4F]">
          {data?.title ?? 'Accounts Payable (A/P)'}
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#090E4FB3]">Total A/P amount</p>
          <p className="text-2xl font-medium text-[#090E4F]">{formattedAmount}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-6">
        {metrics.map((metric, index) => (
          <div key={index}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-normal text-[#090E4F]">{metric.label}</p>
              <p className="text-sm font-medium text-[#090E4F]">{metric.value}</p>
            </div>
            <div
              style={{ background: 'rgba(9, 14, 79, 0.04)' }}
              className="h-4 w-full overflow-hidden rounded-full"
            >
              <div
                className={`h-full rounded-full ${metric.barColor} transition-all duration-700 ease-out`}
                style={{ width: `${metric.barPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-[#090E4F]">Bills</p>
          <p className="text-sm font-medium text-[#090E4F]">{billCount}</p>
        </div>
        <div
          style={{ background: 'rgba(9, 14, 79, 0.04)' }}
          className="h-4 w-full overflow-hidden rounded-full"
        >
          <div className="h-full rounded-full transition-all duration-700 ease-out" />
        </div>
      </div> */}
    </Card>
  );
}
