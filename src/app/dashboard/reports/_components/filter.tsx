'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import DateRangePicker, { getPredefinedRange } from '@/components/ui/DateRange';
import moment from 'moment';
import Button from '@/components/ui/RawButton';
import { useRouter } from 'next/navigation';
import { IoIosArrowBack } from 'react-icons/io';
import PrintPDF from './PrintPDF';
import Link from 'next/link';

interface FilterProps {
  setProcessedData?: any;
  refetch?: () => void;
  onFilterChange?: () => void;
  setParams: any;
  params: any;
  defaultRange?: string;
  OnPdfClick?: () => void;
  value?: any;
  /** PrintPDF calls this with { is_pdf: true } and expects { file_uid, url } back. */
  pdfFn?: (params?: any) => any;
}

export default function ReportFilter({
  value = {},
  pdfFn,
  setProcessedData,
  onFilterChange,
  setParams,
  params,
  defaultRange = '',
  refetch,
  OnPdfClick,
}: FilterProps) {
  // const [filters, setFilters] = useState<FilterValues>({
  //   created_at_after: undefined,
  //   created_at_before: undefined,
  // });
  const router = useRouter();

  const [date, setDate] = useState<any>({ ...value });

  useEffect(() => {
    const range = getPredefinedRange(defaultRange);
    if (range) {
      setParams({
        ...params,
        created_at_after: range?.startDate,
        created_at_before: range?.endDate,
      });
      setDate({ startDate: range?.startDate, endDate: range?.endDate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    // setProcessedData && setProcessedData([]);
    onFilterChange && onFilterChange();
    setParams({
      ...params,
      created_at_after: date?.startDate,
      created_at_before: date?.endDate,
      page: 1,
    });
    refetch && refetch();
  };

  const resetFilters = () => {
    const range = getPredefinedRange(defaultRange);
    setParams({
      ...params,
      created_at_after: range?.startDate,
      created_at_before: range?.endDate,
      page: 1,
    });
    setDate({ startDate: range?.startDate, endDate: range?.endDate });
  };

  return (
    <>
      <div className="mx-auto my-4 rounded-xl border bg-white/40 px-7 py-4">
        <Link href="/dashboard/reports">
          <Button className="flex items-center gap-1 px-0 font-medium text-accent_soft_black hover:underline">
            <IoIosArrowBack className="text-xl" />
            Back
          </Button>
        </Link>
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
        {pdfFn ? (
          <PrintPDF fetchFn={pdfFn} />
        ) : (
          <div className="flex justify-end">
            {/* print button */}
            <button
              onClick={() => OnPdfClick && OnPdfClick()}
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
