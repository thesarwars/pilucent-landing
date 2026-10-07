
export interface SaleTypeOption {
  url: string;
  api: string;
  label: string;
}

export const SALE_TYPES: SaleTypeOption[] = [
  { url: 'all', api: 'all', label: 'All' },
  { url: 'invoice', api: 'invoice', label: 'Invoice' },
  { url: 'estimate', api: 'estimate', label: 'Estimate' },
  { url: 'sale receipt', api: 'sale_receipt', label: 'Sale Receipt' },
  { url: 'refund receipt', api: 'refund_receipt', label: 'Refund Receipt' },
  { url: 'credit note', api: 'credit_note', label: 'Credit Note' },
  { url: 'payment received', api: 'payment_received', label: 'Payment Received' },
];

// URL form ("sale receipt") -> API form ("sale_receipt")
export const toApiSaleType = (value?: string | null) =>
  (value || 'all').trim().replace(/\s+/g, '_');

// API form ("sale_receipt") -> URL form ("sale receipt")
export const toUrlSaleType = (value?: string | null) =>
  (value || 'all').trim().replace(/_/g, ' ');

// Pretty label for any form ("sale_receipt" | "sale receipt" -> "Sale Receipt")
export const saleTypeLabel = (value?: string | null) => {
  const api = toApiSaleType(value);
  const match = SALE_TYPES.find((t) => t.api === api);
  if (match) return match.label;
  return toUrlSaleType(value)
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};
