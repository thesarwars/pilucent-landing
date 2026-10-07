import Button from "@/components/ui/RawButton";
import { FaPaperPlane } from "react-icons/fa";
import { LuDownload } from "react-icons/lu";
import { BsPrinter } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import ReactToPrint from "react-to-print";
import { useEffect, useRef, useState } from "react";
import { TfiEmail } from "react-icons/tfi";
import { IoIosArrowBack } from "react-icons/io";
import moment from "moment";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

const BillPaymentPreview = ({
  PurchaseData,
  setPreview,
  Items,
  handleSubmit,
  isLoading,
}: {
  PurchaseData: any;
  Items: any;
  setPreview: any;
  handleSubmit: any;
  isLoading: any;
}) => {
  const [subTotal, setSubTotal] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null);
  const {
    allDates,
    tags,
    files,
    attachmentList,
    selectedSupplier: supplier,
    Data,
    emails,
  } = PurchaseData;
  const { purchaseItems, CreditItems } = Items;
  const {
    mailing_address,
    reference_number,
    total,
    payment_method,
    deposit_to,
    bill_no,
  } = Data;


  const [amountApply, setAmountApply] = useState(0);
  const [amountCredit, setAmountCredit] = useState(0);

  const handleDownloadPdf = async () => {
    if (componentRef.current) {
      const dataUrl = await htmlToImage.toPng(componentRef.current, {
        quality: 1,
        pixelRatio: 2,
      });
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("invoice.pdf");
    }
  };

  useEffect(() => {
    const InvoiceTotal = purchaseItems?.reduce(
      (acc: any, row: any) => acc + Number(row?.payment),
      0,
    );
    const creditTotal = CreditItems?.reduce(
      (acc: any, row: any) => acc + Number(row?.payment),
      0,
    );
    setAmountCredit(InvoiceTotal);
    setAmountApply(creditTotal);
  }, [purchaseItems, CreditItems]);


  return (
    <div>
      <Button
        onClick={() => setPreview(false)}
        className="mb-4 mt-5 flex items-center gap-1 p-1 text-accent_soft_blue"
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
            Bill Payment
          </h1>
          <div className="flex gap-7">
            <div className="flex-1">
              <p className="border-b font-semibold text-[#333752]">
                Bill Information
              </p>
              {/* <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                Bill Date
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {moment(allDates?.paymentDate).format("DD/MM/YYYY")}
                </span>
              </p> */}
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Payment Date
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {moment(allDates?.paymentDate).format("DD/MM/YYYY")}
                </span>
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Payment Account
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {deposit_to?.title}
                </span>
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Bill No
                </span>
                <span className="flex-1 text-[#7E84A3]">{bill_no}</span>
              </p>
            </div>
            <div className="flex-1">
              {" "}
              <p className="border-b font-semibold text-[#333752]">
                Supplier Information
              </p>
              <p className="mt-2 text-[#333752]">
                {supplier?.first_name} {supplier?.middle_name}{" "}
                {supplier?.last_name}
              </p>
              <p className="mt-2 flex items-center gap-1 text-[#333752]">
                {" "}
                <TfiEmail /> {emails?.email}
              </p>
              <p className="mt-2 text-[#333752]">{mailing_address}</p>
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
                      <TableHead>Purchase ID</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Original Amount</TableHead>
                      <TableHead>Original balance</TableHead>
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {purchaseItems.map(
                      (purchase: any, idx: number) =>
                        purchase?.payment && (
                          <TableRow
                            className={`border-b bg-white hover:bg-white`}
                            key={idx}
                          >
                            <TableCell className="cursor-pointer">
                              {purchase?.purchase_id}
                            </TableCell>
                            <TableCell>{purchase?.due_date}</TableCell>
                            <TableCell> {purchase?.original_amount}</TableCell>
                            <TableCell>{purchase?.due_total}</TableCell>
                            <TableCell>{purchase?.payment}</TableCell>
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
                    {CreditItems?.map(
                      (data: any, idx: number) =>
                        data?.payment && (
                          <TableRow
                            className={`border-b bg-white hover:bg-white`}
                            key={idx}
                          >
                            <TableCell className="cursor-pointer">
                              {data?.credit_number}
                            </TableCell>
                            <TableCell>{data?.date}</TableCell>
                            <TableCell> {data?.original_amount}</TableCell>
                            <TableCell>{data?.remaining_balance}</TableCell>

                            <TableCell>{data?.payment}</TableCell>
                          </TableRow>
                        ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <div className="rounded-2xl bg-[#F5F6FA] p-4 text-white">
              <div className="my-4 flex justify-between font-semibold text-[#333752]">
                Amount Apply
                <p className="w-32 text-right">$ {amountApply || 0}</p>
              </div>

              <p className="mb-4 flex justify-between font-semibold text-[#333752]">
                Amount to Credit{" "}
                <span className="font-semibold">$ {amountCredit}</span>
              </p>
            </div>
          </div>
          <div>
              <h1 className="text-lg font-semibold text-[#333752]">Tags</h1>
              <hr className="mb-3" />
              {tags.map((tag: any) => (
                <p
                  className="mr-1 inline-block rounded-3xl bg-[#E6E9F4] px-4 py-1 text-[#5A607F]"
                  key={tag}
                >
                  {tag}
                </p>
              ))}
            </div>

            <div className="mt-4">
              <h1 className="text-lg font-semibold text-[#333752]">
                Terms & Conditions
              </h1>
              <hr className="mb-3" />
              <div id="textInput"></div>
            </div>

            <div className="mt-4">
              <h1 className="text-lg font-semibold text-[#333752]">
                Documents
              </h1>
              <hr className="mb-3" />
              <div className="space-y-2">
                {files.map((file: any) => (
                  <p key={file.name} className="border px-3 py-1">
                    {file.name}
                  </p>
                ))}

                <div className="mt-1 space-y-1">
                  {attachmentList?.map((file: any, index: any) => (
                    <div key={index} className="border px-3 py-1">
                      <p>{file?.title.slice(0, 50)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>
        <div className="min-w-72">
          <div
            className="flex flex-col gap-4 rounded-xl p-4"
            style={{ boxShadow: "0px 4px 30px 0px rgba(46, 45, 116, 0.05)" }}
          >
            <Button
              onClick={handleSubmit}
              isLoading={isLoading}
              className="flex items-center justify-center gap-2 bg-accent_dark_blue font-semibold text-white"
            >
              <FaPaperPlane className="text-lg font-semibold" /> Save & Send
            </Button>
            <Button
              onClick={handleDownloadPdf}
              className="flex w-full items-center justify-center gap-2 bg-[#E7E7FF] font-semibold text-accent_soft_blue"
            >
              <LuDownload className="text-lg font-semibold" /> Download
            </Button>

            <ReactToPrint
              trigger={() => (
                <Button className="flex items-center justify-center gap-2 bg-[#E7E7FF] font-semibold text-accent_soft_blue">
                  <BsPrinter className="text-xl font-semibold" /> Print
                </Button>
              )}
              content={() => componentRef.current}
            />
            <Button
              onClick={() => setPreview(false)}
              className="flex items-center justify-center gap-2 bg-[#E7E7FF] font-semibold text-accent_soft_blue"
            >
              <FiEdit className="text-lg font-semibold" /> Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPaymentPreview;
