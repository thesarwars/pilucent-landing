"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface TableProps {
  isCheckbox?: boolean;
  columns?: any[];
  isIconsShow?: boolean;
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  visibleColumns: any;
  ActionFormatter: any;
}

export default function TableSkeleton({
  isCheckbox,
  visibleColumns,
  columns = [],
  isIconsShow = true,
  onView,
  onEdit,
  onDelete,
  ActionFormatter,
}: TableProps) {
  return (
    <>
      {Array.from({ length: 7 }).map((row: any, rowIndex: number) => (
        <TableRow key={rowIndex}>
          {isCheckbox && (
            <TableCell className="px-4 py-3">
              <div className="m-2 ml-0 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
            </TableCell>
          )}
          {columns.map(
            (column, colIndex) =>
              visibleColumns.includes(column?.dataField) && (
                <TableCell key={colIndex} className="px-4 py-3">
                  <div className="m-2 ml-0 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
                </TableCell>
              ),
          )}
          {isIconsShow ? (
            (onView || onEdit || onDelete || ActionFormatter) && (
              <TableCell className="px-4 py-3">
                <div className="m-2 ml-0 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
              </TableCell>
            )
          ) : (
            <TableCell className="px-4 py-3">
              <div className="m-2 ml-0 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  );
}
