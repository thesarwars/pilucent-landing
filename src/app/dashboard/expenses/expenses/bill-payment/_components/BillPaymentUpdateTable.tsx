import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { toast } from "@/lib/ToastService";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const BillPaymentUpdateTable = ({
  view = false,
  setPurchaseItems,
  PurchaseItems,
  setCreditItems,
  CreditItems,
  PaymentData,
  setPaymentData,
}: {
  view?: boolean;
  PurchaseItems: any;
  CreditItems: any;
  setPurchaseItems: any;
  setCreditItems: any;
  PaymentData: any;
  setPaymentData: any;
}) => {
  const [isTransactionOpen, setIsTransactionOpen] = useState(true);
  const [isCreditOpen, setIsCreditOpen] = useState(true);
  const [amountApply, setAmountApply] = useState(0);
  const [amountCredit, setAmountCredit] = useState(0);
  const [total, setTotal] = useState(0);

  console.log(PurchaseItems);

  //credit note functions
  const handleInputChange = (uid: string, value: any) => {
    const updatedRows = PurchaseItems.map((row: any) => {
      if (row?.uid == uid && value <= Number(row?.due_total)) {
        console.log("object");
        const updatedCreditRows = CreditItems.map((credit: any) => {
          return { ...credit, payment: "" };
        });
        setCreditItems(updatedCreditRows);
        let updatedRow = { ...row, payment: value };
        return updatedRow;
      } else {
        toast.warning("You can't edit purchase which has open balance zero!");
        return row;
      }
    });
    setPurchaseItems(updatedRows);
  };

  //credit note functions
  const handleCreditInputChange = (uid: string, value: any) => {
    if (Number(value) > Number(amountApply)) {
      toast.warning("Credit Can't be larger than the Amount");
      return;
    }
    const updatedRows = CreditItems.map((row: any) => {
      if (row?.uid === uid) {
        let updatedRow = { ...row, payment: value };
        return updatedRow;
      } else {
        toast.warning("You can't edit purchase which has open balance zero!");
        return row;
      }
    });
    setCreditItems(updatedRows);
  };

  useEffect(() => {
    const calculateTotals = () => {
      const InvoiceTotal = PurchaseItems.reduce(
        (acc: any, row: any) => acc + Number(row.payment),
        0,
      );
      const creditTotal = CreditItems.reduce(
        (acc: any, row: any) => acc + Number(row.payment),
        0,
      );
      const total = (InvoiceTotal || 0) - (creditTotal || 0);

      setTotal(total);
      setAmountApply(InvoiceTotal);
      setAmountCredit(creditTotal);
      setPaymentData({ ...PaymentData, total: total });
    };

    calculateTotals();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PurchaseItems, CreditItems]);

  const handleCollapse = () => {
    setIsCreditOpen(!isCreditOpen);
  };

  return (
    <div>
      {" "}
      <div className="mt-4">
        <div
          className="flex w-full cursor-pointer items-center gap-2"
          onClick={() => setIsTransactionOpen(!isTransactionOpen)}
        >
          <p>
            <FaChevronDown
              className={`font-normal text-[#7E84A3] transition-all duration-300 ${
                isTransactionOpen && "rotate-[180deg]"
              }`}
            />
          </p>
          <h2 className="font-medium uppercase text-accent_soft_black">
            Outstanding transactions
          </h2>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isTransactionOpen ? "mt-4 w-full opacity-100" : "h-0 opacity-0"
          }`}
        >
          {/* <div>
          <div className="flex flex-col gap-1">
            <Label className="font-medium text-[#5A607F]">
              Find Invoice Number
            </Label>
            <div className="flex items-center gap-2">
              {" "}
              <Input
                type="text"
                placeholder="Find Invoice Number"
                className="max-w-[230px] rounded-lg border px-3 py-3 placeholder:text-[#A1A7C4]"
              />{" "} 
              <span className="cursor-pointer font-normal text-[#A1A7C4]">
                All
              </span>
            </div>
          </div>
        </div> */}

          <div className="mt-4 w-full overflow-x-auto">
            {" "}
            <Table className="font-lexend">
              <TableHeader className="">
                <TableRow className="bg-white hover:bg-white">
                  <TableHead className="pl-2">Due Date</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>Open balance</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {PurchaseItems?.map((purchase: any) => (
                  <TableRow
                    className="bg-white hover:bg-white"
                    key={purchase?.uid}
                  >
                    <TableCell className="pl-2">{purchase?.due_date}</TableCell>
                    <TableCell> {purchase?.original_amount}</TableCell>
                    <TableCell>{purchase?.due_total}</TableCell>
                    <TableCell>
                      <input
                        type="number"
                        value={purchase?.payment}
                        onChange={(e) => {
                          handleInputChange(purchase?.uid, e.target.value);
                        }}
                        placeholder=""
                        className="rounded-lg border bg-white px-3 py-2 outline-none disabled:bg-gray-200"
                        readOnly={view}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>{" "}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div
          className="flex w-full cursor-pointer items-center gap-2"
          onClick={handleCollapse}
        >
          <p>
            <FaChevronDown
              className={`font-normal text-[#7E84A3] transition-all duration-300 ${
                isCreditOpen && "rotate-[180deg]"
              }`}
            />
          </p>
          <h2 className="font-medium uppercase text-accent_soft_black">
            Credits
          </h2>
        </div>
        <div
          className={`transition-all duration-300 ease-in-out ${
            isCreditOpen ? "mt-4 w-full opacity-100" : "h-0 opacity-0"
          }`}
        >
          {/* <div>
          <div className="flex flex-col gap-1">
            <Label className="font-medium text-[#5A607F]">
              Find Invoice Number
            </Label>
            <div className="flex items-center gap-2">
              {" "}
              <Input
                type="text"
                placeholder="Find Invoice Number"
                className="max-w-[230px] rounded-lg border px-3 py-3 placeholder:text-[#A1A7C4]"
              />{" "}
              <span className="cursor-pointer font-normal text-[#A1A7C4]">
                All
              </span>
            </div>
          </div>
        </div> */}

          <div className="mt-4 w-full overflow-x-auto">
            <Table className="font-lexend">
              <TableHeader className="">
                <TableRow className="bg-white hover:bg-white">
                  <TableHead className="pl-2">Note No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>Remaining Balance</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {CreditItems?.map((data: any, idx: any) => (
                  <TableRow className="bg-white hover:bg-white" key={idx}>
                    <TableCell className="cursor-pointer pl-2">
                      {data?.credit_number}
                    </TableCell>
                    <TableCell>{data?.date}</TableCell>
                    <TableCell> {data?.original_amount}</TableCell>
                    <TableCell>{data?.remaining_balance}</TableCell>
                    <TableCell>
                      <input
                        type="number"
                        value={data?.payment}
                        onChange={(e) => {
                          handleCreditInputChange(data?.uid, e.target.value);
                        }}
                        placeholder=""
                        readOnly={view}
                        className="rounded-lg border bg-white px-3 py-2 outline-none disabled:bg-gray-200"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <div
          style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
          className="mt-5 space-y-4 rounded-2xl bg-white p-4 text-right font-semibold"
        >
          <div className="flex items-center gap-4 text-[#333752]">
            <p className="text-right">Amount Apply</p>
            <p className="flex-1 text-right">{amountApply}</p>
          </div>
          <div className="flex items-center gap-4 text-accent_soft_blue">
            <p className="text-right">Amount to Credit</p>
            <p className="flex-1 text-right">{amountCredit}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPaymentUpdateTable;
