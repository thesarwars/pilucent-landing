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
import { useDispatch, useSelector } from "react-redux";
import { addsalaryproccess } from "@/app/redux/Employee/EmployeeSlice";
import {
  getEmployeePayrollComponents,
  getPayrollComponentYtd,
} from "@/utils/SalaryProcess";

// Column definition
const columns = [
  { key: "type", label: "Type" },
  { key: "hours", label: "Hours" },
  { key: "rate", label: "Rate" },
  { key: "current", label: "Current" },
  { key: "ytd", label: "YTD" },
];

const Pay = ({ datatax, settotalGross, updateState }: any) => {
  const [data, setData] = useState<any>([]);
  const [showBody, setShowBody] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const { salaryProccess } = useSelector((state: any) => state.employee);
  const dispatch = useDispatch()
  const [totalEarings, settotalEarings] = useState(0);

  const [taxInfo, setTaxInfo] = useState({
    workingHrs: "",
    Rate: "",
    OT: "",
    doubleOT: "",
    holydayPay: "",
    bonus: "",
    commission: "",
    PTO: "",
  });

  const toNumber = (value: any) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const getCurrentPageItems = () => {

    return data
  };



  const payYtdAliases: Record<string, string[]> = {
    Salary: ["Salary", "SALARY"],
    "Overtime Pay": ["Overtime", "OVERTIME", "OVERTIME_PAY"],
    "Double Overtime Pay": ["Double Overtime Pay", "DOUBLE_OVERTIME_PAY"],
    "Holiday Pay": ["Holiday Pay", "HOLIDAY_PAY"],
    Bonus: ["Bonus", "BONUS"],
    Commission: ["Commission", "COMMISSION"],
    PTO: ["PTO"],
  };

  const resolvePayYtd = (
    components: ReturnType<typeof getEmployeePayrollComponents>,
    rowType: string,
    extraKeys: string[] = [],
  ) =>
    getPayrollComponentYtd(
      components,
      ...(payYtdAliases[rowType] ?? [rowType]),
      ...extraKeys,
    );

  const recalculateData = (input: any) => {
    const payrollComponents = getEmployeePayrollComponents(datatax?.allinfo);

    let newData = [
      {
        id: 1,
        type: "Salary",
        hours: input.workingHrs,
        rate: input.Rate,
        current: (toNumber(input.workingHrs) * toNumber(input.Rate)).toFixed(2),
        input: false,
        ytd: resolvePayYtd(payrollComponents, "Salary"),
      },
      {
        id: 2,
        type: "Overtime Pay",
        hours: input.OT,
        input: true,
        rate: (toNumber(input.Rate) * 1.5).toFixed(2),
        current: (toNumber(input.OT) * 1.5 * toNumber(input.Rate)).toFixed(2),
        ytd: resolvePayYtd(payrollComponents, "Overtime Pay"),
      },
      {
        id: 3,
        type: "Double Overtime Pay",
        hours: input.doubleOT,
        input: true,
        rate: toNumber(input.Rate) * 1.5*1.5,
        current: (toNumber(input.doubleOT) * 2.25 * toNumber(input.Rate)).toFixed(
          2,
        ),
        ytd: resolvePayYtd(payrollComponents, "Double Overtime Pay"),
      },
      {
        id: 4,
        type: "Holiday Pay",
        hours: input.holydayPay,
        input: true,
        rate: input.Rate,
        current: toNumber(input.holydayPay).toFixed(2),
        ytd: resolvePayYtd(payrollComponents, "Holiday Pay"),
      },
      {
        id: 5,
        type: "Bonus",
        hours: "-",
        rate: "-",
        input: false,
        current: toNumber(input.bonus).toFixed(2),
        ytd: resolvePayYtd(payrollComponents, "Bonus"),
      },
      {
        id: 6,
        type: "Commission",
        hours: "-",
        rate: "-",
        input: false,
        current: toNumber(input.commission).toFixed(2),
        ytd: resolvePayYtd(payrollComponents, "Commission"),
      },
      {
        id: 7,
        type: "PTO",
        hours: input.PTO,
        rate: input.Rate,
        input: true,
        current: (toNumber(input.PTO) * toNumber(input.Rate)).toFixed(2),
        ytd: resolvePayYtd(payrollComponents, "PTO"),
      },
    ]
    if (datatax?.allinfo?.earnings) {
      settotalEarings(datatax?.allinfo?.earnings.reduce((sum: number, item: any) => sum + toNumber(item?.total_recurring_amount), 0).toFixed(2))
      datatax?.allinfo?.earnings.map((item: any) => {
        const earningKey = item?.description
          ? String(item.description).replace(/ /g, "_").toUpperCase()
          : String(item?.pay_kind ?? "").toUpperCase();
        newData=[...newData, {
          id: 7,
          type: item?.pay_kind,
          hours: 0,
          rate: 0,
          input: false,
          current: item?.total_recurring_amount,
          ytd: getPayrollComponentYtd(payrollComponents, earningKey, String(item?.pay_kind ?? "")),
        }]
      })
    }
    setData(newData);
    return newData
  };



  const handleInputChange = (key: keyof typeof taxInfo, value: string) => {
    const updated: any = { ...taxInfo, [key]: value };
    setTaxInfo(updated);
    const calculated = recalculateData(updated);
    const updatedGross = calculated.reduce((sum: number, item: any) => sum + toNumber(item.current), 0).toFixed(2)
    updateState({...updated,grossPay:updatedGross})


  };

  useEffect(() => {
    console.log(datatax, 1223);

    if (datatax) {
      const initialTaxInfo = {
        workingHrs: datatax.workingHrs || "",
        Rate: datatax.Rate || "",
        OT: datatax.OT || "",
        doubleOT: datatax.doubleOT || "",
        holydayPay: datatax.holydayPay || "",
        bonus: datatax.bonus || "",
        commission: datatax.commission || "",
        PTO: datatax.PTO || "",
        grossPay: datatax.grossPay || "",
        exactSalary: datatax.exactSalary || "",
      };
      setTaxInfo(initialTaxInfo);
      recalculateData(initialTaxInfo);
      
     
    }

  }, [datatax]);

  useEffect(() => {
    const updatedGross = data.reduce((sum: number, item: any) => sum + toNumber(item.current), 0).toFixed(2)
    settotalGross(updatedGross)

  }, [data]);

  useEffect(() => {
    
    return () => {
      
    };
  }, []);

  return (
    <div className="font-inter">
      <div className="rounded-[20px] px-4 py-8">
        <div
          className="mb-4 flex cursor-pointer items-center"
          onClick={() => setShowBody((prev) => !prev)}
        >
          <h1 className="text-md font-semibold text-accent_text_black">Pay</h1>
          {showBody ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
        </div>

        {showBody && (
          <form>
            <Table className="w-full text-left font-inter">
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key} className="py-5 pl-6 text-left">
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {getCurrentPageItems().map((row: any, rowIndex: any) => (
                  <TableRow key={row.id}>
                    {columns.map((col) => {
                      const isEditable =
                        col.key === "hours";

                      return (
                        <TableCell
                          key={col.key}
                          className="py-4 pl-6 text-left"
                        >
                          {isEditable ? (
                            <input
                              type="text"
                              disabled={!row.input}
                              value={row[col.key] ?? ""}
                              onChange={(e) => {
                                const fieldMap: any = {
                                  hours: "workingHrs", // default fallback
                                  rate: "Rate",
                                  current: "", // skip current directly
                                };

                                // Dynamically infer the tax field based on row.type
                                let taxField: keyof typeof taxInfo =
                                  "workingHrs";

                                if (row.type === "Salary")
                                  taxField =
                                    col.key === "hours" ? "workingHrs" : "Rate";
                                else if (row.type === "Overtime Pay")
                                  taxField =
                                    col.key === "hours" ? "OT" : "Rate";
                                else if (row.type === "Double Overtime Pay")
                                  taxField =
                                    col.key === "hours" ? "doubleOT" : "Rate";
                                else if (row.type === "Holiday Pay")
                                  taxField =
                                    col.key === "hours" ? "holydayPay" : "Rate";
                                else if (row.type === "Bonus")
                                  taxField = "bonus";
                                else if (row.type === "Commission")
                                  taxField = "commission";
                                else if (row.type === "PTO")
                                  taxField = "PTO";

                                handleInputChange(taxField, e.target.value);
                              }}
                              className="w-[100px] border-b border-gray-300 bg-transparent focus:outline-none"
                            />
                          ) : (
                            row[col.key]
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                <TableRow>
                  {/* Total of each column */}
                  <TableCell className="py-4 pl-6 text-left font-bold">
                    Total
                  </TableCell>
                  <TableCell className="py-4 pl-6 text-left font-bold">
                    {data.reduce((sum: number, item: any) => sum + toNumber(item.hours), 0)}
                  </TableCell>
                  <TableCell className="py-4 pl-6 text-left font-bold">
                    {data.reduce((sum: number, item: any) => sum + toNumber(item.rate), 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-4 pl-6 text-left font-bold">
                    {data.reduce((sum: number, item: any) => sum + toNumber(item.current), 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-4 pl-6 text-left font-bold">
                    {data.reduce((sum: number, item: any) => sum + toNumber(item.ytd), 0).toFixed(2)}
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

export default Pay;
