/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import DateRangePicker, { getPredefinedRange } from '@/components/ui/DateRange';
import moment from 'moment';
import Button from '@/components/ui/RawButton';
import { IoIosArrowBack } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import PrintPDF from './PrintPDF';

interface FilterProps {
  onFilterChange?: () => void;
  setParams: any;
  params: any;
  defaultRange?: string;
  pdfFn?: any;
  OnPdfClick?: any;
}

export default function ReportFilter2({
  onFilterChange,
  setParams,
  params,
  defaultRange = '',
  pdfFn,
  OnPdfClick,
}: FilterProps) {
  const router = useRouter();

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
      <div className="mx-auto my-4 rounded-xl border bg-white/40 px-7 py-4">
        <Button
          className="flex items-center gap-1 px-0 font-medium text-accent_soft_black hover:underline"
          onClick={() => router.back()}
        >
          <IoIosArrowBack className="text-xl" />
          Back
        </Button>
        <div className="flex flex-col flex-wrap justify-center gap-4 space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-accent_soft_black">Date Range</label>
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
              className="flex items-center gap-2 rounded-[10px] border border-accent_soft_black bg-transparent px-6 py-2 text-sm font-semibold text-accent_soft_black transition-all duration-300 hover:bg-accent_soft_black hover:text-white active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="flex items-center gap-1 whitespace-pre rounded-[10px] border border-accent_soft_black bg-accent_soft_black px-3 py-2 text-white transition-colors hover:bg-transparent hover:text-accent_soft_black"
            >
              <Filter className="h-4 w-4" />
              Run Report
            </button>
          </div>
        </div>

        {pdfFn && <PrintPDF fetchFn={pdfFn} />}

        {OnPdfClick && (
          <div className="flex justify-end">
            {/* print button */}
            <button
              onClick={() => OnPdfClick()}
              className="rounded-[10px] border border-accent_soft_black bg-transparent px-6 py-2 text-sm font-semibold text-accent_soft_black transition-all duration-300 hover:bg-accent_soft_black hover:text-white active:scale-95"
            >
              Print
            </button>
          </div>
        )}
      </div>
    </>
  );
}
