import type { VioletTone } from '@/components/violet';

/**
 * UI helpers shared by the expenses tables. Logic (status derivation, payee name)
 * is ported from the per-type tables so behaviour stays identical — only the
 * presentation changes.
 */

export const supplierName = (s: any) =>
  `${s?.first_name || ''} ${s?.last_name || ''}`.replace(/\s+/g, ' ').trim();

/** Status label + Violet tone, derived from the open balance like the originals. */
export function deriveExpenseStatus(row: any): { label: string; tone: VioletTone } {
  const isPaid = Number(row?.due_total) === 0;
  const isPartial = Number(row?.due_total) > 0 && Number(row?.due_total) < Number(row?.total);
  return {
    label: isPartial ? 'PARTIALLY' : isPaid ? 'PAID' : 'OPEN',
    tone: isPartial ? 'warn' : isPaid ? 'success' : 'violet',
  };
}

/** The type-switcher options (value matches AllExpensesTable's `tableType`). */
export const EXPENSE_TYPES: { value: string; label: string }[] = [
  { value: 'bill', label: 'Bill' },
  { value: 'purchase', label: 'Purchase Order' },
  { value: 'expense', label: 'Expense' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'payment', label: 'Bill Payment' },
  { value: 'credit', label: 'Supplier Credit' },
  { value: 'payBill', label: 'Pay Bill' },
];
