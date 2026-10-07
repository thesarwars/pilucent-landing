'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SALE_TYPES } from './saleTypes';

// Shared dropdown for every All Sales table. It is the single source of truth
// for the selected sale type: it reads the current value from the URL
// (?sale_type=...) and, on change, writes the readable/spaced value back to the
// URL so the selection is reflected in the address bar and is bookmarkable.
const SaleTypeSelect = () => {
  const router = useRouter();
  const current = useSearchParams().get('sale_type') || 'all';

  return (
    <select
      value={current}
      onChange={(e) =>
        router.push(`/dashboard/sales/all_sales?sale_type=${e.target.value}`)
      }
      className="rounded-md border px-5 py-[10px] text-accent_soft_blue outline-none"
    >
      {SALE_TYPES.map((t) => (
        <option key={t.url} value={t.url}>
          {t.label}
        </option>
      ))}
    </select>
  );
};

export default SaleTypeSelect;
