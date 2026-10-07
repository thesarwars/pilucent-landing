import Button from "@/components/ui/RawButton";
import { useRef } from "react";
import { IoIosArrowBack } from "react-icons/io";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { TfiEmail } from "react-icons/tfi";
import { FaPaperPlane } from "react-icons/fa";
import { LuDownload } from "react-icons/lu";
import ReactToPrint from "react-to-print";
import { BsPrinter } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { useAppSelector } from "@/app/redux/store";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import moment from "moment";

const RefundPreview = ({
  EstimateData,
  setPreview,
  handleSubmit,
  isLoading,
}: {
  EstimateData: any;
  setPreview: any;
  handleSubmit: any;
  isLoading: any;
}) => {
  const componentRef = useRef(null);
  const { UserData } = useAppSelector((state) => state.userData);
  const { invoiceItems, invoiceData, ReceiptData, tags, files } = EstimateData;
  const {
    tax_kind: taxType,
    ReceiptDate,
    selectedCustomer: customer,
    emails,
    data,
    total,
    sub_total,
    total_tax,
  } = invoiceData;

  const { receipt_number, deposit_to, cheque_number, payment_method } =
    ReceiptData;
  const { billing_address } = data;

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

  return (
    <div className="mt-4 text-sm">
      <Button
        onClick={() => setPreview(false)}
        className="mb-4 flex items-center gap-1 p-1 text-accent_soft_blue"
      >
        <IoIosArrowBack /> Back
      </Button>
      <div className="flex gap-6">
        <div
          ref={componentRef}
          className="mb-7 flex-1 rounded border bg-white p-4"
        >
          <h1 className="mb-3 text-2xl font-semibold text-black">
            Refund Receipt
          </h1>
          <div className="flex gap-7">
            <div className="flex-1">
              <p className="border-b font-semibold text-[#333752]">
                Refund Information
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Refund Receipt Date
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {moment(ReceiptDate).format("DD/MM/YYYY")}
                </span>
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Refund Receipt No
                </span>
                <span className="flex-1 text-[#7E84A3]">{receipt_number}</span>
              </p>

              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Balance
                </span>
                <span className="flex-1 text-[#7E84A3]">{total}</span>
              </p>
            </div>
            <div className="flex-1">
              {" "}
              <p className="border-b font-semibold text-[#333752]">
                Refund Receipt
              </p>
              <p className="mt-2 text-[#333752]">
                {" "}
                {customer?.first_name} {customer?.middle_name}{" "}
                {customer?.last_name}
              </p>
              <p className="mt-2 flex items-center gap-1 text-[#333752]">
                {" "}
                <TfiEmail /> {customer?.email}
              </p>
              <p className="mt-2 text-[#333752]">{billing_address}</p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Refund From
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {deposit_to?.title}
                </span>
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Cheque No
                </span>
                <span className="flex-1 text-[#7E84A3]">{cheque_number}</span>
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Payment Method
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {payment_method?.title}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="border-base-300 relative mb-5 rounded-none">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="">
                    <TableRow className="border-b-2 border-gray-300 bg-white/60 uppercase hover:bg-white">
                      <TableHead className="text-left">
                        Product/Service
                      </TableHead>

                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>

                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceItems.map((row: any, index: any) => (
                      <TableRow
                        key={index}
                        className={`border-none bg-white hover:bg-white`}
                      >
                        {row.type === "product" && row?.product_service?.uid ? (
                          <>
                            {" "}
                            <TableCell className="w-84 border-b bg-white capitalize">
                              <div className="ml-2 w-80">
                                <div className="custom-select flex items-center justify-between">
                                  <input
                                    type="text"
                                    placeholder="Type to find a Product.."
                                    value={row?.product_service?.title}
                                    readOnly
                                    className={`w-full bg-transparent px-6 py-2 capitalize outline-none`}
                                  />
                                </div>
                                <div className="my-1">
                                  <input
                                    type="text"
                                    className="h-full w-full px-2 outline-none"
                                    value={row.description}
                                    placeholder="Product Description Here"
                                    readOnly
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="border-b">
                              <input
                                type="number"
                                className="w-full px-2 text-center outline-none"
                                value={row.qty}
                              />
                            </TableCell>
                            <TableCell className="border-b">
                              <input
                                type="text"
                                className="w-full px-2 text-center outline-none"
                                value={row.price}
                                readOnly
                              />
                            </TableCell>
                            <TableCell className="border-b">
                              <input
                                type="text"
                                className="h-full w-full border-none px-2 text-center outline-none"
                                value={row.amount}
                                readOnly
                              />
                            </TableCell>
                          </>
                        ) : row.type === "section" ? (
                          <>
                            <TableCell className="col-span-4 w-80 border-b">
                              {" "}
                              <input
                                type="text"
                                className="h-full w-80 border-none px-2 text-lg italic text-[#333752] outline-none"
                                value={row.description}
                                readOnly
                              />
                            </TableCell>
                            <TableCell className="border-b"></TableCell>
                            <TableCell className="border-b"></TableCell>

                            <TableCell className="border-b"></TableCell>
                          </>
                        ) : (
                          row.type === "note" && (
                            <>
                              <TableCell className="col-span-4 w-80 border-b">
                                {" "}
                                <input
                                  type="text"
                                  className="h-full w-80 border-none px-2 text-lg font-light text-[#7E84A3] outline-none"
                                  readOnly
                                  value={row.description}
                                />
                              </TableCell>
                              <TableCell className="border-b"></TableCell>
                              <TableCell className="border-b"></TableCell>

                              <TableCell className="border-b"></TableCell>
                            </>
                          )
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="rounded-lg border bg-white p-4 text-accent_soft_black">
                <div className="my-4 flex justify-between font-semibold text-[#333752]">
                  Subtotal
                  <p className="w-32 text-right">$ {sub_total}</p>
                </div>

                <p className="mb-4 flex justify-between font-semibold text-accent_soft_blue">
                  Amount Refunded{" "}
                  <span className="w-32 text-right font-semibold">
                    $ {total}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h1 className="text-lg font-semibold text-[#333752]">Tags</h1>
              <hr className="mb-3" />
              {tags?.map((tag: any) => (
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
              </div>
            </div>
          </div>
        </div>
        <div className="min-w-72">
          <div className="mb-7 flex flex-col gap-4 rounded border bg-white p-4">
            <Button className="flex items-center justify-center gap-2 bg-accent_dark_blue text-sm text-white">
              <FaPaperPlane className="text-lg font-semibold" /> Save & Send
              Invoice
            </Button>
            <Button
              onClick={handleDownloadPdf}
              className="flex w-full items-center justify-center gap-2 bg-[#E7E7FF] text-sm text-accent_soft_blue"
            >
              <LuDownload className="text-lg font-semibold" /> Download Invoice
            </Button>

            <ReactToPrint
              trigger={() => (
                <Button className="flex items-center justify-center gap-2 bg-[#E7E7FF] text-sm text-accent_soft_blue">
                  <BsPrinter className="text-xl font-semibold" /> Print Invoice
                </Button>
              )}
              content={() => componentRef.current}
            />
            <Button
              onClick={() => setPreview(false)}
              className="flex items-center justify-center gap-2 bg-[#E7E7FF] text-sm text-accent_soft_blue"
            >
              <FiEdit className="text-lg font-semibold" /> Edit Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPreview;
