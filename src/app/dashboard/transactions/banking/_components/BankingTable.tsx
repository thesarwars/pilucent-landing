'use client';

import TableSkeleton from '@/app/(admin)/_components/TableSkeleton';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/Pagination/Pagination';
import PdfExcelDropDown from '@/components/ui/PdfExcelDropDown';
import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as XLSX from 'xlsx';
import { Eye, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import SmoothCheckbox from '@/components/ui/SmoothCheckbox';

// Define types for our table
type Column = {
  dataField: string;
  title: string;
  formatter?: (row: any) => React.ReactNode;
  minWidth?: number;
  width?: number;
  maxWidth?: number;
  sortable?: boolean;
  hidden?: boolean;
};

type dataType = {
  count: number;
  results: any[];
  next: any;
  prev: any;
};

type TableProps<T> = {
  isPending: boolean;
  data: dataType;
  columns: Column[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
  params?: any;
  setParams?: any;
  refetch?: any;
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  ActionFormatter?: any;
  ExpendedElement?: any;
  setExpandedRow?: any;
  expandedRow?: any;
  setVisibleColumns: any;
  visibleColumns: any;
  storageName?: any;
  setSelectedRows: any;
  selectedRows: any;
};

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export default function ResizableTable<T>({
  storageName = 'tableSettings',
  setSelectedRows,
  selectedRows,
  setExpandedRow,
  expandedRow,
  onView,
  ActionFormatter,
  onEdit,
  onDelete,
  params = {},
  setParams,
  isPending,
  data,
  columns,
  keyExtractor,
  onRowClick,
  className = '',
  refetch,
  emptyMessage = 'No data available',
  ExpendedElement,
  setVisibleColumns,
  visibleColumns,
}: TableProps<T>) {
  // State for columns with their widths
  const [isSettingVisible, setIsSettingVisible] = useState(false);
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null);
  const [startX, setStartX] = useState<number>(0);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [allSelected, setAllSelected] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const tableRef = useRef<HTMLTableElement>(null);
  const selectRef = useRef<any>(undefined);

  useEffect(() => {
    setParams && setParams({ ...params, page: currentPage, limit: itemsPerPage });
    setAllSelected(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (!selectedRows?.size) {
      setAllSelected(false);
    }
  }, [selectedRows]);

  // Initialize column widths
  useEffect(() => {
    const initialWidths: Record<string, number> = {};
    columns.forEach((column) => {
      initialWidths[column.dataField] = column.width || 150;
    });
    setColumnWidths(initialWidths);

    // Load saved settings from localStorage if available
    try {
      const savedSettings = localStorage.getItem(storageName);
      if (savedSettings) {
        const { widths, visible } = JSON.parse(savedSettings);
        if (widths) setColumnWidths((prev) => ({ ...prev, ...widths }));
        if (visible) setVisibleColumns(visible);
      }
    } catch (error) {
      console.error('Error loading saved table settings:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  useEffect(() => {}, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(
        storageName,
        JSON.stringify({
          widths: columnWidths,
          visible: visibleColumns,
        })
      );
    } catch (error) {
      console.error('Error saving table settings:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnWidths, visibleColumns]);

  // Handle column resize
  const handleResizeStart = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    setResizingColumnId(columnId);
    setStartX(e.clientX);
  };

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingColumnId) return;

      const deltaX = e.clientX - startX;
      setColumnWidths((prev) => {
        const currentColumn = columns.find((col) => col.dataField === resizingColumnId);
        const currentWidth = prev[resizingColumnId] || currentColumn?.width || 150;
        const newWidth = Math.max(currentColumn?.minWidth || 50, currentWidth + deltaX);

        if (currentColumn?.maxWidth && newWidth > currentColumn.maxWidth) {
          return prev;
        }

        return {
          ...prev,
          [resizingColumnId]: newWidth,
        };
      });
      setStartX(e.clientX);
    },
    [resizingColumnId, startX, columns]
  );

  const handleResizeEnd = useCallback(() => {
    setResizingColumnId(null);
  }, []);

  useEffect(() => {
    if (resizingColumnId) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [resizingColumnId, handleResizeMove, handleResizeEnd]);

  // Handle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev: any) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
        setAllSelected(false);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const toggleAllRows = () => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      const allIds = filteredData.map((item) => keyExtractor(item));
      setSelectedRows(new Set(allIds));
    }
    setAllSelected(!allSelected);
  };

  // Handle row expansion
  const toggleRowExpansion = (id: string) => {
    if (id == expandedRow) {
      setExpandedRow('');
      return;
    }
    setExpandedRow(id);
  };

  // Handle sorting
  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.dataField === columnId);
    if (!column?.sortable) return;

    setSortConfig((prev) => {
      if (prev?.key === columnId) {
        return prev?.direction === 'asc' ? { key: columnId, direction: 'desc' } : null;
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev: any) => {
      if (prev.includes(columnId)) {
        return prev.filter((id: any) => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };

  // Filter and sort data
  const filteredData = data?.results?.filter((item) => {
    if (!searchTerm) return true;

    // Simple search across all visible columns
    return columns.some((column) => {
      if (!visibleColumns.includes(column.dataField)) return false;
      const value = column.formatter ? column.formatter(item) : item[column.dataField];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });
  });

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;
    const filteredD = filteredData || [];
    return [...filteredD].sort((a, b) => {
      const column = columns.find((col) => col.dataField === sortConfig.key);
      if (!column) return 0;

      const aValue = column.formatter ? column.formatter(a) : a[column.dataField];
      const bValue = column.formatter ? column.formatter(b) : b[column.dataField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig?.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig?.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  // Export to CSV
  const handleGenerateExcel = () => {
    const selectedRowsId: string[] = [];
    selectedRows.forEach((id: any) => {
      selectedRowsId.push(id);
    });
    const selectedData = selectedRowsId.map((id) => {
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
    XLSX.writeFile(workbook, `${'transactions'}.xlsx`);
  };

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
      // Add the table header to the print window
      printWindow?.document.write(
        '<table border="1" style="border-collapse: collapse; width: 100%; text-align: center;">'
      );
      printWindow?.document.write('<thead><tr>');

      {
        columns.map((column, index) => printWindow?.document.write(`  <th>${column.title}</th>`));
      }

      printWindow?.document.write('</tr></thead>');
      printWindow?.document.write('<tbody>');

      selectedRows.forEach((id: any) => {
        if (!data?.results) {
          return;
        }
        const row = data?.results.find((row: any) => row.uid === id);

        if (row) {
          printWindow?.document.write('<tr>');

          {
            columns.map((column, colIndex) =>
              printWindow?.document.write(
                `<td style="padding-top: 8px; padding-bottom: 8px;">${
                  getNestedValue(row, column.dataField) || '-'
                }</td>`
              )
            );
          }

          printWindow?.document.write('</tr>');
        }
      });

      printWindow?.document.write('</tbody></table>');

      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.print();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="my-5 max-w-full overflow-hidden rounded-[16px] bg-white/60 p-6">
      <div className="my-custom-scroll mb-6 flex flex-wrap items-center justify-between gap-4 bg-transparent">
        <div className="flex w-full flex-1 shrink-0 flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-greyscale_900">Transactions</h1>
          <div className="relative w-full flex-1 shrink-0 bg-transparent">
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
              placeholder="Search here..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setParams &&
                  setParams({
                    page: 1,
                    limit: itemsPerPage,
                    search: e.target.value,
                  });
              }}
              className="inline-flex w-full items-start justify-start rounded-[10px] bg-transparent px-5 py-4 pr-10 text-sm font-normal leading-6 text-slate-400 outline outline-1 outline-offset-[-1px] outline-gray-200 placeholder:font-normal placeholder:text-slate-400 hover:outline-gray-50"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
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
                          className="-mt-1.5 cursor-pointer text-sm text-greyscale_600"
                        >
                          {column?.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-medium text-greyscale_900">Rows per page</h3>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent ref={selectRef}>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="40">40</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                      <SelectItem value="80">80</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <PdfExcelDropDown
            OnExcelClick={() => handleGenerateExcel()}
            OnPdfClick={handlePdfPrint}
          />
        </div>
      </div>

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

      {/* Table */}
      <div className="my-custom-scroll overflow-x-auto rounded-[10px] border border-greyscale_300 font-normal">
        <table
          ref={tableRef}
          className={`w-full caption-bottom border-collapse text-[14px] ${className}`}
          style={{ tableLayout: 'fixed' }}
        >
          <thead className="text-left text-greyscale_600">
            <tr className="border-b-0 bg-greyscale_50 hover:bg-greyscale_50">
              <th className="h-[60px] w-10 whitespace-nowrap px-4 text-center align-middle text-xs font-bold [&:has([role=checkbox])]:pr-0">
                <SmoothCheckbox
                  checked={allSelected}
                  onCheckedChange={toggleAllRows}
                  className=""
                />
              </th>
              {columns.map(
                (column) =>
                  visibleColumns.includes(column.dataField) && (
                    <th
                      key={column.dataField}
                      className={`h-[60px] select-none whitespace-nowrap px-4 text-center align-middle text-xs font-bold [&:has([role=checkbox])]:pr-0 ${column.sortable ? 'cursor-pointer border-r border-greyscale_200 hover:bg-greyscale_100' : ''}`}
                      style={{
                        width: columnWidths[column.dataField] || column.width || 150,
                        position: 'relative',
                      }}
                      onClick={() => column.sortable && handleSort(column.dataField)}
                    >
                      <div className="flex w-full items-center justify-center">
                        <span>{column.title}</span>
                        {sortConfig?.key === column.dataField ? (
                          <span className="ml-1">
                            {sortConfig?.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        ) : (
                          <span className="ml-1">{'↓↑'}</span>
                        )}
                      </div>
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:w-1 hover:bg-blue-500"
                        onMouseDown={(e) => handleResizeStart(e, column.dataField)}
                      />
                    </th>
                  )
              )}
              <th className="h-[60px] w-24 whitespace-nowrap px-4 text-center align-middle text-xs font-bold">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="text-greyscale_900 [&_tr:last-child]:border-b-0">
            {isPending ? (
              <TableSkeleton
                ActionFormatter={<div></div>}
                visibleColumns={visibleColumns}
                columns={columns}
                // isIconsShow={isIconsShow}
                // onDelete={onDelete}
                // onEdit={onEdit}
                // onView={onView}
              />
            ) : sortedData?.length > 0 ? (
              sortedData.map((item, index) => {
                const rowId = keyExtractor(item);
                const isSelected = selectedRows.has(rowId);
                const isExpanded = expandedRow == rowId;
                // let Action = "categorize";

                return (
                  <React.Fragment key={rowId}>
                    <tr
                      className={`h-[60px] cursor-pointer whitespace-nowrap border-b border-greyscale_200 text-center align-middle transition-colors [&:has([role=checkbox])]:pr-0 ${isSelected ? 'bg-table_success_light/50' : ''} last:border-r-0 hover:bg-greyscale_100 data-[state=selected]:bg-table_success_light/50`}
                      onClick={() => {
                        onRowClick && onRowClick(item);
                        toggleRowExpansion(rowId);
                      }}
                    >
                      <td
                        className="h-[60px] border-r px-4 py-[18px] text-left align-middle text-sm [&:has([role=checkbox])]:pr-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SmoothCheckbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRowSelection(rowId)}
                        />
                      </td>
                      {columns.map(
                        (column) =>
                          visibleColumns.includes(column.dataField) && (
                            <td
                              key={column.dataField}
                              className="h-[60px] text-wrap border-r px-4 py-[18px] text-left align-middle text-sm last:border-r-0"
                              style={{
                                width: columnWidths[column.dataField] || column.width || 150,
                              }}
                            >
                              {column?.formatter
                                ? column.formatter(item) || '-'
                                : item[column?.dataField] || '-'}
                            </td>
                          )
                      )}
                      {(onView || onEdit || onDelete || ActionFormatter) && (
                        <td className="h-[60px] px-4 py-[18px] text-left align-middle">
                          <div className="flex items-center justify-center gap-2 text-nowrap">
                            {onView && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(item)}
                                className="rounded-full bg-table_success_light text-table_success hover:bg-table_success hover:text-white"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(item)}
                                className="rounded-full bg-table_portage/10 text-table_portage hover:bg-table_portage hover:text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(item)}
                                className="rounded-full bg-table_error_light text-table_error hover:bg-table_error hover:text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            {ActionFormatter && ActionFormatter(item)}
                          </div>
                        </td>
                      )}
                    </tr>
                    {isExpanded && <ExpendedElement key={index} item={item} index={index} />}
                  </React.Fragment>
                );
              })
            ) : (
              ''
            )}
          </tbody>
        </table>
      </div>
      {!sortedData?.length && !isPending ? (
        <div className="bg-transparent">
          <p className="px-4 py-8 text-center text-greyscale_500">{emptyMessage}</p>
        </div>
      ) : (
        ''
      )}
      {data && (
        <Pagination
          limit={itemsPerPage}
          currentPage={currentPage}
          totalData={data.count}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
