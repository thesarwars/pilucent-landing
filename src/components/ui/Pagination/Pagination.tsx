'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const DEFAULT_LIMIT_OPTIONS = [10, 20, 50, 100];

const Pagination = ({
  limit = 10,
  currentPage,
  totalData,
  onPageChange,
  onLimitChange,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  maxVisiblePages = 7,
}: {
  limit?: number;
  currentPage: number;
  totalData: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  maxVisiblePages?: number;
}) => {
  const totalPage = Math.ceil(totalData / limit);
  const [totalPages, setTotalPages] = useState(totalPage);
  const [limitOpen, setLimitOpen] = useState(false);

  useEffect(() => {
    if (totalPage > 0) {
      setTotalPages(totalPage);
    }
  }, [totalPage]);

  const generatePagination = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePagination();
  const startItem = totalData === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalData);

  return (
    <div className="mt-7 flex w-full flex-col items-center justify-between gap-4 md:flex-row">
      {/* Left: Prev + page numbers + Next — Figma Balanzify 2.0 */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-greyscale_200 transition-colors hover:bg-greyscale_100 disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5 text-greyscale_900" />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) => (
            <button
              key={index}
              type="button"
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`flex h-8 min-w-[32px] items-center justify-center rounded-[10px] px-3 py-1.5 text-xs font-semibold transition-colors ${
                currentPage === page
                  ? 'bg-greyscale_100 text-greyscale_900'
                  : 'text-greyscale_900 hover:bg-greyscale_100 disabled:cursor-default disabled:opacity-70'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-greyscale_200 transition-colors hover:bg-greyscale_100 disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5 text-greyscale_900" />
        </button>
      </div>

      {/* Right: Entry count + optional "Show X" dropdown */}
      <div className="flex items-center gap-4">
        <p className="text-xs font-medium text-accent_soft_black">
          Showing {startItem} to {endItem} of {totalData} entries
        </p>

        {onLimitChange && (
          <Popover open={limitOpen} onOpenChange={setLimitOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-8 items-center gap-2 rounded-[8px] border border-greyscale_200 bg-white px-2.5 py-2 text-xs font-medium text-greyscale_900 transition-colors hover:bg-greyscale_50"
              >
                Show {limit}
                <ChevronDown className="h-4 w-4 shrink-0 text-greyscale_600" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto rounded-[8px] border-greyscale_200 p-1">
              <div className="flex flex-col">
                {limitOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onLimitChange(option);
                      setLimitOpen(false);
                    }}
                    className={`rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                      limit === option
                        ? 'bg-greyscale_100 text-greyscale_900'
                        : 'text-greyscale_900 hover:bg-greyscale_100'
                    }`}
                  >
                    Show {option}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default Pagination;
