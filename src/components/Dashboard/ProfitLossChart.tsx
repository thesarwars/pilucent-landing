// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ReferenceLine,
//   ResponsiveContainer,
// } from "recharts";

// // #region Sample data
// const data = [
//   {
//     name: "Page A",
//     // uv: 4000,
//     pv: 2400,
//     amt: 2400,
//   },
//   {
//     name: "Page B",
//     // uv: -3000,
//     pv: 1398,
//     amt: 2210,
//   },
//   {
//     name: "Page C",
//     // uv: -2000,
//     pv: -9800,
//     amt: 2290,
//   },
//   {
//     name: "Page D",
//     // uv: 2780,
//     pv: 3908,
//     amt: 2000,
//   },
//   {
//     name: "Page E",
//     // uv: -1890,
//     pv: 4800,
//     amt: 2181,
//   },
//   {
//     name: "Page F",
//     // uv: 2390,
//     pv: -3800,
//     amt: 2500,
//   },
//   {
//     name: "Page G",
//     // uv: 3490,
//     pv: 4300,
//     amt: 2100,
//   },
// ];

// // #endregion
// const PositiveAndNegativeBarChart = () => {
//   return (
//     <div className="h-full w-full font-sans bg-white" style={{ padding: "20px" }}>
//       <ResponsiveContainer
//         width="100%"
//         height="100%"
//         minHeight={400}
//         minWidth={400}
//       >
//         <BarChart
//           style={{
//             width: "770px",
//             maxWidth: "700px",
//             maxHeight: "70vh",
//             aspectRatio: 1.618,
//           }}
//           //   responsive
//           data={data}
//           margin={{
//             top: 5,
//             right: 0,
//             left: 0,
//             bottom: 5,
//           }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name" />
//           {/* <YAxis width={1} /> */}
//           <Tooltip />
//           <Legend />
//           <ReferenceLine y={0} stroke="#000" />
//           <Bar dataKey="pv" fill="#8884d8" />
//           <Bar dataKey="uv" fill="#82ca9d" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default PositiveAndNegativeBarChart;

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useIs2XL, useIsMobile } from '@/hooks/use-mobile';
import { Card } from '../ui/card';

// Sample data - positive values for income, negative for expenses
const data = [
  { month: '0', value: 2500 },
  { month: '', value: -1200 },
  { month: '3k', value: 3100 },
  { month: '', value: 2800 },
  { month: '9K', value: -2400 },
  { month: '', value: 4200 },
  { month: 'Loss', value: -1800 },
  { month: '', value: 3500 },
  { month: '15k', value: 2900 },
  { month: '', value: -2200 },
  { month: '18k', value: 3800 },
  { month: '21k', value: 5200 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded border border-gray-300 bg-white p-2 shadow-lg">
        <p className="text-sm font-medium">{data.month}</p>
        <p
          className={`text-sm font-semibold ${data.value > 0 ? 'text-green-600' : 'text-blue-600'}`}
        >
          ${Math.abs(data.value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function ProfitLossChart() {
  const totalIncome = data.filter((d) => d.value > 0).reduce((sum, d) => sum + d.value, 0);
  const totalExpense = Math.abs(
    data.filter((d) => d.value < 0).reduce((sum, d) => sum + d.value, 0)
  );
  const netProfit = totalIncome - totalExpense;
  const [filter, setFilter] = useState('last-30-days');
  const [isOpen, setIsOpen] = useState(false);

  const is2XL = useIs2XL();

  console.log(is2XL);

  return (
    <Card
      style={{
        borderRadius: '24px',
      }}
      className="w-full flex-1 p-8"
    >
      <div className="pb-2">
        <div className="flex flex-col items-start justify-between md:flex-row">
          <div className="flex max-md:items-center max-md:gap-2 md:flex-col">
            <h2 className="mb-1 text-xl font-medium text-[#090E4F]">Profit & Loss</h2>
          </div>

          <div className="flex items-center gap-2 font-lexend text-sm">
            <Select
              value={filter}
              onValueChange={(e) => {
                setFilter(e);
              }}
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <SelectTrigger
                style={{ borderRadius: '32px', border: '0.5px solid #090E4F' }}
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

      <p className="text-sm font-normal text-[#090E4F]">Spending for last 30 days</p>
      <div className="flex items-center justify-between">
        <h1 className="flex items-end gap-2">
          <span className="text-[32px] font-semibold text-[#090E4F]">$24,510 </span>{' '}
          <span className="mb-2 flex items-center gap-1 text-sm font-medium text-[#30B11A]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M5.25033 3.88066C5.25033 3.88066 9.29767 3.56406 9.86764 4.134C10.4376 4.70394 10.1209 8.7513 10.1209 8.7513M9.62533 4.3763L3.79199 10.2096"
                stroke="#30B11A"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            21%
          </span>{' '}
          <span className="mb-2 text-sm font-medium text-[#090E4FB3] max-2xl:hidden">
            From prior month
          </span>
        </h1>
        <div className="flex items-center gap-6">
          <p className="flex flex-col gap-2">
            <span className="text-sm font-normal text-[#090E4F99]">Income</span>
            <span className="flex items-center gap-1 text-xl font-medium text-[#090E4F]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M7.50033 5.54324C7.50033 5.54324 13.2822 5.09096 14.0965 5.90516C14.9107 6.71936 14.4583 12.5013 14.4583 12.5013M13.7503 6.2513L5.41699 14.5846"
                  stroke="#69E255"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              $17,280
            </span>
          </p>
          <p className="flex flex-col gap-2">
            <span className="text-sm font-normal text-[#090E4F99]">Expanses</span>
            <span className="flex items-center gap-1 text-xl font-medium text-[#090E4F]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M14.4577 7.4974C14.4577 7.4974 14.91 13.2793 14.0958 14.0936C13.2816 14.9077 7.49967 14.4554 7.49967 14.4554M13.7497 13.7474L5.41634 5.41406"
                  stroke="#7E54D9"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              $9,700
            </span>
          </p>
        </div>
      </div>
      <div className="h-[220px] overflow-hidden 2xl:h-[240px]">
        <ResponsiveContainer className="max-h-[300px]" width="100%" height={is2XL ? 280 : 255}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              // angle={-45}
              style={{ color: '#67728A', fontSize: 14 }}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            {/* <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: "Amount ($)",
                angle: -90,
                position: "insideLeft",
              }}
            /> */}
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 0, 0, 0]}>
              {data?.map((e, i) => {
                return <Cell key={i} fill={e.value > 0 ? '#5CCD49' : '#7E54D9'} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
