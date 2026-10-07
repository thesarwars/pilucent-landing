'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useAppSelector } from '@/app/redux/store';
import { cn } from '@/lib/utils';
import { VioletButton } from '@/components/violet';

interface Item {
  label: string;
  href: string;
  perm: string;
  divider?: boolean;
}

// Same routes + permission gates as the original RedirectDropdown, reordered to
// match the spec menu (Invoice / Payment / Estimate / Sales receipt / — / Credit note / Refund receipt).
const ITEMS: Item[] = [
  { label: 'Invoice', href: '/dashboard/sales/all_sales/invoice', perm: 'add_sale' },
  { label: 'Payment', href: '/dashboard/sales/all_sales/payment', perm: 'add_salepaymentreceive' },
  { label: 'Estimate', href: '/dashboard/sales/all_sales/estimate', perm: 'add_sale' },
  { label: 'Sales receipt', href: '/dashboard/sales/all_sales/sales_receipt', perm: 'add_salereceipt' },
  { label: 'Credit note', href: '/dashboard/sales/all_sales/credit_note', perm: 'add_creditnote', divider: true },
  { label: 'Refund receipt', href: '/dashboard/sales/all_sales/refund_receipt', perm: 'add_salereceipt' },
];

export default function NewTransactionMenu() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const perms = Array.isArray(Permissions) ? Permissions : [];

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const items = ITEMS.filter((it) => perms.includes(it.perm));

  return (
    <div className="relative" ref={ref}>
      <VioletButton
        variant="primary"
        size="md"
        leftIcon={<Plus className="h-4 w-4" />}
        rightIcon={
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} />
        }
        onClick={() => setOpen((v) => !v)}
      >
        New transaction
      </VioletButton>

      {open && items.length > 0 && (
        <div className="absolute right-0 top-12 z-50 w-[200px] animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white p-1.5 shadow-v-modal">
          {items.map((it, idx) => (
            <React.Fragment key={it.label}>
              {it.divider && idx > 0 && (
                <div className="my-1 border-t border-[rgba(22,23,42,0.07)]" />
              )}
              <Link
                href={it.href}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between rounded-[9px] px-3 py-2 text-[13px] font-semibold text-v-ink700 transition-colors hover:bg-v-tint100 hover:text-v-primary"
              >
                {it.label}
                <ChevronRight className="h-[14px] w-[14px] text-v-ink300 transition-colors group-hover:text-v-primary" />
              </Link>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
