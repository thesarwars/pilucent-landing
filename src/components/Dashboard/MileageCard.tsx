// "use client";

// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { cn } from "@/lib/utils";
// import { useState } from "react";

// export default function MileageDashboard() {
//   const [isOpen, setIsOpen] = useState(false);
//   return (
//     <div className="md:h-[320px] md:max-h-[320px]">
//       <Card
//         style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
//         className="h-full w-full bg-white"
//       >
//         <CardHeader className="pb-4">
//           <div className="flex items-start flex-col md:flex-row justify-between">
//             <div className="space-y-1">
//               <h1 className="text-base font-normal text-accent_charcoal_indigo">
//                 Mileage
//               </h1>
//               <p className="text-sm font-light text-accent_granite">
//                 Potential deductions for last 30 days
//               </p>
//             </div>
//             <div className="space-y-1">
//               <div className="text-base font-medium text-accent_charcoal_indigo">
//                 $0
//               </div>
//               <div className="text-sm font-light text-accent_granite">
//                 0.00 Total business miles
//               </div>
//             </div>
//             <div className="flex items-center gap-2 font-lexend text-sm">
//               <Select
//                 defaultValue="last-30-days"
//                 open={isOpen}
//                 onOpenChange={setIsOpen}
//               >
//                 <SelectTrigger className="w-32 rounded-full border border-accent_cloud_gray px-4 py-2 text-accent_granite shadow-sm hover:bg-gray-200 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem className="font-lexend" value="last-30-days">
//                     Last 30 days
//                   </SelectItem>
//                   <SelectItem value="last-7-days">Last 7 days</SelectItem>
//                   <SelectItem value="last-90-days">Last 90 days</SelectItem>
//                 </SelectContent>
//               </Select>
//               <button
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="cursor-pointer rounded-full border border-accent_cloud_gray p-2 shadow-sm transition-colors duration-150 hover:bg-gray-200 active:scale-95"
//               >
//                 <svg
//                   width="16"
//                   height="16"
//                   viewBox="0 0 12 12"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                   className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
//                 >
//                   <path
//                     d="M3 4.5L6 7.5L9 4.5"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {/* Chart Area */}
//           <div className="w-full space-y-3">
//             {[
//               { label: 0, left: 0, right: 0 },
//               { label: 0.1, left: 0, right: 0 },
//               { label: 0.2, left: 20, right: 30 },
//               { label: 0.3, left: 0, right: 0 },
//               { label: 0, right: 30, left: 30 },
//             ].map((value, index) => (
//               <div className="flex items-center gap-2" key={index}>
//                 <p className="w-5 text-right text-sm text-[#808285]">
//                   {value?.label}
//                 </p>
//                 <div
//                   className={cn(
//                     "relative h-4 w-full overflow-hidden rounded-[4px]",
//                   )}
//                 >
//                   {/* Background with diagonal stripes */}
//                   <div
//                     className={cn(
//                       "absolute inset-0 rounded-[4px]",
//                       "bg-gradient-to-r from-blue-200 to-blue-300",
//                     )}
//                     style={{
//                       backgroundImage: `repeating-linear-gradient(
//                         -45deg,
//                         transparent,
//                         transparent 2px,
//                         rgba(183, 202, 210, 1) 3px,
//                         rgba(183, 202, 210, 1) 4px
//                       )`,
//                     }}
//                   >
//                     <div className="item-center flex w-full translate-y-1.5 justify-center gap-4">
//                       <div
//                         className={`w-[${value.left}%] h-[5px] rounded-xl bg-[#8AD193]`}
//                       />

//                       <div
//                         className={`h-[5px] w-[${value.right}%] rounded-xl bg-[#F78EB6]`}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* <div className="absolute inset-0 rounded-[4px] shadow-inner opacity-20" /> */}
//               </div>
//             ))}
//           </div>

//           <div className="flex items-center justify-between">
//             <div></div>
//             <div className="flex items-center space-x-6">
//               <div className="flex items-center space-x-2">
//                 <div className="h-3 w-3 rounded-sm bg-[#8AD193]"></div>
//                 <span className="text-sm text-accent_granite">
//                   Potential Deductions
//                 </span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="h-3 w-3 rounded-sm bg-[#F78EB6]"></div>
//                 <span className="text-sm text-accent_granite">For Review</span>
//               </div>
//             </div>
//             <div className="text-sm font-light text-accent_granite">
//               Mar 18 - Apr 17
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
'use client';
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import RadialBarChart from './RadialBarChart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import React, { useState } from 'react';
import { Card } from '../ui/card';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded border border-gray-300 bg-white p-2 shadow-lg">
        <p className="text-sm font-medium">{data.month}</p>
        <p className={`text-sm font-normal ${data.value > 0 ? 'text-green-600' : 'text-blue-600'}`}>
          Potential Deductions - ${Math.abs(data.Deductions).toLocaleString()}
        </p>
        <p className={`text-sm font-normal ${data.value > 0 ? 'text-green-600' : 'text-blue-600'}`}>
          For Review - ${Math.abs(data.Deductions).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const MileageCard = () => {
  const [filter, setFilter] = useState('last-30-days');
  const [isOpen, setIsOpen] = useState(false);
  const chartData = [
    { month: 'January', Deductions: 29, Review: 19 },
    { month: 'Feb', Deductions: 35, Review: 23 },
    { month: 'March', Deductions: 44, Review: 29 },
    { month: 'April', Deductions: 29, Review: 19 },
    { month: 'May', Deductions: 35, Review: 23 },
    { month: 'June', Deductions: 39, Review: 29 },
    // { month: "July", Deductions: 29, Review: 19 },
    // { month: "Aug", Deductions: 35, Review: 23 },
    // { month: "Sept", Deductions: 39, Review: 29 },
    // { month: "Oct", Deductions: 29, Review: 19 },
    // { month: "Nov", Deductions: 35, Review: 23 },
    // { month: "Dec", Deductions: 39, Review: 29 },
  ];
  return (
    <Card
      style={{
        borderRadius: '24px',
      }}
      className="w-full max-w-[800px] flex-1 overflow-hidden p-8"
    >
      <div className="pb-2">
        <div className="flex flex-col items-start justify-between md:flex-row">
          <div className="flex max-md:items-center max-md:gap-2 md:flex-col">
            <h2 className="mb-1 text-xl font-medium text-[#090E4F]">Expenses</h2>
            <p className="text-sm font-normal text-[#090E4F]">Spending for last 30 days</p>
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
                {/* <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4" /> */}
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
      <div className="mt-8 h-[280px] overflow-hidden">
        <ResponsiveContainer width="100%" height={280} className="mb-0">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="white" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
            <YAxis axisLine={false} tickLine={false} tickMargin={10} domain={[0, 50]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Deductions" fill="#EDA147" radius={[0, 0, 0, 0]} barSize={18} />
            <Bar dataKey="Review" fill="#7E54D9" radius={[0, 0, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-7">
        <p className="flex items-center gap-3 text-sm font-medium text-[#090E4F]">
          <span className="block size-2 rounded-full bg-[#7E54D9]"></span>
          Potential Deductions
        </p>
        <p className="flex items-center gap-3 text-sm font-medium text-[#090E4F]">
          <span className="block size-2 rounded-full bg-[#EDA147]"></span> For Review
        </p>
      </div>
    </Card>
  );
};

export default MileageCard;
