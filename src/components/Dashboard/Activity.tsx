'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchProductsOverview } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

interface ProductsOverview {
  stock_count?: number;
  low_stock_count?: number;
  out_of_stock_count?: number;
  expired_stock_count?: number;
}

const CHART_SEGMENTS = [
  { key: 'stock', label: 'Total Stock', color: '#8C62FF' },
  { key: 'low', label: 'Low Stock', color: '#2DD4BF' },
  { key: 'out', label: 'Out of Stock', color: '#FE964A' },
  { key: 'expired', label: 'Expired Stock', color: '#C084FC' },
] as const;

const Activity = () => {
  const [isClient, setIsClient] = useState(false);
  const [filter, setFilter] = useState('all-time');

  const { data, isPending } = useFetch(
    ['products_overview'],
    fetchProductsOverview
  );

  const overview = data as ProductsOverview | undefined;

  const stats = useMemo(
    () => ({
      stock_count: overview?.stock_count ?? 0,
      low_stock_count: overview?.low_stock_count ?? 0,
      out_of_stock_count: overview?.out_of_stock_count ?? 0,
      expired_stock_count: overview?.expired_stock_count ?? 0,
    }),
    [overview]
  );

  const total = useMemo(
    () =>
      stats.stock_count +
      stats.low_stock_count +
      stats.out_of_stock_count +
      stats.expired_stock_count,
    [stats]
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const series = useMemo(
    () => [
      stats.stock_count,
      stats.low_stock_count,
      stats.out_of_stock_count,
      stats.expired_stock_count,
    ],
    [stats]
  );

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
      },
      labels: CHART_SEGMENTS.map((s) => s.label),
      colors: CHART_SEGMENTS.map((s) => s.color),
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 400,
                color: '#090E4FB3',
                offsetY: 20,
                formatter: () => 'Products',
              },
              value: {
                show: true,
                fontSize: '32px',
                fontWeight: 600,
                color: '#090E4F',
                offsetY: -15,
                formatter: () => `${total}`,
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Total',
                fontSize: '14px',
                fontWeight: 400,
                color: '#090E4FB3',
                formatter: () => `${total}`,
              },
            },
          },
        },
      },
      stroke: {
        width: 4,
        colors: ['#fff'],
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => `${val}`,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 200,
            },
          },
        },
      ],
    }),
    [total]
  );

  const legendItems = CHART_SEGMENTS.map((s, i) => ({
    label: s.label,
    color: s.color,
    value: series[i] ?? 0,
  }));

  return (
    <Card
      style={{ borderRadius: '24px' }}
      className="w-full flex-1 p-8 min-w-0"
    >
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-medium text-[#090E4F]">Product Inventory (Warehouse)</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger
            style={{ borderRadius: '32px', border: '0.5px solid #090E4F' }}
            className="w-[120px] border border-accent_cloud_gray px-4 py-5 font-medium text-[#090E4F] shadow-sm hover:bg-gray-200 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="font-lexend" value="all-time">
              All Time
            </SelectItem>
            <SelectItem className="font-lexend" value="last-30-days">
              Last 30 days
            </SelectItem>
            <SelectItem className="font-lexend" value="last-7-days">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-center">
        {isClient && !isPending ? (
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="donut"
            height={240}
            width={240}
          />
        ) : isClient && isPending ? (
          <div
            className="flex items-center justify-center text-sm text-[#090E4FB3]"
            style={{ height: 240, width: 240 }}
          >
            Loading…
          </div>
        ) : (
          <div style={{ height: 240, width: 240 }} />
        )}
      </div>

      <div className="mt-4 space-y-3">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="block size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-normal text-[#090E4F]">
                {item.label}
              </span>
            </div>
            <span className="text-sm font-medium text-[#090E4F]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Activity;
