import { fetchSupplierBills } from "@/app/helpers/backend";
import { decryptData } from "@/app/helpers/crypto";
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
import { useQueries } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const BillPaymentTable = ({
  setPurchaseItems,
  PurchaseItems,
  creditItems,
  setCreditItems,
  PaymentData,
  setPaymentData,
  supplierUID,
}: {
  PurchaseItems: any;
  creditItems?: any;
  setPurchaseItems: any;
  setCreditItems: any;
  PaymentData: any;
  setPaymentData: any;
  supplierUID: any;
}) => {
  const [isTransactionOpen, setIsTransactionOpen] = useState(true);
  const [isCreditOpen, setIsCreditOpen] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [selectedCreditRows, setSelectedCreditRows] = useState<Set<any>>(
    new Set(),
  );
  const [amountApply, setAmountApply] = useState(0);
  const [amountCredit, setAmountCredit] = useState(0);
  const [total, setTotal] = useState(0);
  const bill = decryptData(useSearchParams().get("b") || "{}");
  const c = decryptData(useSearchParams().get("c") || "{}");

  const [OpenInvoices, CreditNotes] = useQueries({
    queries: [
      {
        queryKey: ["openBills_list", supplierUID],
        queryFn: async () => {
          const res = await GetData(
            `we/purchases?status=OPEN&is_bill=true&supplier__uid=${supplierUID}`,
            "",
          );
          const arr = res?.results.map((purchase: any) => {
            return {
              purchase_id: purchase?.purchase_id,
              uid: purchase?.uid,
              due_date: purchase?.due_date,
              original_amount: purchase?.total,
              due_total: parseFloat(purchase?.due_total),
              payment: c?.uid ? parseFloat(purchase?.due_total) : "",
            };
          });
          setPurchaseItems(arr);
          return res;
        },
        enabled: !!supplierUID && !bill?.uid,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["credit_notes_supplier", supplierUID],
        queryFn: async () => {
          const res = await GetData(
            `we/credit-notes?&kind=PURCHASE&supplier__uid=${supplierUID}`,
            "",
          );
          const arr = res?.results.map((credit: any) => {
            return {
              uid: credit?.uid,
              credit_number: credit?.credit_note_number,
              original_amount: credit?.total,
              remaining_balance: parseFloat(credit?.purchase_remaining_balance),
              payment: "",
              date: credit?.date,
            };
          });
          setCreditItems(arr);

          return res;
        },
        enabled: !!supplierUID,
        refetchOnWindowFocus: false,
      },
    ],
  });

  const {
    data: io,
    isPending: isInvoicePending,
    refetch: invoiceRefetch,
  } = OpenInvoices;
  const {
    data: ios,
    isPending: isCreditLoading,
    refetch: creditRefetch,
  } = CreditNotes;

  //credit note functions
  const handleInputChange = (uid: string, value: any) => {
    const updatedRows = PurchaseItems.map((row: any) => {
      if (row?.uid === uid && value <= row?.due_total) {
        const updatedCreditRows = creditItems.map((credit: any) => {
          return { ...credit, payment: "" };
        });
        setCreditItems(updatedCreditRows);
        let updatedRow = { ...row, payment: value };
        return updatedRow;
      } else {
        return row;
      }
    });
    setPurchaseItems(updatedRows);
  };

  
  console.log(PurchaseItems, "PurchaseItems");

  useEffect(() => {
    if (c?.uid && bill?.uid) {
      handleDefaultChecked(bill.uid);
      setPurchaseItems([
        {
          purchase_id: bill?.purchase_id,
          uid: bill?.uid,
          due_date: bill?.due_date,
          original_amount: bill?.total,
          due_total: parseFloat(bill?.due_total),
          payment: parseFloat(bill?.due_total),
        },
      ]);
    }
    if (c?.uid && !bill?.uid) {
      const fn = async () => {
        const res = await fetchSupplierBills({
          status: "OPEN",
          is_bill: true,
          supplier__uid: c?.uid,
        });
        res?.results?.map((bill: any) => {
          handleDefaultChecked(bill?.uid);
        });
      };
      fn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDefaultChecked = (id: any) => {
    setSelectedRows((prev) => {
      const UpdatedRows = new Set(prev);
      if (UpdatedRows.has(id)) {
        // UpdatedRows.delete(id);
      } else {
        UpdatedRows.add(id);
      }

      return UpdatedRows;
    });
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prev) => {
      const UpdatedRows = new Set(prev);
      if (UpdatedRows.has(id)) {
        UpdatedRows.delete(id);
        const updatedCreditRows = creditItems.map((credit: any) => {
          return { ...credit, payment: "" };
        });
        setCreditItems(updatedCreditRows);
        const updatedRows = PurchaseItems.map((row: any) => {
          if (row?.uid === id) {
            let updatedRow = { ...row, payment: "" };
            return updatedRow;
          } else {
            return row;
          }
        });
        setPurchaseItems(updatedRows);
      } else {
        UpdatedRows.add(id);
        const updatedRows = PurchaseItems.map((row: any) => {
          if (row?.uid === id) {
            let updatedRow = { ...row, payment: row.due_total };
            return updatedRow;
          } else {
            return row;
          }
        });
        setPurchaseItems(updatedRows);
      }

      return UpdatedRows;
    });
  };

  //credit note functions
  const handleCreditInputChange = (uid: string, value: any) => {
    if (Number(value) > Number(amountApply)) {
      alert("Credit Can't be larger than the Amount");
      toast.warning("Credit Can't be larger than the Amount");
      return;
    }
    const updatedRows = creditItems.map((row: any) => {
      if (row?.uid === uid && value <= row?.remaining_balance) {
        let updatedRow = { ...row, payment: value };
        return updatedRow;
      } else {
        return row;
      }
    });
    setCreditItems(updatedRows);
  };

  const handleCreditCheckboxChange = (id: number) => {
    setSelectedCreditRows((prev) => {
      const UpdatedRows = new Set(prev);
      if (UpdatedRows.has(id)) {
        UpdatedRows.delete(id);
        const updatedRows = creditItems.map((row: any) => {
          if (row?.uid === id) {
            let updatedRow = { ...row, payment: "" };
            return updatedRow;
          } else {
            return row;
          }
        });
        setCreditItems(updatedRows);
      } else {
        UpdatedRows.add(id);
        const updatedRows = creditItems.map((row: any) => {
          if (row?.uid === id) {
            let updatedRow = {
              ...row,
              payment:
                Number(row.remaining_balance) > Number(amountApply)
                  ? Number(amountApply)
                  : Number(row?.remaining_balance),
            };
            return updatedRow;
          } else {
            return row;
          }
        });
        setCreditItems(updatedRows);
      }

      return UpdatedRows;
    });
  };

  useEffect(() => {
    const calculateTotals = () => {
      const InvoiceTotal = PurchaseItems.reduce(
        (acc: any, row: any) => acc + Number(row.payment),
        0,
      );
      const creditTotal = creditItems.reduce(
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
  }, [PurchaseItems, creditItems, selectedRows, selectedCreditRows]);

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

          {!supplierUID && !bill?.uid ? (
            <p>Select A Supplier First</p>
          ) : !bill?.uid && isInvoicePending ? (
            <div className="h-full w-full rounded-xl border border-gray-100 bg-white bg-opacity-70">
              <div className="flex h-full w-full items-center justify-center">
                <p className="inline-block h-20 w-20 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />{" "}
              </div>
            </div>
          ) : (
            <div className="mt-4 w-full overflow-x-auto">
              {" "}
              <Table className="font-lexend">
                <TableHeader className="">
                  <TableRow className="bg-white hover:bg-white">
                    <TableHead className="py-5 pl-3">
                      {/* <Checkbox /> */}
                    </TableHead>
                    <TableHead className="font-medium">Purchase ID</TableHead>
                    <TableHead className="font-medium">Due Date</TableHead>
                    <TableHead className="font-medium">
                      Original Amount
                    </TableHead>
                    <TableHead className="font-medium">Open balance</TableHead>
                    <TableHead className="font-medium">Payment</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {PurchaseItems?.map((purchase: any) => (
                    <TableRow
                      className="bg-white hover:bg-white"
                      key={purchase?.uid}
                    >
                      <TableCell className="py-5 pl-3">
                        <Checkbox
                          value={selectedRows.has(purchase.uid)}
                          onChange={() => handleCheckboxChange(purchase.uid)}
                        />
                      </TableCell>
                      <TableCell className="cursor-pointer">
                        {purchase?.purchase_id}
                      </TableCell>
                      <TableCell>{purchase?.due_date}</TableCell>
                      <TableCell> {purchase?.original_amount}</TableCell>
                      <TableCell>{purchase?.due_total}</TableCell>
                      <TableCell>
                        <input
                          disabled={!selectedRows.has(purchase.uid)}
                          type="number"
                          value={purchase?.payment}
                          onChange={(e) => {
                            handleInputChange(purchase?.uid, e.target.value);
                          }}
                          placeholder=""
                          className="rounded-lg border bg-white px-3 py-2 outline-none disabled:bg-gray-200"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>{" "}
              {!PurchaseItems?.length && supplierUID && (
                <p className="py-2 text-center text-accent_soft_blue">
                  No Bills Found!
                </p>
              )}
            </div>
          )}
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
          {!supplierUID ? (
            <p>Select A Supplier First</p>
          ) : isCreditLoading ? (
            <div className="h-full w-full rounded-xl border border-gray-100 bg-white bg-opacity-70">
              <div className="flex h-full w-full items-center justify-center">
                <p className="inline-block h-20 w-20 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />{" "}
              </div>
            </div>
          ) : (
            <div className="mt-4 w-full overflow-x-auto">
              <Table className="font-lexend">
                <TableHeader className="">
                  <TableRow className="bg-white hover:bg-white">
                    <TableHead className="py-5 pl-3">
                      {/* <Checkbox /> */}
                    </TableHead>
                    <TableHead className="font-medium">Note No</TableHead>
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium">
                      Original Amount
                    </TableHead>
                    <TableHead className="font-medium">
                      Remaining Balance
                    </TableHead>
                    <TableHead className="font-medium">Payment</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {creditItems?.map((data: any, idx: any) => (
                    <TableRow className="bg-white hover:bg-white" key={idx}>
                      <TableCell className="py-5 pl-3">
                        <Checkbox
                          value={selectedCreditRows.has(data.uid)}
                          onChange={() => handleCreditCheckboxChange(data.uid)}
                        />
                      </TableCell>
                      <TableCell className="cursor-pointer">
                        {data.credit_number}
                      </TableCell>
                      <TableCell>{data.date}</TableCell>
                      <TableCell> {data.original_amount}</TableCell>
                      <TableCell>{data.remaining_balance}</TableCell>
                      <TableCell>
                        <input
                          disabled={!selectedCreditRows.has(data.uid)}
                          type="number"
                          value={data?.payment}
                          onChange={(e) => {
                            handleCreditInputChange(data?.uid, e.target.value);
                          }}
                          placeholder=""
                          className="rounded-lg border bg-white px-3 py-2 outline-none disabled:bg-gray-200"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!creditItems?.length && supplierUID && (
                <p className="py-2 text-center text-accent_soft_blue">
                  No Credit Note Found!
                </p>
              )}
            </div>
          )}
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

export default BillPaymentTable;
