"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import {
  getEmployeePayrollComponents,
  getPayrollComponentYtd,
} from "@/utils/SalaryProcess";

// Define dynamic column structure
interface Column {
  key: keyof SalaryProcessItem;
  label: string;
}

interface SalaryProcessItem {
  id: number;
  type: string;
  current: string;
  ytd: string;
}

const columns: Column[] = [
  { key: "type", label: "Type" },
  { key: "current", label: "Current" },
  { key: "ytd", label: "YTD" },
];

const initialData: SalaryProcessItem[] = [
  { id: 1, type: "Medical Insurance", current: "$4,166.67", ytd: "$5,689.11" },
  { id: 2, type: "Child/Apouse Support", current: "$0.00", ytd: "$7,212.20" },

  { id: 5, type: "Total", current: "$0.00", ytd: "$50.00" },
];

const Employee_deduction = ({
  deduction_data,
  garnishment,
  settotalDeduction,
  allinfo,
}: any) => {
  const [data, setData] = useState<any>([]);
  const [showBody, setShowBody] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getCurrentPageItems = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  const handleChange = (
    rowIndex: number,
    key: keyof SalaryProcessItem,
    value: string,
  ) => {
    // const updated = [...data];
    // updated[rowIndex] = { ...updated[rowIndex], [key]: value };
    // setData(updated);
    // settotalDeduction(updated.reduce((sum: number, item: any) => sum + toNumber(item.ytd), 0).toFixed(2))
  };

  useEffect(() => {
    const payrollComponents = getEmployeePayrollComponents(allinfo);
    const rows: SalaryProcessItem[] = [];

    if (deduction_data) {
      deduction_data.forEach((item: any) => {
        const typeKey = String(item?.deduction_and_contribution?.title ?? "")
          .replace(/ /g, "_")
          .toUpperCase();
        rows.push({
          id: item.id,
          type: item?.deduction_and_contribution?.title,
          current: item?.total_employee_deduction_per_pay_check,
          ytd: getPayrollComponentYtd(payrollComponents, typeKey),
        });
      });
    }
    if (garnishment) {
      garnishment.forEach((item: any) => {
        const typeKey = String(item?.description ?? "")
          .replace(/ /g, "_")
          .toUpperCase();
        rows.push({
          id: item.id,
          type: item?.description,
          current: item?.total_requsted_amount,
          ytd: getPayrollComponentYtd(payrollComponents, typeKey),
        });
      });
    }
    setData(rows);
  }, [deduction_data, garnishment, allinfo]);

  useEffect(() => {
    console.log(222);

    if (data) {
      let pretx = 0;
      console.log(deduction_data?.allinfo?.deduction_contributions, 778);

      deduction_data?.forEach((item: any) => {
        console.log(item, 998);

        if (item?.tax_option === "PRETAX") {
          pretx += toNumber(item?.total_employee_deduction_per_pay_check);
        }
      });
      console.log(pretx, 1002);
      settotalDeduction(
        data
          .reduce((sum: number, item: any) => sum + toNumber(item.current), 0)
          .toFixed(2) - pretx,
      );
      //settotalDeduction(pretx)
    }
  }, [data]);

  const toNumber = (value: any) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="font-inter">
      <div className="rounded-[20px] px-4 py-8">
        <div
          className="mb-4 flex cursor-pointer items-center"
          onClick={() => setShowBody((prev) => !prev)}
        >
          <h1 className="text-md font-semibold text-accent_text_black">
            Employee Deduction
          </h1>
          {showBody ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
        </div>

        {showBody && (
          <form>
            <Table className="font-inter w-full text-left">
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col.key as string}
                      className="py-5 pl-6 text-left"
                    >
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {getCurrentPageItems().map((row: any, rowIndex: any) => (
                  <TableRow key={row.id}>
                    {columns.map((col: any) => {
                      if (col.key === "type") {
                        return (
                          <TableCell
                            key={rowIndex as string}
                            className="py-4 pl-6 text-left"
                          >
                            {row[col.key]}
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          key={rowIndex as string}
                          className="py-4 pl-6 text-left"
                        >
                          <input
                            type="text"
                            disabled
                            value={row[col.key]}
                            onChange={(e) =>
                              handleChange(rowIndex, col.key, e.target.value)
                            }
                            className="w-[100px] border-b border-gray-300 bg-transparent focus:outline-none"
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="py-4 pl-6 text-left font-bold">
                    Total
                  </TableCell>
                  <TableCell className="py-4 pl-6 text-left font-bold">
                    {data
                      .reduce(
                        (sum: number, item: any) =>
                          sum + toNumber(item.current),
                        0,
                      )
                      .toFixed(2)}
                  </TableCell>
                  <TableCell className="py-4 pl-6 text-left font-bold">
                    {data
                      .reduce(
                        (sum: number, item: any) => sum + toNumber(item.ytd),
                        0,
                      )
                      .toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </form>
        )}
      </div>
    </div>
  );
};

export default Employee_deduction;
