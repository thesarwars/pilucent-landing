/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Filter } from "lucide-react";
import moment from "moment";
import Button from "@/components/ui/RawButton";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import DateRangePicker, { getPredefinedRange } from "./daterange";

interface FilterProps {
  onFilterChange?: () => void;
  setParams: any;
  params: any;
  defaultRange?: string;
}

export default function ReportFilter({
  onFilterChange,
  setParams,
  params,
  defaultRange = "",
}: FilterProps) {
  const router = useRouter()

  const [date, setDate] = useState<any>({});

  useEffect(() => {
    const range = getPredefinedRange(defaultRange);
    if (range) {
      setParams({
        ...params,
        start_date: range?.startDate,
        end_date: range?.endDate,
      });
      setDate({ startDate: range?.startDate, endDate: range?.endDate });
    }
  }, []);

  const applyFilters = () => {
    onFilterChange && onFilterChange();
    setParams({
      ...params,
      start_date: date?.startDate,
      end_date: date?.endDate,
      page: 1,
    });
  };

  const resetFilters = () => {
    const range = getPredefinedRange(defaultRange);
    setParams({
      ...params,
      start_date: range?.startDate,
      end_date: range?.endDate,
      page: 1,
    });
    setDate({ startDate: range?.startDate, endDate: range?.endDate });
  };

  return (
    <>
      <Button
        className="flex items-center gap-1 px-0 font-medium text-accent_soft_blue hover:underline"
        onClick={() => router.back()}
      >
        <IoIosArrowBack className="text-xl" />
        Back
      </Button>
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col flex-wrap justify-center gap-4 space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Custom Date Range
            </label>
            <DateRangePicker
              isApplyHidden={true}
              value={date}
              setValue={(e) => {
                setDate(e);
              }}
            />
          </div>

          <div className="flex gap-4 space-x-1 md:ml-auto">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="flex items-center gap-1 whitespace-pre rounded-md bg-accent_soft_blue px-3 py-2 text-white transition-colors hover:bg-accent_soft_blue"
            >
              <Filter className="h-4 w-4" />
              Run Report
            </button>
          </div>
        </div>

        {date.startDate && date.endDate && (
          <div className="mt-4 text-center text-sm text-gray-900">
            Selected date range:{" "}
            {moment(new Date(date.startDate)).format("DD MMMM, YYYY")} to{" "}
            {moment(new Date(date.endDate)).format("DD MMMM, YYYY")}
          </div>
        )}
      </div>
    </>
  );
}