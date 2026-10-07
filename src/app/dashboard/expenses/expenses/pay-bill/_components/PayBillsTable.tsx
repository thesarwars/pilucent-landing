import Checkbox from "@/components/ui/Checkbox/Checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { toast } from "@/lib/ToastService";
import { GetData } from "@/services/FetchMethods";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const PayBillsTable = ({
  view=false,
  setItems,
  PaymentData,
  setPaymentData,
}: {
  view?:boolean
  setItems: any;
  PaymentData: any;
  setPaymentData: any;
}) => {
  const [SupplierList, setSupplierList] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [amountApply, setAmountApply] = useState(0);
  const [total, setTotal] = useState(0);

  const { data, isPending } = useQuery({
    queryKey: ["suppliers_for_pay_bills"],
    queryFn: async () => {
      const res = await GetData(`we/suppliers?status=ACTIVE`);
      const arr = res?.results.map((supplier: any) => {
        return {
          name: `${supplier?.first_name ? supplier?.first_name : ""} ${supplier?.middle_name ? supplier?.middle_name : ""} ${supplier?.last_name ? supplier?.last_name : ""}`,
          uid: supplier?.uid,
          open_balance: supplier?.opening_balance,
          total_credit: supplier?.total_credit,
          credit_applied: "",
          payment: "",
          total_amount: "",
        };
      });
      setSupplierList(arr);
      return res;
    },
    refetchOnWindowFocus: false,
  });

  const handleCreditAppliedInputChange = (uid: string, value: any) => {
    const updatedRows = SupplierList.map((row) => {
      if (row?.uid === uid) {
        if (
          Number(value) > Number(row?.total_credit) ||
          Number(value) > Number(row?.open_balance - row.payment)
        ) {
          toast.error(
            "Applied credit cannot be larger than total credit or open balance",
          );
          return row;
        }
        let updatedRow = {
          ...row,
          credit_applied: value,
          total_amount: Number(value) + Number(row.payment),
        };
        return updatedRow;
      } else {
        return row;
      }
    });
    setSupplierList(updatedRows);
  };
  const handlePaymentInputChange = (uid: string, value: any) => {
    const updatedRows = SupplierList.map((row) => {
      if (row?.uid === uid) {
        if (value > Number(row.open_balance - row.credit_applied)) {
          toast.error("Payment amount cannot be larger than open balance");
          return row;
        }
        let updatedRow = {
          ...row,
          payment: value,
          total_amount: Number(row.credit_applied) + Number(value),
        };
        return updatedRow;
      } else {
        return row;
      }
    });
    setSupplierList(updatedRows);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prev) => {
      const UpdatedRows = new Set(prev);
      if (UpdatedRows.has(id)) {
        UpdatedRows.delete(id);
        const updatedRows = SupplierList.map((row) => {
          if (row?.uid === id) {
            let updatedRow = {
              ...row,
              payment: "",
              credit_applied: "",
              total_amount: "",
            };
            return updatedRow;
          } else {
            return row;
          }
        });
        setSupplierList(updatedRows);
      } else {
        UpdatedRows.add(id);
        const updatedRows = SupplierList?.map((row) => {
          if (row?.uid === id) {
            let updatedRow = {
              ...row,
              payment: Number(row.open_balance - row.credit_applied),
              total_amount:
                Number(row.open_balance - row.credit_applied) +
                Number(row.credit_applied),
            };
            return updatedRow;
          } else {
            return row;
          }
        });
        setSupplierList(updatedRows);
      }

      return UpdatedRows;
    });
  };

  useEffect(() => {
    const calculateTotals = () => {
      const Total = SupplierList.reduce(
        (acc, row) => acc + Number(row.payment) + Number(row.credit_applied),
        0,
      );
      const total = Total || 0;

      setTotal(total);
      setAmountApply(total);
      setPaymentData({ ...PaymentData, total: total });
    };
    calculateTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SupplierList, selectedRows, selectedRows]);

  useEffect(() => {
    setItems(SupplierList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SupplierList]);

  return (
    <div>
      {" "}
      <div className="mt-4">
        <div className={``}>
          {isPending ? (
            <div className="h-full w-full rounded-xl border border-gray-100 bg-white bg-opacity-70">
              <div className="flex h-full w-full items-center justify-center">
                <p className="inline-block h-20 w-20 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />{" "}
              </div>
            </div>
          ) : (
            <div className="mt-4 w-full overflow-x-auto">
              {" "}
              <Table className="font-lexend bg-white">
                <TableHeader className="">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-5 pl-3">
                      {/* <Checkbox /> */}
                    </TableHead>
                    <TableHead>Payee</TableHead>
                    <TableHead>Open Balance</TableHead>
                    <TableHead className="text-center">Credit Applied</TableHead>
                    <TableHead className="text-center">Payment</TableHead>
                    <TableHead className="text-center">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {SupplierList?.map((supplier: any) => (
                    <TableRow
                      className="hover:bg-transparent"
                      key={supplier?.uid}
                    >
                      <TableCell className="py-5 pl-3">
                        <Checkbox
                          value={selectedRows.has(supplier.uid)}
                          onChange={() => !view && handleCheckboxChange(supplier.uid)}
                        />
                      </TableCell>
                      <TableCell className="cursor-pointer">
                        {supplier?.name}
                      </TableCell>
                      <TableCell>{supplier?.open_balance}</TableCell>
                      <TableCell className="flex flex-col items-center justify-center py-1 mt-1">
                        <input
                          disabled={!selectedRows.has(supplier.uid)}
                          type="number"
                          value={supplier?.credit_applied}
                          onChange={(e) => {
                            handleCreditAppliedInputChange(
                              supplier?.uid,
                              e.target.value,
                            );
                          }}
                          placeholder=""
                          className="rounded-lg border bg-white px-3 py-2 outline-none disabled:bg-gray-200"
                          readOnly={view}
                        />
                        {selectedRows.has(supplier.uid) && (
                          <span>Available Credit: {supplier.total_credit}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <input
                          disabled={!selectedRows.has(supplier.uid)}
                          type="number"
                          value={supplier?.payment}
                          onChange={(e) => {
                            handlePaymentInputChange(
                              supplier?.uid,
                              e.target.value,
                            );
                          }}
                          readOnly={view}
                          placeholder=""
                          className="rounded-lg border bg-white px-3 py-2 outline-none disabled:bg-gray-200"
                        />
                      </TableCell>
                      <TableCell className="text-center">{supplier?.total_amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>{" "}
              {!SupplierList?.length && !isPending && (
                <p className="py-2 text-center text-accent_soft_blue">
                  No Supplier Found!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <div className="mt-5 space-y-4 rounded-2xl bg-[#F5F6FA] p-4 text-right font-semibold">
          <div className="flex items-center gap-4 text-[#333752]">
            <p className="text-right">Total</p>
            <p className="flex-1 text-right">{total}</p>
          </div>
          {/* <div className="flex items-center gap-4 text-accent_soft_blue">
            <p className="text-right">Amount to Credit</p>
            <p className="flex-1 text-right">{amountCredit}</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default PayBillsTable;
