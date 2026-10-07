import type { VioletTone } from '@/components/violet';

/**
 * UI helpers shared by the All Sales list. The /we/sales/documents endpoint
 * returns a mix of document types, so TYPE / STATUS / edit-route are derived
 * from each row. Logic is ported verbatim from the original AllListTable so the
 * behaviour (and the routes) stay identical — only presentation changes.
 */

export const getRowApiType = (row: any): string => {
  if (row?.sale_type) return row.sale_type;
  if (row?.document_type) return row.document_type;
  if (row?.is_estimated) return 'estimate';
  if (row?.is_sale_receipt) return row?.kind === 'REFUND' ? 'refund_receipt' : 'sale_receipt';
  if (row?.kind === 'SALE') return 'credit_note';
  if (row?.is_payment || row?.payment_received) return 'payment_received';
  if (row?.is_invoice) return 'invoice';
  return 'invoice';
};

/** "first middle last" with collapsed whitespace. */
export const fullName = (c: any) =>
  `${c?.first_name || ''} ${c?.middle_name ? c.middle_name : ''} ${c?.last_name || ''}`
    .replace(/\s+/g, ' ')
    .trim();

export const editRouteSegment: Record<string, string> = {
  invoice: 'invoice',
  estimate: 'estimate',
  sale_receipt: 'sales_receipt',
  refund_receipt: 'refund_receipt',
  credit_note: 'credit_note',
  payment_received: 'payment',
};

/** Status label + Violet tone, derived exactly like the original renderStatus(). */
export function deriveStatus(row: any): { label: string; tone: VioletTone } {
  const apiType = getRowApiType(row);
  if (apiType === 'sale_receipt') return { label: 'PAID', tone: 'success' };
  if (apiType === 'refund_receipt') return { label: 'REFUNDED', tone: 'teal' };
  if (apiType === 'credit_note') return { label: 'CREDITED', tone: 'violet' };
  if (apiType === 'estimate') return { label: row?.status || 'OPEN', tone: 'violet' };
  // invoice / payment_received -> derive from balance
  const isPaid = Number(row?.due_total) === 0;
  const isPartial = Number(row?.due_total) > 0 && Number(row?.due_total) < Number(row?.total);
  return {
    label: isPartial ? 'PARTIALLY' : isPaid ? 'PAID' : 'OPEN',
    tone: isPartial ? 'warn' : isPaid ? 'success' : 'violet',
  };
}
