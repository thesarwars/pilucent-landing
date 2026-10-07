import Checkbox from "@/components/ui/Checkbox/Checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PayBillUpdateTable = ({
  view = false,
  setItems,
  Items,
  PaymentData,
  setPaymentData,
}: {
  view?: boolean;
  setItems: any;
  Items: any;
  PaymentData: any;
  setPaymentData: any;
}) => {
  const [amountApply, setAmountApply] = useState(0);
  const [total, setTotal] = useState(0);

  const handleCreditAppliedInputChange = (uid: string, value: any) => {
    const updatedRows = Items.map((row: any) => {
      if (row?.uid === uid) {
        if (
          Number(value) > Number(row?.total_credit) ||
          Number(value) > Number(row?.open_balance - row.payment)
        ) {
          toast.error(
            "Applied Credit Cannot be larger than Total credit or Open balance",
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
    setItems(updatedRows);
  };
  const handlePaymentInputChange = (uid: string, value: any) => {
    const updatedRows = Items.map((row: any) => {
      if (row?.uid === uid) {
        if (value > Number(row.open_balance - row.credit_applied)) {
          toast.error("Payment Amount Cannot be larger than Open balance");
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
    setItems(updatedRows);
  };

  useEffect(() => {
    const calculateTotals = () => {
      const Total = Items.reduce(
        (acc: any, row: any) =>
          acc + Number(row.payment) + Number(row.credit_applied),
        0,
      );
      const total = Total || 0;

      setTotal(total);
      setAmountApply(total);
      setPaymentData({ ...PaymentData, total: total });
    };

    calculateTotals();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Items]);

  useEffect(() => {
    setItems(Items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Items]);

  return (
    <div>
      {" "}
      <div className="mt-4">
        <div className={``}>
          <div className="mt-4 w-full overflow-x-auto">
            {" "}
            <Table className="font-lexend">
              <TableHeader className="">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Payee</TableHead>
                  <TableHead>Open Balance</TableHead>
                  <TableHead>Credit Applied</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Items?.map((supplier: any) => (
                  <TableRow
                    className="hover:bg-transparent"
                    key={supplier?.uid}
                  >
                    <TableCell className="cursor-pointer">
                      {supplier?.name}
                    </TableCell>
                    <TableCell>{supplier?.open_balance}</TableCell>
                    <TableCell className="flex flex-col items-center justify-center py-1">
                      <input
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

                      <span>Available Credit: {supplier.total_credit}</span>
                    </TableCell>
                    <TableCell>
                      <input
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
                    <TableCell>{supplier?.total_amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>{" "}
            {!Items?.length && (
              <p className="py-2 text-center text-accent_soft_blue">
                No Supplier Found!
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="mt-5 space-y-4 rounded-2xl bg-[#F5F6FA] p-4 text-right font-semibold">
          <div className="flex items-center gap-4 text-[#333752]">
            <p className="text-right">Total</p>
            <p className="flex-1 text-right">{total}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayBillUpdateTable;
