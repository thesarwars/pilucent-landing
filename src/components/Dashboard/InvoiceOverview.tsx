'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/card';
import { useFetch } from '@/app/helpers/hooks';
import { fetchInvoiceOverview } from '@/app/helpers/backend';

type InvoiceBucket = {
  invoice_count?: number;
  amount?: number;
};

type InvoiceOverviewResponse = {
  draft?: InvoiceBucket;
  pending?: InvoiceBucket;
  open?: InvoiceBucket;
  accepted?: InvoiceBucket;
  paid?: InvoiceBucket;
  total?: InvoiceBucket;
};

interface DisplayRow {
  label: string;
  count: number;
  amount: number;
  color: string;
  percentage: number;
}

function readBucket(b: InvoiceBucket | undefined) {
  return {
    count: Number(b?.invoice_count ?? 0),
    amount: Number(b?.amount ?? 0),
  };
}

const ROW_SPECS: ReadonlyArray<{
  apiKey: keyof Pick<InvoiceOverviewResponse, 'draft' | 'pending' | 'open' | 'accepted' | 'paid'>;
  label: string;
  color: string;
}> = [
  { apiKey: 'draft', label: 'Draft', color: '#FBBF24' },
  { apiKey: 'pending', label: 'Not Paid', color: '#EF4444' },
  { apiKey: 'open', label: 'Open', color: '#38BDF8' },
  { apiKey: 'accepted', label: 'Accepted', color: '#7C3AED' },
  { apiKey: 'paid', label: 'Fully Paid', color: '#22C55E' },
];

const InvoiceOverview = () => {
  const [animated, setAnimated] = useState(false);
  const { data, isPending } = useFetch(['invoice_overview'], fetchInvoiceOverview);

  const overview = data as InvoiceOverviewResponse | undefined;

  const rows = useMemo((): DisplayRow[] => {
    const totalAmt = readBucket(overview?.total).amount;
    const denom = totalAmt > 0 ? totalAmt : 0;

    return ROW_SPECS.map(({ apiKey, label, color }) => {
      const { count, amount } = readBucket(overview?.[apiKey]);
      const percentage = denom > 0 ? Math.min(100, (amount / denom) * 100) : 0;
      return { label, count, amount, color, percentage };
    });
  }, [overview]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card
      style={{ borderRadius: '24px' }}
      className={`w-full flex-1 p-5 2xl:p-8 ${isPending ? 'opacity-70' : ''}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-medium text-accent_primary">Invoice Overview</h1>
      </div>

      <div className="flex flex-col gap-7">
        {rows.map((status) => (
          <div key={status.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-accent_primary">{status.label}</span>
              <div className="flex items-center gap-1.5 text-sm text-accent_text_gray">
                <span className="font-medium text-accent_primary">{status.count}</span>
                <span className="text-accent_text_gray">|</span>
                <span>
                  $
                  {status.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-accent_bg_bright_gray">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: animated ? `${status.percentage}%` : '0%',
                  backgroundColor: status.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InvoiceOverview;
