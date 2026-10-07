import {
  fetchCustomerInvoices,
  fetchSingleCustomer,
} from "@/app/helpers/backend";
import { decryptData } from "@/app/helpers/crypto";
import Checkbox from "@/components/ui/Checkbox/Checkbox";
import Input from "@/components/ui/RawInput";
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

const PaymentReceivedTable = ({
  setInvoiceItems,
  setCreditItems,
  PaymentData,
  setPaymentData,
  customerUID,
}: {
  setInvoiceItems: any;
  setCreditItems: any;
  PaymentData: any;
  setPaymentData: any;
  customerUID: any;
}) => {
  const [isTransactionOpen, setIsTransactionOpen] = useState(true);
  const [isCreditOpen, setIsCreditOpen] = useState(true);
  const [InvoiceList, setInvoiceList] = useState<any[]>([]);
  const [creditNoteList, setCreditNoteList] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedCreditRows, setSelectedCreditRows] = useState<Set<number>>(
    new Set(),
  );
  const [amountApply, setAmountApply] = useState(0);
  const [amountCredit, setAmountCredit] = useState(0);
  const [total, setTotal] = useState(0);
  const c = decryptData(useSearchParams().get("c") || "{}");
  const inv = decryptData(useSearchParams().get("inv") || "{}");
  const [OpenInvoices, CreditNotes] = useQueries({
    queries: [
      {
        queryKey: ["openSales", customerUID],
        queryFn: async () => {
          const res = await GetData(
            `we/sales?status=OPEN&is_invoice=true&customer__uid=${customerUID}`,
            "",
          );
          const arr = res?.results.map((sale: any) => {
            return {
              invoice_id: sale?.invoice_id,
              uid: sale?.uid,
              due_date: sale?.due_date,
              original_amount: sale?.total,
              due_total: parseFloat(sale?.due_total),
              payment: c?.uid ? parseFloat(sale?.due_total) : "",
            };
          });
          setInvoiceList(arr);
          return res;
        },
        enabled: !!customerUID && !inv?.uid,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["credit_notes", customerUID],
        queryFn: async () => {
          const res = await GetData(
            `we/credit-notes?kind=SALE&customer__uid=${customerUID}`,
            "",
          );
          const arr = res?.results.map((sale: any) => {
            return {
              uid: sale?.uid,
              credit_number: sale?.credit_note_number,
              original_amount: sale?.total,
              remaining_balance: parseFloat(sale?.sale_remaining_balance),
              payment: "",
              date: sale?.date,
            };
          });
          setCreditNoteList(arr);

          return res;
        },
        enabled: !!customerUID,
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

  useEffect(() => {
    if (c?.uid && inv?.uid) {
      handleDefaultChecked(inv.uid);
      setInvoiceList([
        {
          invoice_id: inv?.invoice_id,
          uid: inv?.uid,
          due_date: inv?.due_date,
          original_amount: inv?.total,
          due_total: parseFloat(inv?.due_total),
          payment: parseFloat(inv?.due_total),
        },
      ]);
    }
    if (c?.uid && !inv?.uid) {
      const fn = async () => {
        const res = await fetchCustomerInvoices(c?.uid);
        res?.results?.map((sale: any) => {
          handleDefaultChecked(sale?.uid);
        });
      };
      fn();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //credit note functions
  const handleInputChange = (uid: string, value: any) => {
    const updatedRows = InvoiceList.map((row) => {
      if (row?.uid === uid && value <= row?.due_total) {
        const updatedCreditRows = creditNoteList.map((credit) => {
          return { ...credit, payment: "" };
        });
        setCreditNoteList(updatedCreditRows);
        let updatedRow = { ...row, payment: value };
        return updatedRow;
      } else {
        return row;
      }
    });
    setInvoiceList(updatedRows);
  };

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
        const updatedCreditRows = creditNoteList.map((credit) => {
          return { ...credit, payment: "" };
        });
        setCreditNoteList(updatedCreditRows);
        const updatedRows = InvoiceList.map((row) => {
          if (row?.uid === id) {
            let updatedRow = { ...row, payment: "" };
            return updatedRow;
          } else {
            return row;
          }
        });
        setInvoiceList(updatedRows);
      } else {
        UpdatedRows.add(id);
        const updatedRows = InvoiceList.map((row) => {
          if (row?.uid === id) {
            let updatedRow = { ...row, payment: row.due_total };
            return updatedRow;
          } else {
            return row;
          }
        });
        setInvoiceList(updatedRows);
      }

      return UpdatedRows;
    });
  };

  //credit note functions
  const handleCreditInputChange = (uid: string, value: any) => {
    if (Number(value) > Number(amountApply)) {
      return toast.error("Credit Can't be larger than the Amount");
    }
    const updatedRows = creditNoteList.map((row) => {
      if (row?.uid === uid && value <= row?.remaining_balance) {
        let updatedRow = { ...row, payment: value };
        return updatedRow;
      } else {
        return row;
      }
    });
    setCreditNoteList(updatedRows);
  };

  const handleCreditCheckboxChange = (id: number) => {
    setSelectedCreditRows((prev) => {
      const UpdatedRows = new Set(prev);
      if (UpdatedRows.has(id)) {
        UpdatedRows.delete(id);
        const updatedRows = creditNoteList.map((row) => {
          if (row?.uid === id) {
            let updatedRow = { ...row, payment: "" };
            return updatedRow;
          } else {
            return row;
          }
        });
        setCreditNoteList(updatedRows);
      } else {
        UpdatedRows.add(id);
        const updatedRows = creditNoteList.map((row) => {
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
        setCreditNoteList(updatedRows);
      }

      return UpdatedRows;
    });
  };

  useEffect(() => {
    const calculateTotals = () => {
      const InvoiceTotal = InvoiceList.reduce(
        (acc, row) => acc + Number(row.payment),
        0,
      );
      const creditTotal = creditNoteList.reduce(
        (acc, row) => acc + Number(row.payment),
        0,
      );
      const total = Number(InvoiceTotal || 0) - Number(creditTotal || 0);

      setTotal(total);
      setAmountApply(InvoiceTotal);
      setAmountCredit(creditTotal);

      setPaymentData({ ...PaymentData, total: total, amount_to_credit: creditTotal });
    };

    calculateTotals();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [InvoiceList, creditNoteList, selectedRows, selectedCreditRows]);

  useEffect(() => {
    setInvoiceItems(InvoiceList);
    setCreditItems(creditNoteList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [InvoiceList, creditNoteList]);

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
          <h2 className="font-semibold uppercase text-accent_soft_black">
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

          {!customerUID && !inv?.uid ? (
            <p>Select A Customer First</p>
          ) : isInvoicePending && !inv?.uid ? (
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
                    <TableHead className="text-left">Invoice ID</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Original Amount</TableHead>
                    <TableHead>Open balance</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {InvoiceList?.map((invoice: any) => (
                    <TableRow
                      className="hover:bg-transparent"
                      key={invoice?.uid}
                    >
                      <TableCell className="py-5 pl-3">
                        <Checkbox
                          value={selectedRows.has(invoice.uid)}
                          onChange={() => handleCheckboxChange(invoice.uid)}
                        />
                      </TableCell>
                      <TableCell className="cursor-pointer">
                        {invoice?.invoice_id}
                      </TableCell>
                      <TableCell>{invoice?.due_date}</TableCell>
                      <TableCell> {invoice?.original_amount}</TableCell>
                      <TableCell>{invoice?.due_total}</TableCell>
                      <TableCell>
                        <input
                          disabled={!selectedRows.has(invoice.uid)}
                          type="number"
                          value={invoice?.payment}
                          onChange={(e) => {
                            handleInputChange(invoice?.uid, e.target.value);
                          }}
                          placeholder=""
                          className="rounded-lg border bg-white px-3 py-2 outline-none disabled:bg-gray-200"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>{" "}
              {!InvoiceList?.length && customerUID && (
                <p className="py-2 text-center text-accent_soft_blue">
                  No Open Invoice Found!
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
          <h2 className="font-semibold uppercase text-accent_soft_black">Credits</h2>
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
          {!customerUID ? (
            <p>Select A Customer First</p>
          ) : isCreditLoading ? (
            <div className="h-full w-full rounded-xl border border-gray-100 bg-white bg-opacity-70">
              <div className="flex h-full w-full items-center justify-center">
                <p className="inline-block h-20 w-20 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />{" "}
              </div>
            </div>
          ) : (
            <div className="mt-4 w-full overflow-x-auto">
              <Table className="font-lexend bg-white">
                <TableHeader className="">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-5 pl-3">
                      {/* <Checkbox /> */}
                    </TableHead>
                    <TableHead className="text-left">Note No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Original Amount</TableHead>
                    <TableHead>Remaining Balance</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {creditNoteList?.map((data, idx) => (
                    <TableRow className="hover:bg-transparent" key={idx}>
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
              {!creditNoteList?.length && customerUID && (
                <p className="py-2 text-center text-accent_soft_blue">
                  No Credit Note Found!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <div style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }} className="mt-5 space-y-4 rounded-2xl bg-white p-4 text-right font-semibold">
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

export default PaymentReceivedTable;
