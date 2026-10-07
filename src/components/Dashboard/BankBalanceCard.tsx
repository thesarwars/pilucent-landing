'use client';

import { useIs2XL } from '@/hooks/use-mobile';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../ui/card';
import { useFetch } from '@/app/helpers/hooks';
import { getBankOverview } from '@/app/helpers/backend';

const PURPLE = '#5041BC';
const PURPLE_LIGHT = '#8B82D8';
const PURPLE_FAINT = '#C4BFEE';

export interface BankBalanceChartPoint {
  month: string;
  value: number;
}

interface BankOverviewMonthRow {
  month: string;
  amount: number;
}

interface BankBalanceCardProps {
  balance?: number;
  transactionCount?: number;
  chartData?: BankBalanceChartPoint[];
}

// Recharts renders this inside the SVG via the `customized` prop on any chart element
const GradientDefs = () => (
  <defs>
    <linearGradient id="areaGradientInner" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={PURPLE} stopOpacity={0.55} />
      <stop offset="60%" stopColor={PURPLE_LIGHT} stopOpacity={0.28} />
      <stop offset="100%" stopColor={PURPLE_FAINT} stopOpacity={0.06} />
    </linearGradient>
    <linearGradient id="areaGradientOuter" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={PURPLE_LIGHT} stopOpacity={0.3} />
      <stop offset="50%" stopColor={PURPLE_FAINT} stopOpacity={0.18} />
      <stop offset="100%" stopColor={PURPLE_FAINT} stopOpacity={0.04} />
    </linearGradient>
  </defs>
);

const BankBalanceCard: React.FC<BankBalanceCardProps> = ({
  balance: balanceProp,
  transactionCount: _transactionCount = 4,
  chartData: chartDataProp,
}) => {
  void _transactionCount;

  const formatCurrency = (value: number): string =>
    `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const is2XL = useIs2XL();

  const { data, isPending } = useFetch(
    ['bank_accounts_grid'],
    getBankOverview
  );

  const apiChartData = useMemo((): BankBalanceChartPoint[] => {
    const rows = data?.current_year as BankOverviewMonthRow[] | undefined;
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map((row) => ({
      month: row.month,
      value: typeof row.amount === 'number' ? row.amount : Number(row.amount) || 0,
    }));
  }, [data]);

  const rawChartData = chartDataProp ?? apiChartData;

  const chartData = useMemo(() => {
    if (!rawChartData.length) return [];
    const peak = Math.max(...rawChartData.map((d) => d.value), 1);
    return rawChartData.map((d, i) => {
      const progress = (i + 1) / rawChartData.length;
      const bandSpread = peak * 0.25 * progress;
      return {
        ...d,
        outerUpper: d.value + bandSpread * 2,
        innerUpper: d.value + bandSpread * 0.8,
      };
    });
  }, [rawChartData]);

  const totalFromApi = useMemo(() => {
    const t = data?.total;
    if (t == null || t === '') return 0;
    const n = typeof t === 'number' ? t : parseFloat(String(t));
    return Number.isFinite(n) ? n : 0;
  }, [data?.total]);

  const balance = balanceProp ?? totalFromApi;

  const defaultActiveIndex = useMemo(() => {
    if (!chartData.length) return 0;
    let idx = chartData.length - 1;
    let maxVal = chartData[idx].value;
    chartData.forEach((d, i) => {
      if (d.value >= maxVal) {
        maxVal = d.value;
        idx = i;
      }
    });
    return idx;
  }, [chartData]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(defaultActiveIndex);
  }, [defaultActiveIndex]);

  const { minValue, maxValue } = useMemo(() => {
    if (!chartData.length) return { minValue: 0, maxValue: 1 };
    const allVals = chartData.flatMap((d) => [d.value, d.outerUpper, d.innerUpper]);
    const min = Math.min(...allVals);
    const max = Math.max(...allVals);
    if (min === max) {
      const pad = max === 0 ? 1 : max * 0.12;
      return { minValue: Math.max(0, min - pad), maxValue: max + pad };
    }
    return {
      minValue: 0,
      maxValue: max * 1.1,
    };
  }, [chartData]);

  const yTicks = useMemo(() => {
    const rawStep = maxValue / 2;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
    const niceSteps = [1, 2, 2.5, 5, 10];
    const normalized = rawStep / magnitude;
    const nice = niceSteps.find((s) => s >= normalized) ?? 10;
    const step = nice * magnitude;
    return [0, Math.round(step), Math.round(step * 2)];
  }, [maxValue]);

  const activeMonth = chartData[activeIndex]?.month;
  const activeValue =
    chartData.length > 0 ? (chartData[activeIndex]?.value ?? balance) : balance;

  const CustomXAxisTick = useCallback(
    ({
      x,
      y,
      payload,
      index,
    }: {
      x: number;
      y: number;
      payload: { value: string };
      index: number;
    }) => {
      const isActive = index === activeIndex;
      return (
        <text
          x={x}
          y={y}
          dy={14}
          textAnchor="middle"
          fill={isActive ? '#090E4F' : '#9CA3AF'}
          fontSize={12}
          fontWeight={isActive ? 600 : 400}
        >
          {payload.value}
        </text>
      );
    },
    [activeIndex],
  );

  const CustomYAxisTick = ({
    x,
    y,
    payload,
  }: {
    x: number;
    y: number;
    payload: { value: number };
  }) => (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#9CA3AF" fontSize={11}>
      {payload.value >= 1000 ? `${Math.round(payload.value / 1000)}k` : payload.value}
    </text>
  );

  const BalanceTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: BankBalanceChartPoint }>;
  }) => {
    if (!active || !payload?.length) return null;
    const v = payload[0].payload.value;
    return (
      <div className="relative rounded-lg bg-[#090E4F] px-3 py-2 text-sm font-semibold text-white shadow-lg after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-[#090E4F] after:content-['']">
        {formatCurrency(v)}
      </div>
    );
  };

  return (
    <Card
      style={{ borderRadius: '24px' }}
      className="flex-1 border border-[#E0DCF0] bg-[#EEEAF8] p-8 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-normal text-[#6B7280]">Balance</p>
          <h2 className="mt-1 text-lg font-semibold text-[#090E4F]">Total Bank Balance</h2>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#D5D1E8] bg-white/80 px-5 py-2.5 text-sm font-medium text-[#374151] shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
          aria-haspopup="listbox"
        >
          Month
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M3.5 5.25L7 8.75L10.5 5.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <p className="mt-6 text-4xl font-bold tracking-tight text-[#090E4F]">
        {isPending ? (
          <span className="inline-block h-9 w-48 animate-pulse rounded-lg bg-[#090E4F]/10" />
        ) : (
          formatCurrency(activeValue)
        )}
      </p>

      <div className="mt-8">
        {isPending && !chartData.length ? (
          <div
            className="w-full animate-pulse rounded-xl bg-[#090E4F]/10"
            style={{ height: is2XL ? 240 : 190 }}
          />
        ) : !chartData.length ? (
          <div
            className="flex w-full items-center justify-center rounded-xl border border-dashed border-[#090E4F]/20 text-sm text-[#6B7280]"
            style={{ height: is2XL ? 240 : 190 }}
          >
            No balance history for this year
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={is2XL ? 240 : 190}>
          <ComposedChart
            data={chartData}
            margin={{ top: 28, right: 8, left: 4, bottom: 4 }}
            onMouseMove={(state) => {
              if (state?.activeTooltipIndex != null) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setActiveIndex(defaultActiveIndex)}
          >
            <GradientDefs />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={CustomXAxisTick}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[minValue, maxValue]}
              ticks={yTicks}
              tick={CustomYAxisTick}
              width={36}
            />

            {activeMonth != null && (
              <ReferenceLine
                x={activeMonth}
                stroke={PURPLE}
                strokeDasharray="4 3"
                strokeWidth={1.2}
                strokeOpacity={0.6}
                ifOverflow="extendDomain"
              />
            )}

            <Tooltip content={<BalanceTooltip />} cursor={false} />

            <Area
              type="natural"
              dataKey="outerUpper"
              stroke="none"
              fill="url(#areaGradientOuter)"
              fillOpacity={1}
              isAnimationActive={false}
              baseValue={0}
            />

            <Area
              type="natural"
              dataKey="innerUpper"
              stroke="none"
              fill="url(#areaGradientInner)"
              fillOpacity={1}
              isAnimationActive={false}
              baseValue={0}
            />

            <Line
              type="natural"
              dataKey="value"
              stroke={PURPLE}
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={(props: { cx: number; cy: number; index: number }) => {
                const { cx, cy, index } = props;
                if (index !== activeIndex || cx == null || cy == null)
                  return <g key={`dot-${index}`} />;
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={PURPLE}
                    stroke="#fff"
                    strokeWidth={2.5}
                  />
                );
              }}
              activeDot={{ r: 6, fill: PURPLE, stroke: '#fff', strokeWidth: 2.5 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default BankBalanceCard;