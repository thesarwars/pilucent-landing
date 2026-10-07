'use client';

import type React from 'react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Table as MainTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Eye, Edit, Trash2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import TableSkeleton from './TableSkeleton';
import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import Image from 'next/image';
import PdfExcelDropDown from '@/components/ui/PdfExcelDropDown';
import moment from 'moment';
import Pagination from '@/components/ui/Pagination/Pagination';
import { RxCross2 } from 'react-icons/rx';

interface Column {
  text: string;
  dataField: string;
  formatter?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface TableProps {
  headerShown?: boolean;
  searchPlaceholder?: string;
  params?: any;
  isDateRange?: boolean;
  columns?: Column[];
  isIconsShow?: boolean;
  ActionFormatter?: any;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results?: any[];
    data?: any[];
  };
  loading?: boolean;
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  pagination?: boolean;
  title?: string;
  isCheckbox?: boolean;
  refetch?: (row: any) => void;
  setParams?: any;
  isSettings?: boolean;
  onFilter?: any;
  isSearch?: any;
  children?: ReactNode;
  isPdfExcel?: boolean;
  emptyDataMessage?: string;
  beforeTitleContent?: any;
  isEdit?: boolean;
  isDelete?: boolean;
  isView?: boolean;
  excelFileName?: string;
  isScreen?: boolean;
}

const Table = ({
  headerShown = true,
  // searchPlaceholder = "Search by name, role, department...",
  searchPlaceholder = 'Search here...',
  beforeTitleContent,
  params = {},
  isDateRange = false,
  columns = [],
  isIconsShow = true,
  ActionFormatter,
  data = { count: 0, next: null, previous: null, results: [] },
  loading = false,
  onView,
  onEdit,
  onDelete,
  pagination = true,
  title,
  isCheckbox = true,
  refetch,
  setParams,
  onFilter,
  isSettings = true,
  isSearch = true,
  children,
  isPdfExcel = true,
  emptyDataMessage = 'No Data Found',
  isEdit = true,
  isDelete = true,
  isView = true,
  excelFileName = 'Excel',
  isScreen = true,
}: TableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [itemsPerPage, setItemsPerPage] = useState<any>(10);
  const [visibleColumns, setVisibleColumns] = useState(columns?.map((column) => column?.dataField));
  const [searchText, setSearchText] = useState('');
  const [isSettingVisible, setIsSettingVisible] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<any>(undefined);

  const toggleColumnVisibility = (columnDataField: string) => {
    setVisibleColumns((prevColumns) => {
      if (prevColumns.includes(columnDataField)) {
        return prevColumns.filter((col) => col !== columnDataField);
      } else {
        return [...prevColumns, columnDataField];
      }
    });
  };

  const getDataArray = () => {
    return data?.results || data?.data || [];
  };

  const handleCheckboxChange = (uid: string) => {
    setSelectedRows((prev) => {
      const UpdatedRows = new Set(prev);
      if (UpdatedRows.has(uid)) {
        UpdatedRows.delete(uid);
        setIsAllSelected(false);
      } else {
        UpdatedRows.add(uid);
      }
      return UpdatedRows;
    });
  };

  const handleSelectAllChange = (checked: boolean) => {
    setIsAllSelected(checked);
    if (checked && data.results) {
      const allIds = data?.results?.map((row: any) => row.uid);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  useEffect(() => {
    setParams && setParams({ page: currentPage, limit: itemsPerPage });
    setIsAllSelected(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  const getNestedValue = (obj: any, path: any) => {
    return path.split('.').reduce((acc: any, part: any) => acc && acc[part], obj);
  };

  const handlePdfPrint = () => {
    if (selectedRows.size === 0) {
      alert('No Row Selected for Print');
      return;
    }

    const printWindow = window.open('', '', 'height=620px,width:870px');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print</title>');
      printWindow.document.write('</head><body style="font-family: sans-serif;">');
      printWindow.document.write(
        '<table border="1" style="border-collapse: collapse; width: 100%; text-align: center;">'
      );
      printWindow.document.write('<thead><tr>');

      columns?.map((column) => printWindow?.document.write(`<th>${column.text}</th>`));

      printWindow.document.write('</tr></thead>');
      printWindow.document.write('<tbody>');

      selectedRows.forEach((id) => {
        if (!data?.results) return;
        const row = data?.results.find((row: any) => row.uid === id);

        if (row) {
          printWindow.document.write('<tr>');
          columns?.map((column) =>
            printWindow?.document.write(
              `<td style="padding-top: 8px; padding-bottom: 8px;">${getNestedValue(row, column.dataField) || '-'}</td>`
            )
          );
          printWindow.document.write('</tr>');
        }
      });

      printWindow.document.write('</tbody></table>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);

    // Format dates to YYYY-MM-DD for API
    const formatDateForAPI = (date: Date | undefined) => {
      if (!date) return undefined;
      return format(date, 'yyyy-MM-dd');
    };
    setCurrentPage(1);
    setParams({
      ...params,
      page: 1,
      limit: itemsPerPage,
      created_at_after: formatDateForAPI(range.from),
      created_at_before: formatDateForAPI(range.to),
    });
  };

  const handleGenerateExcel = () => {
    const selectedRowsId: string[] = [];
    selectedRows.forEach((id) => {
      selectedRowsId.push(id);
    });
    const selectedData = selectedRowsId?.map((id) => {
      if (!data?.results) return;
      const rows = data?.results.filter((row: any) => row.uid === id);
      return rows[0];
    });

    if (!selectedData || selectedData.length === 0) {
      return alert('Select Row To Download Excel File');
    }

    const worksheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '');
    XLSX.writeFile(workbook, `${excelFileName}.xlsx`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) ||
        (selectRef.current && !selectRef.current.contains(event.target as Node))
      ) {
        setIsSettingVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`mb-5 max-w-full rounded-[16px] bg-white/60 p-4 ${isScreen ? 'min-h-screen' : ''}`}
    >
      {/* Header Section — Figma Balanzify 2.0 theme */}
      {headerShown && (
        <div className="my-custom-scroll mb-6 flex flex-wrap items-center justify-between gap-4 bg-transparent">
          <div className="flex w-full flex-1 shrink-0 flex-wrap items-center gap-4">
            {beforeTitleContent && beforeTitleContent()}
            {title && <h1 className="text-xl font-medium text-greyscale_900">{title}</h1>}
            {isSearch && (
              <div className="relative w-full max-w-xs flex-1 shrink-0 bg-transparent">
                <svg
                  className="absolute right-6 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#111827]"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <path
                    d="M8.625 15.75C12.56 15.75 15.75 12.56 15.75 8.625C15.75 4.68997 12.56 1.5 8.625 1.5C4.68997 1.5 1.5 4.68997 1.5 8.625C1.5 12.56 4.68997 15.75 8.625 15.75Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.5 16.5L15 15"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <input
                  placeholder={searchPlaceholder}
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setParams &&
                      setParams({
                        page: 1,
                        limit: itemsPerPage,
                        search: e.target.value,
                      });
                    setCurrentPage(1);
                  }}
                  className="inline-flex w-full items-start justify-start rounded-[10px] bg-transparent px-4 py-2.5 pr-10 text-sm font-normal leading-6 text-accent_primary outline outline-1 outline-offset-[-1px] outline-gray-400 placeholder:font-normal placeholder:text-gray-500 hover:outline-gray-50"
                />
              </div>
            )}
            {/* Filter Button */}
            {onFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={onFilter}
                className="rounded-xl border-0 px-4 py-[22px] text-accent_granite"
              >
                <Image
                  src="/icons/filter.svg"
                  width={100}
                  height={100}
                  alt="filter"
                  className="mr-2 h-4 w-4"
                />
                Filter
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range Picker */}
            {isDateRange && (
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-full items-center justify-center gap-2.5 rounded-[10px] px-5 py-4 text-sm text-accent_primary outline outline-1 outline-offset-[-1px] outline-gray-200 hover:outline-gray-50"
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
                      'DD/MM/YYYY - DD/MM/YYYY'
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M10.6666 1.33325V3.99992M5.33325 1.33325V3.99992"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.66667 2.66675H7.33333C4.81917 2.66675 3.5621 2.66675 2.78105 3.44779C2 4.22885 2 5.48592 2 8.00008V9.33341C2 11.8475 2 13.1047 2.78105 13.8857C3.5621 14.6667 4.81917 14.6667 7.33333 14.6667H8.66667C11.1808 14.6667 12.4379 14.6667 13.2189 13.8857C14 13.1047 14 11.8475 14 9.33341V8.00008C14 5.48592 14 4.22885 13.2189 3.44779C12.4379 2.66675 11.1808 2.66675 8.66667 2.66675Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 6.66675H14"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7.99692 9.33325H8.00292M7.99692 11.9999H8.00292M10.6606 9.33325H10.6666M5.33325 9.33325H5.33923M5.33325 11.9999H5.33923"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
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
            )}

            {/* Settings */}
            {isSettings && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSettingVisible(!isSettingVisible)}
                  className="inline-flex h-full items-center justify-center rounded-[10px] border-none bg-transparent px-5 py-4 text-accent_primary outline outline-1 outline-offset-[-1px] outline-gray-200 hover:bg-transparent hover:outline-gray-50"
                >
                  <Image
                    src="/icons/settings-v2.svg"
                    width={200}
                    height={200}
                    alt="settings"
                    className="h-6 w-6"
                  />
                </button>

                <div
                  className={`absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-xl border border-greyscale_300 bg-white p-4 shadow-lg transition-all duration-300 ease-in-out max-md:-right-12 md:right-0 ${
                    isSettingVisible
                      ? 'scale-100 opacity-100'
                      : 'pointer-events-none scale-95 opacity-0'
                  }`}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 font-medium text-greyscale_900">Columns</h3>
                      <div className="space-y-2">
                        {columns?.map((column, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <SmoothCheckbox
                              htmlFor={`column-${idx}`}
                              checked={visibleColumns.includes(column?.dataField)}
                              onCheckedChange={() => toggleColumnVisibility(column?.dataField)}
                            />
                            <label
                              htmlFor={`column-${idx}`}
                              className="-mt-1.5 cursor-pointer text-sm font-normal text-accent_primary"
                            >
                              {column?.text}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 font-medium text-gray-900">Rows per page</h3>
                      <select
                        className="rounded-md border px-7 py-2 outline-none"
                        value={itemsPerPage.toString()}
                        onChange={(e) => {
                          setItemsPerPage(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={80}>80</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Print */}
            {isPdfExcel && (
              <PdfExcelDropDown OnPdfClick={handlePdfPrint} OnExcelClick={handleGenerateExcel} />
            )}

            {/* Add New Button */}
            {children && <>{children}</>}
          </div>
        </div>
      )}
      <style jsx>{`
        .my-custom-scroll {
          --sb-track-color: #fafafa;
          --sb-thumb-color: #cbd5e0;
          --sb-size: 2px;
        }

        .my-custom-scroll::-webkit-scrollbar {
          width: 2px;
          height: 4px;
        }

        .my-custom-scroll::-webkit-scrollbar-track {
          background: var(--sb-track-color);
          border-radius: 12px;
        }

        .my-custom-scroll::-webkit-scrollbar-thumb {
          background: var(--sb-thumb-color);
          border-radius: 12px;
        }

        @supports not selector(::-webkit-scrollbar) {
          .my-custom-scroll {
            scrollbar-color: var(--sb-thumb-color) var(--sb-track-color);
          }
        }
      `}</style>
      <div className="my-custom-scroll overflow-x-auto rounded-[10px] border border-greyscale_300 font-normal">
        <MainTable>
          <TableHeader className="border-b-0">
            <TableRow className="border-b-0 bg-greyscale_50 hover:bg-greyscale_50">
              {isCheckbox && (
                <TableHead className="px-4">
                  <SmoothCheckbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAllChange}
                    className="ml-4"
                    bgClassName="none"
                  />
                </TableHead>
              )}
              {columns?.map(
                (column, index) =>
                  visibleColumns.includes(column?.dataField) && (
                    <TableHead
                      key={index}
                      className="border-0 px-4 font-medium text-accent_primary last:border-r-0"
                    >
                      {column.text}
                    </TableHead>
                  )
              )}
              {((onView && isView) ||
                (onEdit && isEdit) ||
                (onDelete && isDelete) ||
                ActionFormatter) && <TableHead className="text-center font-medium text-accent_primary">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton rows
              <TableSkeleton
                isCheckbox={isCheckbox}
                ActionFormatter={ActionFormatter}
                visibleColumns={visibleColumns}
                columns={columns}
                isIconsShow={isIconsShow}
                onDelete={onDelete}
                onEdit={onEdit}
                onView={onView}
              />
            ) : getDataArray().length == 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (isCheckbox ? 1 : 0) + 1}
                  className="py-8 text-center"
                >
                  <p className="text-gray-700">{emptyDataMessage}</p>
                </TableCell>
              </TableRow>
            ) : (
              getDataArray()?.map((row: any, rowIndex: number) => (
                <TableRow key={rowIndex}>
                  {isCheckbox && (
                    <TableCell className="px-4">
                      <SmoothCheckbox
                        checked={selectedRows.has(row.uid)}
                        onCheckedChange={() => handleCheckboxChange(row.uid)}
                        className="ml-4"
                      />
                    </TableCell>
                  )}
                  {columns?.map(
                    (column, colIndex) =>
                      visibleColumns.includes(column?.dataField) && (
                        <TableCell
                          key={colIndex}
                          className={`${column.className || ''} text-nowrap px-4 last:border-r-0`}
                        >
                          {column.formatter
                            ? column.formatter(getNestedValue(row, column.dataField), row)
                            : getNestedValue(row, column.dataField) || '-'}
                        </TableCell>
                      )
                  )}
                  {((onView && isView) ||
                    (onEdit && isEdit) ||
                    (onDelete && isDelete) ||
                    ActionFormatter) && (
                    <TableCell className="text-nowrap">
                      <div className="flex items-center justify-center gap-2 text-nowrap">
                        {onView && isView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(row)}
                            className="rounded-full bg-table_success_light text-table_success hover:bg-table_success hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && isEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(row)}
                            className="rounded-full bg-table_portage/10 text-table_portage hover:bg-table_portage hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && isDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(row)}
                            className="rounded-full bg-table_error_light text-table_error hover:bg-table_error hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {ActionFormatter && ActionFormatter(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </MainTable>
      </div>
      {/* Pagination — Figma Balanzify 2.0 */}
      {data && pagination && (
        <Pagination
          limit={itemsPerPage}
          currentPage={currentPage}
          totalData={data.count}
          onPageChange={setCurrentPage}
          onLimitChange={(newLimit) => {
            setItemsPerPage(newLimit);
            setCurrentPage(1);
          }}
          limitOptions={[8, 10, 20, 50, 100]}
        />
      )}
    </div>
  );
};

export default Table;
