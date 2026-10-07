import Button from "@/components/ui/RawButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { BsPrinter } from "react-icons/bs";
import { FaPaperPlane } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";
import { LuDownload } from "react-icons/lu";
import { TfiEmail } from "react-icons/tfi";
import ReactToPrint from "react-to-print";

interface propsType {
  setPreview: any;
  PaymentData: any;
  tags: string[];
  files: any[];
  invoiceItems: any;
  creditItems: any;
  handleSend: any;
  isPending: any;
}

const PaymentPreview = ({
  setPreview,
  PaymentData,
  invoiceItems,
  creditItems,
  tags,
  files,
  handleSend,
  isPending,
}: propsType) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [amountApply, setAmountApply] = useState(0)
  const [amountCredit, setAmountCredit] = useState(0)
  const {
    billing_address,
    reference_number,
    total,
    payment_method,
    deposit_to,
    customer,
    emails,
    receiptDate,
  } = PaymentData;



  useEffect(() => {
  
      const InvoiceTotal = invoiceItems.reduce(
        (acc: any, row: any) => acc + Number(row.payment),
        0,
      );
      const creditTotal = creditItems.reduce(
        (acc: any, row: any) => acc + Number(row.payment),
        0,
      );
      setAmountCredit(creditTotal)
      setAmountApply(InvoiceTotal)
   
  }, [invoiceItems, creditItems]);

  return (
    <div>
      <Button
        onClick={() => setPreview(false)}
        className="mb-4 flex items-center gap-1 text-accent_soft_blue"
      >
        <IoIosArrowBack /> Back
      </Button>
      <div className="flex gap-6">
        <div
          ref={componentRef}
          className="flex-1 rounded-xl p-4"
          style={{ boxShadow: "0px 4px 30px 0px rgba(46, 45, 116, 0.05)" }}
        >
          <h1 className="mb-3 text-2xl font-semibold text-black">
            Payment Received
          </h1>
          <div className="flex gap-7">
            <div className="flex-1">
              <p className="border-b font-semibold text-[#333752]">
                Payment Information
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Payment Received Date
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {moment(receiptDate).format("DD/MM/YYYY")}
                </span>
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Amount received
                </span>
                <span className="flex-1 text-[#7E84A3]">{total}</span>
              </p>
            </div>
            <div className="flex-1">
              {" "}
              <p className="border-b font-semibold text-[#333752]">
                Payment Received
              </p>
              <p className="mt-2 text-[#333752]">{`${customer?.first_name} ${customer?.middle_name} ${customer?.last_name}`}</p>
              <p className="mt-2 flex items-center gap-1 text-[#333752]">
                {" "}
                <TfiEmail /> {emails?.customer_email}
              </p>
              <p className="mt-2 text-[#333752]">{billing_address}</p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Payment Method
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {payment_method?.title}
                </span>
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Deposit to
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {deposit_to?.title}
                </span>
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Reference Number
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {reference_number}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex w-full cursor-pointer items-center gap-2">
              <h2 className="font-semibold uppercase text-[#5A607F]">
                Outstanding transactions
              </h2>
            </div>
            <div>
              <div className="w-full overflow-x-auto">
                <Table className="font-lexend">
                  <TableHeader className="">
                    <TableRow className="border-b border-gray-300 bg-white uppercase hover:bg-white">
                      <TableHead className="text-left">Invoice ID</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Original Amount</TableHead>
                      <TableHead>Original balance</TableHead>
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {invoiceItems.map(
                      (invoice: any, idx: number) =>
                        invoice?.payment && (
                          <TableRow
                            className={`border-b bg-white hover:bg-white`}
                            key={idx}
                          >
                            <TableCell className="cursor-pointer">
                              {invoice?.invoice_id}
                            </TableCell>
                            <TableCell>{invoice?.due_date}</TableCell>
                            <TableCell> {invoice?.original_amount}</TableCell>
                            <TableCell>{invoice?.due_total}</TableCell>
                            <TableCell>{invoice.payment}</TableCell>
                          </TableRow>
                        ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <div>
            <div className="flex w-full cursor-pointer items-center gap-2">
              <h2 className="font-semibold uppercase text-[#5A607F]">
                Credits
              </h2>
            </div>
            <div className={`w-full`}>
              <div className="w-full overflow-x-auto">
                <Table className="font-lexend">
                  <TableHeader className="">
                    <TableRow className="border-b-2 border-gray-300 bg-white/60 uppercase hover:bg-white">
                      <TableHead>Note No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Original Amount</TableHead>
                      <TableHead>Open balance</TableHead>
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {creditItems.map((data: any, idx: number) => (
                      data?.payment && <TableRow
                        className={`border-b bg-white hover:bg-white`}
                        key={idx}
                      >
                        <TableCell className="cursor-pointer">
                          {data.credit_number}
                        </TableCell>
                        <TableCell>{data.date}</TableCell>
                        <TableCell> {data.original_amount}</TableCell>
                        <TableCell>{data.remaining_balance}</TableCell>

                        <TableCell>{data.payment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="rounded-2xl bg-[#F5F6FA] p-4 text-white">
              <div className="my-4 flex justify-between font-semibold text-[#333752]">
                Amount Apply
                <p className="w-32 text-right">$ {amountApply}</p>
              </div>

              <p className="mb-4 flex justify-between font-semibold text-[#333752]">
                Amount to Credit <span className="font-semibold">$ {amountCredit}</span>
              </p>
            </div>
          </div>

          {/* <div>
            <h1 className="text-lg font-semibold text-[#333752]">Tags</h1>
            <hr className="mb-3" />
            {tags.map((tag) => (
              <p
                className="mr-1 inline-block rounded-3xl bg-[#E6E9F4] px-4 py-1 text-[#5A607F]"
                key={tag}
              >
                {tag}
              </p>
            ))}
          </div> */}

          <div className="mt-4">
            <h1 className="text-lg font-semibold text-[#333752]">
              Terms & Conditions
            </h1>
            <hr className="mb-3" />
            <div id="textInput"></div>
          </div>

          <div className="mt-4">
            <h1 className="text-lg font-semibold text-[#333752]">Documents</h1>
            <hr className="mb-3" />
            <div className="space-y-2">
              {files.map((file) => (
                <p key={file.name} className="border px-3 py-1">
                  {file.name}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="min-w-72">
          <div
            className="flex flex-col gap-4 rounded-xl p-4"
            style={{ boxShadow: "0px 4px 30px 0px rgba(46, 45, 116, 0.05)" }}
          >
            <Button onClick={handleSend} isLoading={isPending} className="flex items-center justify-center gap-2 bg-accent_dark_blue font-semibold text-white">
              <FaPaperPlane className="text-lg font-semibold" /> Save & Send
              Invoice
            </Button>
            <Button className="flex w-full items-center justify-center gap-2 bg-[#E7E7FF] font-semibold text-accent_soft_blue">
              <LuDownload className="text-lg font-semibold" /> Download Invoice
            </Button>

            <ReactToPrint
              trigger={() => (
                <Button className="flex items-center justify-center gap-2 bg-[#E7E7FF] font-semibold text-accent_soft_blue">
                  <BsPrinter className="text-xl font-semibold" /> Print Invoice
                </Button>
              )}
              content={() => componentRef.current}
            />
            <Button
              onClick={() => setPreview(false)}
              className="flex items-center justify-center gap-2 bg-[#E7E7FF] font-semibold text-accent_soft_blue"
            >
              <FiEdit className="text-lg font-semibold" /> Edit Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPreview;
