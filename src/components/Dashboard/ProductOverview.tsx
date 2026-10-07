'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { fetchProductsOverview } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';

/** Figma: fill rgba(255,255,255,0.30), stroke 1px #D3CBFB, padding 25px */
const CARD_STYLE = {
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.3)',
  border: '1px solid #D3CBFB',
  padding: '25px',
} as const;

const NAVY = '#00035F';
/** Figma: View More link — blue-purple accent */
const LINK_COLOR = '#6B5CE7';

type ProductsOverviewData = {
  stock_count?: number;
  low_stock_count?: number;
  out_of_stock_count?: number;
  expired_stock_count?: number;
};

type StockMetricRow = {
  title: string;
  getValue: (d: ProductsOverviewData | undefined) => number;
  icon: React.ReactNode;
};

const STOCK_METRICS: StockMetricRow[] = [
  {
    title: 'Total Stock',
    getValue: (d) => d?.stock_count ?? 0,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={21}
        height={28}
        viewBox="0 0 21 28"
        fill="none"
        className="shrink-0"
        aria-hidden
      >
        <path
          d="M3.243 10.657L0.707609 8.12239C0.316825 7.73173 0.316776 7.09822 0.7075 6.7075C1.09822 6.31678 1.73173 6.31683 2.12239 6.70761L4.657 9.243H19.899C20.0549 9.24299 20.2086 9.27941 20.3479 9.34937C20.4872 9.41932 20.6082 9.52086 20.7012 9.6459C20.7943 9.77093 20.8569 9.91598 20.8839 10.0695C20.9109 10.223 20.9017 10.3807 20.857 10.53L18.457 18.53C18.3953 18.7361 18.2687 18.9168 18.0961 19.0452C17.9235 19.1737 17.7141 19.243 17.499 19.243H5.243V21.243H15.243C15.7953 21.243 16.243 21.6907 16.243 22.243C16.243 22.7953 15.7953 23.243 15.243 23.243H4.243C3.97778 23.243 3.72343 23.1376 3.53589 22.9501C3.34836 22.7626 3.243 22.5082 3.243 22.243V10.657ZM5.243 11.243V17.243H16.755L18.555 11.243H5.243ZM4.743 27.243C4.34518 27.243 3.96364 27.085 3.68234 26.8037C3.40104 26.5224 3.243 26.1408 3.243 25.743C3.243 25.3452 3.40104 24.9636 3.68234 24.6823C3.96364 24.401 4.34518 24.243 4.743 24.243C5.14082 24.243 5.52236 24.401 5.80366 24.6823C6.08496 24.9636 6.243 25.3452 6.243 25.743C6.243 26.1408 6.08496 26.5224 5.80366 26.8037C5.52236 27.085 5.14082 27.243 4.743 27.243ZM16.743 27.243C16.3452 27.243 15.9636 27.085 15.6823 26.8037C15.401 26.5224 15.243 26.1408 15.243 25.743C15.243 25.3452 15.401 24.9636 15.6823 24.6823C15.9636 24.401 16.3452 24.243 16.743 24.243C17.1408 24.243 17.5224 24.401 17.8037 24.6823C18.085 24.9636 18.243 25.3452 18.243 25.743C18.243 26.1408 18.085 26.5224 17.8037 26.8037C17.5224 27.085 17.1408 27.243 16.743 27.243Z"
          fill="#04103B"
        />
        <path
          d="M9.87891 3.47705L12.356 0.999938L14.8331 3.47705"
          stroke="#04103B"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.348 1.00749V7.70345"
          stroke="#04103B"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Low Stock',
    getValue: (d) => d?.low_stock_count ?? 0,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={21}
        height={28}
        viewBox="0 0 21 28"
        fill="none"
        className="shrink-0"
        aria-hidden
      >
        <path
          d="M3.243 10.657L0.707609 8.12239C0.316825 7.73173 0.316776 7.09822 0.7075 6.7075C1.09822 6.31678 1.73173 6.31683 2.12239 6.70761L4.657 9.243H19.899C20.0549 9.24299 20.2086 9.27941 20.3479 9.34937C20.4872 9.41932 20.6082 9.52086 20.7012 9.6459C20.7943 9.77093 20.8569 9.91598 20.8839 10.0695C20.9109 10.223 20.9017 10.3807 20.857 10.53L18.457 18.53C18.3953 18.7361 18.2687 18.9168 18.0961 19.0452C17.9235 19.1737 17.7141 19.243 17.499 19.243H5.243V21.243H15.243C15.7953 21.243 16.243 21.6907 16.243 22.243C16.243 22.7953 15.7953 23.243 15.243 23.243H4.243C3.97778 23.243 3.72343 23.1376 3.53589 22.9501C3.34836 22.7626 3.243 22.5082 3.243 22.243V10.657ZM5.243 11.243V17.243H16.755L18.555 11.243H5.243ZM4.743 27.243C4.34518 27.243 3.96364 27.085 3.68234 26.8037C3.40104 26.5224 3.243 26.1408 3.243 25.743C3.243 25.3452 3.40104 24.9636 3.68234 24.6823C3.96364 24.401 4.34518 24.243 4.743 24.243C5.14082 24.243 5.52236 24.401 5.80366 24.6823C6.08496 24.9636 6.243 25.3452 6.243 25.743C6.243 26.1408 6.08496 26.5224 5.80366 26.8037C5.52236 27.085 5.14082 27.243 4.743 27.243ZM16.743 27.243C16.3452 27.243 15.9636 27.085 15.6823 26.8037C15.401 26.5224 15.243 26.1408 15.243 25.743C15.243 25.3452 15.401 24.9636 15.6823 24.6823C15.9636 24.401 16.3452 24.243 16.743 24.243C17.1408 24.243 17.5224 24.401 17.8037 24.6823C18.085 24.9636 18.243 25.3452 18.243 25.743C18.243 26.1408 18.085 26.5224 17.8037 26.8037C17.5224 27.085 17.1408 27.243 16.743 27.243Z"
          fill="#04103B"
        />
        <path
          d="M9.87891 3.47705L12.356 0.999938L14.8331 3.47705"
          stroke="#04103B"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.348 1.00749V7.70345"
          stroke="#04103B"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Out of Stock',
    getValue: (d) => d?.out_of_stock_count ?? 0,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={17}
        height={22}
        viewBox="0 0 17 22"
        fill="none"
        className="shrink-0"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.7483 3C15.7483 1.89543 14.8529 1 13.7483 1H3C1.89543 1 1 1.89543 1 3V18.667C1 19.7716 1.89543 20.667 3 20.667H13.7483C14.8529 20.667 15.7483 19.7716 15.7483 18.667V3Z"
          stroke="#04103B"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.12891 5.04224H8.1517"
          stroke="#04103B"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.12891 9.51221H12.1745"
          stroke="#04103B"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.12891 14.8757H12.1745"
          stroke="#04103B"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Expired Stock',
    getValue: (d) => d?.expired_stock_count ?? 0,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={44}
        height={44}
        viewBox="0 0 44 44"
        fill="none"
        className="shrink-0"
        aria-hidden
      >
        <circle cx={22} cy={22} r={21.5} stroke="#D3CBFB" />
        <path
          d="M11.5 32.5C11.5 30.3783 12.3429 28.3434 13.8431 26.8431C15.3434 25.3429 17.3783 24.5 19.5 24.5C21.6217 24.5 23.6566 25.3429 25.1569 26.8431C26.6571 28.3434 27.5 30.3783 27.5 32.5H11.5ZM19.5 23.5C16.185 23.5 13.5 20.815 13.5 17.5C13.5 14.185 16.185 11.5 19.5 11.5C22.815 11.5 25.5 14.185 25.5 17.5C25.5 20.815 22.815 23.5 19.5 23.5Z"
          stroke="#04103B"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26.5 12.5C28.9862 12.5 31 14.9293 31 17.9286C31 20.9279 28.9862 23.2619 26.5 23.2619C28.0913 23.2619 29.6174 24.0245 30.7426 25.3819C31.8679 26.7393 32.5 28.5803 32.5 30.5H29.9286"
          stroke="#04103B"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const PRODUCTS_HREF = '/dashboard/sales/product_services';

const ProductOverview = () => {
  const { data, isPending } = useFetch(
    ['products_overview'],
    fetchProductsOverview
  );

  const overview = data as ProductsOverviewData | undefined;

  const rows = useMemo(
    () =>
      STOCK_METRICS.map((m) => ({
        ...m,
        value: m.getValue(overview),
      })),
    [overview]
  );

  return (
    <div className="mb-8 w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        {rows.map((m) => (
          <div
            key={m.title}
            className="flex flex-col transition-shadow duration-200"
            style={CARD_STYLE}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-accent_text_gray">{m.title}</p>
                {isPending ? (
                  <div
                    className="mt-2 h-9 w-20 max-w-full animate-pulse rounded-md bg-neutral-200/80"
                    aria-hidden
                  />
                ) : (
                  <p
                    className="mt-2 truncate text-2xl font-bold tracking-tight sm:text-[1.65rem]"
                    style={{ color: NAVY }}
                  >
                    {m.value.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-start justify-end">{m.icon}</div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link
                href={PRODUCTS_HREF}
                className="text-sm font-medium underline-offset-4 transition-colors hover:underline"
                style={{ color: LINK_COLOR }}
              >
                View More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductOverview;
