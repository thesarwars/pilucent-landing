/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, ChangeEvent } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import Label from "@/components/ui/RawLabel";
import useAllTaxRates from "@/hooks/useAllTaxRates";
import { GrDrag } from "react-icons/gr";
import { IoMdInformationCircleOutline } from "react-icons/io";
import GetToken from "@/hooks/getToken";
import ProductSelectDropdown from "@/components/ui/ScrollSelectDropDowns/ProductSelectDropdown";
import TaxSelectDropDown from "@/components/ui/ScrollSelectDropDowns/TaxSelectDropdown";
import { toast } from "react-toastify";

const CreditNoteTable = ({
  isEdit = false,
  deleteItemsUID,
  setDeleteItemsUID,
  invoiceData,
  setInvoiceData,
  setInvoiceItems,
  invoiceItems,
  setIsTaxLoading,
  storedAutoTax,
  setIsCalculation,
}: {
  isEdit?: boolean;
  deleteItemsUID?: any;
  setDeleteItemsUID?: any;
  setIsTaxLoading?: any;
  storedAutoTax?: any;
  setIsCalculation?: any;
  invoiceItems: any;
  invoiceData?: any;
  setInvoiceData: React.Dispatch<React.SetStateAction<any>>;
  setInvoiceItems: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [discount, setDiscount] = useState<any>("");
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState<any>({ rate: 0, value: "" });
  const token = GetToken();
  const { taxRates: taxRateOptions, isPending } = useAllTaxRates(token);
  const [discountAmount, setDiscountAmount] = useState<any>("");
  const [shippingAmount, setShippingAmount] = useState<any>("");

  useEffect(() => {
    const calculateTotals = () => {
      //product calculations
      const InvoiceSubtotal = invoiceItems.reduce(
        (acc: any, row: any) => acc + Number(row.amount),
        0,
      );
      let ExclusiveTotalTax = 0;
      let InvoiceTotalTax = 0;
      if (invoiceData?.tax_kind == "EXCLUSIVE") {
        ExclusiveTotalTax = invoiceItems.reduce(
          (acc: any, row: any) => acc + Number(row?.tax || 0),
          0,
        );
      }

      InvoiceTotalTax = invoiceItems.reduce(
        (acc: any, row: any) => acc + Number(row?.tax || 0),
        0,
      );

      if (invoiceData?.tax_kind == "NO_TAX") {
        InvoiceTotalTax = 0;
      }
      const InvoiceTotal = Number(InvoiceSubtotal) + Number(ExclusiveTotalTax);

      //set totals in purchaseData object
      const total = Number(
        (
          Number(InvoiceTotal) +
          Number(shippingAmount) -
          Number(discountAmount)
        ).toFixed(2),
      );
      const dueTotal = total - Number(invoiceData?.deposit);

      setSubtotal(Number(InvoiceSubtotal));
      setInvoiceData({
        ...invoiceData,
        total_tax: Number(InvoiceTotalTax.toFixed(2)),
        due_total: dueTotal,
        total: total,
        sub_total: Number(InvoiceSubtotal),
      });
    };

    calculateTotals();
  }, [invoiceItems, invoiceData?.tax_kind, discountAmount, shippingAmount]);

  const handleShippingChange = (value: any) => {
    if (value > subtotal) {
      toast.warning("Shipping Amount Can't be More than Subtotal");
      setShippingAmount("");
      setShipping({ ...shipping, value: "" });
      setInvoiceData({ ...invoiceData, shipping_fee: "", deposit: "" });
      return;
    }
    const shippingAmount = (
      Number(value / 100) * Number(shipping.rate)
    ).toFixed(2);
    setShipping({ ...shipping, value: Number(value) });
    setShippingAmount(shippingAmount);
    setInvoiceData({
      ...invoiceData,
      shipping_fee: shippingAmount,
      deposit: "",
    });
  };

  const handleDiscountChange = (value: any) => {
    if (invoiceData.discount_kind === "PERCENTAGE") {
      setDiscount(value);
      if (value > 100) {
        toast.warning("Discount Percentage Can't be More than 100");
        setDiscount("");
        setDiscountAmount("");
        setInvoiceData({ ...invoiceData, discount_amount: "", deposit: "" });
        return;
      }
      const discountAmount = Number(subtotal / 100) * Number(value);
      setDiscountAmount(discountAmount);
      setInvoiceData({
        ...invoiceData,
        discount_amount: discountAmount,
        deposit: "",
      });
    } else if (invoiceData.discount_kind === "FLAT") {
      setDiscount(value);
      if (value > subtotal) {
        toast.warning("Discount Amount Can't be More than Subtotal");
        setDiscountAmount("");
        setDiscount("");
        setInvoiceData({ ...invoiceData, discount_amount: "", deposit: "" });
        return;
      }
      const discountAmount = value;
      setDiscountAmount(discountAmount);
      setInvoiceData({
        ...invoiceData,
        discount_amount: discountAmount,
        deposit: "",
      });
    }
  };

  const handleDepositChange = (value: any) => {
    if (value > invoiceData?.total) {
      toast.warning("Deposit Amount Can't be More than Total Amount");
      setInvoiceData({
        ...invoiceData,
        deposit: "",
      });
      return;
    }
    setInvoiceData({
      ...invoiceData,
      deposit: Number(value),
      due_total: invoiceData?.total - Number(value),
    });
  };

  useEffect(() => {
    if (taxRateOptions.length) {
      setShipping({ rate: taxRateOptions[0].rate, value: "" });
    }
  }, [taxRateOptions]);

  const addInvoiceLine = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        type: "product",
        mainPrice: 0,
        productService: "",
        product_uid: "",
        description: "",
        qty: 1,
        price: 0,
        amount: 0,
        tax: 0,
        productTaxInfo: taxRateOptions.length
          ? taxRateOptions[0]
          : { rate: 0, title: "", uid: "" },
        productTaxRate: taxRateOptions.length ? taxRateOptions[0]?.rate : 0,
        productTaxType: invoiceData?.tax_kind,
        productCode: 0,
        isPopupOpen: false, // Initialize popup state
      },
    ]);
  };

  const AddSection = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        type: "section",
        mainPrice: 0,
        productService: "",
        description: "",
        product_uid: "",
        qty: 1,
        price: 0,
        amount: 0,
        tax: 0,
        productTaxInfo: { rate: 0, title: "", uid: "" },
        productTaxRate: 0,
        productTaxType: "EXCLUSIVE",
        productCode: 0,
        isPopupOpen: false,
      },
    ]);
  };
  const AddNote = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        type: "note",
        mainPrice: 0,
        productService: "",
        product_uid: "",
        description: "",
        qty: 1,
        price: 0,
        amount: 0,
        tax: 0,
        productTaxInfo: { rate: 0, title: "", uid: "" },
        productTaxRate: 0,
        productTaxType: "EXCLUSIVE",
        productCode: 0,
        isPopupOpen: false,
      },
    ]);
  };

  const removeInvoiceLine = (index: number, uid?: string) => {
    const updatedRows = invoiceItems.filter(
      (_: any, rowIndex: any) => rowIndex !== index,
    );
    setInvoiceItems(updatedRows);
    if (uid) {
      setDeleteItemsUID([...deleteItemsUID, uid]);
    }
  };

  const removeALLInvoiceLine = () => {
    setInvoiceItems([]);
  };

  const handleInvoiceInputChange = (index: number, field: any, value: any) => {
    const updatedRows = invoiceItems.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        let updatedRow = { ...row };
        if (field == "productTaxRate") {
          taxRateOptions.map((rate) => {
            if (value === rate.uid) {
              updatedRow = { ...row, [field]: rate.rate, productTaxInfo: rate };
            }
          });
        } else {
          updatedRow = { ...row, [field]: value };
        }
        if (
          field === "price" ||
          field === "qty" ||
          field === "productTaxRate" ||
          field === "productTaxType"
        ) {
          if (updatedRow.productTaxType === "EXCLUSIVE") {
            updatedRow.amount = updatedRow.price * updatedRow.qty;
            updatedRow.tax =
              (updatedRow.price / 100) *
              updatedRow.productTaxRate *
              updatedRow.qty;
          }

          if (updatedRow.productTaxType === "INCLUSIVE") {
            updatedRow.price = updatedRow.price;
            updatedRow.amount = updatedRow.price * updatedRow.qty;
            updatedRow.tax =
              (updatedRow.price /
                (100 + Number(updatedRow?.productTaxRate || 0))) *
              updatedRow.productTaxRate *
              updatedRow.qty;
          }

          if (updatedRow.productTaxType === "NO_TAX") {
            updatedRow.price = updatedRow.price;
            updatedRow.tax = 0;
            updatedRow.amount = updatedRow.price * updatedRow.qty;
          }
        }
        return updatedRow;
      }
      return row;
    });
    setInvoiceItems(updatedRows);
  };
  const handleSelectedProduct = (index: number, product: any) => {
    const updatedRows = invoiceItems.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        row.product_uid = product.uid;
        row.productService = product.title;
        row.description = product.description;
        row.productCode = product.code;
        row.productTaxType = invoiceData?.tax_kind;
        row.product = product;
        row.isPopupOpen = false; // Close the popup

        if (invoiceData?.tax_kind === "EXCLUSIVE") {
          row.mainPrice = product.sale_price;
          row.price = product.sale_price;
          row.amount = product.sale_price * row.qty;
          row.tax = (product.sale_price / 100) * row.productTaxRate * row.qty;
        }

        if (invoiceData?.tax_kind === "INCLUSIVE") {
          row.mainPrice = product.sale_price;
          row.price = product.sale_price;
          row.amount = product.sale_price * row.qty;
          row.tax =
            (product.sale_price / (100 + Number(row?.productTaxRate || 0))) *
            row.productTaxRate *
            row.qty;
        }

        if (invoiceData?.tax_kind === "NO_TAX") {
          row.mainPrice = product.sale_price;
          row.price = product.sale_price;
          row.tax = 0;
          row.amount = product.sale_price * row.qty;
        }
      }
      return row;
    });

    setInvoiceItems(updatedRows);
  };

  const handleTaxTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    invoiceItems.map((row: any, idx: any) => {
      row.productTaxType = invoiceData?.tax_kind;
    });

    const newTaxType = e.target.value;

    const updatedRows = invoiceItems.map((row: any) => {
      row.productTaxType = newTaxType;

      if (newTaxType === "EXCLUSIVE") {
        row.price = row.price;
        row.amount = row.price * row.qty;
        row.tax = (row.price / 100) * row.productTaxRate * row.qty;
      } else if (newTaxType === "INCLUSIVE") {
        // row.price = row.mainPrice - (row.mainPrice / 100) * row.productTaxRate;
        row.price = row.price;
        row.amount = row.price * row.qty;
        row.tax =
          (row.price / (100 + Number(row?.productTaxRate || 0))) *
          row.productTaxRate *
          row.qty;
      } else if (newTaxType === "NO_TAX") {
        row.price = row.price;
        row.tax = 0;
        row.amount = row.price * row.qty;
      }

      return { ...row };
    });

    setInvoiceItems(updatedRows);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLTableRowElement>,
    index: number,
  ) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLTableRowElement>,
    index: number,
  ) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;

    const updatedData = [...invoiceItems];
    const draggedItem = updatedData[draggingIndex];
    updatedData.splice(draggingIndex, 1);
    updatedData.splice(index, 0, draggedItem);
    setDraggingIndex(index);
    setInvoiceItems(updatedData);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  useEffect(() => {
    if (setIsTaxLoading) {
      setIsTaxLoading(isPending);
    }
  }, [isPending]);

  return (
    <div className="font-lexend relative">
      {isPending && !setIsTaxLoading && (
        <div className="absolute left-0 top-0 z-[100] h-full w-full rounded-xl border border-gray-100 bg-white bg-opacity-70">
          <div className="flex h-full w-full items-center justify-center">
            <p className="inline-block h-20 w-20 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />{" "}
          </div>
        </div>
      )}
      <div className="mb-5 mt-6 flex items-center justify-start">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Label className="font-medium text-accent_text_gray">
            Amount are
          </Label>
          <select
            style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
            value={invoiceData?.tax_kind}
            onChange={(e) => {
              setInvoiceData({ ...invoiceData, tax_kind: e.target.value });
              handleTaxTypeChange(e);
            }}
            className="mt-2 h-11 w-64 rounded-md border bg-white px-3 text-[#7E84A3] outline-none"
          >
            <option value="EXCLUSIVE">Exclusive of Tax</option>
            <option value="INCLUSIVE">Inclusive of Tax</option>
            <option value="NO_TAX">Out Of Scope Of Tax</option>
          </select>
        </div>
      </div>

      <div className="border-base-300 relative mb-5 rounded-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="">
              <TableRow className="border-b-2 border-gray-300 bg-white/60 uppercase hover:bg-white">
                <TableHead className="pl-2">#</TableHead>
                <TableHead className="text-left">Product/Service</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-center">Rate</TableHead>
                {!(invoiceData?.tax_kind === "NO_TAX") && (
                  <TableHead className="text-center">TAX</TableHead>
                )}
                <TableHead className="text-center">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceItems?.map((row: any, index: any) => (
                <TableRow
                  draggable // Enables the drag behavior
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  key={index}
                  className={`border-none bg-white hover:bg-white`}
                >
                  {row.type === "product" ? (
                    <>
                      {" "}
                      <TableCell className="cursor-pointer border-b pl-2 pr-1">
                        <GrDrag className="text-2xl" />
                      </TableCell>
                      <TableCell className="w-84 border-b">
                        <ProductSelectDropdown
                          handleInvoiceInputChange={handleInvoiceInputChange}
                          handleSelectedProduct={handleSelectedProduct}
                          index={index}
                          invoiceRows={invoiceItems}
                          row={row}
                          setInvoiceRows={setInvoiceItems}
                        />
                      </TableCell>
                      <TableCell className="border-b">
                        <div className="group relative">
                          <div className="absolute top-[-80px] z-[-1] translate-y-[-20px] opacity-0 transition-all duration-500 group-hover:z-[1000] group-hover:translate-y-0 group-hover:opacity-100">
                            <p className="w-max rounded bg-[#8d8d8d] px-3 py-2 text-[0.9rem] text-white">
                              Quantity On Hand: {row?.product?.quantity || 0}{" "}
                              <br />
                              Reorder Point: {row?.product?.reorder_point || 0}
                            </p>
                          </div>
                          <input
                            type="number"
                            className="w-full border-accent_soft_blue px-2 text-center outline-none hover:border-b-2 focus:border-b-2"
                            value={row.qty}
                            onChange={(e) =>
                              handleInvoiceInputChange(
                                index,
                                "qty",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="border-b">
                        <input
                          type="text"
                          className="w-full border-accent_soft_blue px-2 text-center outline-none hover:border-b-2 focus:border-b-2"
                          value={row.price}
                          onChange={(e) =>
                            handleInvoiceInputChange(
                              index,
                              "price",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      {!(invoiceData?.tax_kind === "NO_TAX") && (
                        <TableCell className="border-b bg-white text-center">
                          <TaxSelectDropDown
                            ClassName="h-full bg-transparent text-[16px] outline-none border-none"
                            parentClassName="w-full"
                            value={row.productTaxInfo}
                            setValue={(e: any) =>
                              handleInvoiceInputChange(
                                index,
                                "productTaxRate",
                                e.uid,
                              )
                            }
                            storedAutoTax={storedAutoTax}
                            required={false}
                            isAddNew={false}
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
                      <TableCell
                        onClick={() => removeInvoiceLine(index, row?.uid)}
                        className="cursor-pointer border-b p-6"
                      >
                        <RiDeleteBin6Line className="text-red-500" />
                      </TableCell>
                    </>
                  ) : row.type === "section" ? (
                    <>
                      {" "}
                      <TableCell className="cursor-pointer border-b pl-2 pr-1">
                        <GrDrag className="text-2xl" />
                      </TableCell>
                      <TableCell className="col-span-4 w-80 border-b">
                        {" "}
                        <input
                          type="text"
                          className="h-full w-80 border-none px-2 text-center text-lg italic text-[#333752] outline-none"
                          onChange={(e) =>
                            handleInvoiceInputChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          value={row.description}
                        />
                      </TableCell>
                      <TableCell className="border-b"></TableCell>
                      <TableCell className="border-b"></TableCell>
                      {!(invoiceData?.tax_kind === "NO_TAX") && (
                        <TableCell className="border-b"></TableCell>
                      )}
                      <TableCell className="border-b"></TableCell>
                      <TableCell
                        onClick={() => removeInvoiceLine(index)}
                        className="cursor-pointer border-b p-6"
                      >
                        <RiDeleteBin6Line className="text-red-500" />
                      </TableCell>
                    </>
                  ) : (
                    row.type === "note" && (
                      <>
                        <TableCell className="cursor-pointer border-b pl-2 pr-1">
                          <GrDrag className="text-2xl" />
                        </TableCell>

                        <TableCell className="col-span-4 w-80 border-b">
                          {" "}
                          <input
                            type="text"
                            className="h-full w-80 border-none px-2 text-center text-lg font-light text-[#7E84A3] outline-none"
                            onChange={(e) =>
                              handleInvoiceInputChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            value={row.description}
                          />
                        </TableCell>
                        <TableCell className="border-b"></TableCell>
                        <TableCell className="border-b"></TableCell>
                        {!(invoiceData?.tax_kind === "NO_TAX") && (
                          <TableCell className="border-b"></TableCell>
                        )}
                        <TableCell className="border-b"></TableCell>
                        <TableCell
                          onClick={() => removeInvoiceLine(index)}
                          className="cursor-pointer border-b p-6"
                        >
                          <RiDeleteBin6Line className="text-red-500" />
                        </TableCell>
                      </>
                    )
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-3 border-b pb-3">
            <div className="ml-4 flex gap-8 text-accent_soft_blue max-md:overflow-x-auto max-md:py-3 md:ml-16">
              <button
                onClick={addInvoiceLine}
                className="border-r-1 cursor-pointer text-nowrap font-medium"
              >
                Add a Product
              </button>
              <button
                onClick={AddSection}
                className="border-r-1 cursor-pointer text-nowrap font-medium"
              >
                Add a Section
              </button>
              <button
                onClick={AddNote}
                className="cursor-pointer text-nowrap font-medium"
              >
                Add a Note
              </button>
              <button
                onClick={removeALLInvoiceLine}
                className="cursor-pointer text-nowrap font-medium"
              >
                Remove All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <div
          style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
          className="rounded-2xl bg-white/60 p-4 text-white"
        >
          <div className="my-4 flex justify-between gap-4 font-semibold text-[#333752]">
            <p className="flex-1 text-right">Subtotal</p>
            <p className="w-32 text-right">
              {" "}
              ${" "}
              {invoiceData?.tax_kind == "INCLUSIVE"
                ? (Number(subtotal) - Number(invoiceData.total_tax)).toFixed(2)
                : Number(subtotal).toFixed(2)}
            </p>
          </div>
          {/* <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center justify-end gap-2">
              <select
                value={invoiceData.discount_kind}
                onChange={(e) => {
                  setInvoiceData({
                    ...invoiceData,
                    discount_kind: e.target.value,
                  });
                }}
                className="rounded-lg border border-[#A1A7C4] bg-transparent px-4 py-2 text-[#7E84A3] outline-none"
              >
                <option value="PERCENTAGE">Discount Percentage</option>
                <option value="FLAT">Discount Value</option>
              </select>
              <input
                type="number"
                value={discount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="w-20 rounded-lg border border-[#A1A7C4] bg-transparent px-4 py-2 text-[#7E84A3] outline-none"
              />
            </div>
            <p className="w-32 text-right font-semibold text-[#333752]">
              - {Number(invoiceData.discount_amount)}
            </p>
          </div> 
          {/* <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center justify-end gap-4">
              <p className="font-medium text-[#7E84A3]">Shipping</p>
              <select
                value={shipping.rate}
                onChange={(e) =>
                  setShipping((prev:any) => ({
                    ...prev,
                    rate: parseInt(e.target.value),
                  }))
                }
                className="rounded-lg border border-[#A1A7C4] bg-transparent px-4 py-2 text-[#7E84A3] outline-none"
              >
                {taxRateOptions.map((option: any) => (
                  <option key={option.value} value={option.rate}>
                    {option.rate}%
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={shipping.value}
                onChange={(e) =>handleShippingChange(e.target.value)}
                className="w-20 rounded-lg border border-[#A1A7C4] bg-transparent px-4 py-2 text-[#7E84A3] outline-none"
              />
            </div>
            <p className="w-32 text-right font-semibold text-[#333752]">
              + {Number(invoiceData.shipping_fee)}
            </p>
          </div> */}
          <div>
            {invoiceData?.tax_kind !== "NO_TAX" &&
              invoiceItems.map((product: any, idx: any) =>
                product.type === "product" && product.amount ? (
                  <div
                    key={idx}
                    className="mb-4 flex items-center justify-between gap-4 text-[#7E84A3]"
                  >
                    <div className="flex flex-1 justify-end">
                      <p className="text-right">
                        {product.productTaxInfo.title} @{" "}
                        {product.productTaxInfo.rate}% On ${product.price}
                      </p>
                    </div>
                    {product.productTaxType === "EXCLUSIVE" ? (
                      <p className="w-32 text-right text-[#7E84A3]">
                        {product.tax.toFixed(2)}
                      </p>
                    ) : product.productTaxType === "INCLUSIVE" ? (
                      <p className="w-32 text-right text-[#7E84A3]">
                        {(
                          (product.price /
                            (100 + Number(product?.productTaxRate || 0))) *
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
            {invoiceData?.tax_kind !== "NO_TAX" &&
              invoiceItems.map((product: any, idx: any) =>
                product.type === "category" && product.amount ? (
                  <div
                    key={idx}
                    className="mb-4 flex items-center justify-between gap-4 text-[#7E84A3]"
                  >
                    <div className="flex flex-1 justify-end">
                      <p className="text-right">
                        {product.productTaxInfo.title} @{" "}
                        {product.productTaxInfo.rate}% On ${product.amount}
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

          <div className="flex items-center gap-4 font-semibold text-[#333752]">
            <p className="text-right">Sales tax rate</p>
            <div className="flex-1 flex flex-col gap-1">
              <TaxSelectDropDown
                parentClassName="flex-1"
                ClassName="border font-normal border-accent_soft_black focus:border-accent_soft_blue rounded-md"
                value={invoiceData?.sales_tax}
                setValue={(e: any) =>
                  setInvoiceData({ ...invoiceData, sales_tax: e })
                }
                storedAutoTax={storedAutoTax}
              />
              {invoiceData?.sales_tax?.auto_calculated && (
                <p className="text-xs text-green-600 font-normal">
                  ✓ Auto-calculated based on customer address
                </p>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between px-4 py-2 text-base font-normal text-accent_soft_black">
              <p>Total sales tax </p>
              <p>$ {invoiceData?.total_tax}</p>
            </div>
          </div>
          {invoiceData?.sales_tax && (
            <div className="flex items-center justify-end">
              <button
                className="mb-3 flex items-center gap-1 px-2 py-1 text-sm font-normal text-accent_soft_blue hover:bg-gray-200 hover:underline"
                onClick={() => setIsCalculation && setIsCalculation(true)}
              >
                See math{" "}
                <IoMdInformationCircleOutline className="text-lg text-accent_soft_blue" />
              </button>
            </div>
          )}

          <div className="mb-4 flex justify-between gap-4 font-semibold text-[#333752]">
            <p className="flex-1 text-right">Total Credit</p>
            <p className="w-32 text-right font-semibold">
              $ {Number(invoiceData?.total).toFixed(2)}
            </p>
          </div>
          {/* <div className="my-4 flex items-center justify-between gap-4 font-semibold text-[#333752]">
            <p className="flex-1 text-right"> Deposit</p>
            <input
              type="number"
              value={invoiceData?.deposit}
              onChange={(e) => handleDepositChange(e.target.value)}
              placeholder="0.0"
              className="w-32 rounded-lg border border-[#A1A7C4] bg-transparent px-4 py-2 text-[#7E84A3] outline-none"
            />
          </div>
          <div className="mb-4 flex justify-between gap-4 font-semibold text-accent_soft_blue">
            <p className="flex-1 text-right">Balance Due</p>
            <p className="w-32 text-right font-semibold">
              $ {Number(invoiceData?.due_total).toFixed(2)}
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CreditNoteTable;
