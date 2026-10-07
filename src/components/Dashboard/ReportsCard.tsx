'use client';

// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon, Search, RotateCcw } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import { Calendar } from "../ui/calendar";
// import { format, isValid, parse } from "date-fns";
// import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
// export default function ReportsCard() {
//   const [startDate, setStartDate] = useState<Date>(new Date(2025, 5, 12)); // June 12, 2025
//   const [endDate, setEndDate] = useState<Date>(new Date(2025, 5, 12)); // June 12, 2025
//   const [startDateInput, setStartDateInput] = useState("12/06/2025");
//   const [endDateInput, setEndDateInput] = useState("12/06/2025");
//   const [startOpen, setStartOpen] = useState(false);
//   const [endOpen, setEndOpen] = useState(false);
//   const [isSpin, setIsSpin] = useState(true);

//   const handleSpin = () => {
//     setIsSpin(true);
//     setTimeout(() => {
//       setIsSpin(false);
//     }, 5000);
//   };

//   useEffect(() => {
//     setTimeout(() => {
//       setIsSpin(false);
//     }, 7000);
//   }, []);

//   const handleStartDateInputChange = (value: string) => {
//     setStartDateInput(value);

//     // Try to parse the date in MM/dd/yyyy format
//     const parsedDate = parse(value, "MM/dd/yyyy", new Date());
//     if (isValid(parsedDate)) {
//       setStartDate(parsedDate);
//     }
//   };

//   const handleEndDateInputChange = (value: string) => {
//     setEndDateInput(value);

//     // Try to parse the date in MM/dd/yyyy format
//     const parsedDate = parse(value, "MM/dd/yyyy", new Date());
//     if (isValid(parsedDate)) {
//       setEndDate(parsedDate);
//     }
//   };

//   const handleStartDateSelect = (date: Date | undefined) => {
//     if (date) {
//       setStartDate(date);
//       setStartDateInput(format(date, "MM/dd/yyyy"));
//       setStartOpen(false);
//     }
//   };

//   const handleEndDateSelect = (date: Date | undefined) => {
//     if (date) {
//       setEndDate(date);
//       setEndDateInput(format(date, "MM/dd/yyyy"));
//       setEndOpen(false);
//     }
//   };

//   return (
//     <div className="w-full">
//       <Card className="w-full border-0 bg-transparent p-0 shadow-none">
//         <CardHeader className="p-0">
//           <div className="flex items-start justify-between">
//             <div className="flex-1 rounded-tl-2xl rounded-tr-[40px] bg-white p-6 pb-4 pt-4">
//               <h2 className="mb-1 text-base font-normal text-accent_charcoal_indigo">
//                 Reports
//               </h2>
//               <p className="text-sm font-light text-accent_granite">
//                 Custom Report
//               </p>
//             </div>
//             <div className="-ml-2 flex h-20 w-24 translate-y-2 items-center justify-center rounded-bl-3xl bg-accent_bluish_gray">
//               <div
//                 onClick={handleSpin}
//                 className={`inline-block cursor-pointer rounded-full border border-blue-600/10 bg-[#2977F5] p-3 shadow-sm transition-all hover:scale-105 hover:shadow-md`}
//               >
//                 <Image
//                   src="/icons/reload-solid.svg"
//                   width={200}
//                   height={200}
//                   alt="reload"
//                   className={`h-6 w-6 text-white ${isSpin ? "animate-spin" : ""}`}
//                 />
//               </div>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="flex gap-4 rounded-b-xl rounded-tr-[32px] bg-white p-4 pt-4">
//           <div className="grid grid-cols-1 gap-4 rounded-lg bg-[#F9F9F9] p-2">
//             {/* Start Date */}
//             <div className="space-y-2">
//               <Label
//                 htmlFor="start-date"
//                 className="text-sm font-normal text-gray-600"
//               >
//                 Start
//               </Label>
//               <div className="relative">
//                 <Popover open={startOpen} onOpenChange={setStartOpen}>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       className="absolute left-0 top-0 h-full w-10 p-0 hover:bg-transparent"
//                     >
//                       <CalendarIcon className="h-4 w-4 text-gray-400" />
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <Calendar
//                       mode="single"
//                       selected={startDate}
//                       onSelect={handleStartDateSelect}
//                       initialFocus
//                     />
//                   </PopoverContent>
//                 </Popover>
//                 <Input
//                   id="start-date"
//                   type="text"
//                   value={startDateInput}
//                   onChange={(e) => handleStartDateInputChange(e.target.value)}
//                   placeholder="MM/DD/YYYY"
//                   className="rounded-xl border-gray-200 bg-gray-50 pl-10 font-normal text-gray-700 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//             {/* End Date */}
//             <div className="space-y-2">
//               <Label
//                 htmlFor="end-date"
//                 className="text-sm font-normal text-gray-600"
//               >
//                 End
//               </Label>
//               <div className="relative">
//                 <Popover open={endOpen} onOpenChange={setEndOpen}>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       className="absolute left-0 top-0 h-full w-10 p-0 hover:bg-transparent"
//                     >
//                       <CalendarIcon className="h-4 w-4 text-gray-400" />
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <Calendar
//                       mode="single"
//                       selected={endDate}
//                       onSelect={handleEndDateSelect}
//                       initialFocus
//                     />
//                   </PopoverContent>
//                 </Popover>
//                 <Input
//                   id="end-date"
//                   type="text"
//                   value={endDateInput}
//                   onChange={(e) => handleEndDateInputChange(e.target.value)}
//                   placeholder="MM/DD/YYYY"
//                   className="rounded-xl border-gray-200 bg-gray-50 pl-10 font-normal text-gray-700 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 gap-4 rounded-lg bg-[#F9F9F9] p-2">
//             {/* Report Name */}
//             <div className="space-y-2">
//               <Label
//                 htmlFor="report-name"
//                 className="text-sm font-normal text-gray-600"
//               >
//                 Report Name
//               </Label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
//                 <Input
//                   id="report-name"
//                   type="text"
//                   placeholder="Type"
//                   className="rounded-xl border-gray-200 bg-gray-50 pl-10 font-normal text-gray-700 placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Category */}
//             <div className="space-y-2">
//               <Label
//                 htmlFor="category"
//                 className="text-sm font-normal text-gray-600"
//               >
//                 Category
//               </Label>
//               <Select defaultValue="cash-flow">
//                 <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50 font-normal text-gray-700 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="cash-flow">Cash Flow</SelectItem>
//                   <SelectItem value="profit-loss">Profit & Loss</SelectItem>
//                   <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
//                   <SelectItem value="expenses">Expenses</SelectItem>
//                   <SelectItem value="income">Income</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useState } from 'react';
import Button from '../ui/RawButton';
import moment from 'moment';
import { RxCross2 } from 'react-icons/rx';
import { Card } from '../ui/card';
interface ReportFormData {
  reportType: string;
  category: string;
  dateRange: string;
}

export default function ReportCard() {
  const [formData, setFormData] = useState<ReportFormData>({
    reportType: '',
    category: 'Cash Flow',
    dateRange: '',
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const handleRefresh = () => {
    console.log('Refresh clicked');
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
  };

  return (
    <Card
      style={{
        borderRadius: '24px',
      }}
      className="w-full flex-1 overflow-hidden 2xl:max-w-[400px]"
    >
      {/* Header with purple background */}
      <div className="bg-[#EAE3F9] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium text-[#090E4F]">Reports</h1>
            <p className="text-sm text-[#090E4Fb3]">Custom Report</p>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="flex size-11 items-center justify-center rounded-2xl bg-[#090E4F] transition-colors hover:bg-blue-800"
            aria-label="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M12.6386 0.832031L13.1368 1.76351C13.4738 2.39325 13.6422 2.70813 13.5308 2.84298C13.4194 2.97783 13.0526 2.86892 12.3189 2.6511C11.5854 2.43333 10.8067 2.31616 9.99967 2.31616C5.62742 2.31616 2.08301 5.75575 2.08301 9.99873C2.08301 11.398 2.46852 12.71 3.14212 13.84M7.36078 19.1654L6.86247 18.2339C6.52557 17.6042 6.35712 17.2892 6.46851 17.1544C6.5799 17.0196 6.94675 17.1285 7.68042 17.3463C8.41392 17.5641 9.19267 17.6812 9.99967 17.6812C14.3719 17.6812 17.9163 14.2417 17.9163 9.99873C17.9163 8.5994 17.5308 7.28743 16.8573 6.15743"
                stroke="white"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Form content */}
      <div className="p-6">
        {/* Report Name section */}
        <div className="mb-6">
          <label className="mb-3 block text-sm text-[#535784]">Report Name</label>

          {/* Type input */}
          <div className="relative">
            <div className="flex h-[50px] items-center gap-3 rounded-xl border border-gray-300 px-5 transition-colors focus-within:border-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M12.75 12.75L15.75 15.75"
                  stroke="#090E4F"
                  stroke-width="1.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25Z"
                  stroke="#090E4F"
                  stroke-width="1.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Type"
                value={formData.reportType}
                onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                className="flex-1 bg-transparent text-base font-normal text-blue-900 placeholder-[#090E4F] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category section */}
        <div className="mb-6">
          <label className="mb-3 block text-sm text-[#535784]">Category</label>

          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="h-[50px] w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white px-6 text-base font-normal text-blue-900 transition-colors focus:border-blue-500"
            >
              <option>Cash Flow</option>
              <option>Revenue</option>
              <option>Expenses</option>
              <option>Profit & Loss</option>
            </select>

            {/* Dropdown arrow */}
            <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 transform">
              <svg className="h-6 w-6 text-blue-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Data range section */}
        <div>
          <label className="mb-3 block text-sm text-[#535784]">Date range</label>

          <div className="relative">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex h-[50px] w-full cursor-pointer items-center justify-between rounded-xl border border-gray-300 bg-white px-4 text-sm font-normal text-[#090E4F] transition-colors focus-within:border-blue-500"
                >
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {moment(dateRange.from).format('DD MMM, YYYY')} -{' '}
                        {moment(dateRange.to).format('DD MMM, YYYY')}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDateRangeChange({
                              from: undefined,
                              to: undefined,
                            });
                          }}
                          className="rounded-full p-1 hover:bg-gray-200"
                        >
                          <RxCross2 />
                        </button>
                      </>
                    ) : (
                      <> {moment(dateRange.from).format('DD MMM, YYYY')} - DD/MMM/YYYY</>
                    )
                  ) : (
                    'Select date range'
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                  >
                    <path
                      d="M12 1.5V4.5M6 1.5V4.5"
                      stroke="#090E4F"
                      stroke-width="1.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M9.75 3H8.25C5.42157 3 4.00736 3 3.12868 3.87868C2.25 4.75736 2.25 6.17157 2.25 9V10.5C2.25 13.3284 2.25 14.7427 3.12868 15.6213C4.00736 16.5 5.42157 16.5 8.25 16.5H9.75C12.5784 16.5 13.9927 16.5 14.8713 15.6213C15.75 14.7427 15.75 13.3284 15.75 10.5V9C15.75 6.17157 15.75 4.75736 14.8713 3.87868C13.9927 3 12.5784 3 9.75 3Z"
                      stroke="#090E4F"
                      stroke-width="1.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M2.25 7.5H15.75"
                      stroke="#090E4F"
                      stroke-width="1.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8.99662 10.5H9.00338M8.99662 13.5H9.00338M11.9932 10.5H12M6 10.5H6.00673M6 13.5H6.00673"
                      stroke="#090E4F"
                      stroke-width="1.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range: any) => {
                    if (range) {
                      handleDateRangeChange(range);
                      if (range.from && range.to) {
                        setIsDatePickerOpen(false);
                      }
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </Card>
  );
}
