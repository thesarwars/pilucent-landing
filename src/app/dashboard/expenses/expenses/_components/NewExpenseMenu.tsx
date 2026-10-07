'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useAppSelector } from '@/app/redux/store';
import { cn } from '@/lib/utils';

interface Item {
  label: string;
  href: string;
  perm: string;
  divider?: boolean;
}

// Same routes + permission gates as the original RedirectExpenseDropdown,
// ordered per the spec (Bill / Expense / Cheque / Purchase order / Bill payment / Supplier credit).
const ITEMS: Item[] = [
  { label: 'Bill', href: '/dashboard/expenses/expenses/bill', perm: 'add_purchase' },
  { label: 'Expense', href: '/dashboard/expenses/expenses/expense', perm: 'add_expense' },
  { label: 'Cheque', href: '/dashboard/expenses/expenses/cheque', perm: 'add_purchase' },
  { label: 'Purchase order', href: '/dashboard/expenses/expenses/purchase', perm: 'add_purchase' },
  { label: 'Bill payment', href: '/dashboard/expenses/expenses/bill-payment', perm: 'add_purchasepayment' },
  { label: 'Supplier credit', href: '/dashboard/expenses/expenses/supplier-credit', perm: 'add_creditnote' },
];

export default function NewExpenseMenu() {
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
      {/* split button */}
      <div className="flex overflow-hidden rounded-v-btn shadow-v-btn">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 bg-v-primary px-[18px] py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-v-primary-hover"
        >
          <Plus className="h-4 w-4" />
          New transaction
        </button>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-center border-l border-white/25 bg-[#6B3FE8] px-2.5 text-white transition-colors hover:bg-v-primary-hover"
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} />
        </button>
      </div>

      {open && items.length > 0 && (
        <div className="absolute right-0 top-12 z-[300] w-[200px] animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white p-1.5 shadow-v-modal">
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
