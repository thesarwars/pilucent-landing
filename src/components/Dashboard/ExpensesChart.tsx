'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIs2XL } from '@/hooks/use-mobile';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/card';
import { useFetch } from '@/app/helpers/hooks';
import { getExpenseOverview } from '@/app/helpers/backend';
import { getDateRange } from './financial-dashboard';
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from 'recharts';

const INNER_COLORS = ['#6C3FC5', '#D4922E', '#3DAF2A'];
const OUTER_COLORS = ['#8B6AD4', '#EDBA6F', '#6FD45E'];

const formatCurrency = (v: number) =>
  `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
  } = props;

  return (
    <g>
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="#090E4F"
        fontSize={11}
        fontWeight={600}
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill="#090E4F"
        fontSize={13}
        fontWeight={700}
      >
        {formatCurrency(value)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={1}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 9}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

export default function RadialBarChartExample() {
  const [filter, setFilter] = useState('last-30-days');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const is2XL = useIs2XL();

  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    const date = getDateRange(filter);
    setDateRange(date);
  }, [filter]);

  const { data } = useFetch(['expense'], () => getExpenseOverview(dateRange));

  const total = Number(data?.total) || 0;

  const chartData = useMemo(() => {
    const raw = [
      { name: 'Purchases', value: Number(data?.total_other_expenses) || 0 },
      { name: 'Other Miscellaneous', value: Number(data?.total_other_miscellaneous) || 0 },
      { name: 'Cost of goods sold', value: Number(data?.total_cost_of_good) || 0 },
    ];
    return raw.filter((d) => d.value > 0);
  }, [data]);

  const activeInnerColors = useMemo(
    () => chartData.map((d) => {
      const idx = ['Purchases', 'Other Miscellaneous', 'Cost of goods sold'].indexOf(d.name);
      return INNER_COLORS[idx] ?? INNER_COLORS[0];
    }),
    [chartData],
  );

  const activeOuterColors = useMemo(
    () => chartData.map((d) => {
      const idx = ['Purchases', 'Other Miscellaneous', 'Cost of goods sold'].indexOf(d.name);
      return OUTER_COLORS[idx] ?? OUTER_COLORS[0];
    }),
    [chartData],
  );

  const onOuterEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const onOuterLeave = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  const chartSize = is2XL ? 260 : 220;
  const innerR = is2XL ? 44 : 36;
  const gapR = is2XL ? 52 : 42;
  const outerInnerR = is2XL ? 58 : 48;
  const outerOuterR = is2XL ? 96 : 80;

  return (
    <Card
      style={{ borderRadius: '24px' }}
      className="max-w-[650px] flex-1 p-8"
    >
      <div className="pb-2">
        <div className="flex flex-col items-start justify-between md:flex-row">
          <div className="flex max-md:items-center max-md:gap-2 md:flex-col">
            <h2 className="mb-1 text-xl font-medium text-[#090E4F]">
              Expenses
            </h2>
            <p className="text-sm font-normal text-[#090E4F]">
              Spending for last 30 days
            </p>
          </div>

          <div className="flex items-center gap-2 font-lexend text-sm">
            <Select
              value={filter}
              onValueChange={(e) => setFilter(e)}
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <SelectTrigger
                style={{
                  borderRadius: '32px',
                  border: '0.5px solid #090E4F',
                }}
                className="rounded-full border border-accent_cloud_gray px-6 py-5 font-medium text-[#090E4F] shadow-sm hover:bg-gray-200 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden"
              >
                <SelectValue />
                <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem className="font-lexend" value="last-30-days">
                  Last 30 days
                </SelectItem>
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-90-days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-8 mt-6 flex items-center gap-6 lg:gap-10">
        <div
          style={{ width: chartSize, height: chartSize }}
          className="shrink-0"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Inner solid pie */}
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={innerR}
                stroke="none"
                isAnimationActive
                animationDuration={800}
              >
                {chartData.map((_, idx) => (
                  <Cell key={`inner-${idx}`} fill={activeInnerColors[idx]} />
                ))}
              </Pie>

              {/* Outer donut ring with active hover */}
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={outerInnerR}
                outerRadius={outerOuterR}
                stroke="#fff"
                strokeWidth={3}
                paddingAngle={2}
                activeIndex={activeIndex >= 0 ? activeIndex : undefined}
                activeShape={renderActiveShape}
                onMouseEnter={onOuterEnter}
                onMouseLeave={onOuterLeave}
                isAnimationActive
                animationDuration={800}
              >
                {chartData.map((_, idx) => (
                  <Cell
                    key={`outer-${idx}`}
                    fill={activeOuterColors[idx]}
                    style={{ cursor: 'pointer', outline: 'none' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-light text-[#090E4FB3]">
            Total expenses
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#090E4F] 2xl:text-[42px]">
            {formatCurrency(total)}
          </h1>
          <p className="mt-1 text-sm font-light text-[#090E4FB3]">
            From prior 30 days
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            {[
              { label: 'Purchases', color: INNER_COLORS[0], value: Number(data?.total_other_expenses) || 0 },
              { label: 'Other Miscellaneous', color: INNER_COLORS[1], value: Number(data?.total_other_miscellaneous) || 0 },
              { label: 'Cost of goods sold', color: INNER_COLORS[2], value: Number(data?.total_cost_of_good) || 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="block size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-xs font-normal text-[#090E4F99] 2xl:text-sm">
                    {item.label}
                  </span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-[#090E4F] 2xl:text-sm">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
