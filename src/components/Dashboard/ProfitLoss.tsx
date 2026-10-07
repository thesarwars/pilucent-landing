'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import { Card } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getProfitLossesDashboard } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

const PROFIT_COLOR = '#5041BC';
const LOSS_COLOR = '#EA8F95';
const CARD_BG = '#F8F9FD';
const TEXT_PRIMARY = '#2D3748';
const TEXT_MUTED = '#A0AEC0';
const GRID_LINE = '#E8EAF4';
/** Plot area bg (Figma-style): top lavender → fades to transparent */
const PLOT_BG_GRADIENT =
  'linear-gradient(180deg, rgba(197, 189, 254, 0.451) 0%, rgba(80, 65, 188, 0.02) 55%, rgba(255, 255, 255, 0) 100%)';
const TOOLTIP_GRADIENT =
  'linear-gradient(145deg, #3D29D0 0%, #6D4EE6 42%, #C25FFF 100%)';

type ProfitLossItem = {
  month: string;
  profit: number;
  loss: number;
};

function formatYAxisTick(val: number): string {
  if (!Number.isFinite(val) || val === 0) return '0';
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (Math.abs(val) >= 1000) {
    return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
  }
  return String(Math.round(val));
}

const ProfitLoss = () => {
  const [isClient, setIsClient] = useState(false);

  const { data, setQueryParams, params } = useFetch(
    ['profit-loss'],
    getProfitLossesDashboard,
    { months: 7 }
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartData: ProfitLossItem[] = useMemo(() => {
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }, [data]);

  const categories = useMemo(
    () => chartData.map((item) => item.month),
    [chartData]
  );

  const profitData = useMemo(
    () => chartData.map((item) => Number(item.profit) || 0),
    [chartData]
  );

  const lossData = useMemo(
    () => chartData.map((item) => Number(item.loss) || 0),
    [chartData]
  );

  const maxSeriesValue = useMemo(
    () => Math.max(0, ...profitData, ...lossData),
    [profitData, lossData]
  );

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: 'area' as const,
        toolbar: { show: false },
        zoom: { enabled: false },
        background: 'transparent',
        fontFamily: 'inherit',
        dropShadow: {
          enabled: true,
          top: 10,
          left: 0,
          blur: 18,
          opacity: 0.35,
          color: PROFIT_COLOR,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 4,
      },
      colors: [PROFIT_COLOR, LOSS_COLOR],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.05,
          inverseColors: false,
          opacityFrom: 0.08,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        crosshairs: {
          show: true,
          width: 52,
          position: 'back',
          opacity: 1,
          stroke: {
            color: 'transparent',
            width: 0,
            dashArray: 0,
          },
          fill: {
            type: 'gradient',
            color: '#5041BC',
            gradient: {
              colorFrom: '#3D29D0',
              colorTo: '#C5BDFE',
              stops: [0, 100],
              opacityFrom: 0.38,
              opacityTo: 0.04,
            },
          },
          dropShadow: {
            enabled: false,
            left: 0,
            top: 0,
            blur: 0,
            opacity: 0,
          },
        },
        labels: {
          offsetY: 10,
          style: {
            colors: TEXT_MUTED,
            fontSize: '12px',
            fontWeight: 400,
          },
        },
      },
      yaxis: {
        min: 0,
        max: maxSeriesValue > 0 ? Math.ceil(maxSeriesValue * 1.12) : 10,
        tickAmount: 5,
        crosshairs: {
          show: false,
          stroke: { width: 0, dashArray: 0, color: 'transparent' },
        },
        labels: {
          offsetX: -6,
          padding: 4,
          formatter: (val: number) => formatYAxisTick(val),
          style: {
            colors: TEXT_MUTED,
            fontSize: '11px',
            fontWeight: 400,
          },
        },
      },
      grid: {
        borderColor: GRID_LINE,
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { left: 18, right: 14, top: 14, bottom: 18 },
      },
      markers: {
        size: 0,
        strokeWidth: 2,
        strokeColors: [PROFIT_COLOR, LOSS_COLOR],
        colors: ['#ffffff', '#ffffff'],
        hover: {
          size: 7,
          sizeOffset: 0,
        },
      },
      tooltip: {
        shared: false,
        intersect: false,
        followCursor: false,
        custom: ({
          series,
          seriesIndex,
          dataPointIndex,
          w,
        }: {
          series: number[][];
          seriesIndex: number;
          dataPointIndex: number;
          w: { globals: { categoryLabels: string[] } };
        }) => {
          const month =
            w.globals.categoryLabels[dataPointIndex] ?? '';
          const raw = series[seriesIndex]?.[dataPointIndex];
          const val = Number(raw) || 0;
          const formatted = `$${val.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}`;
          return (
            '<div style="padding:11px 16px;background:' +
            TOOLTIP_GRADIENT +
            ';border-radius:15px;color:#fff;box-shadow:0 10px 28px rgba(61,41,208,0.35);">' +
            '<div style="font-size:11px;opacity:0.92;margin-bottom:4px">' +
            month +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px">' +
            '<span style="display:inline-block;width:7px;height:7px;border-radius:9999px;background:#fff"></span>' +
            '<span style="font-size:18px;font-weight:700;line-height:1.2">' +
            formatted +
            '</span>' +
            '</div>' +
            '</div>'
          );
        },
      },
      legend: { show: false },
      dataLabels: { enabled: false },
    } as ApexOptions),
    [categories, maxSeriesValue]
  );

  const series = [
    { name: 'Profit', data: profitData },
    { name: 'Loss', data: lossData },
  ];

  const filterOptions = [
    { value: 7, label: 'Last 7 month' },
    { value: 3, label: 'Last 3 month' },
    { value: 12, label: 'Last 12 month' },
  ];

  const selectedMonths = Number(params?.months) || 7;

  return (
    <Card
      style={{ borderRadius: '18px' }}
      className="w-full flex-1 border-0 p-6 shadow-[0_4px_24px_rgba(45,55,72,0.06)] sm:p-7"
    >
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h2
            className="mb-2.5 text-lg font-semibold tracking-tight sm:text-xl"
            style={{ color: TEXT_PRIMARY }}
          >
            Profit & Loss
          </h2>
          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            <p className="flex items-center gap-2">
              <span
                className="block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: PROFIT_COLOR }}
              />
              <span className="text-sm font-normal" style={{ color: TEXT_MUTED }}>
                Profit
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span
                className="block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: LOSS_COLOR }}
              />
              <span className="text-sm font-normal" style={{ color: TEXT_MUTED }}>
                Loss
              </span>
            </p>
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              style={{ borderRadius: '12px' }}
              className="flex shrink-0 items-center gap-2 border border-[#E2E8F0] bg-white/80 px-3.5 py-2 text-sm font-medium shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:border-[#CBD5E0]"
            >
              <span style={{ color: TEXT_MUTED }}>
                {filterOptions.find((f) => f.value === selectedMonths)?.label}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 1.5V4.5M6 1.5V4.5"
                  stroke={TEXT_MUTED}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.75 3H8.25C5.42157 3 4.00736 3 3.12868 3.87868C2.25 4.75736 2.25 6.17157 2.25 9V10.5C2.25 13.3284 2.25 14.7427 3.12868 15.6213C4.00736 16.5 5.42157 16.5 8.25 16.5H9.75C12.5784 16.5 13.9927 16.5 14.8713 15.6213C15.75 14.7427 15.75 13.3284 15.75 10.5V9C15.75 6.17157 15.75 4.75736 14.8713 3.87868C13.9927 3 12.5784 3 9.75 3Z"
                  stroke={TEXT_MUTED}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.25 7.5H15.75"
                  stroke={TEXT_MUTED}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto border-[#E2E8F0] p-1" align="end">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setQueryParams({ months: option.value }, true)}
                className={`block w-full rounded-lg px-4 py-2 text-left text-sm transition-colors hover:bg-[#F8F9FD] ${
                  selectedMonths === option.value
                    ? 'font-semibold'
                    : 'font-normal'
                }`}
                style={{
                  color:
                    selectedMonths === option.value ? TEXT_PRIMARY : TEXT_MUTED,
                }}
              >
                {option.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <div
        className="relative mt-3 overflow-hidden rounded-2xl px-0.5 pt-1"
        // style={{ background: PLOT_BG_GRADIENT }}
      >
        {isClient ? (
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="area"
            height={228}
          />
        ) : (
          <div style={{ height: 228 }} />
        )}
      </div>
    </Card>
  );
};

export default ProfitLoss;
