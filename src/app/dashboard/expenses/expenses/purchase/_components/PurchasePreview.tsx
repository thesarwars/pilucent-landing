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
import { useAppSelector } from "@/app/redux/store";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

const PurchasePreview = ({
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
    // fileList,
    attachmentList,
    selectedSupplier: supplier,
    Data,
    expenseData,
    emails,
    status
  } = PurchaseData;
  const { purchaseItems, CategoryItems } = Items;

  const {
    tax_kind: taxType,
    discount_kind,
    discount_amount,
    shipping_fee,
    total_tax,
    total,
    // deposit,
    // due_total,
  } = expenseData;
  const { mailing_address, shipping_to, ship_via, location, terms, bill_no } =
    Data;

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
        pdf.save("purchase.pdf");
      }
    };
  

  useEffect(() => {
    const calculateTotals = () => {
      const PurchaseSubtotal = purchaseItems?.reduce(
        (acc: any, row: any) => acc + Number(row.amount),
        0,
      );
      //category calculations
      const CategorySubtotal = CategoryItems?.reduce(
        (acc: any, row: any) => acc + Number(row.amount),
        0,
      );

      setSubTotal(Number(PurchaseSubtotal) + Number(CategorySubtotal));
    };
    calculateTotals();
  }, [purchaseItems, CategoryItems]);

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
          <h1 className="mb-3 text-2xl font-semibold text-black">Purchase Order</h1>
          <div className="flex gap-7">
            <div className="flex-1">
              <p className="border-b font-semibold text-[#333752]">
              Purchase Information
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                Purchase Order Date
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {moment(allDates?.estimateDate).format("DD/MM/YYYY")}
                </span>
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                Status
                </span>
                <p className="flex-1 text-[#286AC5]"><span className=" text-[#286AC5] bg-[#DDEDFD] px-3 rounded-2xl py-1 ">{status}</span></p>
              </p>
            </div>
            <div className="flex-1">
              {" "}
              <p className="border-b font-semibold text-[#333752]">
                Supplier and Shipping Address
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
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Ship date
                </span>
                <span className="flex-1 text-[#7E84A3]">
                  {moment(allDates?.shipDate).format("DD/MM/YYYY")}
                </span>
              </p> 
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Ship to
                </span>
                <span className="flex-1 text-[#7E84A3]">{shipping_to}</span>
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Ship via
                </span>
                <span className="flex-1 text-[#7E84A3]">{ship_via}</span>
              </p>
              <p className="mt-2 flex items-center gap-5">
                <span className="flex-1 font-semibold text-[#5A607F]">
                  Location
                </span>
                <span className="flex-1 text-[#7E84A3]">{location?.title}</span>
              </p>
            </div>
          </div>

          <div className="relative mb-8 mt-8 rounded-none border-base-300">
            <h1 className="font-semibold uppercase text-[#5A607F]">
              category details
            </h1>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="">
                  <TableRow className="border-b-2 border-gray-300 bg-white/60 uppercase hover:bg-white">
                    <TableHead>Category</TableHead>
                    {!(taxType === "NO_TAX") && <TableHead>TAX</TableHead>}
                    <TableHead>Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CategoryItems?.map((row: any, index: any) => (
                    <TableRow
                      key={index}
                      className={`border-none bg-white hover:bg-white`}
                    >
                      {row.type === "category" && row?.amount ? (
                        <>
                          <TableCell className="w-84 border-b bg-white capitalize">
                            <div className="ml-2 w-80">
                              <div className="custom-select flex items-center justify-between">
                                <input
                                  type="text"
                                  placeholder="Type to find a Product.."
                                  value={row.category}
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
                          {!(taxType === "NO_TAX") && (
                            <TableCell className="border-b bg-white">
                              {row?.productTaxRate}%
                            </TableCell>
                          )}
                          <TableCell className="border-b">
                            <input
                              type="text"
                              className="w-full px-2 text-center outline-none"
                              value={row.amount}
                              readOnly
                            />
                          </TableCell>
                        </>
                      ) : row.type === "section" ? (
                        <>
                          {" "}
                          <TableCell className="col-span-4 w-80 border-b">
                            {" "}
                            <input
                              type="text"
                              className="h-full w-80 border-none px-2 text-center text-lg italic text-[#333752] outline-none"
                              value={row.description}
                            />
                          </TableCell>
                          {!(taxType === "NO_TAX") && (
                            <TableCell className="border-b"></TableCell>
                          )}
                          <TableCell className="border-b"></TableCell>
                        </>
                      ) : (
                        row.type === "note" && (
                          <>
                            <TableCell className="col-span-4 w-80 border-b">
                              {" "}
                              <input
                                type="text"
                                className="h-full w-80 border-none px-2 text-center text-lg font-light text-[#7E84A3] outline-none"
                                value={row.description}
                              />
                            </TableCell>
                            {!(taxType === "NO_TAX") && (
                              <TableCell className="border-b"></TableCell>
                            )}
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

          <div className="mt-4">
            <h1 className="font-semibold uppercase text-[#5A607F]">
              item details
            </h1>
            <div className="relative mb-5 rounded-none border-base-300">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="">
                    <TableRow className="border-b-2 border-gray-300 bg-white/60 uppercase hover:bg-white">
                      <TableHead className="text-left">Product/Service</TableHead>

                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      {!(taxType === "NO_TAX") && (
                        <TableHead>TAX</TableHead>
                      )}
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseItems.map((row: any, index: any) => (
                      <TableRow
                        key={index}
                        className={`border-none bg-white hover:bg-white`}
                      >
                        {row.type === "product" && row.mainPrice ? (
                          <>
                            {" "}
                            <TableCell className="w-84 border-b bg-white capitalize">
                              <div className="ml-2 w-80">
                                <div className="custom-select flex items-center justify-between">
                                  <input
                                    type="text"
                                    placeholder="Type to find a Product.."
                                    value={row.productService}
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
                            {!(taxType === "NO_TAX") && (
                              <TableCell className="border-b bg-white">
                                <input
                                  type="text"
                                  className="h-full w-full border-none px-2 text-center outline-none"
                                  value={`${row.productTaxRate} %`}
                                  readOnly
                                />
                              </TableCell>
                            )}
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
                            {!(taxType === "NO_TAX") && (
                              <TableCell className="border-b"></TableCell>
                            )}
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
                              {!(taxType === "NO_TAX") && (
                                <TableCell className="border-b"></TableCell>
                              )}
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
              <div className="rounded-2xl bg-[#F5F6FA] p-4 text-white">
                <div className="my-4 flex justify-between font-semibold text-[#333752]">
                  Subtotal
                  <p className="w-32 text-right">
                    $ {subTotal}
                  </p>
                </div>
                <p className="mb-4 flex justify-between font-semibold text-[#333752]">
                  Discount{" "}
                  <span className="font-semibold">$ {discount_amount}</span>
                </p>
                <p className="mb-4 flex justify-between font-semibold text-[#333752]">
                  Shipping{" "}
                  <span className="font-semibold">$ {shipping_fee}</span>
                </p>
                <div className="flex items-center gap-6">
                  <div>
                    {taxType !== "NO_TAX" &&
                      purchaseItems.map((product: any, idx: any) =>
                        product.type === "product" && product.product_uid ? (
                          <div
                            key={idx}
                            className="mb-4 flex items-center justify-between gap-4 text-[#7E84A3]"
                          >
                            <div className="flex flex-1 justify-start">
                              <p className="text-left">
                                {product.productTaxInfo.title} @
                                {product.productTaxInfo.rate}% On $
                                {product.amount}
                              </p>
                            </div>
                            {product.productTaxType === "EXCLUSIVE" ? (
                              <p className="w-32 text-right text-[#7E84A3]">
                                {product.tax.toFixed(2)}
                              </p>
                            ) : product.productTaxType === "INCLUSIVE" ? (
                              <p className="w-32 text-right text-[#7E84A3]">
                                {(
                                  (product.price / 100) *
                                  product.productTaxRate *
                                  product.qty
                                ).toFixed(2)}
                              </p>
                            ) : (
                              ""
                            )}
                          </div>
                        ) : (
                          ""
                        ),
                      )}

                    {/* categoryTaxList */}
                    {taxType !== "NO_TAX" &&
                      CategoryItems?.map((product: any, idx: any) =>
                        product.type === "category" && product.amount ? (
                          <div
                            key={idx}
                            className="mb-4 flex items-center justify-between gap-4 text-[#7E84A3]"
                          >
                            <div className="flex flex-1 justify-end">
                              <p className="text-right">
                                {product.productTaxInfo.title} @{" "}
                                {product.productTaxInfo.rate}% On $
                                {product.amount}
                              </p>
                            </div>
                            <p className="w-32 text-right text-[#7E84A3]">
                              {(
                                (product.amount / 100) *
                                product.productTaxRate
                              ).toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          ""
                        ),
                      )}
                  </div>
                </div>

                <p className="mb-4 flex justify-between font-semibold text-[#333752]">
                  Total Tax <span className="font-semibold">$ {total_tax}</span>
                </p>
                <p className="mb-4 flex justify-between font-semibold text-accent_soft_blue">
                  Total <span className="font-semibold">$ {total}</span>
                </p>
                {/* <p className="mb-4 flex justify-between font-semibold text-accent_soft_blue">
                  Deposit{" "}
                  <span className="font-semibold">$ {deposit || 0}</span>
                </p>
                <p className="mb-4 flex justify-between font-semibold text-accent_soft_blue">
                  Due Total <span className="font-semibold">$ {due_total}</span>
                </p> */}
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
                {/* <div className="mt-1 space-y-1">
                  {fileList?.map((file: any, index: any) => (
                    <div key={index} className="border px-3 py-1">
                      {" "}
                      <p>{file?.title?.slice(0, 50)}</p>{" "}
                    </div>
                  ))}
                </div> */}
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

export default PurchasePreview;
